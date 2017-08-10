const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const babel = require('babel-core');

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue',
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader',
        }),
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: 'src/scripts',
        to: 'scripts',
        transform: function (content) {
          return babel.transform(content, {
            presets: ['stage-0', 'es2015'],
          }).code;
        },
      },
      {
        from: 'src/assets',
        to: 'assets',
      },
      {
        from: 'vendor',
        to: 'vendor',
      },
      {
        from: 'manifest.json',
        to: 'manifest.json',
      },
    ]),
    new ExtractTextPlugin('style.css'),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/index.html',
      inject: true,
    }),
  ]
}
