var utils = require("./utils");
var klasses = require("./klasses");

var elementLists = [
	"Textarea", "Button", "Switch",
	"Label", "Picture", "Slider",
	"Circle", "Path", "Input",
	"Sprite", "Combobox", "Progress",
	"Group", "Scrollbase", "Listbase",
	"Swipe", "Buttonset",
	"Stack", "Fan", "Menu"
];

function isNumber(d) {
	if (/-?^\d+$/g.test(d)) {
		return true;
	}
}

function capitaliseFirstLetter(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function walk(dom, parent) {
	if (!dom.childNodes) {
		return;
	}
	if (dom.nodeName[0] === "#") {
		for (var i = 0, len = dom.childNodes.length; i < len; i++) {
			walk(dom.childNodes[i], parent);
		}
	} else {
		var klassName = capitaliseFirstLetter(dom.nodeName);
		if (elementLists.indexOf(klassName) === -1) {
			throw("no element " + klassName + " found");
			return;
		}
		var elem = new klasses[klassName]().init();
		for (var i = 0; i < dom.attributes.length; i++) {
			var key = dom.attributes[i].nodeName;
			var value = dom.getAttribute(key);
			if (isNumber(value)) {
				value = parseInt(value, 10);
			}
			if (value === "true") {
				value = true;
			}
			if (value === "false") {
				value = false;
			}
			elem.attr(key, value);
		}
		parent.add(elem);
		if (dom.childNodes.length === 1 && dom.childNodes[0].nodeName === "#text") {
			elem.attr("value", dom.childNodes[0].nodeValue);
		} else {
			for (var i = 0, len = dom.childNodes.length; i < len; i++) {
				walk(dom.childNodes[i], elem);
			}
		}
	}
}

module.exports.createElementsFromXML = function(xml, parent) {
	walk(utils.parseXML(xml), parent);
};