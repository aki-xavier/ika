var utils = require("../utils");
var Element = require("../element");

// Button inherits from Element
function Button(value) {
	Element.call(this);
	this.name = "Button";
	this.isInput = true;
	this.value = value || "";
	this.width = 80;
	this.height = 30;
	
	// Determine whether this element should re-calculate its width containing longer text
	this.autoWidth = true;
	
	// If the button is disabled, "click" event will not be emitted
	this.disabled = false;
	
	// "active" shows whether the button is active
	this.active = false;
	
	/* "isMouseTarget" shows whether the button is being pressed
	 * isMouseTarget needs to be seperated from the "active" attribute
	 * because you can use it as a toggle button
	 */
	this.isMouseTarget = false;
	
	// Dummy is the element that receives events when the button is disabled
	this.dummy = new Element();
	this.backgroundColor = {
		type: "linear",
		colors: [
			[0, "white"],
			[1, "rgb(235,235,235)"]
		]
	};
	
	this.activeBackgroundColor = {
		type: "linear",
		colors: [
			[0, "rgb(235,235,235)"],
			[1, "white"]
		]
	};
	
	this.borderColor = this.activeBorderColor = "rgb(100,100,100)";
	
	// Applying some default styles
	this.css({
		"color": utils.colorOne,
		"active-color": utils.colorOne,
		"disabled-color": "#999",
		"border-width": 1,
		"text-align": "center",
		"padding": 10,
		"text-baseline": "middle",
		"text-shadow-x": 0,
		"text-shadow-y": 1,
		"text-shadow-color": "white",
		"text-shadow-blur": 0
	});
}

Button.prototype = new Element();

Button.prototype.init = function(flag) {
	Element.prototype.init.call(this);
	// Respond to mousedown, mousedragend and mouseup events by default
	if (!flag) {
		this.on("mousedown", function() {
			this.isMouseTarget = true;
			NotificationReceiver.emit("render", this);
		});
		this.on("mousedragend", function() {
			this.isMouseTarget = false;
			NotificationReceiver.emit("render", this);
		});
		this.on("mouseup", function() {
			this.isMouseTarget = false;
			NotificationReceiver.emit("render", this);
		});
	}
	return this;
};

Button.prototype.render = function(ctx) {
	var rerender = false;
	ctx.save();
	if (this.active || this.isMouseTarget) {
		// Apply active-background-color
		this.css("background-color", this.activeBackgroundColor);
	} else {
		// Apply background-color for normal state
		this.css("background-color", this.backgroundColor);
	}
	// Fill background
	this.renderBackground(ctx);
	// this.clip(ctx);
	// Apply font style
	ctx.font = this.css("font-size") + "px " + this.css("font-name");
	//re-calculate button width
	if (this.autoWidth && ctx.measureText(this.value).width + this.css("padding") * 2 > this.width) {
		this.width = ctx.measureText(this.value).width + this.css("padding") * 2;
		this.emit("size-changed", {
			width: this.width
		});
		rerender = true;
	}
	if (this.disabled) {
		// Apply text color for disabled state
		ctx.fillStyle = this.css("disabled-color");
	} else if (this.active || this.isMouseTarget) {
		// Apply text color for active state
		ctx.fillStyle = this.css("active-color");
	} else {
		ctx.fillStyle = this.css("color");
	}

	var text_align = this.css("text-align");
	ctx.textAlign = text_align;
	ctx.textBaseline = this.css("text-baseline");
	
	var x = 0, y = 0;

	if (text_align === "center") {
		// Start from the center of the button
		x = this.x + this.width / 2;
		y = this.y + this.height / 2;
	} else if (text_align === "left") {
		x = this.x;
		y = this.y + this.height / 2;
	} else if (text_align === "right") {
		x = this.x + this.width;
		y = this.y + this.height / 2;
	}
	
	ctx.shadowOffsetX = this.css("text-shadow-x");
	ctx.shadowOffsetY = this.css("text-shadow-y");
	ctx.shadowColor = this.css("text-shadow-color");
	ctx.shadowBlur = this.css("text-shadow-blur");
	
	ctx.fillText(this.value, x, y);
	
	if (this.active || this.isMouseTarget) {
		this.css("border-color", this.activeBorderColor);
	} else {
		this.css("border-color", this.borderColor);
	}
	
	this.renderBorder(ctx);
	ctx.restore();
	return rerender;
};

Button.prototype.hitTest = function(x, y) {
	if (utils.isPointInRect(x, y, this.x, this.y, this.width, this.height)) {
		// If the button is disabled, return the dummy to the scene
		if (this.disabled) {
			return this.dummy;
		} else {
			return this;
		}
	}
};

Button.prototype.disable = function() {
	if (!this.disabled) {
		this.disabled = true;
		NotificationReceiver.emit("render", this);
	}
};

Button.prototype.enable = function() {
	if (this.disabled) {
		this.disabled = false;
		NotificationReceiver.emit("render", this);
	}
};

module.exports = Button;