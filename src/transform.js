function Transform() {
	this.reset();
	this.histories = [];
	this.rotate3YScale = 0.5;
}

Transform.prototype.reset = function() {
	this.m = [1,0,0,1,0,0];
};

Transform.prototype.save = function() {
	this.histories.push(this.m);
};

Transform.prototype.restore = function() {
	if (this.histories.length !== 0) {
		this.m = this.histories.pop();
	}
};

Transform.prototype.multiply = function(matrix) {
	var m11 = this.m[0] * matrix.m[0] + this.m[2] * matrix.m[1];
	var m12 = this.m[1] * matrix.m[0] + this.m[3] * matrix.m[1];

	var m21 = this.m[0] * matrix.m[2] + this.m[2] * matrix.m[3];
	var m22 = this.m[1] * matrix.m[2] + this.m[3] * matrix.m[3];

	var dx = this.m[0] * matrix.m[4] + this.m[2] * matrix.m[5] + this.m[4];
	var dy = this.m[1] * matrix.m[4] + this.m[3] * matrix.m[5] + this.m[5];

	this.m[0] = m11;
	this.m[1] = m12;
	this.m[2] = m21;
	this.m[3] = m22;
	this.m[4] = dx;
	this.m[5] = dy;
};

Transform.prototype.invert = function() {
	var d = 1 / (this.m[0] * this.m[3] - this.m[1] * this.m[2]);
	var m0 = this.m[3] * d;
	var m1 = -this.m[1] * d;
	var m2 = -this.m[2] * d;
	var m3 = this.m[0] * d;
	var m4 = d * (this.m[2] * this.m[5] - this.m[3] * this.m[4]);
	var m5 = d * (this.m[1] * this.m[4] - this.m[0] * this.m[5]);
	this.m[0] = m0;
	this.m[1] = m1;
	this.m[2] = m2;
	this.m[3] = m3;
	this.m[4] = m4;
	this.m[5] = m5;
};

Transform.prototype.scale = function(sx, sy) {
	this.m[0] *= sx;
	this.m[1] *= sx;
	this.m[2] *= sy;
	this.m[3] *= sy;
};

Transform.prototype.rotate = function(rad) {
	var c = Math.cos(rad);
	var s = Math.sin(rad);
	var m11 = this.m[0] * c + this.m[2] * s;
	var m12 = this.m[1] * c + this.m[3] * s;
	var m21 = this.m[0] * -s + this.m[2] * c;
	var m22 = this.m[1] * -s + this.m[3] * c;
	this.m[0] = m11;
	this.m[1] = m12;
	this.m[2] = m21;
	this.m[3] = m22;
};

//scale Y
Transform.prototype.rotateX = function(rad) {
	rad = this._normalizeRad(rad);
	this.scale(1, Math.cos(rad));
};

//scale X
Transform.prototype.rotateY = function(rad) {
	rad = this._normalizeRad(rad);
	this.scale(Math.cos(rad), 1);
};

Transform.prototype.rotate3 = function(rad, radius) {
	rad = this._normalizeRad(rad);
	var s = Math.sin(rad);
	var c = Math.cos(rad);
	var y = radius * s * this.rotate3YScale;
	var x = radius * c;
	var _rad = Math.asin(y / radius);
	this.m[0] = x / radius;
	this.m[1] = Math.tan(_rad);
};

Transform.prototype.translate = function(x, y) {
	this.m[4] += this.m[0] * x + this.m[2] * y;
	this.m[5] += this.m[1] * x + this.m[3] * y;
};

Transform.prototype.transformPoint = function(px, py) {
	var x = px;
	var y = py;
	px = x * this.m[0] + y * this.m[2] + this.m[4];
	py = x * this.m[1] + y * this.m[3] + this.m[5];
	return {
		x: px,
		y: py
	};
};

Transform.prototype.invertPoint = function(px, py) {
	var y = (py - this.m[5] + this.m[4] * this.m[1] / this.m[0] - px * this.m[1] / this.m[0]) / (this.m[3] - this.m[2] * this.m[1] / this.m[0]);
	var x = (px - y * this.m[2] - this.m[4]) / this.m[0];
	return {
		x: x,
		y: y
	};
};

Transform.prototype._normalizeRad = function(rad) {
	while (rad > Math.PI * 2) {
		rad -= Math.PI * 2;
	}
	while (rad < 0) {
		rad += Math.PI * 2;
	}
	return rad;
};

module.exports = Transform;