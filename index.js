var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

var url = 'https://vk.com/topic-4918594_27696136?offset=0';
var urlEnd = 'https://vk.com/topic-4918594_27696136?offset=3560';
var opt = {
  encoding: 'utf8'
};

var saveInFile = function (fileName, body, next) {
  fs.writeFile(
    fileName,
    body,
    opt,
    (err) => {
      if (err) {
        throw new Error(err.message);
      }
      console.log(fileName + ' - OK');
      if (next) {
        next();
      }
    }
  );
}


request(url, (err, res, body) => {
  if (err) {
    throw new Error(err.message);
  }
  var $ = cheerio.load(body);
  var body = $('body').html();
  saveInFile('comming.html', body);

  var posts = $('.post_item');
  var i = 0;
  $('.post_item').each((i, elem) => {
    i++;
    var body = $(elem).html();
    var a = $(elem).find('a[name^="post"]');
    console.log(i,$(a).attr('name'));
    saveInFile('comming/'+$(a).attr('name')+'.html', body);
  });
});
