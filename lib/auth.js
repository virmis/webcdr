'use strict';

var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcryptjs');
var Promise = require('bluebird');
var ActiveDirectory = require('activedirectory');

var config = require('./config').auth;

var ad;
try {
  ad = new ActiveDirectory(config.ad.connection);
} catch(error) {
  console.log("Active Directory credentials is not defined, switching to local authentication.");
};

var authenticate = function authenticate (user, password) {
  return new Promise(function (resolve, reject) {
    if (user.get('auth_ad') && ad) {
      ad.authenticate(user.get('username') + '@' + config.ad.domain, password, function (err) {
        if (err) {
          reject();
        } else {
          resolve();
        }
      });
    } else {
      var result = false;

      if (user.get('password').match(/\$2/)) {
        result = bcrypt.compareSync(password, user.get('password'));
      } else {
        result = user.get('password') === password;
      }

      if (result) {
        resolve();
      } else {
        reject();
      }
    }
  });
};

module.exports = function (users) {
  var strategy = new LocalStrategy(
    function (username, password, done) {
      users.query(function (qb) {
        qb.where({
          username: username
        });
      })
        .fetch()
        .then(function (col) {
          if (!col.length) {
            done(null, false, { message: 'Wrong username or password' });
          }
          var user = col.at(0);
          authenticate(user, password).then(function () {
            done(null, user.toJSON());
          }).catch(function (err) {
            done(err, false, { message: 'Wrong username or password' });
          });
        })
        .catch(function (err) {
          done(err);
        });
    }
  );

  return strategy;
};
