// 生产环境
const webpack = require('webpack');
const webpackBase = require('./webpack.base.config');
const merge = require('webpack-merge');
const path = require('path');
const resolve = dir => path.join(__dirname, '../', dir);

module.exports = merge(webpackBase(), {
  entry: {
    build: resolve('src/main.js'),
    vendor: ['vue', 'iview', 'axios', 'lodash', 'moment', 'vue-router']
  },
  output: {
    filename: 'js/[name]-[chunkhash:8].js'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      output: {
        comments: false
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor']
    })]
});
