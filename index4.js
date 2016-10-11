var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

var log4js = require('log4js');
log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('logs/grabber.log'), 'grabber');
var logger = log4js.getLogger('grabber');

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
      logger.info('saveIFile ' + fileName + ' - OK');
    });
}

var queueNumber = 0;

var Queue = function (aName) {
  this.counter = 0;
  this.name = (function() {
        queueNumber++;
        logger.info('new queue ' + aName + '/' + queueNumber);
        return aName + '/' + queueNumber;
      })();
  this.finishEvents = [];
  this.push = function () {
    this.counter++;
    logger.info('queue ' + this.name + ', inc counter ' + this.counter + '.');
  };
  this.pop = function () {
    this.counter--;
    logger.info('queue ' + this.name + ', sub counter ' + this.counter + '.');
    if (this.counter === 0) {
      this.fireFinish();
    }
  };
  this.addFinishEvent = function (func) {
    logger.info('queue ' + this.name + ', add finish events(' + this.finishEvents.length + ').');
    this.finishEvents.push(func);
  };
  this.addFireEvent = function (func) {
    logger.info('queue ' + this.name + ', add fire events(' + this.finishEvents.length + ').');
    this.finishEvents.push(func);
    if (this.counter === 0) {
      this.fireFinish();
    }
  };
  this.fireFinish = function (){
    logger.info('queue ' + this.name + ', fire finish.');
    var func = null;
    while (func=this.finishEvents.pop())
    {
      logger.info('queue ' + this.name + ', do events ' + this.finishEvents.length +' in fire finish.');
      func();
    }
  };

  return this;
};

function starter(err, data) {
  if (err) {
    return logger.error(err.message);
  }
  if (data.countdown >= 0) {
    var pageQueue = new Queue('QP');

    logger.info(JSON.stringify(data));
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
          saveInFile('comming/'+$(a).attr('name')+'.html', postBody);
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
