const express = require('express');
const { pathToFileURL } = require('url');
const { register } = require('module');
const { PassThrough } = require('stream');
const { Worker, MessageChannel } = require('worker_threads');
const { createElement } = require('react');
const { renderToPipeableStream } = require('react-dom/server');
const { createFromNodeStream } = require('react-server-dom-webpack/client');
const { injectRSCPayload } = require('./rsc-html-stream/server');
const { BUILD_DIR, FLIGHT_WORKER_PATH } = require('./lib/constants');
const { getReactSSRManifest } = require('./lib/manifests');

register('./framework/loaders/jsx.js', pathToFileURL('./'));

const PORT = 8000;
const app = express();

const flightWorker = new Worker(FLIGHT_WORKER_PATH, {
  execArgv: ['--conditions', 'react-server'],
});

app.use(express.static(BUILD_DIR));

function renderRSC(req, cb) {
  const { port1, port2 } = new MessageChannel();

  port1.on('error', (error) => {
    console.error('Port1 error:', error);
    // Handle port error if necessary
  });

  flightWorker.on('error', (error) => {
    console.error('Flight worker error:', error);
    // Handle worker error, possibly terminate the response
  });

  const request = {
    port: port2,
    searchParams: req.query,
    pathname: req.path,
    headers: req.headers,
    method: req.method,
  };

  flightWorker.postMessage(request, [port2]);
  port1.on('message', cb);

  if (req.method === 'POST') {
    req.on('data', (data) => {
      port1.postMessage({
        type: 'data',
        data,
      });
    });
    req.on('end', () => {
      port1.postMessage({
        type: 'end',
      });
    });
  }
}

async function requestHandler(req, res) {
  try {
    if (req.accepts('text/x-component')) {
      res.setHeader('Content-Type', 'text/x-component');

      renderRSC(req, (message) => {
        if (message.type === 'cookies') {
          res.setHeader('Set-Cookie', message.data);
        } else if (message.type === 'data') {
          res.write(message.data);
        } else if (message.type === 'end') {
          res.end();
        }
      });
    } else {
      const htmlConsumerRSCStream = new PassThrough();
      const payloadConsumerRSCStream = new PassThrough();

      renderRSC(req, (message) => {
        if (message.type === 'cookies') {
          res.setHeader('Set-Cookie', message.data);
        } else if (message.type === 'data') {
          htmlConsumerRSCStream.write(message.data);
          payloadConsumerRSCStream.write(message.data);
        } else if (message.type === 'end') {
          htmlConsumerRSCStream.end();
          payloadConsumerRSCStream.end();
        }
      });

      const serverConsumerManifest = await getReactSSRManifest();

      const { tree } = await createFromNodeStream(
        htmlConsumerRSCStream,
        serverConsumerManifest
      );

      res.setHeader('Content-Type', 'text/html');
      const { SSRRouter } = await import('./client/ssr-router.js');

      const htmlStream = renderToPipeableStream(
        createElement(SSRRouter, { initialState: { tree } }),
        {
          bootstrapScripts: ['/client.js'],
          onShellReady: () => {
            htmlStream
              .pipe(injectRSCPayload(payloadConsumerRSCStream))
              .pipe(res);
          },
          onError: (error) => {
            console.error('Render error:', error);
            res.status(500).send('Internal Server Error');
          },
        }
      );
    }
  } catch (error) {
    console.log({ error });
    res.status(500).send('Internal Server Error');
  }
}

app.get('*', async (req, res) => {
  if (req.path === '/favicon.ico') {
    res.status(404).end();
    return;
  }
  await requestHandler(req, res);
});

app.post('*', requestHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
