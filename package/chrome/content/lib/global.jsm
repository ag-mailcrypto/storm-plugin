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

this.EXPORTED_SYMBOLS = ["storm"];
var storm = {};

// load preferences branch
var preferences = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
storm.preferences = preferences.getBranch("extensions.storm.");
storm.defaultPreferences = preferences.getDefaultBranch("extensions.storm.");

// TODO: this should be somewhere else, at some point
storm.ui = {
    dialogSignKey: function(window, key) {
        window.alert("Signing key of " + key.getPrimaryUserId().realName);
    },

    dialogKeyDetails: function(window, key) {
        window.openDialog("chrome://storm/content/ui/keyDetails.xul", "", "", key);
    },

    dialogKeyserver: function(window) {
        window.alert("Keyserver dialog");
    },

    dialogImportKeyFromFile: function(window) {
        window.alert("Import key from file");
    },

    dialogImportKeyFromClipboard: function(window) {
        window.alert("Import key from clipboard");
    },

    dialogGenerateKey: function(window) {
        window.openDialog("chrome://storm/content/ui/stormKeygen.xul", "", "", "");
    },

};

storm.log = function(msg) {
    // error console
    Components.utils.reportError(msg);

    // stdout
    var console = (Components.utils.import("resource://gre/modules/devtools/Console.jsm", {})).console;
    console.log(msg);
}
