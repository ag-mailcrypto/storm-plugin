Components.utils.import("chrome://storm/content/utils.jsm");
Components.utils.import("chrome://storm/content/Key.jsm");
Components.utils.import("chrome://storm/content/UserID.jsm");

// TODO
// - Signatures
// - Revokation
// - Expiry
// - Trust
// - ...

this.EXPORTED_SYMBOLS = [];

this.EXPORTED_SYMBOLS.push("Keyring");
function Keyring() {
    this.keys = [];
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
                keyring.keys.push(key);
            }
            key = createKeyFromValues(values);
        } else {
            if(!key) return; // we need to find a public key first

            if(record_type == "sub") {
                key.subKeys[key_id] = createKeyFromValues(values);
            } else if(record_type == "uid") {
                key.userIDs.push(new UserID(user_id));
            } else if(record_type == "fpr") {
                key.fingerprint = user_id; // field 10 is used for fingerprint here
            }
        }
    });
}

Keyring.prototype.getKey = function(id) {
    id = id.toUpperCase();
    if(id.startswith("0X")) id = id.substr(2);

    return this.keys.filter(function(key) {
        return key.key_id == key_id;
    }).first();
}

Keyring.prototype.searchKeys = function(query) {
    return this.keys.filter(function(key) {
        return key.matches(query);
    });
}

