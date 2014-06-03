/**
 * onload: see http://forum.jquery.com/topic/jquery-1-4-and-xul-wizard
 */
loadStormKeygenJs = function() {
  var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
                                    .getService(Components.interfaces.mozIJSSubScriptLoader);
    jsScriptFiles = [
        "chrome://storm/content/ext/jquery-2.0.3.min.js",
        "chrome://storm/content/ui/stormKeygenWizard.js",
        "chrome://storm/content/ui/stormKeygenWizardValidation.js",
    ];
    var i;
    for (i=0; i < jsScriptFiles.length; i++) {
        loader.loadSubScript(jsScriptFiles[i]);
    }
};

