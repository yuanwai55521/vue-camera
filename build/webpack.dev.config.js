const webpack = require('webpack');
const webpackBase = require('./webpack.base.config');
const merge = require('webpack-merge');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

module.exports = merge(webpackBase(), {
  entry: ['webpack-hot-middleware/client'],
  plugins: [new webpack.HotModuleReplacementPlugin(), new FriendlyErrorsPlugin()]
});