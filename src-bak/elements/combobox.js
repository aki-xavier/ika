var Input = require("./input");
var utils = require("../utils");
var ArrayMgr = require("arraymgr");
var Menu = require("../groups/menu");

function Combobox() {
	Input.call(this);
	this.name = "Combobox";
}

Combobox.prototype = new Input();

Combobox.prototype.init = function() {
	Input.prototype.init.call(this, this);
	this.editable = true;
	this.css("button-color", utils.colorOne);
	this.options = new ArrayMgr();
	this.menu = new Menu().init(this.width);
	this.createMenu();
	var self = this;
	this.watchAttr("options", function(options) {
		options = options.split(",");
		self.options = new ArrayMgr(options);
		self.createMenu();
	});
	this.on("mousedown", this.bind("onmousedown"));
	return this;
};

Combobox.prototype.addOption = function(option) {
	this.options.add(option);
	this.createMenu();
	return this;
};

Combobox.prototype.rmOption = function(option) {
	this.options.rm(option);
	this.createMenu();
	return this;
};

Combobox.prototype.createMenu = function() {
	this.menu.empty();
	var self = this;
	this.options.iterate(function(option) {
		self.menu.add(option, function() {
			self.value = this.value;
			self.emit("change", self.value);
		});
	});
};

Combobox.prototype.render = function(ctx, timestamp) {
	ctx.save();
	this.renderBackground(ctx);
	ctx.save();
	this.clip(ctx);
	ctx.font = this.css("font-size") + "px " + this.css("font-name");
	ctx.fillStyle = this.css("color");
	ctx.textAlign = this.css("text-align");
	ctx.textBaseline = "middle";
	ctx.translate(this.x, this.y);
	var value = this.value;
	if (this.type === "password") {
		var len = value.length;
		value = "";
		while (len--) {
			value += "*";
		}
	}
	var width = ctx.measureText(value).width;
	if (width > this.width - this.height - this.css("padding") * 2) {
		var offset = width - this.width + this.height + this.css("padding") * 2;
		ctx.fillText(value, this.css("padding") - offset, this.height / 2);
	} else {
		ctx.fillText(value, this.css("padding"), this.height / 2);
	}
	ctx.fillStyle = this.css("button-color");
	ctx.fillRect(this.width - this.height, 0, this.height, this.height);
	ctx.restore();
	this.renderBorder(ctx);
	ctx.restore();
};

Combobox.prototype.onclick = function(e) {
	var b = this.getBound();
	if (!utils.isPointInRect(e.x, e.y, b.x + b.width - b.height, b.y, b.height, b.height) && this.editable) {
		Input.prototype.onclick.call(this, arguments);
	}
};

Combobox.prototype.onmousedown = function(e) {
	var b = this.getBound();
	if (!this.editable || utils.isPointInRect(e.x, e.y, b.x + b.width - b.height, b.y, b.height, b.height)) {
		NotificationReceiver.emit("show-popover", this.menu, this);
	}
};

module.exports = Combobox;