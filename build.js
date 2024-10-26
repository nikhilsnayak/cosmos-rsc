const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const util = require('util');

const config = require('./webpack.config');

fs.rmSync(path.resolve(__dirname, './dist'), { recursive: true, force: true });

const compiler = webpack(config);

compiler.run((err, stats) => {
  if (err) {
    console.error('\x1b[31m%s\x1b[0m', '🛑 Webpack Build Error:');
    console.error(
      util.inspect(err, {
        colors: true,
        depth: null,
        breakLength: 80,
      })
    );

    if (err.details) {
      console.error('\n\x1b[33m%s\x1b[0m', '📝 Error Details:');
      console.error(
        util.inspect(err.details, {
          colors: true,
          depth: null,
          breakLength: 80,
        })
      );
    }
    process.exit(1);
  }

  const info = stats.toJson({
    colors: true,
    modules: false,
    chunks: false,
  });

  if (stats.hasErrors()) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Webpack Build Failed:');
    info.errors.forEach((e) => {
      console.error(
        '\n' +
          util.inspect(e, {
            colors: true,
            depth: null,
            breakLength: 80,
          })
      );
    });
    process.exit(1);
  } else {
    console.log(
      '\x1b[32m%s\x1b[0m',
      `✅ Webpack Build Successfully completed in ${
        stats.endTime - stats.startTime
      }ms`
    );
  }
});
