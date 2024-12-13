const http = require('http');
const path = require('path');
const url = require('url');
const logger = require('./logger');
const fileHelpers = require('./file-helpers');
const { renderToReadableStream } = require('react-dom/server.edge');
const {
  createFromReadableStream,
} = require('react-server-dom-webpack/client.edge');
const { injectRSCPayload } = require('rsc-html-stream/server');
const { Readable } = require('stream');

const PORT = 8000;

async function serveJavaScript(res, pathname) {
  try {
    const filePath = path.join(path.resolve(__dirname, './dist'), pathname);
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
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  logger.info(`${req.method} ${parsedUrl.pathname}`);

  const isRSC = req.headers.accept === 'text/x-component';

  try {
    if (parsedUrl.pathname === '/favicon.ico') {
      res.writeHead(404);
      res.end();
    } else if (parsedUrl.pathname.endsWith('.js')) {
      await serveJavaScript(res, parsedUrl.pathname);
    } else {
      const options = {
        hostname: 'localhost',
        port: 8008,
        path: parsedUrl.path,
        method: req.method,
        headers: req.headers,
      };

      const proxyReq = http.request(options, async (proxyRes) => {
        proxyRes.headers['content-type'] = isRSC
          ? 'text/x-component'
          : 'text/html';
        res.writeHead(proxyRes.statusCode, proxyRes.headers);

        if (isRSC) {
          proxyRes.pipe(res);
        } else {
          const serverConsumerManifest = await fileHelpers.readJsonFile(
            path.join(
              path.resolve(__dirname, './dist'),
              'react-ssr-manifest.json'
            )
          );

          const rscStream = Readable.toWeb(proxyRes);

          const [rscStream1, rscStream2] = rscStream.tee();

          const reactElements = await createFromReadableStream(rscStream1, {
            serverConsumerManifest,
          });

          const htmlStream = await renderToReadableStream(reactElements, {
            bootstrapScripts: ['/client.js'],
          });

          const response = htmlStream.pipeThrough(injectRSCPayload(rscStream2));

          Readable.fromWeb(response).pipe(res);
        }
      });

      proxyReq.on('error', (err) => {
        logger.error('Proxy request error', err);
        res.writeHead(500);
        res.end('Internal Server Error');
      });

      req.pipe(proxyReq);
    }
  } catch (error) {
    logger.error('Unhandled server error', error);
    res.writeHead(500);
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  logger.success(`🚀 Server running at http://localhost:${PORT}`);
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
