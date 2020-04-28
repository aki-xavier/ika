var Element = require("../element");
var ArrayMgr = require("arraymgr");

function Path() {
	Element.call(this);
	this.selected = false;
}

Path.prototype = new Element();

Path.prototype.init = function() {
	Element.prototype.init.call(this);
	/* Segments should have: x & y
		 or x, y, cp1x, cp1y, cp2x, cp2y
	 */
	this.segments = new ArrayMgr();
	this.css("background-color", "#eaeaea");
	return this;
};

// Add segments
Path.prototype.add = function() {
	this.segments.add(Array.prototype.slice.call(arguments, 0));
	return this;
};

// Remove segments
Path.prototype.rm = function(index) {
	this.segments.rmByIndex(index);
	return this;
};

Path.prototype.getBound = function() {
	var xmax = xmin = ymax = ymin = 0;
	this.segments.iterate(function(s) {
		if (s[0] > xmax) {
			xmax = s[0];
		}
		if (s[0] < xmin) {
			xmin = s[0];
		}
		if (s[1] > ymax) {
			ymax = s[1];
		}
		if (s[1] < ymin) {
			ymin = s[1];
		}
	});
	return {
		x: this.x,
		y: this.y,
		width: xmax - xmin,
		height: ymax - ymin
	};
};

Path.prototype.render = function(ctx) {
	ctx.save();
	ctx.translate(this.x, this.y);
	this._drawPath(ctx);
	this.applyBackgroundStyles(ctx);
	ctx.fill();
	this.applyBorderStyles(ctx);
	ctx.stroke();
	if (this.selected) {
		this._renderSegments(ctx);
	}
	ctx.restore();
};

Path.prototype._renderSegments = function(ctx) {
	ctx.save();
	ctx.fillStyle = "rgb(0,157,236)";
	ctx.strokeStyle = "rgb(0,157,236)";
	ctx.lineWidth = 1;
	var self = this;
	this.segments.iterate(function(s, i) {
		if (s[2] != null) {
			self._renderSegment(ctx, s[4], s[5]);
		} else {
			self._renderSegment(ctx, s[0], s[1]);
		}
	});
	this._drawPath(ctx);
	ctx.stroke();
	ctx.restore();
};

Path.prototype._renderSegment = function(ctx, x, y) {
	ctx.fillRect(x - 2, y - 2, 4, 4);
};

Path.prototype._drawPath = function(ctx) {
	ctx.beginPath();
	var self = this;
	this.segments.iterate(function(s, i) {
		if (i === 0) {
			ctx.moveTo(s[0], s[1]);
		} else {
			if (s[4] != null) {
				ctx.bezierCurveTo(s[0], s[1], s[2], s[3], s[4], s[5]);
			} else if (s[2] != null) {
				ctx.quadraticCurveTo(s[0], s[1], s[2], s[3]);
			} else {
				ctx.lineTo(s[0], s[1]);
			}
		}
	});
	ctx.closePath();
};

Path.prototype.hitTest = function(x, y, ctx) {
	this._drawPath(ctx);
	x -= this.x;
	y -= this.y;
	if (ctx.isPointInPath(x, y)) {
		return this;
	}
};

module.exports = Path;