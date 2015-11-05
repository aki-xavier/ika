var Group = require("../group");
var utils = require("../utils");

function Stack() {
  Group.call(this);
  this.name = "Stack";
  this.width = 400;
  this.height = 300;
  // horizontal or vertical
  this.type = "horizontal";
  this.transitionType = "outExpo";
  this.index = 0;
  this.enableTransition = true;
}

Stack.prototype = new Group();

Stack.prototype.init = function() {
  Group.prototype.init.call(this);
  this.children.on("add", this.bind("resize"));
  this.children.on("rm", this.bind("resize"));
  this.children.on("moveto", this.bind("resize"));
  this.watchAttr("width", this.bind("resize"));
  this.watchAttr("height", this.bind("resize"));
  return this;
};

Stack.prototype.resize = function() {
  var self = this;
  this.children.iterate(function(child, index) {
    var x = 0, y = 0;
    if (self.type === "horizontal") {
      x = (index - self.index) * self.width;
    } else {
      y = (index - self.index) * self.height;
    }
    if (self.enableTransition) {
      child.animateTo(x, y, {
        type: self.transitionType
      });
    } else {
      child.x = x;
      child.y = y;
    }
  });
};

Stack.prototype.render = function(ctx) {
  ctx.save();
  this.applyTransform(ctx);
  this.renderBackground(ctx, true);
  this.clip(ctx, true);
  var self = this;
  
  var bound = {
    x: 0,
    y: 0,
    width: this.width,
    height: this.height
  };
  var rerender = false;
  this.children.iterate(function(child) {
    child._updateAnimation();
    if (!child.visible) {
      return;
    }
    if (utils.haveIntersection(bound, child.getBound())) {
      if (child.render(ctx)) {
        rerender = true;
      }
    }
  });
  this.renderBorder(ctx, true);
  ctx.restore();
  return rerender;
};

Stack.prototype.getBound = function() {
  return {
    x: this.x,
    y: this.y,
    width: this.width,
    height: this.height
  };
};

Stack.prototype.navTo = function(index, fn) {
  fn = fn || function() {};
  if (this.animations.length() !== 0) {
    fn("Existing animation running");
    return;
  }
  if (index === this.index) {
    fn("Is current stack");
    return;
  }
  if (index > this.children.length() - 1) {
    fn("Stack out of range");
    return;
  }
  this.index = index;
  this.resize();
  NotificationReceiver.emit("render", this);
  fn(null);
};

module.exports = Stack;