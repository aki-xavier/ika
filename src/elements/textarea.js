var Element = require("../element");
var utils = require("../utils");

function Textarea() {
	Element.call(this);
	this.name = "Textarea";
	this.value = "";
	this.width = 200;
	this.height = 100;
	this.useCache = true;
	this.caches = [];
	this.lineNumber = 0;
	this.css({
		"text-baseline": "top",
		"text-align": "start",
		"line-height": 1.5,
		"font-weight": "normal",
		"font-name": "helvetica",
		"color": utils.colorOne
	});
	this.autoHeight = true;
}

Textarea.prototype = new Element();

Textarea.prototype.init = function() {
	Element.prototype.init.call(this);
	var self = this;
	this.watchAttr("value", function(val) {
		self.caches = [];
	});
	return this;
};

Textarea.prototype.render = function(ctx) {
	ctx.save();
	this.renderBackground(ctx);
	this.clip(ctx);
	ctx.font = this.css("font-weight") + " " + this.css("font-size") + "px " + this.css("font-name");
	ctx.fillStyle = this.css("color");
	ctx.textAlign = this.css("text-align");
	ctx.textBaseline = this.css("text-baseline");
	
	var rerender = false;
	
	if (this.useCache && this.caches.length !== 0) {
		this._drawWithCache(ctx);
	} else {
		var lines = this.value.split("\n");
		for (var i = 0; i < lines.length; i++) {
			if (this._drawLine(ctx, lines[i])) {
				rerender = true;
				break;
			}
		}
	}
	this.lineNumber = 0;
	ctx.restore();
	if (rerender) {
		this.caches = [];
		this.emit("size-changed", {
			height: this.height
		});
	}
	return rerender;
};

Textarea.prototype._getX = function() {
	var x = 0;
	var align = this.css("text-align");
	if (align === "center") {
		x = this.x + this.width / 2;
	} else if (align === "right") {
		x = this.x + this.width;
	} else {
		x = this.x;
	}
	return x;
}

Textarea.prototype._drawWithCache = function(ctx) {
	
	for (var i = 0, len = this.caches.length; i < len; i++) {
		this._drawText(ctx, this.caches[i], this._getX(),	 this.y + i * this.css("line-height") * this.css("font-size"));
	}
};

Textarea.prototype._drawLine = function(ctx, line) {
	var rerender = false;
	while (ctx.measureText(line).width > this.width) {
		var x = Math.floor(this.width * line.length / ctx.measureText(line).width);
		while (ctx.measureText(line.substring(0, x)).width < this.width) {
			x += 1;
		}
		while (ctx.measureText(line.substring(0, x)).width >= this.width) {
			x -= 1;
		}
		while (this._isCharInsideWord(line, x)) {
			x -= 1;
		}
		var _line = line.substring(0, x);
		this.caches.push(_line);
		this._drawText(ctx, _line, this._getX(), this.y + this.lineNumber * this.css("line-height") * this.css("font-size"));
		line = line.substring(x);
		if (this._checkHeight()) {
			rerender = true;
		}
		this.lineNumber += 1;
	}
	if (line !== "") {
		this.caches.push(line);
		this._drawText(ctx, line, this._getX(), this.y + this.lineNumber * this.css("line-height") * this.css("font-size"));
		if (this._checkHeight()) {
			rerender = true;
		}
		this.lineNumber += 1;
	}
	return rerender;
};

Textarea.prototype._isCharInsideWord = function(text, index) {
	var regex = /[a-z]/;
	return regex.test(text[index - 1]) && regex.test(text[index]);
};

Textarea.prototype._checkHeight = function() {
	if (!this.autoHeight) {
		return;
	}
	if ((this.lineNumber + 1) * this.css("line-height") * this.css("font-size") > this.height) {
		this.height = (this.lineNumber + 1) * this.css("line-height") * this.css("font-size");
		return true;
	}
};

Textarea.prototype._drawText = function(ctx, text, x, y) {
	ctx.fillText(text, x, y);
};

module.exports = Textarea;