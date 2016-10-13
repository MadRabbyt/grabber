var fs = require('fs');
var Queue = require('./queue').Queue;

var log4js = require('log4js');
log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('logs/postform.log'), 'postform');
var logger = log4js.getLogger('postform');

var getFileList = require('./postforming').getFileList;
var reOrderArrayBy = require('./postforming').reOrderArrayBy;
var addArrayIndex = require('./postforming').addArrayIndex;

var order = [];

getFileList('./comming/', function (err, list) {
  // logger.info(JSON.stringify(list));
  heap = [];
  for (i in list) {
    re = /post(\d+)\.html/i;
    if (re.test(list[i])) {
      num = parseInt(re.exec(list[i])[1]);
      heap.push({num: num, name: list[i]});
    }
  }

  order = reOrderArrayBy(heap, 'num');

  var lastIndex = order.length;
  console.log(lastIndex);
  console.log(order[i]);
  var i = 1;

  while(i <= lastIndex) {
    // logger.info(order[i]);
    var entity = order[i];

    var queue = new Queue('Q');
    queue.push();
    fs.readFile('./comming/' + entity.name, function (err, body) {

      var newBody = '',
        navigator = '',
        prevFile = '#',
        nextFile = '#';
      if (i !== 1) prevFile = entity.name;
      nextFile = entity.name;
      if (i === lastIndex) nextFile = '#';
      navigator = '<a href="'+prevFile+'">Prev</a> <a href="'+nextFile+'">Next</a>';
      newBody = navigator + body;

      fs.writeFile('./comming/' + entity.name, newBody, function (err) {
        if (err) throw err;
        queue.pop();
      });
    });

    queue.addFinishEvent(function () {
      i++;
    });

  } // next order[i]

});
