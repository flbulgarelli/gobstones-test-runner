const path = require('path');

const buildFolder = 'dist';

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: {
    main: './runner.js'
  },
  output: {
    filename: 'gobstones-test-runner.js',
    path: path.resolve(__dirname, buildFolder),
    library: 'GobstonesTestRunner'
  }
};

