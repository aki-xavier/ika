var Group = require("../group");
var Listbase = require("./listbase");
var Label = require("../elements/label");
var utils = require("../utils");

function Menu() {
  Listbase.call(this);
  this.name = "Menu";
  this.colorOne = utils.colorOne;
}

Menu.prototype = new Listbase();

Menu.prototype.init = function(labelWidth) {
  Listbase.prototype.init.call(this);
  this.attr("childMargin", 5);
  this.css({
    "color": utils.colorOne,
    "second-color": utils.colorTwo
  });
  this.children.on("add", this.bind("unifyWidth"));
  this.children.on("rm", this.bind("unifyWidth"));
  this.children.on("moveto", this.bind("unifyWidth"));
  this.labelWidth = labelWidth;
  return this;
};

Menu.prototype.add = function(name, fn) {
  fn = fn || function() {};
  var self = this;
  var label = new Label().init()
  .attr({
    "value": name,
    "autoWidth": true
  });
  this._bindEventsForLabel(label, fn);
  this.children.add(label);
  return this;
};

Menu.prototype._bindEventsForLabel = function(label, fn) {
  var self = this;
  label.on("mousemove", function() {
    self.children.iterate(function(child) {
      child.css({
        "color": self.css("color"),
        "background-color": "rgba(0, 0, 0, 0)"
      });
    });
    this.css({
      "color": self.css("second-color"),
      "background-color": self.css("color")
    });
  });
  label.on("mousedown", function() {
    self.children.iterate(function(child) {
      child.css({
        "color": self.css("color"),
        "background-color": "rgba(0, 0, 0, 0)"
      });
    });
    this.css({
      "color": self.css("second-color"),
      "background-color": self.css("color")
    });
  });
  label.on("mousedragend", function() {
    this.css({
      "color": self.css("color"),
      "background-color": "rgba(0, 0, 0, 0)"
    });
  });
  label.on("mouseup", function() {
    this.css({
      "color": self.css("color"),
      "background-color": "rgba(0, 0, 0, 0)"
    });
    fn.apply(label, arguments);
    self.emit("select", label.attr("value"));
    NotificationReceiver.emit("hide-popover");
  });
  label.on("size-changed", this.bind("unifyWidth"));
};

Menu.prototype.unifyWidth = function() {
  var max = 0;
  if (this.labelWidth) {
    max = this.labelWidth;
  } else {
    this.children.iterate(function(child) {
      var b = child.getBound();
      if (b.width > max) {
        max = b.width;
      }
    });
  }
  this.children.iterate(function(child) {
    child.attr("width", max);
  });
};

Menu.prototype.rm = function(name) {
  var label = this.children.query({value: name});
  if (label) {
    this.children.rm(label);
    label.dispose();
    NotificationReceiver.emit("render", this);
  }
  return this;
};

Menu.prototype.empty = function() {
  this.children.iterate(function(child) {
    child.removeAllListeners();
  });
  this.children.empty();
};

module.exports = Menu;