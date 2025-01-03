const fileHelpers = require('./file-helpers');
const { DIST_DIR, HTML_TEMPLATE } = require('./constants');


module.exports = {
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

  async serveRSC(
    res,
    pathname,
    searchParams,
    serverFunctionResult = '$$RSC_ONLY'
  ) {
    try {
      const manifestPath = path.join(DIST_DIR, 'react-client-manifest.json');
      const moduleMap = await fileHelpers.readJsonFile(manifestPath);

      const pagePath = `./pages${pathname}`;
      let Page;

      try {
        Page = require(pagePath).default;
      } catch (error) {
        res.writeHead(404);
        return res.end('PAGE NOT FOUND');
      }

      if (!Page) {
        throw new Error(`No default export found in ${pagePath}`);
      }

      let Component = React.createElement(Page, { searchParams });

      if (serverFunctionResult !== '$$RSC_ONLY') {
        Component = { rscPayload: Component, serverFunctionResult };
      }

      const { pipe } = renderToPipeableStream(Component, moduleMap);

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
