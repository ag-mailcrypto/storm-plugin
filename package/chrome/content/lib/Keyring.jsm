Components.utils.import("chrome://storm/content/lib/global.jsm");
Components.utils.import("chrome://storm/content/lib/gpg.jsm");
Components.utils.import("chrome://storm/content/lib/utils.jsm");
Components.utils.import("chrome://storm/content/lib/Key.jsm");
Components.utils.import("chrome://storm/content/lib/UserID.jsm");
Components.utils.import("chrome://storm/content/lib/Signature.jsm");

this.EXPORTED_SYMBOLS = [];

this.EXPORTED_SYMBOLS.push("Keyring");
function Keyring() {
    this.keys = [];
    this.loadKeys();
}

Keyring.prototype.loadKeys = function() {
    // INFO: "--list-sigs" list public keys, just like
    //       "--list-public-keys --with-sigs-list",
    //       but it is backwards compatible
    var publicKeys = storm.gpg.call(["--list-sigs",        "--with-colons", "--with-fingerprint"]);
    var secretKeys = storm.gpg.call(["--list-secret-keys", "--with-colons", "--with-fingerprint"]);
    var lines = (publicKeys + "\n" + secretKeys).split("\n");

    var key = null, subkey = null, userID = null, signature = null;
    var keyring = this;

    this.keys = [];
    lines.forEach(function(line) {
        if(line == "") return;
        var values = line.split(":");

        var record_type = values[0],
            validity = values[1],
            key_id = values[4],
            expiration = values[6],
            user_id = values[9];

        switch(record_type) {
            case "pub":
            case "sec":
                key = createKeyFromValues(values);
                keyring.keys.push(key);
                subkey = key;
                if(key.userIDs.length) userID = key.userIDs[0];
                break;
            case "sub":
            case "ssb":
                subkey = createKeyFromValues(values);
                subkey.parentKey = key;
                if(subkey.userIDs.length) userID = subkey.userIDs[0];
                key.subKeys.push(subkey);
                break;
            case "uid":
                userID = new UserID(user_id);
                key.userIDs.push(userID);
                break;
            case "fpr":
                // field 10 is used for fingerprint here
                key.fingerprint = user_id;
                break;
            case "sig":
                signature = createSignatureFromValues(values);
                signature.targetUserID = userID;
                userID.signatures.push(signature);
                break;
            default:
                // others are unhandled
                break;
        }
    });
}

Keyring.prototype.getKey = function(id) {
    id = id.toUpperCase();
    if(id.startsWith("0X")) id = id.substr(2);

    if(id.length != 8 && id.length != 16) return null;

    return this.keys.filter(function(key) {
        return key.id.endsWith(id);
    })[0];
}

Keyring.prototype.searchKeys = function(query) {
    return this.keys.filter(function(key) {
        return key.matches(query);
    });
}

// Prepare the instance
Components.utils.import("chrome://storm/content/lib/global.jsm");
storm.keyring = new Keyring();
