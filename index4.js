var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var Queue = require('./queue').Queue;
var config = require('./config');

var log4js = require('log4js');
log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('logs/grabber4.log'), 'grabber');
var logger = log4js.getLogger('grabber');

var re = /\.(jpg|jpeg|png|bmp)(\|\d+)*/;
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
      logger.info('saveIFile ' + fileName + ' - OK');
    });
}

(function starter2(err, data) {
  if (err) {
    return logger.error(err.message);
  };
  if (data.iterator >= data.finish) {
    var url = data.url + data.iterator;

    processUrl(url, () => {
      data.iterator += data.delta;
      starter2(null, data);
    });
  };
}).(null, {
  url: config.get('urlTemplate'),
  iterator: config.get('interval:start'),
  finish: config.get('interval:finish'),
  delta: config.get('interval:delta'),
});


function precessUrl(url, callback) {
  var pageQueue = new Queue('QP');

  pageQueue.addFinishEvent( () => {

  });

  pageQueue.addFinishEvent( () => { callback(); });

  pageQueue.push();
  request(url, (err, res, body) => {
    var $ = cheerio.load(body);

    var before = $('a.mr_label').attr('href');
    $('a.mr_label').attr('href', 'http://vk.com' + before);

    var imgQueue = new Queue('QI');
    $('img').each((i, elem) => {
      var imgThumbSrc = $(elem).attr('src');
      var imgSrc = $(elem).attr('data-src_big');

      --> *
    });
    pageQueue.pop();
  });

}

function starter(err, data) {
  if (err) {
    return logger.error(err.message);
  }
  if (data.countdown >= 0) {
    var pageQueue = new Queue('QP');

    var url = urlTemplate + data.countdown;
    pageQueue.push();
    request(url, (err, res, body) => {
      var theBody = body;
      if (err) {
        logger.error(err.message);
        throw new Error(err.message);
      }
      var $ = cheerio.load(theBody);

      var before = $('a.mr_label').attr('href');
      $('a.mr_label').attr('href', 'http://vk.com' + before);

      var theQueue = new Queue('Q' + data.countdown + '');

      $('img').each((i, elem) => {
        var re = /\.(jpg|jpeg|png|bmp)(\|\d+)*/;
        var imgThumbSrc = $(elem).attr('src');
        var imgSrc = $(elem).attr('data-src_big');
        if (imgSrc) {
          logger.info('find big image ' + imgSrc);
          if (re.test(imgSrc)) {
            var ext = re.exec(imgSrc)[1];
            var pref = "data:image/"+ext+";base64,";
            logger.info(imgSrc, ext, pref);

            theQueue.push();
            var src = /(.*\.(jpg|jpeg|png|bmp))(\|\d+)*/.exec($(elem).attr('data-src_big'))[1];
            logger.info('try download image ' + src);
            request(src, {encoding: 'base64'}, (err, res, body) => {
              $(elem).attr('src', pref+body);
              theQueue.pop();
            });
          }
        } else {
          logger.info('find image ' + imgThumbSrc);
          if (re.test(imgThumbSrc)) {
            var ext = re.exec(imgThumbSrc)[1];
            var pref = "data:image/"+ext+";base64,";
            logger.info(imgThumbSrc, ext, pref);

            theQueue.push();
            request($(elem).attr('src'), {encoding: 'base64'}, (err, res, body) => {
              $(elem).attr('src', pref+body);
              theQueue.pop();
            });
          }
        }
      });

      theQueue.addFinishEvent( function () {
        $('.post_item').each((i, elem) => {
          var postBody = $(elem).html();
          var a = $(elem).find('a[name^="post"]');
          saveInFile('comming4/'+$(a).attr('name')+'.html', postBody);
        });
      });
      pageQueue.pop();
    });

    pageQueue.addFinishEvent( function () {
      data.countdown -= data.diff;
      starter(null, data);
    });
  }
}


starter(null, {countdown: 20, diff: 20});
