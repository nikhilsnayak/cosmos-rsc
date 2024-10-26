const register = require('react-server-dom-webpack/node-register');
register();

const babelRegister = require('@babel/register');
babelRegister({
  ignore: [/[\\\/](dist|node_modules)[\\\/]/],
  presets: [['@babel/preset-react', { runtime: 'automatic' }]],
  plugins: ['@babel/transform-modules-commonjs'],
});

const http = require('http');
const { readFile } = require('fs/promises');
const { renderToPipeableStream } = require('react-server-dom-webpack/server');
const path = require('path');
const React = require('react');
const url = require('url');
const util = require('util');

const PORT = process.env.PORT ?? 8008;
const DIST_DIR = path.resolve(__dirname, './dist');
const PAGES_DIR = path.resolve(__dirname, './pages');
const HTML_TEMPLATE = path.resolve(__dirname, './index.html');

const logger = {
  info: (message, data = '') => {
    console.log('\x1b[36m%s\x1b[0m', '📢 ' + message, data);
  },
  error: (message, error) => {
    console.error('\x1b[31m%s\x1b[0m', '❌ ' + message);
    if (error) {
      console.error(
        util.inspect(error, {
          colors: true,
          depth: null,
          breakLength: 80,
        })
      );
    }
  },
  success: (message) => {
    console.log('\x1b[32m%s\x1b[0m', '✅ ' + message);
  },
};

const fileHelpers = {
  readJsonFile: async (filePath) => {
    try {
      const content = await readFile(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      logger.error(`Failed to read JSON file: ${filePath}`, error);
      throw error;
    }
  },

  readFile: (filePath, encoding = 'utf8') => {
    try {
      return readFile(filePath, encoding);
    } catch (error) {
      logger.error(`Failed to read file: ${filePath}`, error);
      throw error;
    }
  },
};

const handlers = {
  async serveJavaScript(res, pathname) {
    try {
      const filePath = path.join(DIST_DIR, pathname);
      const content = await fileHelpers.readFile(filePath);
      res.writeHead(200, {
        'Content-Type': 'application/javascript',
      });
      res.end(content);
      logger.info(`Served JS file: ${pathname}`);
    } catch (error) {
      logger.error(`JS file not found: ${pathname}`);
      res.writeHead(404);
      res.end('Not found');
    }
  },

  async serveHtml(res) {
    try {
      const html = await fileHelpers.readFile(HTML_TEMPLATE);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
      logger.info('Served HTML template');
    } catch (error) {
      logger.error('Failed to serve HTML template', error);
      res.writeHead(500);
      res.end('Internal Server Error');
    }
  },

  async serveRSC(res, pathname, searchParams) {
    try {
      const manifestPath = path.join(DIST_DIR, 'react-client-manifest.json');
      const moduleMap = await fileHelpers.readJsonFile(manifestPath);

      const pagePath = `./pages${pathname}`;
      const Page = require(pagePath).default;

      if (!Page) {
        throw new Error(`No default export found in ${pagePath}`);
      }

      const { pipe } = renderToPipeableStream(
        React.createElement(Page, { searchParams }),
        moduleMap
      );

      res.writeHead(200, {
        'Content-Type': 'text/x-component',
      });

      pipe(res);
      logger.success(`RSC rendered: ${pathname}`);
    } catch (error) {
      logger.error(`Failed to render RSC for ${pathname}`, error);
      res.writeHead(500);
      res.end('Internal Server Error');
    }
  },
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const searchParams = { ...parsedUrl.query };
  const isRSC = searchParams._rsc;

  logger.info(`${req.method} ${parsedUrl.pathname}`, isRSC ? '(RSC)' : '');

  try {
    if (parsedUrl.pathname.endsWith('.js')) {
      await handlers.serveJavaScript(res, parsedUrl.pathname);
    } else if (!isRSC) {
      await handlers.serveHtml(res);
    } else {
      delete searchParams._rsc;
      await handlers.serveRSC(res, parsedUrl.pathname, searchParams);
    }
  } catch (error) {
    logger.error('Unhandled server error', error);
    res.writeHead(500);
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  logger.success(`🚀 Server running at http://localhost:${PORT}`);
  logger.info('Environment:', {
    distDir: DIST_DIR,
    pagesDir: PAGES_DIR,
    nodeEnv: process.env.NODE_ENV,
  });
});

server.on('error', (error) => {
  logger.error('Server error', error);
  process.exit(1);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
