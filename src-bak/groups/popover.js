var Group = require("../group");
var utils = require("../utils");

function Popover() {
  Group.call(this);
  this.name = "Popover";
}

Popover.prototype = new Group();

Popover.prototype.init = function() {
  Group.prototype.init.call(this, true);
  this.css({
    "border-width": 1,
    "border-color": utils.colorOne,
    "background-color": "white"
  });
  this.on("mousedown", this.bind("onmousedown"));
  this.on("click", this.bind("_receiveEvents"));
  this.on("mouseup", this.bind("_receiveEvents"));
  this.on("mousemove", this.bind("_receiveEvents"));
  this.on("mousewheel", this.bind("_receiveEvents"));
  this.on("mousedrag", this.bind("_receiveEvents"));
  this.on("mousedragend", this.bind("_receiveEvents"));
  return this;
};

Popover.prototype.hitTest = function(x, y) {
  return this;
};

Popover.prototype.onmousedown = function(event, ctx) {
  var x = event.x, y = event.y;
  var b = this.getBound();
  if (!utils.isPointInRect(x, y, b.x, b.y, b.width, b.height)) {
    this.emit("should-hide");
  } else {
    this._receiveEvents(event, ctx);
  }
};

module.exports = Popover;