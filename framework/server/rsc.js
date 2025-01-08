require('react-server-dom-webpack/node-register')();
require('@babel/register')({
  ignore: [/[\\\/](.cosmos-rsc|node_modules)[\\\/]/],
  presets: [['@babel/preset-react', { runtime: 'automatic' }]],
  plugins: ['@babel/transform-modules-commonjs'],
});

const http = require('http');
const {
  renderToPipeableStream,
  decodeReplyFromBusboy,
  decodeAction,
  decodeFormState,
} = require('react-server-dom-webpack/server');
const path = require('path');
const React = require('react');
const url = require('url');
const Busboy = require('busboy');
const { Readable } = require('stream');

const logger = require('../lib/logger');
const fileHelpers = require('../lib/file-helpers');
const { BUILD_DIR } = require('../lib/constants');
const { runWithAppStore, getAppStore } = require('../lib/app-store');

const PORT = 8008;

function getCookieString(cookiesEntries) {
  return cookiesEntries
    .map(([key, cookie]) => {
      const { value, ...options } = cookie;
      const optionsString = Object.entries(options)
        .map(([optionKey, optionValue]) => {
          if (optionKey === 'httpOnly') {
            return optionValue ? 'HttpOnly' : '';
          }
          if (optionKey === 'secure') {
            return optionValue ? 'Secure' : '';
          }
          if (optionKey === 'expires' && optionValue instanceof Date) {
            return `Expires=${optionValue.toUTCString()}`;
          }
          if (optionKey === 'maxAge') {
            return `Max-Age=${optionValue}`;
          }
          if (optionKey === 'domain') {
            return `Domain=${optionValue}`;
          }
          if (optionKey === 'path') {
            return `Path=${optionValue}`;
          }
          if (optionKey === 'sameSite') {
            return `SameSite=${optionValue}`;
          }
          return '';
        })
        .filter(Boolean)
        .join('; ');

      return `${key}=${value}${optionsString ? `; ${optionsString}` : ''}`;
    })
    .join('; ');
}

async function serveRSC({
  res,
  pathname,
  searchParams,
  serverFunctionResult,
  formState,
}) {
  const { cookies } = getAppStore();
  const manifestPath = path.join(BUILD_DIR, 'react-client-manifest.json');
  const moduleMap = await fileHelpers.readJsonFile(manifestPath);

  const pagePath = `../../app/pages${pathname}`;
  let Page;

  try {
    Page = require(pagePath).default;
  } catch (error) {
    logger.error(`Failed to import page: ${pagePath}`, error);
    res.writeHead(404);
    return res.end('PAGE NOT FOUND');
  }

  if (!Page) {
    throw new Error(`No default export found in ${pagePath}`);
  }

  const RootLayout = require('../../app/root-layout').default;

  const Component = React.createElement(
    RootLayout,
    null,
    React.createElement(Page, { searchParams })
  );

  const { pipe } = renderToPipeableStream(
    { rscPayload: Component, serverFunctionResult, formState },
    moduleMap
  );

  res.writeHead(200, {
    'Content-Type': 'text/x-component',
    ...(cookies.outgoing.size > 0 && {
      'Set-Cookie': getCookieString([
        ...Array.from(cookies.incoming),
        ...Array.from(cookies.outgoing),
      ]),
    }),
  });

  pipe(res);
  logger.success(`RSC rendered: ${pathname}`);
}

const server = http.createServer(async (req, res) => {
  const { pathname, query } = url.parse(req.url, true);
  const searchParams = { ...query };

  logger.info(`${req.method} ${pathname}`, '(RSC)');

  const incomingCookies = new Map(
    req.headers.cookie?.split(';').map((cookie) => {
      const [key, ...valueParts] = cookie.split('=');
      return [
        key.trim(),
        {
          value: valueParts.join('=').trim(),
        },
      ];
    }) ?? []
  );

  const appStore = {
    cookies: {
      incoming: incomingCookies,
      outgoing: new Map(),
    },
  };

  runWithAppStore(appStore, async () => {
    try {
      if (req.method === 'GET') {
        await serveRSC({ res, pathname, searchParams });
      } else if (req.method === 'POST') {
        const serverFunctionId = req.headers['server-function-id'];

        let serverFunctionResult;
        let formState;
        if (serverFunctionId) {
          const [fileUrl, functionName] = serverFunctionId.split('#');
          const path = url.fileURLToPath(fileUrl);
          const serverFunction = require(path)[functionName];

          const busboy = Busboy({ headers: req.headers });
          req.pipe(busboy);

          const args = await decodeReplyFromBusboy(busboy);
          serverFunctionResult = await serverFunction.apply(null, args);
        } else {
          const fakeReq = new Request('http://localhost', {
            method: 'POST',
            headers: { 'Content-Type': req.headers['content-type'] },
            body: Readable.toWeb(req),
            duplex: 'half',
          });
          const formData = await fakeReq.formData();
          const action = await decodeAction(formData);
          const result = await action();
          formState = decodeFormState(result, formData);
        }

        await serveRSC({
          res,
          pathname,
          searchParams,
          serverFunctionResult,
          formState,
        });
      }
    } catch (error) {
      logger.error(`Failed to render RSC for ${pathname}`, error);
      res.writeHead(500);
      res.end('Internal Server Error');
    }
  });
});

server.listen(PORT, () => {
  logger.success(`RSC Server running at http://localhost:${PORT}`);
});

server.on('error', (error) => {
  logger.error('RSC Server error', error);
  process.exit(1);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down...');
  server.close(() => {
    logger.info('RSC Server closed');
    process.exit(0);
  });
});
