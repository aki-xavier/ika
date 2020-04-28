var Group = require("../group");

function Fan() {
  Group.call(this);
  this.name = "Fan";
  this.startAngel = - Math.PI / 2;
  this.endAngel = Math.PI / 2;
  this.radius = 50;
}

Fan.prototype = new Group();

Fan.prototype.resize = function() {
  var length = this.children.length();
  if (length === 0) {
    return;
  }
  var delta = 0;
  if (length !== 1) {
    delta = (this.endAngel - this.startAngel) / (length - 1);
  }
  var self = this;
  this.children.iterate(function(child, index) {
    var a = self.startAngel + index * delta;
    while (a < 0) {
      a += Math.PI * 2;
    }
    while (a > Math.PI * 2) {
      a -= Math.PI * 2;
    }
    var x = Math.cos(a) * self.radius;
    var y = Math.sin(a) * self.radius;
    child.animateTo(x, y);
  });
};

Fan.prototype.reset = function() {
  this.children.iterate(function(child) {
    child.animateTo(0, 0);
  });
};

module.exports = Fan;