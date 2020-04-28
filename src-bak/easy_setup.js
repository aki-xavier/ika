var Scene = require("./scene");

// fixes from Paul Irish and Tino Zijdel
// using "self" instead of "window" for compatibility with both NodeJS and IE10.
var lastTime = 0;
var vendors = [ "ms", "moz", "webkit", "o" ];

for ( var x = 0; x < vendors.length && !self.requestAnimationFrame; ++ x ) {
	window.requestAnimationFrame = window[ vendors[ x ] + "RequestAnimationFrame" ];
	window.cancelAnimationFrame = window[ vendors[ x ] + "CancelAnimationFrame" ] || window[ vendors[ x ] + "CancelRequestAnimationFrame" ];
}

if ( window.requestAnimationFrame === undefined && window["setTimeout"] !== undefined ) {
	window.requestAnimationFrame = function ( callback ) {
		var currTime = Date.now(), timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
		var id = window.setTimeout( function() { callback( currTime + timeToCall ); }, timeToCall );
		lastTime = currTime + timeToCall;
		return id;
	};
}

if ( window.cancelAnimationFrame === undefined && window["clearTimeout"] !== undefined ) {
	window.cancelAnimationFrame = function ( id ) { window.clearTimeout( id ) };
}

function bindScene(scene) {
	NotificationReceiver.intervalId = 0;
	NotificationReceiver.endTime = 0;
	
	NotificationReceiver.on("render", function() {
		scene.render();
	});
	
	setInterval(function() {
		if (scene._downPoint == null && Date.now() >= NotificationReceiver.endTime) {
			if (NotificationReceiver.intervalId !== 0) {
				clearInterval(NotificationReceiver.intervalId);
				NotificationReceiver.intervalId = 0;
			}
		}
	}, 5000);
	
	function step() {
		scene.render();
		NotificationReceiver.intervalId = requestAnimationFrame(step);
	}
	
	NotificationReceiver.on("start-render", function(t) {
		if (this.intervalId === 0) {
			this.intervalId = setInterval(function() {
				scene.render();
			}, 1000 / 30);
		}
		if (!t) {
			return;
		}
		t += 500;
		var endTime = Date.now() + t;
		if (endTime > this.endTime) {
			this.endTime = endTime;
		}
	});
	
	NotificationReceiver.on("show-popover", function(item, baseitem) {
		if (!item || !baseitem) {
			return;
		}
		var pos = scene.getChildPosition(baseitem);
		if (!pos) {
			return;
		}
		var bi = item.getBound();
		var bb = baseitem.getBound();
		if (pos.x + bi.width > scene.width) {
			pos.x = pos.x + bb.width - bi.width;
		}
		if (pos.y + bb.height + bi.height <= scene.height) {
			pos.y += bb.height;
		} else {
			pos.y = pos.y - bi.height;
		}
		scene.showPopover(item, pos.x, pos.y);
	});
	
	NotificationReceiver.on("hide-popover", function() {
		scene.hidePopover();
	});
	
	scene.on("mousedown", function() {
		if (NotificationReceiver.ika_input) {
			NotificationReceiver.input.blur();
		}
	});
	
	NotificationReceiver.on("get-text", function(ika_input) {
		if (!this.input) {
			var input = document.createElement("input");
			input.setAttribute("type", "text");
			input.style.margin = "0px";
			input.style.padding = "0px";
			input.style.position = "fixed";
			input.style.display = "none";
			this.input = input;
			document.body.appendChild(input);
			var self = this;
			input.onblur = function(e) {
				if (self.ika_input) {
					self.ika_input.setValue(this.value);
					self.ika_input.emit("change", this.value);
					scene.render();
					self.ika_input = null;
				}
				this.style.display = "none";
			};
			input.onkeydown = function(e) {
				if (e.keyCode !== 13) {
					return;
				}
				if (self.ika_input) {
					self.ika_input.emit("enter", this.value, this);
				}
			};
		}
		
		this.ika_input = ika_input;
		this.input.setAttribute("type", ika_input.attr("type"));
		var pos = scene.getChildPosition(ika_input);
		this.input.style.left = pos.x + "px";
		this.input.style.top = pos.y + "px";
		var b = ika_input.getBound();
		this.input.style.padding = ika_input.css("padding") + "px";
		this.input.style.width = (b.width - ika_input.css("padding") * 2 - ika_input.css("border-width") * 2) + "px";
		this.input.style.height = (b.height - ika_input.css("padding") * 2 - ika_input.css("border-width") * 2) + "px";
		this.input.style.borderWidth = ika_input.css("border-width") + "px";
		this.input.style.borderColor = ika_input.css("border-color");
		this.input.style.fontSize = ika_input.css("font-size") + "px";
		this.input.style.fontFamily = ika_input.css("font-name");
		this.input.style.display = "block";
		this.input.value = ika_input.getValue();
		this.input.focus();
	});
};

module.exports.bindScene = bindScene;

module.exports.easySetup = function(canvas) {
	document.body.style.overflow = "hidden";
	var _canvas;
	
	if (canvas == null) {
		// Compatible with Ejecta
		var c = document.getElementById("canvas");
		if (c && c.getContext) {
			_canvas = document.getElementById("canvas");
		} else {
			_canvas = document.createElement("canvas");
			document.body.appendChild(_canvas);
		}
	} else {
		_canvas = canvas;
	}
	
	var scene = new Scene(window.innerWidth, window.innerHeight, _canvas).init();
	bindScene(scene);
	window.addEventListener("resize", function() {
		scene.resize(window.innerWidth, window.innerHeight);
	});
	return scene;
};
