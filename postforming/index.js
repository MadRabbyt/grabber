var fs = require('fs');

function getFileList(path, callback) {
  var err = null;
  var list = [];
  fs.stat(path, function (err, stats) {
    if (err) return callback(err);
    if (!stats.isDirectory()) return callback(new Error(path + ' is not a directory'));
    fs.readdir(path, function (err, files) {
      if (err) throw err;
      callback(null, files);
    });
  });

}

function reOrderArrayBy(array, fieldName) {
  return array.sort( function (a, b) {
      if (a[fieldName] < b[fieldName]) {
        return -1;
      } else {
        return 1;
      };
      return 0;
    });
}

function addArrayIndex(array) {
  return array.map(function (value, index, array) {
    array[index].index = index;
  })
}


module.exports.getFileList = getFileList;
module.exports.reOrderArrayBy = reOrderArrayBy;
module.exports.addArrayIndex = addArrayIndex;
