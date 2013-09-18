Components.utils.import("chrome://storm/content/Keyring.jsm");

this.EXPORTED_SYMBOLS = ["storm"];
var storm = {};

// prepare the keyring
storm.keyring = new Keyring();
storm.keyring.loadKeys();

storm.ui = {};

storm.ui.dialogSignKey = function(window, key) {
    window.alert("Signing key of " + key.getPrimaryUserId().realName);
}

storm.ui.dialogKeyDetails = function(window, key) {
    window.alert("Details for key of " + key.getPrimaryUserId().realName);
}
