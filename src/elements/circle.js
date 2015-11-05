var Element = require("../element");
var utils = require("../utils");

function Circle() {
	Element.call(this);
	this.name = "Circle";
	// x and y represent the center of the circle
	this.radius = 10;
}

Circle.prototype = new Element();

Circle.prototype.init = function() {
	Element.prototype.init.call(this);
	this.css("background-color", utils.colorOne);
	return this;
};

Circle.prototype.render = function(ctx) {
	ctx.save();
	ctx.beginPath();
	ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
	ctx.closePath();
	this.applyBackgroundStyles(ctx);
	ctx.fill();
	this.applyBorderStyles(ctx);
	ctx.stroke();
	ctx.restore();
};

Circle.prototype.hitTest = function(x, y) {
	if (Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2) <= this.radius * this.radius) {
		return this;
	}
};

Circle.prototype.getBound = function() {
	return {
		x: this.x - this.radius,
		y: this.y - this.radius,
		width: this.radius * 2,
		height: this.radius * 2
	};
};

module.exports = Circle;