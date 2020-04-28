var Element = require("./element");
var ArrayMgr = require("arraymgr");
var Transform = require("./transform");
var utils = require("./utils");
var Query = require("./query");

/* Group holds an array of items, manage their positions
 * Group can be applied 2D transforms, like using ctx.transform method
 * Dispatch events directly to children by default
 */
function Group() {
	Element.call(this);
	this.name = "Group";
}

Group.prototype = new Element();

Group.prototype.init = function(flag) {
	Element.prototype.init.call(this);
	this.children = new ArrayMgr();
	this._target = null;
	this._shouldClip = false;
	this._getChildrenBound = true;
	this._transform = new Transform();
	if (!flag) {
		this.on("mousedown", this.bind("_receiveEvents"));
		this.on("mouseup", this.bind("_receiveEvents"));
		this.on("mousemove", this.bind("_receiveEvents"));
		this.on("mousewheel", this.bind("_receiveEvents"));
		this.on("mousedrag", this.bind("_receiveEvents"));
		this.on("mousedragend", this.bind("_receiveEvents"));
		this.on("click", this.bind("_receiveEvents"));
	}
	return this;
};

Group.prototype._receiveEvents = function(event, ctx) {
	var name = event.eventName;
	var e = event.clone();
	var r = this.transformPoint(e.x, e.y);
	e.x = r.x;
	e.y = r.y;
	if (name === "mousedrag" || name === "mousedragend") {
		if (this._target) {
			this._target.emit(name, e);
		}
	} else {
		var item = this._hitTest(e.x, e.y, ctx);
		if (item) {
			item.emit(name, e);
		}
		if (name === "mousedown") {
			this._target = item;
		}
	}
};

Group.prototype.transformPoint = function(x, y) {
	return this._transform.invertPoint(x - this.x, y - this.y);
};

Group.prototype._hitTest = function(x, y, ctx) {
	var target;
	this.children.backIterate(function(item) {
		if (!item.visible) {
			return;
		}
		if (target = item.hitTest(x, y, ctx)) {
			return true;
		}
	});
	if (target) {
		return target;
	}
};

Group.prototype.hitTest = function(x, y, ctx) {
	var np = this.transformPoint(x, y);
	if (this._hitTest(np.x, np.y, ctx)) {
		return this;
	}
};

Group.prototype.applyTransform = function(ctx) {
	ctx.translate(this.x, this.y);
	ctx.transform(this._transform.m[0], this._transform.m[1], this._transform.m[2], this._transform.m[3], this._transform.m[4], this._transform.m[5]);
};

Group.prototype.render = function(ctx, bound) {
	ctx.save();
	this.applyTransform(ctx);
	
	if (this._shouldClip) {
		ctx.save();
		this.clip(ctx, true);
	}
	
	this.renderBackground(ctx, true);
	
	var rerender = false;
	
	this.children.iterate(function(child) {
		child._updateAnimation();
		if (!child.visible) {
			return;
		}
		if (bound) {
			var cb = child.getBound();
			if (utils.haveIntersection(bound, cb)) {
				var _bound = {
					x: bound.x - cb.x,
					y: bound.y - cb.y,
					width: bound.width,
					height: bound.height
				};
				if (child.render(ctx, _bound)) {
					rerender = true;
				}
			}
		} else {
			if (child.render(ctx)) {
				rerender = true;
			}
		}
	});
	
	this.renderBorder(ctx, true);
	
	if (this._shouldClip) {
		ctx.restore();
	}
	
	ctx.restore();
	return rerender;
};

Group.prototype.getBound = function() {
	var width = 0, height = 0;
	
	if (this.visible) {
		if (this._getChildrenBound) {
			this.children.iterate(function(child) {
				var bound = child.getBound();
				if (width < bound.x + bound.width) {
					width = bound.x + bound.width;
				}
				if (height < bound.y + bound.height) {
					height = bound.y + bound.height;
				}
			});
		} else {
			width = this.width;
			height = this.height;
		}
	}
	
	return {
		x: this.x,
		y: this.y,
		width: width,
		height: height
	};
};

Group.prototype.add = function(item) {
	this.children.add(item);
};

Group.prototype.rm = function(item) {
	this.children.rm(item);
};

// Get a child"s position relative to this group
Group.prototype.getChildPosition = function(item) {
	var pos = {
		x: 0,
		y: 0
	};
	if (utils.searchItemInGroup(this, item, pos)) {
		var b = item.getBound();
		pos.x += b.x;
		pos.y += b.y;
		return pos;
	} else {
		return null;
	}
};

Group.prototype.query = function(selector) {
	return new Query(this, selector);
};

module.exports = Group;
