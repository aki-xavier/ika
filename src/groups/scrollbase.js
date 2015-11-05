var Group = require("../group");
var ArrayMgr = require("arraymgr");
var utils = require("../utils");
var Scroller = require("../elements/scroller");
var Ease = require("ika-animations").Ease;
var Friction = require("ika-animations").Friction;

function Scrollbase() {
  Group.call(this);
  this.name = "Scrollbase";
  this.width = 400;
  this.height = 300;
  this.offsetX = 0;
  this.offsetY = 0;
  this.lastMouseDownPoint = null;
  this.lastOffsetX = 0;
  this.lastOffsetY = 0;
  this.allowXScroll = true;
  this.allowYScroll = true;
  this.showXScroller = true;
  this.showYScroller = true;
  this.allowFrictionAnimation = true;
  //lock the scollview
  this.locked = false;
}

Scrollbase.prototype = new Group();

//call init in child
Scrollbase.prototype.init = function() {
  Group.prototype.init.call(this, true);
  this.mousedragData = new ArrayMgr();
  this.xScroller = new Scroller().init()
  .attr("type", "horizontal");
  this.yScroller = new Scroller().init();
  this.on("mousedown", this.bind("_bindmousedown"));
  this.on("mousedrag", this.bind("_bindmousedrag"));
  this.on("mouseup", this.bind("_bindmouseup"));
  this.on("mousedragend", this.bind("_bindmousedragend"));
  this.on("mousewheel", this.bind("_bindmousewheel"));
  this.on("click", this.bind("_bindclick"));
  return this;
};

Scrollbase.prototype.resizeScrollers = function() {
  var _b = this._getBound();
  this.xScroller.length = -4 + (this.width * this.width) / _b.width;
  this.yScroller.length = -4 + (this.height * this.height) / _b.height;
  if (this.xScroller.length >= this.width) {
    this.xScroller.visible = false;
  } else {
    this.xScroller.visible = true;
  }
  if (this.yScroller.length >= this.height) {
    this.yScroller.visible = false;
  } else {
    this.yScroller.visible = true;
  }
  this.xScroller.y = this.height - this.xScroller.width - 2;
  this.yScroller.x = this.width - this.yScroller.width - 2;
};

Scrollbase.prototype.repositionScrollers = function() {
  var _b = this._getBound();
  this.xScroller.x = 2 - this.offsetX * this.width / _b.width;
  this.yScroller.y = 2 - this.offsetY * this.height / _b.height;
  if (this.xScroller.x + this.xScroller.length > this.width - 6) {
    this.xScroller.length = this.width - 6 - this.xScroller.x;
  }
  if (this.yScroller.y + this.yScroller.length > this.height - 6) {
    this.yScroller.length = this.height - 6 - this.yScroller.y;
  }
};

Scrollbase.prototype._getBound = function() {
  var width = 0, height = 0;
  this.children.iterate(function(child) {
    var bound = child.getBound();
    if (width < bound.x + bound.width) {
      width = bound.x + bound.width;
    }
    if (height < bound.y + bound.height) {
      height = bound.y + bound.height;
    }
  });
  return {
    x: 0,
    y: 0,
    width: width,
    height: height
  };
};

Scrollbase.prototype.getBound = function() {
  if (this.visible) {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  } else {
    return {
      x: this.x,
      y: this.y,
      width: 0,
      height: 0
    };
  }
};

Scrollbase.prototype._bindmousedown = function(event) {
  this.lastMouseDownPoint = {
    x: event.x,
    y: event.y
  };
  this.lastOffsetX = this.offsetX;
  this.lastOffsetY = this.offsetY;
  if (this.animations.length() !== 0) {
    this.animations.iterate(function(a) {
      a.abort();
    });
    this.animations.empty();
    this._shouldDispatchClickEvents = false;
  } else {
    this._shouldDispatchClickEvents = true;
  }
  this.mousedragData.empty();
};

Scrollbase.prototype._recordMousedragEvent = function(event) {
  this.mousedragData.add({
    time: Date.now(),
    x: event.x,
    y: event.y
  });
  if (this.mousedragData.length() >= 5) {
    this.mousedragData.rm(this.mousedragData.get(0));
  }
};

Scrollbase.prototype._bindmousedrag = function(event) {
  if (this.locked) {
    return;
  }
  this.xScroller.show();
  this.yScroller.show();
  this._recordMousedragEvent(event);
  var deltaX = event.x - this.lastMouseDownPoint.x;
  var deltaY = event.y - this.lastMouseDownPoint.y;
  var x = this.lastOffsetX;
  var y = this.lastOffsetY;
  var bound = this._getBound();
  if (this.allowXScroll) {
    x += deltaX;
    if (x > 0 || bound.width <= this.width) {
      x = x / 2;
    } else if (x + bound.width < this.width && bound.width >= this.width) {
      x = x + ((this.width - (x + bound.width)) / 2);
    }
  }
  if (this.allowYScroll) {
    y += deltaY;
    if (y > 0 || bound.height <= this.height) {
      y = y / 2;
    } else if (y + bound.height < this.height && bound.height >= this.height) {
      y = y + ((this.height - (y + bound.height)) / 2);
    }
  }
  this.attr("offsetX", x);
  this.attr("offsetY", y);
};

Scrollbase.prototype._bindmouseup = function(event) {
  if (this.mousedragData.length() === 0) {
    this.lastMouseDownPoint = null;
    this.xScroller.hide();
    this.yScroller.hide();
    var reachX = this.reachBoundary("x");
    var reachY = this.reachBoundary("y");
    if (reachX) {
      this.startEaseAnimation("x");
    }
    if (reachY) {
      this.startEaseAnimation("y");
    }
  }
};

Scrollbase.prototype._bindmousedragend = function(event) {
  this.lastMouseDownPoint = null;
  var reachX = this.reachBoundary("x");
  var reachY = this.reachBoundary("y");
  if (reachX) {
    this.startEaseAnimation("x");
  }
  if (reachY) {
    this.startEaseAnimation("y");
  }
  if (this.allowFrictionAnimation) {
    if (!reachX && this.allowXScroll) {
      this.startFrictionAnimation("x");
    }
    if (!reachY && this.allowYScroll) {
      this.startFrictionAnimation("y");
    }
  }
};

Scrollbase.prototype._bindmousewheel = function(event) {
  if (this.locked) {
    return;
  }
  var cb = this._getBound();
  if (this.allowYScroll && cb.height > this.height && event.wheelDeltaY) {
    var y = this.offsetY + event.wheelDeltaY * 0.2;
    if (y > 0) {
      y = 0;
    } else if (y < this.height - cb.height) {
      y = this.height - cb.height;
    }
    this.attr("offsetY", y);
  }
  if (this.allowXScroll && cb.width > this.width && event.wheelDeltaX) {
    var x = this.offsetX + event.wheelDeltaX * 0.2;
    if (x > 0) {
      x = 0;
    } else if (x < this.width - cb.width) {
      x = this.width - cb.width;
    }
    this.attr("offsetX", x);
  }
  this.xScroller.show();
  this.yScroller.show();
  this._lastMousewheelTime = Date.now();
  if (!this._hideScrollerInterval) {
    var self = this;
    this._hideScrollerInterval = setInterval(function() {
      if (Date.now() - self._lastMousewheelTime >= 500) {
        self.xScroller.hide();
        self.yScroller.hide();
        clearInterval(self._hideScrollerInterval);
        self._hideScrollerInterval = 0;
      }
    }, 200);
  }
  NotificationReceiver.emit("render", this);
};

Scrollbase.prototype._bindclick = function(event) {
  if (!this._shouldDispatchClickEvents) {
    return;
  }
  var e = event.clone();
  var r = this.transformPoint(e.x, e.y);
  e.x = r.x;
  e.y = r.y;
  e.x -= this.offsetX;
  e.y -= this.offsetY;
  var item = this._hitTest(e.x, e.y);
  if (item) {
    item.emit("click", e);
  }
};

Scrollbase.prototype.reachBoundary = function(cor, boundary) {
  cor = cor || "y";
  var b = cor === "x" ? "width" : "height";
  var key = "offset" + cor.toUpperCase();
  boundary = boundary || 0;
  boundary = Math.abs(boundary);
  var bound = this._getBound();
  if (this[key] > boundary) {
    return true;
  } else if (this[key] + bound[b] < this[b] - boundary) {
    return true;
  }
};

Scrollbase.prototype.startEaseAnimation = function(cor, to) {
  cor = cor || "y";
  var b = cor === "x" ? "width" : "height";
  var key = "offset" + cor.toUpperCase();
  var cb = this._getBound();
  if (cb[b] === 0) {
    return;
  }
  if (typeof(to) !== "number") {
    if (this[key] > 0) {
      to = 0;
    } else if (this[key] + cb[b] < this[b]) {
      if (cb[b] >= this[b]) {
        to = this[b] - cb[b];
      } else {
        to = 0;
      }
    }
  }
  var ea = new Ease(this[key], to, 500, "outExpo");
  var self = this;
  ea.on("step", function(value) {
    self[key] = value;
    self.emit("ease-animation-step", value);
  });
  ea.on("end", function() {
    self[key] = to;
    self.animations.rm(ea);
    self.xScroller.hide();
    self.yScroller.hide();
    self.emit("ease-animation-end", to);
  });
  this.animations.add(ea);
  this.emit("ease-animation-start", this[key]);
  ea.animate();
};

Scrollbase.prototype.render = function(ctx) {
  if (isNaN(this.offsetX)) {
    this.offsetX = this.lastOffsetX || 0;
  }
  if (isNaN(this.offsetY)) {
    this.offsetY = this.lastOffsetY || 0;
  }
  ctx.save();
  this.applyTransform(ctx);
  this.renderBackground(ctx, true);
  this.clip(ctx, true);
  ctx.save();
  ctx.translate(Math.round(this.offsetX), Math.round(this.offsetY));
  var b = {
    x: - Math.round(this.offsetX),
    y: - Math.round(this.offsetY),
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
    if (utils.haveIntersection(b, cb)) {
      if (child.render(ctx, b)) {
        rerender = true;
      }
    }
  });
  if (this.showXScroller || this.showYScroller) {
    this.resizeScrollers();
    this.repositionScrollers();
  }
  ctx.restore();
  this.xScroller._updateAnimation();
  this.yScroller._updateAnimation();
  if (this.showXScroller && this.xScroller.visible) {
    this.xScroller.render(ctx);
  }
  if (this.showYScroller && this.yScroller.visible) {
    this.yScroller.render(ctx);
  }
  this.renderBorder(ctx, true);
  ctx.restore();
  return rerender;
};

Scrollbase.prototype.getSpeed = function(cor) {
  cor = cor || "y";
  var vs = [];
  var self = this;
  this.mousedragData.iterate(function(d, i) {
    if (i == self.mousedragData.length() - 1) {
      return;
    }
    var dx = self.mousedragData.get(i + 1);
    var v = (dx[cor] - d[cor]) / (dx.time - d.time);
    vs.push(v);
  });
  var vsum = 0;
  for (var i = 0; i < vs.length; i++) {
    vsum += vs[i];
  }
  var _v;
  if (vs.length === 0) {
    _v = 0;
  } else {
    _v = vsum / vs.length;
  }
  if (_v > 2) {
    _v = 2;
  } else if (_v < -2) {
    _v = -2;
  }
  return _v;
};

Scrollbase.prototype.hitTest = function(x, y) {
  var np = this.transformPoint(x, y);
  x = np.x;
  y = np.y;
  var b = this.getBound();
  if (utils.isPointInRect(x, y, 0, 0, b.width, b.height)) {
    return this;
  }
};

Scrollbase.prototype.startFrictionAnimation = function(cor) {
  cor = cor || "y";
  var key = "offset" + cor.toUpperCase();
  var v = this.getSpeed(cor);
  if (Math.abs(v) <= 0.00001) {
    return;
  }
  if (v > 3) {
    v = 3;
  } else if (v < -3) {
    v = -3;
  }
  var cb = this._getBound();
  var fa = new Friction(this[key], v);
  var self = this;
  fa.on("step", function(value) {
    self[key] = value;
    self.emit("friction-animation-step", value);
    if (self.reachBoundary(cor, this.v * 30)) {
      fa.stop();
    }
  });
  fa.on("end", function() {
    self.animations.rm(fa);
    if (self.reachBoundary(cor)) {
      self.startEaseAnimation(cor);
    } else {
      self.xScroller.hide();
      self.yScroller.hide();
    }
    self.emit("friction-animation-end", self[key]);
  });
  this.animations.add(fa);
  this.emit("friction-animation-start", this[key]);
  fa.animate();
};

module.exports = Scrollbase;