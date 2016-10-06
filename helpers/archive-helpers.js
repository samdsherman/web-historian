var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var request = require('request');

/*
 * You will need to reuse the same paths many times over in the course of this sprint.
 * Consider using the `paths` object below to store frequently used file paths. This way,
 * if you move any files, you'll only need to change your code in one place! Feel free to
 * customize it in any way you wish.
 */

exports.paths = {
  siteAssets: path.join(__dirname, '../web/public'),
  archivedSites: path.join(__dirname, '../archives/sites'),
  list: path.join(__dirname, '../archives/sites.txt')
};

// Used for stubbing paths for tests, do not modify
exports.initialize = function(pathsObj) {
  _.each(pathsObj, function(path, type) {
    exports.paths[type] = path;
  });
};

// The following function names are provided to you to suggest how you might
// modularize your code. Keep it clean!

exports.readListOfUrls = function(callback) {
  var urls = [];
  return fs.readFile(exports.paths.list, (err, data) => {
    urls = data.toString('utf8').split(/\r?\n/);
    callback(urls);
  });
};

exports.isUrlInList = function(url, callback) {
  exports.readListOfUrls(function(urls) {
    callback(urls.indexOf(url) > -1);
  });
};

exports.addUrlToList = function(url, callback) {
  exports.readListOfUrls(function(urls) {
    if (urls.indexOf(url) === -1) {
      urls.push(url);
      fs.writeFile(exports.paths.list, urls.join('\n'), (err) => {
        callback();
      });
    } else {
      callback();
    }
  });
};

exports.isUrlArchived = function(url, callback) {
  fs.readFile(exports.paths.archivedSites + '/' + url, (err, data) => {
    if (err) {
      callback(false);
    } else {
      callback(true);
    }
  });
};

exports.downloadUrls = function(urlArray) {
  // var list;
  // exports.readListOfUrls(function(data) {
  //   list = data;
  // });
  for (var url of urlArray) {
    exports.isUrlArchived(url, function(isArchived) {
      if (!isArchived) {
        request({
          url: 'http://' + url
        }, (err, response, body) => {
          fs.writeFile(exports.paths.archivedSites + '/' + url, body);
        });
      }
    });
  }
};
