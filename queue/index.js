var queueNumber = 0;

var Queue = function (aName) {
  this.counter = 0;
  this.name = (function() {
        queueNumber++;
        return aName + '/' + queueNumber;
      })();
  this.finishEvents = [];
  this.push = function () {
    this.counter++;
  };
  this.pop = function () {
    this.counter--;
    if (this.counter === 0) {
      this.fireFinish();
    }
  };
  this.addFinishEvent = function (func) {
    this.finishEvents.push(func);
  };
  this.addFireEvent = function (func) {
    this.finishEvents.push(func);
    if (this.counter === 0) {
      this.fireFinish();
    }
  };
  this.fireFinish = function (){
    var func = null;
    while (func=this.finishEvents.pop())
    {
      func();
    }
  };

  return this;
};


module.exports.Queue = Queue;
