'use strict';

var ActiveDirectoryStrategy = require('passport-activedirectory');
var config = require('./config').auth;

module.exports = function() {
    var strategy = new ActiveDirectoryStrategy({
        integrated: false,
        ldap: config.ad.connection
    }, function (profile, ad, done) {
        ad.find('(&(&(objectClass=user)(|(memberOf=' + config.ad.search.inGroup + ')))(sAMAccountName=' + profile._json.sAMAccountName + '))', function(err, results) {
            if ((err) || (! results)) {
                return done(err); 
            }
            return done(null, profile);
        })
    });

    return strategy;
};