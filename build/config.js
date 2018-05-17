const fs = require('fs');
const _ = require('lodash');
const path = require('path');

module.exports = _.assign({
  CROSS: true,
  PORT: 8080,
  HOST: JSON.stringify('localhost'),
  ROOT: JSON.stringify(''),
  DEVPORT: 3001,
  NAME: JSON.stringify('basesys'),
}, fs.existsSync(path.join(__dirname, '../config.local.js')) && require('../config.local'));