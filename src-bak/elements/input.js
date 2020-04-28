var Element = require("../element");
var utils = require("../utils");

function Input() {
	Element.call(this);
	this.name = "Input";
	this.isInput = true;
	this.width = 150;
	this.height = 30;
	this.type = "text";
	this.value = "";
	this.placeholder = "type in some text";
	this.instruction = "type in some text";
}

Input.prototype = new Element();

Input.prototype.init = function() {
	Element.prototype.init.call(this);
	this.css({
		"color": utils.colorOne,
		"text-baseline": "top",
		"border-width": 1,
		"background-color": utils.colorTwo,
		"border-color": utils.colorOne,
		"padding": 6
	});
	this.on("click", this.bind("onclick"));
	return this;
};

Input.prototype.render = function(ctx, timestamp) {
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
	if (value === "" && this.type === "text") {
		value = this.placeholder;
	}
	var width = ctx.measureText(value).width;
	if (width > this.width - this.css("padding") * 2) {
		var offset = width - this.width + this.css("padding") * 2;
		ctx.fillText(value, this.css("padding") - offset, this.height / 2);
	} else {
		ctx.fillText(value, this.css("padding"), this.height / 2);
	}
	ctx.restore();
	this.renderBorder(ctx);
	ctx.restore();
};

Input.prototype.onclick = function(e) {
	if (window.ejecta && window.ejecta.getText) {
		// Ejecta
		var self = this;
		ejecta.getText(this.instruction, "", function(value) {
			if (value != null && value !== "") {
				self.value = value;
				self.emit("change", value);
			}
			NotificationReceiver.emit("render");
		});
	} else {
		NotificationReceiver.emit("get-text", this);
	}
};

Input.prototype.getValue = function() {
	return this.value;
};

Input.prototype.setValue = function(value) {
	this.value = value;
};

Input.prototype.reset = function() {
	this.value = "";
	NotificationReceiver.emit("render");
};

module.exports = Input;