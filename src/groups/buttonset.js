var Listbase = require("./listbase");
var Button = require("../elements/button");

// Buttonset inherits from Listbase
function Buttonset(opts) {
  Listbase.call(this);
  this.name = "Buttonset";
  this.isInput = true;
  opts = opts || {};
  this.values = {};
  
  // The distance between buttons
  this.childMargin = 10;
  
  // Only two types: horizontal and vertical
  this.type = "horizontal";
  
  // Whether there can be multiple buttons selected at the same time
  this.multiple = opts.multiple || false;
  
  // Whether you can de-select all buttons at the same time
  this.unselectable = opts.unselectable || false;
  if (this.multiple) {
    this.unselectable = true;
  }
}

Buttonset.prototype = new Listbase();

Buttonset.prototype._bindEventsForButton = function(button) {
  var self = this;
  button.on("click", function() {
    if (self.multiple) {
      if (this.active) {
        this.active = false;
      } else {
        this.active = true;
      }
      self.emit("change", self.getValue());
    } else {
      var activeButton = self._findActiveButton();
      if (!activeButton) {
        this.active = true;
        self.emit("change", self.getValue());
      } else {
        if (activeButton === this) {
          if (self.unselectable) {
            this.active = false;
            self.emit("change", self.getValue());
          }
        } else {
          activeButton.active = false;
          this.active = true;
          self.emit("change", self.getValue());
        }
      }
    }
    NotificationReceiver.emit("render", self);
  });
};

Buttonset.prototype._findActiveButton = function() {
  var _child;
  this.children.iterate(function(child) {
    if (child.active) {
      _child = child;
      return true;
    }
  });
  return _child;
};

Buttonset.prototype.addButton = function() {
  for (var i = 0; i < arguments.length; i++) {
    var button = new Button(arguments[i]).init();
    this.children.add(button);
    this._bindEventsForButton(button);
    button.css("border-radius", 0);
  }
  return this;
};

Buttonset.prototype.findButton = function(name) {
  var _child;
  this.children.iterate(function(child) {
    if (child.value === name) {
      _child = child;
      return true;
    }
  });
  return _child;
};

Buttonset.prototype.rmButton = function(name) {
  var child = this.findButton(name);
  if (child) {
    this.children.rm(child);
  }
  return this;
};

// Return each buttons state
Buttonset.prototype.getValue = function() {
  var value = {};
  this.children.iterate(function(child) {
    value[child.value] = child.active;
  });
  return value;
};

Buttonset.prototype.setValue = function(value) {
  for (var k in value) {
    if (value[k]) {
      this.activateButtonByName(k);
    }
  }
};

Buttonset.prototype.reset = function() {
  this.children.iterate(function(child) {
    child.active = false;
  });
};

Buttonset.prototype.activateButtonByName = function(name) {
  var button = this.findButton(name);
  if (button) {
    button.active = true;
  }
};

Buttonset.prototype.activateButtonAtIndex = function(index) {
  if (index < this.children.length() && index >= 0) {
    this.children.get(index).active = true;
  }
};

module.exports = Buttonset;
