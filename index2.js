var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var async = require('async');

var log4js = require('log4js');
log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('logs/images.log'), 'images');
var logger = log4js.getLogger('images');

var urlTemplate = 'https://vk.com/topic-4918594_27696136?offset=';
var url = 'https://vk.com/topic-4918594_27696136?offset=0';
var urlEnd = 'https://vk.com/topic-4918594_27696136?offset=3560';

var counter = 0;
var opt = {
  encoding: 'utf8'
};


var saveInFile = function (fileName, body) {
  fs.writeFile(
    fileName,
    body,
    opt,
    (err) => {
      if (err) {
        throw new Error(err.message);
      }
      logger.info(fileName + ' - OK');
    });
}


function starter(err, data) {
  if (err) {
    return logger.error(err.message);
  }
  if (data.countdown >= 0) {
    logger.info(JSON.stringify(data));
    var url = urlTemplate + data.countdown;
    request(url, (err, res, body) => {
      var theBody = body;
      if (err) {
        logger.error(err.message);
        throw new Error(err.message);
      }

      var $ = cheerio.load(theBody);

      async.series([
        function (callback) {
          var before = $('a.mr_label').attr('href');
          $('a.mr_label').attr('href', 'http://vk.com' + before);
          callback(null, 'rebase links');
        },
        function (callback) {
          for(i in $('img')) {
            var elem = $('img')[i];
            var imgSrc = $(elem).attr('src');
            logger.info(imgSrc);
            var re = /\.(jpg|jpeg|png|bmp)(\|\d+)*/;
            if (re.test(imgSrc)) {
              var ext = re.exec(imgSrc)[1];
              var pref = "data:image/"+ext+";base64,";
              logger.info(imgSrc, ext, pref);

              request($(elem).attr('src'), {encoding: 'base64'}, (err, res, body) => {
                logger.info(pref+body);
                $(elem).attr('src', pref+body)
              });
            }
          };
          callback(null, 'rebase images');
        },
        function (callback) {
          // save posts
          var posts = $('.post_item');
          $('.post_item').each((i, elem) => {
            var postBody = $(elem).html();
            var a = $(elem).find('a[name^="post"]');
            saveInFile('comming/'+$(a).attr('name')+'.html', postBody);
          });
          callback(null, 'save posts');
        }
      ],
      function (err, res) {
        if (err) throw err;
        data.countdown -= data.diff;
        starter(null, data);
      });

      // // rebase links
      // var before = $('a.mr_label').attr('href');
      // $('a.mr_label').attr('href', 'http://vk.com' + before);

      // // rebase images
      // $('img').each((i, elem) => {
      //   var imgSrc = $(elem).attr('src');
      //   logger.info(imgSrc);
      //   var re = /\.(jpg|jpeg|png|bmp)(\|\d+)*/;
      //   if (re.test(imgSrc)) {
      //     var ext = re.exec(imgSrc)[1];
      //     var pref = "data:image/"+ext+";base64,";
      //     logger.info(imgSrc, ext, pref);

      //     request($(elem).attr('src'), {encoding: 'base64'}, (err, res, body) => {
      //       logger.info(pref+body);
      //       $(elem).attr('src', pref+body)
      //     });
      //   }
      // });

      // // save posts
      // var posts = $('.post_item');
      // $('.post_item').each((i, elem) => {
      //   var postBody = $(elem).html();
      //   var a = $(elem).find('a[name^="post"]');
      //   saveInFile('comming/'+$(a).attr('name')+'.html', postBody);
      // });

      // data.countdown -= data.diff;
      // starter(null, data);
    });
  }
}


starter(null, {countdown: 20, diff: 20});
