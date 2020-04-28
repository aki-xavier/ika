var Ease = require("ika-animations").Ease;
var utils = require("../utils");
var Scrollbase = require("./scrollbase");
var Listbase = require("./listbase");

function Swipe() {
  Scrollbase.call(this);
  this.name = "Swipe";
  this.type = "horizontal";
  this.allowYScroll = false;
  this.showXScroller = false;
  this.showYScroller = false;
  this.allowFrictionAnimation = false;
  this.playIntervalId = 0;
  this.intervalTime = 1000;
  this.showSegments = true;
  this._disableAutoPlay = false;
  this.widthFixed = true;
  this.heightFixed = true;
  this.childMargin = 0;
  this.index = 0;
}

Swipe.prototype = new Scrollbase();

Swipe.prototype.init = function() {
  Scrollbase.prototype.init.call(this);
  this.off("mousewheel");
  this.on("mousedragend", this.bind("bindmousedragend"));
  var self = this;
  this.on("mousedown", function(event) {
    self._disableAutoPlay = true;
  });
  this.children.on("add", this.bind("resize"));
  this.children.on("rm", this.bind("resize"));
  this.children.on("moveto", this.bind("resize"));
  this.watchAttr("type", function(val) {
    if (val === "horizontal") {
      self.allowYScroll = false;
      self.allowXScroll = true;
    } else {
      self.allowYScroll = true;
      self.allowXScroll = false;
    }
    self.resize();
  });
  return this;
};

Swipe.prototype.resize = Listbase.prototype.resize;
Swipe.prototype._assign_vertical = Listbase.prototype._assign_vertical;
Swipe.prototype._assign_horizontal = Listbase.prototype._assign_horizontal;

Swipe.prototype.bindmousedragend = function(event) {
  this._disableAutoPlay = false;
  var cor = this.type === "horizontal" ? "x" : "y";
  if (this.reachBoundary(cor)) {
    return;
  }
  var index;
  if (this.getSpeed(cor) <= 0) {
    index = this.findCurrentItem(false);
  } else {
    index = this.findCurrentItem(true);
  }
  this.scrollTo(index);
};

Swipe.prototype.getSpeed = function(cor) {
  cor = cor || "y";
  var len = this.mousedragData.length();
  if (len === 0) {
    return -1;
  }
  return this.mousedragData.get(len - 1)[cor] - this.mousedragData.get(0)[cor];
};

Swipe.prototype.scrollTo = function(index) {
  var item = this.children.get(index);
  if (!item) {
    return;
  }
  this.index = index;
  var b = item.getBound();
  var cor = this.type === "horizontal" ? "x" : "y";
  var key = "offset" + cor.toUpperCase();
  var ea = new Ease(this[key], - b[cor], 500, "outExpo");
  var self = this;
  ea.on("step", function(value) {
    self[key] = value;
    self.emit("ease-animation-step", value);
  });
  ea.on("end", function() {
    self[key] = - b[cor];
    self.animations.rm(ea);
    NotificationReceiver.emit("render", self);
    self.emit("ease-animation-end", - b[cor]);
  });
  this.animations.add(ea);
  this.emit("ease-animation-start", this[key]);
  ea.animate();
};

Swipe.prototype.findCurrentItem = function(leftToRight) {
  var self = this;
  var cor = this.type === "horizontal" ? "x" : "y";
  var size = cor === "x" ? "width" : "height";
  var key = "offset" + cor.toUpperCase();
  var index;
  if (leftToRight) {
    this.children.iterate(function(c, i) {
      var b = c.getBound();
      if (b[cor] + b[size] + self[key] >= 0) {
        index = i;
        return true;
      }
    });
  } else {
    this.children.iterate(function(c, i) {
      var b = c.getBound();
      if (b[cor] + self[key] >= 0) {
        index = i;
        return true;
      }
    });
  }
  return index;
};

Swipe.prototype._renderSegments = function(ctx) {
  ctx.save();
  ctx.shadowBlur = 2;
  ctx.shadowColor = "rgba(0,0,0,1)";
  var count = this.children.length();
  var r = 4;
  var delta = 10;
  var width = count * r * 2 + (count - 1) * delta;
  var bound = this.getBound();
  if (this.type === "horizontal") {
    var x = (bound.width - width) / 2;
    var y = bound.height - delta;
    for (var i = 0; i < count; i++) {
      if (i === this.index) {
        ctx.fillStyle = "white";
      } else {
        ctx.fillStyle = "rgba(255,255,255,0.5)";
      }
      ctx.beginPath();
      ctx.arc(x + i * (r * 2 + delta), y, r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    }
  } else {
    var x = (bound.width - delta);
    var y = (bound.height - width) / 2;
    for (var i = 0; i < count; i++) {
      if (i === this.index) {
        ctx.fillStyle = "white";
      } else {
        ctx.fillStyle = "rgba(255,255,255,0.5)";
      }
      ctx.beginPath();
      ctx.arc(x, y + i * (r * 2 + delta), r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.restore();
};

Swipe.prototype.render = function(ctx) {
  ctx.save();
  this.applyTransform(ctx);
  this.renderBackground(ctx, true);
  this.clip(ctx, true);
  ctx.save();
  ctx.translate(this.offsetX, this.offsetY);
  var b = {
    x: 0,
    y: 0,
    width: this.width,
    height: this.height
  };
  var self = this;
  var rerender = false;
  this.children.iterate(function(child) {
    child._updateAnimation();
    if (!child.visible) {
      return;
    }
    var cb = child.getBound();
    cb.x += self.offsetX;
    cb.y += self.offsetY;
    if (utils.haveIntersection(b, cb)) {
      if (child.render(ctx)) {
        rerender = true;
      }
    }
  });
  ctx.restore();
  if (this.showSegments) {
    this._renderSegments(ctx);
  }
  this.renderBorder(ctx, true);
  ctx.restore();
  return rerender;
};

Swipe.prototype.play = function() {
  if (this.playIntervalId) {
    return;
  }
  var self = this;
  this.playIntervalId = setInterval(function() {
    if (self._disableAutoPlay) {
      return;
    }
    if (self.index < self.children.length() - 1) {
      self.index++;
    } else {
      self.index = 0;
    }
    self.scrollTo(self.index);
  }, this.intervalTime);
};

Swipe.prototype.stop = function() {
  if (!this.playIntervalId) {
    return;
  }
  clearInterval(this.playIntervalId);
  this.playIntervalId = 0;
};

module.exports = Swipe;