var Group = require("../group");

/* List do not have fixed size
 * its size changes with its items
 * items do not have fixed positions
 * positions are assigned by list
 */
function Listbase() {
  Group.call(this);
  this.name = "Listbase";
  
  //type: vertical or horizontal
  this.type = "vertical";
  this.width = 0;
  this.height = 0;
  // If enableTransition is set to true, there will be animations
  // When children is somehow changed: add, rm or moveto
  this.enableTransition = false;
  this.widthFixed = false;
  this.heightFixed = false;
  this.childMargin = 0;
}

Listbase.prototype = new Group();

Listbase.prototype.init = function() {
  Group.prototype.init.call(this);
  this.children.on("add", this.bind("resize"));
  this.children.on("rm", this.bind("resize"));
  this.children.on("moveto", this.bind("resize"));
  this.children.on("size-changed", this.bind("resize"));
  this.watchAttr("childMargin", this.bind("resize"));
  return this;
};

Listbase.prototype.resize = function() {
  this["_assign_" + this.type]();
  NotificationReceiver.emit("render", this);
};

Listbase.prototype.reset = function() {
  this.children.iterate(function(child) {
    child.x = child.y = 0;
  });
};

// Re-position children for Listbase type vertical
Listbase.prototype._assign_vertical = function() {
  var self = this;
  var height = 0;
  this.children.iterate(function(child) {
    var bound = child.getBound();
    if (bound.x !== 0 || height !== bound.y) {
      if (self.enableTransition) {
        child.animateTo(0, height);
      } else {
        child.x = 0;
        child.y = height;
      }
    }
    height += bound.height;
    height += self.childMargin;
  });
  height -= this.childMargin;
  if (!this.heightFixed) {
    this.height = height;
  }
};

// Re-position children for Listbase type horizontal
Listbase.prototype._assign_horizontal = function() {
  var self = this;
  var width = 0;
  this.children.iterate(function(child) {
    var bound = child.getBound();
    if (width !== bound.x || bound.y !== 0) {
      if (self.enableTransition) {
        child.animateTo(width, 0);
      } else {
        child.x = width;
        child.y = 0;
      }
    }
    width += bound.width;
    width += self.childMargin;
  });
  width -= this.childMargin;
  if (!this.widthFixed) {
    this.width = width;
  }
};

module.exports = Listbase;