var path = require('path');
var archive = require('../helpers/archive-helpers');
var fs = require('fs');
// require more modules/folders here!

var parseUrl = function(url) {
  var splitUrl = url.split('%3A%2F%2F');
  url = splitUrl[1] || splitUrl[0];
  var parts = url.split('.');
  if (parts.length === 2) {
    return 'www.' + url;
  } else {
    return url;
  }
};

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
    req.on('data', function(d) {
      myUrl += d;
    });
    req.on('end', function() {

      //filtering excessivly long url input field
      var urlParts = myUrl.split('=');
      if (urlParts.length !== 2
          || urlParts[0] !== 'url') {
        res.writeHead(400);
        res.end();
      } else {

        reqUrl = parseUrl(urlParts[1]);

        archive.addUrlToList(reqUrl)
        .then(() => { // check if url is already archived
          res.writeHead(302);
          return archive.isUrlArchived(reqUrl);
        }).then((isArchived) => {
          if (!isArchived) { //page is not already archived
            fs.readFile(archive.paths.siteAssets + '/loading.html', (err, data) => {
              res.end(data.toString('utf8'));
            });
          } else { //page is archived. load it
            fs.readFile(archive.paths.archivedSites + '/' + reqUrl, (err, data) => {
              res.end(data.toString('utf8'));
            });
          }
        });
      }

    });

  } else {
    res.end();
  }

};
