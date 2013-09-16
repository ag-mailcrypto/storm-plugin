Components.utils.import("chrome://storm/content/utils.jsm");
Components.utils.import("chrome://storm/content/Key.jsm");

// TODO
// - Signatures
// - Revokation
// - Expiry
// - Trust
// - ...

this.EXPORTED_SYMBOLS = [];

this.EXPORTED_SYMBOLS.push("Keyring");
function Keyring() {
    this.keys = {}; // id->key
}

Keyring.prototype.loadKeys = function() {
    var lines = callGpg(["--list-keys", "--with-colons", "--with-fingerprint"]).split("\n");

    var key = null;
    var keyring = this;

    lines.forEach(function(line) {
        var values = line.split(":");

        var record_type = values[0],
            validity = values[1],
            key_id = values[4],
            expiration = values[6],
            user_id = values[9];

        if(record_type == "pub") {
            if(key) {
                keyring.keys[key.id] = key;
            }
            key = createKeyFromValues(values);
        } else {
            if(!key) return; // we need to find a public key first

            if(record_type == "sub") {
                key.subKeys[key_id] = createKeyFromValues(values);
            } else if(record_type == "uid") {
                key.userIds.push(user_id);
            } else if(record_type == "fpr") {
                key.fingerprint = user_id; // field 10 is used for fingerprint here
            }
        }

    });
}

Keyring.prototype.searchKeys = function(query) {
    return Object.values(this.keys).filter(function(key) {
        return key.matches(query);
    });
}

