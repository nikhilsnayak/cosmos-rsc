const { PassThrough } = require('stream');

function teeStream(source) {
  const branch1 = new PassThrough();
  const branch2 = new PassThrough();

  // Handle errors from the source
  source.on('error', (err) => {
    branch1.destroy(err);
    branch2.destroy(err);
  });

  // Start piping
  source.pipe(branch1);
  source.pipe(branch2);

  return [branch1, branch2];
}

module.exports = teeStream;
