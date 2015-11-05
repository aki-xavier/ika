var Element = require("../element");
var PICTURES = require("../public_pictures");

function Picture() {
	Element.call(this);
	this.name = "Picture";
	this.imgHeight = 0;
	this.imgWidth = 0;
	this.src = "";
	this.width = 400;
	this.height = 300;
	this.ready = false;
	this.type = "fitBoth";
	
	/* types of pictures:
	 * 1) original: the picture is rendered at the original size, in the center
	 * 2) fitOne: scale to fit width or height
	 * 3) fitBoth: scale to fit width and height
	 * 4) fitWidth
	 * 5) fitHeight
	 * 6) fitBottom
	 * 7) fitTop
	 * 8) fitRight
	 * 9) fitLeft
	 * 10) autoWidth
	 * 11) autoHeight
	 */
	this.types = [
		"original",
		"fitOne",
		"fitWidth",
		"fitHeight",
		"fitBoth",
		"fitBottom",
		"fitTop",
		"fitRight",
		"fitLeft",
		"autoWidth",
		"autoHeight"
	];
	this.caches = null;
}

Picture.prototype = new Element();

Picture.prototype.init = function() {
	Element.prototype.init.call(this);
	var self = this;
	this.watchAttr("width", function() {
		self.caches = null;
	});
	this.watchAttr("height", function() {
		self.caches = null;
	});
	this.watchAttr("src", function(src) {
		self.ready = false;
		if (PICTURES[src]) {
			self.img = PICTURES[src];
			if (self.img.getAttribute("loaded")) {
				self.imgHeight = self.img.height;
				self.imgWidth = self.img.width;
				self.ready = true;
				self.emit("load");
			} else {
				self.img.addEventListener("load", function() {
					self.imgHeight = this.height;
					self.imgWidth = this.width;
					self.ready = true;
					self.emit("load");
					NotificationReceiver.emit("render", self);
				});
			}
		} else {
			var img = document.createElement("img");
			img.src = src;
			PICTURES[src] = img;
			img.addEventListener("load", function() {
				self.imgHeight = this.height;
				self.imgWidth = this.width;
				this.setAttribute("loaded", true);
				self.ready = true;
				self.emit("load");
				NotificationReceiver.emit("render", self);
			});
			self.img = img;
		}
	});
	return this;
};

Picture.prototype.render = function(ctx) {
	ctx.save();
	this.renderBackground(ctx);
	this.clip(ctx);
	if (!this.ready) {
		ctx.textAlign = "center";
		ctx.fillStyle = "#eaeaea";
		ctx.fillText("loading", this.x + this.width / 2, this.y + this.height / 2);
	} else {
		ctx.translate(this.x, this.y);
		if (this.caches) {
			var c = this.caches;
			this._drawImage(ctx, c.x, c.y, c.width, c.height);
		} else {
			var key = "_render_" + this.type;
			if (this[key]) {
				this[key](ctx);
			}
		}
		this.renderBorder(ctx);
	}
	ctx.restore();
};

Picture.prototype._render_original = function(ctx) {
	var width = this.imgWidth;
	var height = this.imgHeight;
	var x = (this.getBound().width - width) / 2;
	var y = (this.getBound().height - height) / 2;
	this.caches = {
		x: x,
		y: y,
		width: width,
		height: height
	};
	this._drawImage(ctx, x, y, width, height);
};

Picture.prototype._render_fitOne = function(ctx) {
	var width = this.imgWidth;
	var height = this.imgHeight;
	var tan = width / height;
	var bound = this.getBound();
	var _width = bound.height * tan;
	var _height;
	if (_width >= bound.width) {
		_width = bound.width;
		_height = bound.width / tan;
	} else {
		_height = bound.height;
	}
	var x = (bound.width - _width) / 2;
	var y = (bound.height - _height) / 2;
	this.caches = {
		x: x,
		y: y,
		width: _width,
		height: _height
	};
	this._drawImage(ctx, x, y, _width, _height);
};

Picture.prototype._render_fitWidth = function(ctx) {
	var width = this.imgWidth;
	var height = this.imgHeight;
	var tan = width / height;
	var bound = this.getBound();
	var _width = bound.width;
	var _height = _width / tan;
	var x = 0;
	var y = (bound.height - _height) / 2;
	this.caches = {
		x: x,
		y: y,
		width: _width,
		height: _height
	};
	this._drawImage(ctx, x, y, _width, _height);
};

Picture.prototype._render_fitHeight = function(ctx) {
	var width = this.imgWidth;
	var height = this.imgHeight;
	var tan = width / height;
	var bound = this.getBound();
	var _height = bound.height;
	var _width = _height * tan;
	var x = (bound.width - _width) / 2;
	var y = 0;
	this.caches = {
		x: x,
		y: y,
		width: _width,
		height: _height
	};
	this._drawImage(ctx, x, y, _width, _height);
};

Picture.prototype._getRealBound = function() {
	var width = this.imgWidth;
	var height = this.imgHeight;
	var tan = width / height;
	var bound = this.getBound();
	var _width = bound.height * tan;
	var _height;
	if (_width >= bound.width) {
		_height = bound.height;
	} else {
		_width = bound.width;
		_height = bound.width / tan;
	}
	return {
		width: _width,
		height: _height
	};
};

Picture.prototype._render_fitBoth = function(ctx) {
	var bound = this.getBound();
	var rb = this._getRealBound();
	var x = (bound.width - rb.width) / 2;
	var y = (bound.height - rb.height) / 2;
	this.caches = {
		x: x,
		y: y,
		width: rb.width,
		height: rb.height
	};
	this._drawImage(ctx, x, y, rb.width, rb.height);
};

Picture.prototype._render_fitBottom = function(ctx) {	 
	var bound = this.getBound();
	var rb = this._getRealBound();
	var x = (bound.width - rb.width) / 2;
	var y = bound.height - rb.height;
	this.caches = {
		x: x,
		y: y,
		width: rb.width,
		height: rb.height
	};
	this._drawImage(ctx, x, y, rb.width, rb.height);
};

Picture.prototype._render_fitTop = function(ctx) {
	var bound = this.getBound();
	var rb = this._getRealBound();
	var x = (bound.width - rb.width) / 2;
	var y = 0;
	this.caches = {
		x: x,
		y: y,
		width: rb.width,
		height: rb.height
	};
	this._drawImage(ctx, x, y, rb.width, rb.height);
};

Picture.prototype._render_fitRight = function(ctx) {
	var bound = this.getBound();
	var rb = this._getRealBound();
	var x = bound.width - rb.width;
	var y = (bound.height - rb.height) / 2;
	this.caches = {
		x: x,
		y: y,
		width: rb.width,
		height: rb.height
	};
	this._drawImage(ctx, x, y, rb.width, rb.height);
};

Picture.prototype._render_fitLeft = function(ctx) {
	var bound = this.getBound();
	var rb = this._getRealBound();
	var x = 0;
	var y = (bound.height - rb.height) / 2;
	this.caches = {
		x: x,
		y: y,
		width: rb.width,
		height: rb.height
	};
	this._drawImage(ctx, x, y, rb.width, rb.height);
};

Picture.prototype._render_autoWidth = function(ctx) {
	var bound = this.getBound();
	var iw = this.imgWidth;
	var ih = this.imgHeight;
	var w = iw * bound.height / ih;
	if (this.width !== w) {
		this.width = w;
		this.emit("size-changed", {
			width: this.width,
			height: this.height
		});
	}
	this.caches = {
		x: 0,
		y: 0,
		width: this.width,
		height: this.height
	};
	this._drawImage(ctx, 0, 0, this.width, this.height);
};

Picture.prototype._render_autoHeight = function(ctx) {
	var bound = this.getBound();
	var iw = this.imgWidth;
	var ih = this.imgHeight;
	var h = ih * bound.width / iw;
	if (this.height !== h) {
		this.height = h;
		this.emit("size-changed", {
			width: this.width,
			height: this.height
		});
	}
	this.caches = {
		x: 0,
		y: 0,
		width: this.width,
		height: this.height
	};
	this._drawImage(ctx, 0, 0, this.width, this.height);
};

Picture.prototype._drawImage = function(ctx, x, y, width, height) {
	ctx.drawImage(this.img, x, y, width, height);
};

module.exports = Picture;