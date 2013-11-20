loadStormKeygenJs = function() {
  var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
                                    .getService(Components.interfaces.mozIJSSubScriptLoader);
    jsScriptFiles = [
        "chrome://storm/content/ext/jquery-2.0.3.min.js",
        "chrome://storm/content/ui/stormKeygen.js",
        "chrome://storm/content/ui/keygenDialog.js",
        "chrome://global/content/dialogOverlay.js"
     //   "chrome://enigmail/content/enigmailCommon.js",
     //   "chrome://storm/content/ui/enigmailKeygen.js"
    ];
    var i;
    for (i=0; i < jsScriptFiles.length; i++) {
        loader.loadSubScript(jsScriptFiles[i]);
    }
}

