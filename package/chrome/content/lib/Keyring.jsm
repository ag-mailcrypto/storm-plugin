Components.utils.import("chrome://storm/content/lib/global.jsm");
Components.utils.import("chrome://storm/content/lib/gpg.jsm");
Components.utils.import("chrome://storm/content/lib/utils.jsm");
Components.utils.import("chrome://storm/content/lib/Key.jsm");
Components.utils.import("chrome://storm/content/lib/UserID.jsm");

this.EXPORTED_SYMBOLS = [];

this.EXPORTED_SYMBOLS.push("Keyring");
function Keyring() {
    this.keys = [];
    this.loadKeys();
}

function parseKeys(keyList, type) {
    var keys = [];
    var key = null;


    keyList.forEach(function(keyLine) {
        if(keyLine == "") return;
        var values = keyLine.split(":");

        var record_type = values[0],
        validity = values[1],
        key_id = values[4],
        expiration = values[6],
        user_id = values[9];

        if(record_type == type) {
            if(key) {
                keys.push(key);
            }
            key = createKeyFromValues(values);
        } else {
            if(!key) return; // we need to find a public key first

            if(record_type == "sub") {
                key.subKeys.push(createKeyFromValues(values));
            } else if(record_type == "uid") {
                key.userIDs.push(new UserID(user_id));
            } else if(record_type == "fpr") {
                key.fingerprint = user_id; // field 10 is used for fingerprint here
            } else if(record_type == "sig") {

            }
        }
    });

    return keys;
}

Keyring.prototype.loadKeys = function() {
    // INFO: "--list-sigs" list public keys, just like
    //       "--list-public-keys --with-sigs-list",
    //       but it is backwards compatible
    var publicKeyLines = storm.gpg.call(["--list-sigs",        "--with-colons", "--with-fingerprint"]).split("\n");
    var secretKeyLines = storm.gpg.call(["--list-secret-keys", "--with-colons", "--with-fingerprint"]).split("\n");

    var keyring = this;

    this.keys = parseKeys(publicKeyLines, "pub");
    this.secretKeys = parseKeys(secretKeyLines, "sec")
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
