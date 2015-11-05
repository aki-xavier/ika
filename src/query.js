var ArrayMgr = require("arraymgr");

function isNumber(d) {
	if (/-?^\d+$/g.test(d)) {
		return true;
	}
}

function Query(scene, selector) {
	this.target = scene;
	selector = selector.replace(/[\ \t]+/g, " ");
	var tokens = selector.split(" ");
	this.tokens = tokens;
	this.token_index = 0;
	this.results = new ArrayMgr();
	this._search();
}

Query.prototype._search = function() {
	if (!this.target.children || this.target.children.length() === 0) {
		return;
	}
	var token = this.tokens[this.token_index];
	var tagName = token.split("?")[0];
	var _queries = {}, queries;
	var query = token.split("?")[1];
	if (query) {
		queries = query.split("&");
	}
	if (queries && queries.length !== 0 && queries[0] !== "") {
		for (var i = 0; i < queries.length; i++) {
			var key = queries[i].split("=")[0];
			var value = queries[i].split("=")[1] || true;
			if (isNumber(value)) {
				value = parseInt(value, 10);
			}
			if (value === "true") {
				value = true;
			}
			if (value === "false") {
				value = false;
			}
			_queries[key] = value;
		}
	}
	var self = this;
	var target = this.target;
	target.children.iterate(function(item, index) {
		if (item.name.toLowerCase() === tagName || tagName === "") {
			var flag = true;
			for (var k in _queries) {
				if (item.attr(k) !== _queries[k]) {
					flag = false;
					break;
				}
			}
			if (flag) {
				if (self.token_index === self.tokens.length - 1) {
					self.results.add(item);
				} else {
					self.target = item;
					self.token_index++;
					self._search();
					self.target = target;
					self.token_index--;
				}
			}
		}
	});
};

Query.prototype.css = function(key, val) {
	if (val == null) {
		var results = [];
		this.results.iterate(function(r) {
			results.push(r.css(key));
		});
		return results;
	} else {
		this.results.iterate(function(r) {
			r.css(key, val);
		});
		return this;
	}
};

Query.prototype.attr = function(key, val) {
	if (val == null) {
		var results = [];
		this.results.iterate(function(r) {
			results.push(r.attr(key));
		});
		return results;
	} else {
		this.results.iterate(function(r) {
			r.attr(key, val);
		});
		return this;
	}
};

Query.prototype.each = function(fn) {
	this.results.iterate(fn);
};

Query.prototype.length = function() {
	return this.results.length();
};

Query.prototype.dispose = function() {
	this.results.empty();
	this.results = null;
};

Query.prototype.get = function(index) {
	return this.results.get(index);
};

module.exports = Query;