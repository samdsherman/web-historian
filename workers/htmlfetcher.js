// Use the code in `archive-helpers.js` to actually download the urls
// that are waiting.

// crontab -e
// * * * * * /usr/local/bin/node /Users/student/Desktop/2016-09-web-historian/workers/htmlfetcher.js
var archive = require('../helpers/archive-helpers');

archive.readListOfUrls(function(urls) {
  archive.downloadUrls(urls);
});