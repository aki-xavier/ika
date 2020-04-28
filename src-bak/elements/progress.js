var Element = require("../element");
var utils = require("../utils");

function Progress() {
	Element.call(this);
	this.name = "Progress";
	this.width = 150;
	this.height = 30;
	this.rate = 0;
}

Progress.prototype = new Element();

Progress.prototype.init = function() {
	Element.prototype.init.call(this);
	this.css({
		"border-color": utils.colorOne,
		"background-color": {
			type: "linear",
			colors: [
				[0, "black"],
				[0.9, "rgb(80,80,80)"],
				[1, "rgb(100,100,100)"]
			]
		},
		"color": {
			type: "linear",
			colors: [
				[0, "white"],
				[1, "rgb(235,235,235)"]
			]
		}
	});
	return this;
};

Progress.prototype.render = function(ctx) {
	ctx.save();
	this.renderBackground(ctx);
	ctx.save();
	this._applyStyle(ctx, "color");
	ctx.fillRect(this.x, this.y, this.width * this.rate, this.height);
	this.renderBorder(ctx);
	ctx.restore();
};

Progress.prototype.update = function(rate) {
	if (rate > 1) {
		rate = 1;
	} else if (rate < 0) {
		rate = 0;
	}
	this.rate = rate;
	NotificationReceiver.emit("render");
};

Progress.prototype.step = function(delta) {
	delta = delta || 0.05;
	this.rate += delta;
	if (this.rate > 1) {
		this.rate = 1;
	}
	NotificationReceiver.emit("render");
};

module.exports = Progress;