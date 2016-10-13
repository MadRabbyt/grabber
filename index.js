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
  logger.info('lastIndex ' + lastIndex);
  var i = 0;
  var entity = {};
  var newBody = '',
    navigator = '',
    prevFile = '#',
    nextFile = '#';

  while(i < lastIndex) {
    logger.info(i, order[i]);
    entity = order[i];

    var body = fs.readFileSync('./comming/' + entity.name);
    if (i !== 0) prevFile = order[i-1].name;
    if (i === lastIndex-1) {
      nextFile = '#';
    } else {
      nextFile = order[i+1].name;
    }
    navigator = '<a href="'+prevFile+'">Prev</a> <a href="'+nextFile+'">Next</a>';
    newBody = navigator + body;

    fs.writeFileSync('./comming/' + entity.name, newBody);

    i++;
  } // next order[i]

});
