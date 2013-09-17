Components.utils.import("chrome://storm/content/Keyring.jsm");

this.EXPORTED_SYMBOLS = ["storm"];
var storm = {};

// prepare the keyring
storm.keyring = new Keyring();
storm.keyring.loadKeys();
