var Emitter = require("emitter");
var ArrayMgr = require("arraymgr");

// Largely inspired by backbone.Model
function Model() {
	Emitter.call(this);
	this.changed = false;
}

Model.prototype = new Emitter();

Model.prototype.init = function(name) {
	this.name = name || "untitled";
	this._values = {};
	this._regexs = {};
	return this;
};

// Calling bind do not immediately modify the model or
// the element until the next "change" event
// a bind can be called multiple times with the same key
// and	different elements
// bind should be applied to those Element.isInput is true
// Means el should have setValue and getValue function
Model.prototype.bind = function(key, el) {
	var self = this;
	// Sync from el to model
	el.on("change", function(val) {
		// broadcast events to all listeners
		self.set(key, val, this);
	});
	// Sync from model to el
	this.on("change:" + key, function(val, emitter) {
		// exclude events sent from self
		if (emitter !== el) {
			el.setValue(val);
			NotificationReceiver.emit("render");
		}
	});
	return this;
};

// eg: type == css, elKey == background-color
// means this attribute will be in sync with
// this el"s backgroundColor
// watch syncs one direction, not the other
Model.prototype.watch = function(key, el, type, elKey, fn) {
	this.on("change:" + key, function(val) {
		if (fn) {
			val = fn(val);
		}
		el[type](elKey, val);
		NotificationReceiver.emit("render");
	});
	return this;
};

Model.prototype.get = function(key) {
	return this._values[key];
};

Model.prototype.set = function(key, val, agent) {
	if (!this._validate(key, val)) { // did not pass test
		this.emit("error:" + key, val);
	} else {
		this._values[key] = val;
		this.emit("change:" + key, val, agent);
		// For nested models
		this.emit("change", this._values);
	}
	return this;
};

Model.prototype.getValue = function() {
	return this._values;
};

Model.prototype.setValue = function(val) {
	this._values = val;
	return thisl
};

Model.prototype.setValidator = function(key, regex) {
	this._regexs[key] = regex;
};

Model.prototype._validate = function(key, value) {
	if (!this._regexs[key] || this._regexs[key].test(value)) {
		return true;
	}
};

// Rewrite save and load method to create customized model
// that can sync data with the server or whatever
Model.prototype.save = function() {
	localStorage.setItem(this.name, JSON.stringify(this._values));
};

Model.prototype.load = function() {
	this._values = JSON.parse(localStorage.getItem(this.name));
};

module.exports = Model;