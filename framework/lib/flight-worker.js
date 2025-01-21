require('react-server-dom-webpack/node-register')();
require('@babel/register')({
  ignore: [/[\\\/](dist|node_modules)[\\\/]/],
  presets: [['@babel/preset-react', { runtime: 'automatic' }]],
  plugins: ['@babel/plugin-transform-modules-commonjs'],
});

const busboy = require('busboy');
const { parentPort } = require('worker_threads');
const { Writable } = require('stream');
const { fileURLToPath } = require('url');
const { createElement } = require('react');
const {
  renderToPipeableStream,
  decodeReplyFromBusboy,
} = require('react-server-dom-webpack/server.node');
const { getReactClientManifest } = require('./manifests');
const { runWithAppStore, getAppStore } = require('./app-store');
const { getCookieString } = require('./utils');
const logger = require('./logger');

const RootLayout = require('../../app/root-layout').default;

parentPort.on('message', async (request) => {
  const incomingCookies = new Map(
    request.headers.cookie?.split(';').map((cookie) => {
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
    metadata: {
      isRSCRenderStarted: false,
    },
    cookies: {
      incoming: incomingCookies,
      outgoing: new Map(),
    },
  };

  runWithAppStore(appStore, async () => {
    let serverFunctionResult;
    if (request.method === 'POST') {
      const bb = busboy({ headers: request.headers });
      request.port.on('message', (message) => {
        if (message.type === 'end') {
          bb.end();
        } else {
          bb.write(message.data);
        }
      });

      const serverFunctionId = request.headers['server-function-id'];

      if (serverFunctionId) {
        const [fileUrl, functionName] = serverFunctionId.split('#');
        const serverFunction = require(fileURLToPath(fileUrl))[functionName];

        const args = await decodeReplyFromBusboy(bb);
        serverFunctionResult = await serverFunction.apply(null, args);
      }
    }

    const { cookies, metadata } = getAppStore();

    metadata.isRSCRenderStarted = true;

    if (cookies.outgoing.size > 0) {
      request.port.postMessage({
        type: 'cookies',
        data: getCookieString([
          ...Array.from(cookies.incoming),
          ...Array.from(cookies.outgoing),
        ]),
      });
    }

    const writableStream = new Writable({
      write(chunk, encoding, callback) {
        request.port.postMessage({
          type: 'data',
          data: chunk,
        });
        callback();
      },
      final(callback) {
        request.port.postMessage({ type: 'end' });
        callback();
      },
    });

    const pagePath = `../../app/pages${request.pathname}`;
    let Page;

    try {
      Page = require(pagePath).default;
    } catch (error) {
      logger.error(`Failed to import page: ${pagePath}`, error);
    }

    if (!Page) {
      throw new Error(`No default export found in ${pagePath}`);
    }

    const tree = createElement(
      RootLayout,
      null,
      createElement(Page, { searchParams: request.searchParams })
    );

    const webpackMap = await getReactClientManifest();
    renderToPipeableStream({ tree }, webpackMap).pipe(writableStream);
  });
});
