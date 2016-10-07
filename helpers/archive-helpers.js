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

// exports.readListOfUrls = function(callback) {
//   var urls = [];
//   return fs.readFile(exports.paths.list, (err, data) => {
//     urls = data.toString('utf8').split(/\r?\n/).filter(str => str.length > 0);
//     callback(urls);
//   });
// };

exports.readListOfUrls = function() {
  return new Promise((resolve, reject) => {
    fs.readFile(exports.paths.list, (err, data) => {
      if (err) {
        reject(err);
      } else {
        var urls = data.toString('utf8').split(/\r?\n/).filter(str => str.length > 0);
        resolve(urls);
      }
    });
  });
};

// exports.isUrlInList = function(url, callback) {
//   exports.readListOfUrls(function(urls) {
//     callback(urls.indexOf(url) > -1);
//   });
// };

exports.isUrlInList = function(url) {
  return exports.readListOfUrls().then(urls => {
    return (urls.indexOf(url) > -1);
  });
};

// exports.addUrlToList = function(url, callback) {
//   exports.readListOfUrls(function(urls) {
//     if (urls.indexOf(url) === -1) {
//       urls.push(url);
//       console.log(url);
//       fs.writeFile(exports.paths.list, urls.join('\n') + '\n', (err) => {
//         callback();
//       });
//     } else {
//       callback();
//     }
//   });
// };

exports.addUrlToList = function(url) {
  return exports.readListOfUrls().then(urls => {
    if (urls.indexOf(url) === -1) {
      urls.push(url);
      fs.writeFile(exports.paths.list, urls.join('\n') + '\n', (err) => {
        if (err) {
          throw err;
        } else {
          return;
        }
      });
    }
  });
};

// exports.isUrlArchived = function(url, callback) {
//   fs.readFile(exports.paths.archivedSites + '/' + url, (err, data) => {
//     if (err) {
//       callback(false);
//     } else {
//       callback(true);
//     }
//   });
// };

exports.isUrlArchived = function(url) {
  return new Promise((resolve, reject) => {
    fs.readFile(exports.paths.archivedSites + '/' + url, (err, data) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

// exports.downloadUrls = function(urlArray) {
//   if (urlArray.length >= 1) {
//     exports.isUrlArchived(urlArray[0], function(isArchived) {
//       if (!isArchived) {
//         request({
//           url: 'http://' + urlArray[0]
//         }, (err, response, body) => {
//           fs.writeFile(exports.paths.archivedSites + '/' + urlArray[0], body);
//         });
//       }
//     });
//     exports.downloadUrls(urlArray.slice(1));
//   }
// };

exports.downloadUrls = function(urlArray) {
  if (urlArray.length >= 1) {
    exports.isUrlArchived(urlArray[0]).then((isArchived) => {
      if (!isArchived) {
        request({
          url: 'http://' + urlArray[0]
        }, (err, response, body) => {
          if (body !== undefined) {
            fs.writeFile(exports.paths.archivedSites + '/' + urlArray[0], body);
          } else {
            // compare sites.txt with list of archived sites, remove ones with
            exports.readListOfUrls().then(urls => {
              urls.splice(urls.indexOf(urlArray[0]), 1);
              fs.writeFile(exports.paths.list, urls.join('\n') + '\n');
            });
          }
        });
      }
    });
    exports.downloadUrls(urlArray.slice(1));
  }
};

