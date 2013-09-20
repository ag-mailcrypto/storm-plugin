Components.utils.import("chrome://storm/content/lib/Keyring.jsm");

this.EXPORTED_SYMBOLS = ["storm"];
var storm = {};

// prepare the keyring
storm.keyring = new Keyring();
storm.keyring.loadKeys();

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
};
