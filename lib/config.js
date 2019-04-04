'use strict';

var fs = require('fs');
var ini = require('ini');
var path = require('path');

var configFile = process.env.CONFIG || 'config'
var config = ini.parse(fs.readFileSync(path.join(__dirname, '/../' + configFile + '.ini'), 'utf-8'));

if (config.web.urlPrefix === undefined) {
  config.web.urlPrefix = '';
}

module.exports = config;
