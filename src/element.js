var Emitter = require("emitter");
var ArrayMgr = require("arraymgr");
var utils = require("./utils");
var PICTURES = require("./public_pictures");
var gaussian = require("./gaussian");

var Ease = require("ika-animations").Ease;

function Element() {
	Emitter.call(this);
	this.name = "Element";
	this.visible = true;

	// x and y represent the left-top point of each element
	this.x = 0;
	this.y = 0;
	this.height = 0;
	this.width = 0;

	// Some default styles
	this.styles = {
		"border-width": 0,
		"box-shadow-x": 0,
		"box-shadow-y": 0,
		"box-shadow-blur": 0,
		"box-shadow-color": "rgba(0, 0, 0, 0)",
		"border-color": "rgba(0, 0, 0, 0)",
		"background-color": "rgba(0, 0, 0, 0)",
		"border-radius": 0,
		"color": "black",
		"font-size": 14,
		"font-name": "helvetica"
	};
	this._attrChangeWatchers = {};
	this._cssChangeWatchers = {};
}

Element.prototype = new Emitter();

Element.prototype.init = function() {
	// "animations" stores all animations, and will be automatically processed
	// in scene.render function
	this.animations = new ArrayMgr();
	var self = this;
	this.watchCss("background-image", function() {
		self._background_image = null;
		self._background_image_ready = false;
	});
	return this;
};

/* "render" is called when the element needs to
 * be drawed on the screen, and it comes with one parameters
 * 1) ctx: the Canvas2DContext
 */
Element.prototype.render = function(ctx) {

};

/* hitTest is called when we want to know which element should respond
 * to the event, receiving x and y representing the position of the event
 * should return the exact object
 */
Element.prototype.hitTest = function(x, y) {
	var b = this.getBound();
	if (utils.isPointInRect(x, y, b.x, b.y, b.width, b.height)) {
		return this;
	}
};

/* Returns a boundray for the element, describing the
 * 1) left-top point
 * 2) width
 * 3) height
 * of this element
 * This function should be re-written in children
 */
Element.prototype.getBound = function() {
	if (this.visible) {
		return {
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height
		};
	} else {
		return {
			x: this.x,
			y: this.y,
			width: 0,
			height: 0
		};
	}
};

// A jQuery-like api, to get/set attributes
Element.prototype.attr = function(key, val) {
	if (typeof key == "object" && val == null) {
		for (var k in key) {
			this.attr(k, key[k]);
		}
		return this;
	}
	if (key == null) {
		return this;
	} else if (val == null) {
		return this[key];
	} else {
		this[key] = val;
		if (this._attrChangeWatchers[key]) {
			this._attrChangeWatchers[key].iterate(function(fn) {
				fn(val);
			});
		}
		return this;
	}
};

// Get/set styles
Element.prototype.css = function(key, val) {
	if (typeof key == "object" && val == null) {
		for (var k in key) {
			this.css(k, key[k]);
		}
		return this;
	}
	if (key == null) {
		return this;
	} else if (val == null) {
		return this.styles[key];
	} else {
		this.styles[key] = val;
		if (this._cssChangeWatchers[key]) {
			this._cssChangeWatchers[key].iterate(function(fn) {
				fn(val);
			});
		}
		return this;
	}
};

// Listen for value change bade by the two methods: attr & css
// No more need to rewrite attr & css methods
Element.prototype.watchAttr = function(key, fn) {
	if (!key || !fn) {
		return;
	}
	if (!this._attrChangeWatchers[key]) {
		this._attrChangeWatchers[key] = new ArrayMgr();
	}
	this._attrChangeWatchers[key].add(fn);
};

Element.prototype.watchCss = function(key, fn) {
	if (!key || !fn) {
		return;
	}
	if (!this._cssChangeWatchers[key]) {
		this._cssChangeWatchers[key] = new ArrayMgr();
	}
	this._cssChangeWatchers[key].add(fn);
};

// Update animations on each frame
// Normally you don't need to care about it
Element.prototype._updateAnimation = function() {
	this.animations.iterate(function(animation) {
		if (animation && animation.isAnimating) {
			animation.step();
		}
	});
};

/* Runs an animation for this element, from current location to a new
 * location, available opts are:
 * 1) t: the overall time the animation takes
 * 2) type: the animation type; for all types available, checkout
 *		https://github.com/component/ease
 * 3) fn: callback function
 */
Element.prototype.animateTo = function(x, y, opts) {
	if (x == null || y == null) {
		return;
	}
	opts = opts || {};
	var t = opts.t || 300;
	var type = opts.type || "outExpo";
	var fn = opts.fn || function() {};

	var animateX = x !== this.x;
	var animateY = y !== this.y;
	var self = this;

	if (animateX) {
		var eax = new Ease(this.x, x, t, type);
		this.animations.add(eax);
		eax.on("step", function(value) {
			self.x = value;
		});
		eax.on("end", function() {
			self.x = x;
			self.animations.rm(eax);
			fn();
		});
		eax.animate();
	}
	if (animateY) {
		var eay = new Ease(this.y, y, t, type);
		this.animations.add(eay);
		eay.on("step", function(value) {
			self.y = value;
		});
		eay.on("end", function() {
			self.y = y;
			self.animations.rm(eay);
			if (!animateX) {
				fn();
			}
		});
		eay.animate();
	}
};

/* Bind function, avoid nested anonymous callback hell
 * looks like:
 * this.on("click", this.bind("onclick"));
 * meaning to invoke the object"s "onclick" method when "click" event emits
 */
Element.prototype.bind = function(methodName) {
	var self = this;
	return function() {
		return self[methodName].apply(self, arguments);
	};
};

// A easy way to use ctx.clip api around the Element
Element.prototype.clip = function(ctx, startFromZero) {
	var bound = this.getBound();
	var x = startFromZero ? 0 : bound.x;
	var y = startFromZero ? 0 : bound.y;
	var width = bound.width;
	var height = bound.height;
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineTo(x + width, y);
	ctx.lineTo(x + width, y + height);
	ctx.lineTo(x, y + height);
	ctx.closePath();
	ctx.clip();
};

Element.prototype._applyStyle = function(ctx, css) {
	css = css || "background-color";
	var bc = this.css(css);
	var b = this.getBound();
	if (typeof bc === "object") {
		// Gradient
		var type = bc.type || "linear";
		var colors = bc.colors || [];
		var startX, startY, endX, endY, startR, endR;
		startX = bc.startX || b.x;
		startY = bc.startY || b.y;
		endX = bc.endX || b.x;
		endY = bc.endY || b.y + b.height;
		var gradient = ctx.createLinearGradient(startX, startY, endX, endY);
		for (var i = 0; i < colors.length; i++) {
			gradient.addColorStop(colors[i][0], colors[i][1]);
		}
		ctx.fillStyle = gradient;
	} else {
		ctx.fillStyle = bc;
	}
	ctx.shadowOffsetX = this.css("box-shadow-x");
	ctx.shadowOffsetY = this.css("box-shadow-y");
	ctx.shadowBlur = this.css("box-shadow-blur");
	ctx.shadowColor = this.css("box-shadow-color");
};

Element.prototype.applyBackgroundStyles = function(ctx) {
	return this._applyStyle(ctx);
};

Element.prototype.renderBackgroundImage = function(ctx, startFromZero) {
	if (!this._background_images) {
		this._loadBackgroundImage();
		return;
	}

	if (this._background_images_loaded_count < this._background_images.length) {
		return;
	}

	var b = this.getBound();
	var x = startFromZero ? 0 : b.x;
	var y = startFromZero ? 0 : b.y;

	// _background_images is supposed to have 1 or 9 images
	if (this._background_images.length === 1) {
		ctx.drawImage(this._background_images[0], x, y, b.width, b.height);
	} else if (this._background_images.length === 9) {
		var top = this.css("background-image-top") || 5;
		var bottom = this.css("background-image-bottom") || 5;
		var left = this.css("background-image-left") || 5;
		var right = this.css("background-image-right") || 5;
		var bounds = [
			// top three
			[0, 0, left, top],
			[left, 0, b.width - left - right, top],
			[b.width - right, 0, right, top],
			// middle three
			[0, top, left, b.height - top - bottom],
			[left, top, b.width - left - right, b.height - top - bottom],
			[b.width - right, top, right, b.height - top - bottom],
			// final three
			[0, b.height - bottom, left, bottom],
			[left, b.height - bottom, b.width - left - right, bottom],
			[b.width - right, b.height - bottom, right, bottom]
		];
		for (var i = 0; i < bounds.length; i++) {
			ctx.drawImage(this._background_images[i], bounds[i][0] + x, bounds[i][1] + y, bounds[i][2] + 1, bounds[i][3] + 1);
		}
	}
};

Element.prototype._loadBackgroundImage = function() {
	this._background_images = [];
	this._background_images_loaded_count = 0;
	var self = this;
	var bi = this.css("background-image");
	if (typeof bi === "string") {
		this._loadBackgroundImageCell(bi);
	} else if (typeof bi === "object") {
		for (var i = 0; i < bi.length; i++) {
			this._loadBackgroundImageCell(bi[i]);
		}
	}
};

Element.prototype._loadBackgroundImageCell = function(url) {
	var self = this;
	if (PICTURES[url]) {
		var img = PICTURES[url];
		this._background_images.push(img);
		if (!img.getAttribute("loaded")) {
			img.addEventListener("load", function() {
				self._background_images_loaded_count += 1;
				NotificationReceiver.emit("render", self);
			});
		} else {
			self._background_images_loaded_count += 1;
		}
	} else {
		var img = document.createElement("img");
		PICTURES[url] = img;
		this._background_images.push(img);
		img.onload = function() {
			this.setAttribute("loaded", true);
			self._background_images_loaded_count += 1;
			NotificationReceiver.emit("render", self);
		};
		img.src = url;
	}
};

Element.prototype._renderSingleBackgroundImagePiece = function(ctx, img, x, y, width, height) {
	ctx.drawImage(img, x, y, width, height);
};

Element.prototype.renderBackgroundBlur = function(ctx, startFromZero) {
	var imageData = ctx.getImageData(this.x, this.y, this.width, this.height);
	gaussian(imageData, this.width, this.height, 4);
	ctx.putImageData(imageData, this.x, this.y);
};

// Renders background
Element.prototype.renderBackground = function(ctx, startFromZero) {
	ctx.save();
	var b = this.getBound();
	var x = startFromZero ? 0 : b.x;
	var y = startFromZero ? 0 : b.y;
	if (this.css("background-image")) {
		this.renderBackgroundImage(ctx, startFromZero);
	} else if (this.css("background-blur")) {
		this.renderBackgroundBlur(ctx, startFromZero);
	} else {
		this.applyBackgroundStyles(ctx);
		if (this.css("border-radius")) {
			this._drawRadiusPath(ctx, x, y, b);
			ctx.fill();
		} else {
			ctx.fillRect(x, y, b.width, b.height);
		}
	}
	ctx.restore();
};

Element.prototype._drawRadiusPath = function(ctx, x, y, b) {
	var r = this.css("border-radius");
	if (r * 2 > b.height) {
		r = b.height / 2;
	}
	if (r * 2 > b.width) {
		r = b.width / 2;
	}
	ctx.beginPath();
	ctx.moveTo(x, y + r);
	ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 3 / 2);
	ctx.lineTo(x + b.width - r, y);
	ctx.arc(x + b.width - r, y + r, r, Math.PI * 3 / 2, 0);
	ctx.lineTo(x + b.width, y + b.height - r);
	ctx.arc(x + b.width - r, y + b.height - r, r, 0, Math.PI / 2);
	ctx.lineTo(x + r, y + b.height);
	ctx.arc(x + r, y + b.height - r, r, Math.PI / 2, Math.PI);
	ctx.lineTo(x, y + r);
	ctx.closePath();
};

Element.prototype.applyBorderStyles = function(ctx) {
	ctx.strokeStyle = this.css("border-color");
	ctx.lineWidth = this.css("border-width");
};

// Renders border
Element.prototype.renderBorder = function(ctx, startFromZero) {
	var b = this.getBound();
	var x = startFromZero ? 0 : b.x;
	var y = startFromZero ? 0 : b.y;
	this.applyBorderStyles(ctx);
	if (this.css("border-radius")) {
		this._drawRadiusPath(ctx, x, y, b);
		ctx.stroke();
	} else {
		ctx.strokeRect(x, y, b.width, b.height);
	}
};

// Destroy an object and release memories
Element.prototype.dispose = function() {
	this.removeAllListeners();
	this.animations.dispose();
	for (var k in this._attrChangeWatchers) {
		this._attrChangeWatchers[k].dispose();
	}
	for (var j in this._cssChangeWatchers) {
		this._cssChangeWatchers[j].dispose();
	}
};

module.exports = Element;
