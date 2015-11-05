var Element = require("../element");
var utils = require("../utils");

function Label() {
	Element.call(this);
	this.name = "Label";
	this.value = "";
	this.width = 100;
	this.height = 30;
	this.autoWidth = false;
	// text-align should be one of
	// [left, center, right]
	this.css({
		"padding": 5,
		"font-name": "helvetica",
		"font-weight": "normal",
		"text-align": "left",
		"text-baseline": "middle",
		"color": utils.colorOne,
		"background-color": utils.colorTwo,
		"text-shadow-x": 0,
		"text-shadow-y": 0,
		"text-shadow-color": "rgba(0, 0, 0, 0)",
		"text-shadow-blur": 0
	});
}

Label.prototype = new Element();

Label.prototype.render = function(ctx) {
	var rerender = false;
	ctx.save();
	ctx.font = this.css("font-weight") + " " + this.css("font-size") + "px " + this.css("font-name");
	//re-calculate button width
	if (this.autoWidth && ctx.measureText(this.value).width + this.css("padding") * 2 > this.width) {
		this.width = ctx.measureText(this.value).width + this.css("padding") * 2;
		this.emit("size-changed", {
			width: this.width
		});
		rerender = true;
	}
	this.renderBackground(ctx);
	this.clip(ctx);
	ctx.fillStyle = this.css("color");
	var textAlign = this.css("text-align");
	ctx.textAlign = textAlign;
	ctx.textBaseline = this.css("text-baseline");
	ctx.shadowOffsetX = this.css("text-shadow-x");
	ctx.shadowOffsetY = this.css("text-shadow-y");
	ctx.shadowColor = this.css("text-shadow-color");
	ctx.shadowBlur = this.css("text-shadow-blur");
	var x, y;
	y = this.y + this.height / 2;
	if (textAlign === "left") {
		x = this.css("padding") + this.x;
	} else if (textAlign === "center") {
		x = this.x + this.width / 2;
	} else if (textAlign === "right") {
		x = this.x + this.width - this.css("padding");
	}
	ctx.fillText(this.value, x, y);
	ctx.restore();
	return rerender;
};

module.exports = Label;
