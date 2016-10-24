var fs = require('fs');
var request = require('request');


var lots = {
  "1": {
    urlTpl: 'http://lopngoaingu.com/picture-dictionary/images/%num%.jpeg',
    num: {
      min: 1,
      max: 117},
    destFolder: 'lopngoaingu.com',
    fileTpl: 'image%num%.jpg'
  },
  "2": {
    urlTpl: 'http://lopngoaingu.com/picture-dictionary/dict2/dict%num%.jpg',
    num: {
      min: 1,
      max: 59},
    destFolder: 'lopngoaingu.com',
    fileTpl: 'dict%num%.jpg'
  }
};

var lN = "1";
var urlTpl = lots[lN].urlTpl;
var num = lots[lN].num;
var destFolder = '../../comming/' + lots[lN].destFolder;
var fileTpl = lots[lN].fileTpl;

function download(nn) {
  if (nn <= num.max) {
    var url = urlTpl.replace('%num%', nn+'');
    var fileName = destFolder + '/' + fileTpl.replace('%num%', nn+'');
    request(url, {encoding: null}, function(error, res, body) {
      if (!error && res.statusCode == 200) {
        console.log(url , ' to ', fileName);
        fs.writeFile(fileName, body, function (er) {
          if (er) throw er;
          download(nn + 1);
        });
      }
    });
  }
}

fs.stat(destFolder, function (e, stats) {
  console.log('test ' + destFolder);
  if (e && e.code != 'ENOENT') throw e;
  if (e && e.code == 'ENOENT') {
    fs.mkdir(destFolder, function (er) {
      if (er) throw er;
      download(num.min);
    });
  };
  if (stats.isDirectory()) {
    download(num.min);
  };
});
