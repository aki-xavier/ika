var Element = require("../element");
var utils = require("../utils");
var Ease = require("ika-animations").Ease;

function Scroller() {
	Element.call(this);
	this.type = "vertical";
	this.width = 4;
	this.css("opacity", 0);
}

Scroller.prototype = new Element();

Scroller.prototype.init = function() {
	Element.prototype.init.call(this);
	return this;
};

Scroller.prototype.getBound = function() {
	if (this.type === "vertical") {
		return {
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.length
		};
	} else {
		return {
			x: this.x,
			y: this.y,
			width: this.length,
			height: this.width
		};
	}
};

Scroller.prototype.hitTest = function(x, y) {
	var b = this.getBound();
	if (utils.isPointInRect(x, y, b.x, b.y, b.width, b.height)) {
		return this;
	}
};

Scroller.prototype.render = function(ctx) {
	if (this.css("opacity") === 0) {
		return;
	}
	ctx.save();
	ctx.fillStyle = "rgba(50, 50, 50, " + this.css("opacity") + ")";
	ctx.shadowColor = "rgba(255,255,255,0.3)";
	ctx.shadowBlur = 10;
	var b = this.getBound();
	ctx.beginPath();
	ctx.rect(b.x, b.y, b.width, b.height);
	ctx.closePath();
	ctx.fill();
	ctx.restore();
};

Scroller.prototype.hide = function() {
	if (this.isHiding) {
		return;
	}
	this.isHiding = true;
	var self = this;
	self.hideTimeout = setTimeout(function() {
		self.hideTimeout = null;
		var sa = new Ease(self.css("opacity"), 0, 200);
		self.animations.add(sa);
		sa.on("step", function(value) {
			self.css("opacity", value);
		});
		sa.on("end", function() {
			self.css("opacity", 0);
			self.animations.rm(sa);
			self.isHiding = false;
		});
		sa.animate();
	}, 200);
};

Scroller.prototype.show = function() {
	if (!this.isHiding) {
		this.css("opacity", 0.8);
		return;
	}
	if (this.hideTimeout) {
		clearTimeout(this.hideTimeout);
		this.hideTimeout = null;
	}
	this.animations.iterate(function(a) {
		a.abort();
	});
	this.animations.empty();
	this.css("opacity", 0.8);
	this.isHiding = false;
};

module.exports = Scroller;