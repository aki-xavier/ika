var klasses = require("./src/klasses");

for (var k in klasses) {
  module.exports[k] = klasses[k];
}

// external frameworks
module.exports["ika-animations"] = require("ika-animations");
module.exports.Emitter = require("emitter");

var Emitter = require("emitter");
window.NotificationReceiver = new Emitter();

module.exports.easySetup = require("./src/easy_setup").easySetup;
module.exports.bindScene = require("./src/easy_setup").bindScene;
module.exports.createElementsFromXML = require("./src/parse_xml").createElementsFromXML;
module.exports.PICTURES = require("./src/public_pictures");