const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const WebpackConfig = require('./webpack.dev.config');
const path = require('path');
const opn = require('opn');

const port = require('./config').DEVPORT || 3000;
const uri = `http://localhost:${port}/dist/index.html`;

const app = express();
const compiler = webpack(WebpackConfig);
const devMiddleware = webpackDevMiddleware(compiler, {
  publicPath: '/dist/',
  quiet: true,
  stats: {
    colors: true,
    chunks: false
  }
});
app.use(devMiddleware);
app.use(webpackHotMiddleware(compiler, {
  log: () => { }
}));
app.use('/dist/assets', express.static(path.join(__dirname, '../src/assets/static/')));
app.use('/', (req, res) => {
  res.redirect('/dist/index.html')
});
console.log('> Starting dev server...');
devMiddleware.waitUntilValid(() => {
  console.log('> Listening at ' + uri + '\n')
  opn(uri)
});
module.exports = app.listen(port)
