// Copyright (C) 2013

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

// Always place the EXPORTED_SYMBOLS array on the very top of your jsm file!  
this.EXPORTED_SYMBOLS = ["storm"];
var storm = {};

Components.utils.import("chrome://storm/content/lib/Config.jsm");

// load preferences branch
var preferences = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
storm.preferences = preferences.getBranch("extensions.storm.");
storm.defaultPreferences = preferences.getDefaultBranch("extensions.storm.");
storm.window = null;

// New uniform configuration/preferences accessing point
storm.config = new Config();

// TODO: this should be somewhere else, at some point
storm.ui = {
    dialogSignKey: function(window, key) {
        window.openDialog("chrome://storm/content/ui/keySigning.xul", "", "", key);
    },

    dialogKeyDetails: function(window, key) {
        window.openDialog("chrome://storm/content/ui/keyDetails.xul", "", "", key);
    },

    dialogKeyserver: function(window) {
        window.openDialog("chrome://storm/content/ui/keyserverSearch.xul", "", "", "");
    },

    dialogImportKeyFromFile: function(window) {
        window.alert("Import key from file");
    },

    dialogImportKeyFromClipboard: function(window) {
        window.alert("Import key from clipboard");
    },

    dialogGenerateKey: function(window) {
        window.openDialog("chrome://storm/content/ui/stormKeygenWizard.xul", "", "", "");
    },
    
    dialogSettings: function(window) {
        window.openDialog("chrome://storm/content/ui/settings.xul", "", "", "");
    },


};

storm.log = function(msg) {
    // error console
    // Components.utils.reportError(msg);
	var aConsoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
	aConsoleService.logStringMessage(msg);

    // stdout
    var console = (Components.utils.import("resource://gre/modules/devtools/Console.jsm", {})).console;
    console.log(msg);
}
