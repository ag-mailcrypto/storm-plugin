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
    var publicKeys = callGpg(["--list-public-keys", "--with-colons", "--with-sig-list", "--with-fingerprint"]);
    var secretKeys = callGpg(["--list-secret-keys", "--with-colons", "--with-sig-list", "--with-fingerprint"]);
    var lines = (publicKeys + "\n" + secretKeys).split("\n");

    var key = null;
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

        if(record_type == "pub" || record_type == "sec") {
            if(key) {
                keyring.keys.push(key);
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
            }
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

