const { register } = require('module');
const http = require('http');
const path = require('path');
const url = require('url');
const { renderToPipeableStream } = require('react-dom/server');
const { createFromNodeStream } = require('react-server-dom-webpack/client');
const logger = require('../lib/logger');
const fileHelpers = require('../lib/file-helpers');
const injectRSCPayload = require('../lib/inject-rsc-payload');
const teeStream = require('../lib/tee-stream');
const { DIST_DIR } = require('../lib/constants');

register('./framework/loaders/ssr.js', url.pathToFileURL('./'));
const PORT = 8000;

async function serveJavaScript(res, pathname) {
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
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  logger.info(`${req.method} ${parsedUrl.pathname}`);

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

      const rscReq = http.request(options, async (rscRes) => {
        const isRSC = req.headers.accept === 'text/x-component';

        rscRes.headers['content-type'] = isRSC
          ? 'text/x-component'
          : 'text/html';

        res.writeHead(rscRes.statusCode, rscRes.headers);

        if (isRSC) {
          rscRes.pipe(res);
        } else {
          const manifestPath = path.join(DIST_DIR, 'react-ssr-manifest.json');
          const serverConsumerManifest = await fileHelpers.readJsonFile(
            manifestPath
          );

          const [rscStream1, rscStream2] = teeStream(rscRes);

          const { rscPayload } = await createFromNodeStream(
            rscStream1,
            serverConsumerManifest
          );

          const html = renderToPipeableStream(rscPayload, {
            bootstrapScripts: ['/client.js'],
            onShellReady: () => {
              html.pipe(injectRSCPayload(rscStream2)).pipe(res);
            },
          });
        }
      });

      rscReq.on('error', (err) => {
        logger.error('Proxy request error', err);
        res.writeHead(500);
        res.end('Internal Server Error');
      });

      req.pipe(rscReq);
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
