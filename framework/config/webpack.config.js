const path = require('path');
const ReactServerWebpackPlugin = require('react-server-dom-webpack/plugin');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProduction ? 'production' : 'development',
  entry: [path.resolve(__dirname, '../client/index.js')],
  output: {
    path: path.resolve(__dirname, '../../.cosmos-rsc'),
    filename: 'client.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-react',
                {
                  runtime: 'automatic',
                },
              ],
            ],
          },
        },
      },
    ],
  },
  plugins: [
    new ReactServerWebpackPlugin({
      isServer: false,
      clientReferences: [
        {
          directory: './app',
          recursive: true,
          include: /\.js$/,
        },
        {
          directory: './framework/client',
          recursive: true,
          include: /\.js$/,
        },
      ],
    }),
  ],
};
