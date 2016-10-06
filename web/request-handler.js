var path = require('path');
var archive = require('../helpers/archive-helpers');
var fs = require('fs');
// require more modules/folders here!

exports.handleRequest = function (req, res) {
  if (req.method === 'GET') {
    if (req.url === '/') {
      fs.readFile(archive.paths.siteAssets + '/index.html', (err, data) => {
        res.end(data.toString('utf8'));
      });
    } else {
      fs.readFile(archive.paths.archivedSites + req.url, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end();
        } else {
          res.end(data.toString('utf8'));
        }
      });
    }
  } else if (req.method === 'POST') {
    var myUrl = '';
    console.log('posting');
    req.on('data', function(d) {
      myUrl += d;
    });
    req.on('end', function() {
      reqUrl = myUrl.slice(4);
      archive.addUrlToList(reqUrl, function() {
        res.writeHead(302);
        archive.isUrlArchived(reqUrl, function(isArchived) {
          if (!isArchived) {
            fs.readFile(archive.paths.siteAssets + '/loading.html', (err, data) => {
              res.end(data.toString('utf8'));
            });
          } else {
            fs.readFile(archive.paths.archivedSites + '/' + reqUrl, (err, data) => {
              res.end(data.toString('utf8'));
            });
          }
        });
      });
    });
  } else {
    res.end();
  }

};
