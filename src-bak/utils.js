var lastTime = 0;
var vendors = [ "ms", "moz", "webkit", "o" ];
for ( var x = 0; x < vendors.length && !window.requestAnimationFrame; ++ x ) {
	window.requestAnimationFrame = window[ vendors[ x ] + "RequestAnimationFrame" ];
	window.cancelAnimationFrame = window[ vendors[ x ] + "CancelAnimationFrame" ] || window[ vendors[ x ] + "CancelRequestAnimationFrame" ];
}
	
if ( window.requestAnimationFrame === undefined ) {
	window.requestAnimationFrame = function(callback) {
		var currTime = Date.now(), timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
		var id = window.setTimeout( function() { callback( currTime + timeToCall ); }, timeToCall );
		lastTime = currTime + timeToCall;
		return id;
	};
}
	
if ( window.cancelAnimationFrame === undefined ) {
	window.cancelAnimationFrame = function ( id ) { clearTimeout( id ); };
}

module.exports.colorOne = "rgb(50,50,50)";
module.exports.colorTwo = "white";
module.exports.colorThree = "#eaeaea";

module.exports.isPointInRect = function(x, y, x1, y1, width, height) {
	return x >= x1 && x <= x1 + width && y >= y1 && y <= y1 + height;
};

module.exports.random = function(from, to, no_floor) {
	if (Array.isArray(from)) {
		return from[Math.floor(Math.random() * from.length)];
	}
	var _from = from == null ? 0 : from, _to = to == null ? 0 : to;
	if (to < from) {
		_from = to;
		_to = from;
	} else if (to == from) {
		_to = _from + 10;
	}
	if (no_floor) {
		return Math.random() * (_to - _from) + _from;
	} else {
		return Math.floor(Math.random() * (_to - _from) + _from);
	}
};

module.exports.draggable = function(item, disableX, disableY) {
	item.on("mousedown", function(e) {
		this._on_dragging = true;
		if (!disableX) {
			this._originalX = this.x;
			this._startDraggingX = e.x;
		}
		if (!disableY) {
			this._originalY = this.y;
			this._startDraggingY = e.y;
		}
	});
	item.on("mousedrag", function(e) {
		if (!this._on_dragging) {
			return;
		}
		if (!disableX) {
			this.x = this._originalX + e.x - this._startDraggingX;
		}
		if (!disableY) {
			this.y = this._originalY + e.y - this._startDraggingY;
		}
	});
	item.on("mousedragend", function () {
		this._on_dragging = false;
	});
};

module.exports.elastic = function(item) {
	item.on("mousedown", function(e) {
		this._on_dragging = true;
		this._originalX = this.x;
		this._originalY = this.y;
		this._startDraggingX = e.x;
		this._startDraggingY = e.y;
	});
	item.on("mousedrag", function(e) {
		if (!this._on_dragging) {
			return;
		}
		this.x = this._originalX + (e.x - this._startDraggingX) / 2;
		this.y = this._originalY + (e.y - this._startDraggingY) / 2;
	});
	item.on("mousedragend", function() {
		this.animateTo(this._originalX, this._originalY);
		this._on_dragging = false;
	});
};

module.exports.centralize = function(scene, item) {
	var b = item.getBound();
	item.x = (scene.width - b.width) / 2;
	item.y = (scene.height - b.height) / 2;
};

module.exports.delegate = function(agent, func) {
	return function() {
		return agent[func].apply(agent, arguments);
	};
};

module.exports.haveIntersection = function(a, b) {
	var a1x = a.x;
	var a2x = a.x + a.width;
	var a1y = a.y;
	var a2y = a.y + a.height;
	var b1x = b.x;
	var b2x = b.x + b.width;
	var b1y = b.y;
	var b2y = b.y + b.height;
	return (a1x <= b2x && a2x >= b1x && a1y <= b2y && a2y >= b1y);
};

function searchItemInGroup(group, item) {
	var found = false;
	var pos = {
		x: 0,
		y: 0
	};
	if (group.name === "Scrollbase") {
		pos.x += group.offsetX;
		pos.y += group.offsetY;
	}
	group.children.iterate(function(_item) {
		if (_item === item) {
			found = true;
			return true;
		}
	});
	if (found) {
		var b = item.getBound();
		pos.x += b.x;
		pos.y += b.y;
		return pos;
	}
	
	group.children.iterate(function(_item) {
		if (_item.children) {
			var b = _item.getBound();
			pos.x += b.x;
			pos.y += b.y;
			var result = searchItemInGroup(_item, item);
			if (result) {
				found = true;
				pos.x += result.x;
				pos.y += result.y;
				return true;
			} else {
				pos.x -= b.x;
				pos.y -= b.y;
			}
		}
	});
	
	if (found) {
		return pos;
	} else {
		return null;
	}
}

module.exports.searchItemInGroup = searchItemInGroup;

module.exports.lorem = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, " +
"sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. " +
"Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi " +
"ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit " +
"in voluptate velit esse cillum dolore eu fugiat nulla pariatur. " +
"Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia " +
"deserunt mollit anim id est laborum. At vero eos et accusamus et iusto odio " +
"dignissimos ducimus, qui blanditiis praesentium voluptatum deleniti atque corrupti, " +
"quos dolores et quas molestias excepturi sint, obcaecati cupiditate " +
"non provident, similique sunt in culpa, qui officia deserunt mollitia " +
"animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis " +
"est et expedita distinctio. Nam libero tempore, cum soluta nobis est " +
"eligendi optio, cumque nihil impedit, quo minus id, quod maxime placeat, " +
"facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.";

// Code borrowed from jQuery
module.exports.parseXML = function(data) {
	var xml, tmp;
	if ( !data || typeof data !== "string" ) {
		return null;
	}
	try {
		if ( window.DOMParser ) { // Standard
			tmp = new DOMParser();
			xml = tmp.parseFromString( data , "text/xml" );
		} else { // IE
			xml = new ActiveXObject( "Microsoft.XMLDOM" );
			xml.async = "false";
			xml.loadXML( data );
		}
	} catch( e ) {
		xml = undefined;
	}
	if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
		console.error("Invalid XML: " + data);
	}
	return xml;
};
