Components.utils.import("chrome://storm/content/utils.jsm");

// TODO
// - Signatures
// - Revokation
// - Expiry
// - Trust
// - ...

Object.values = function (obj) {
    var vals = [];
    for(var key in obj) {
        if(obj.hasOwnProperty(key)) {
            vals.push(obj[key]);
        }
    }
    return vals;
}

if(!('contains' in String.prototype))
    String.prototype.contains = function(str, startIndex) { return -1 !== String.prototype.indexOf.call(this, str, startIndex); };

function Key(id) {
    this.id = id;
    this.subKeys = {}; // id->subkey
    this.userIds = [];

    this.recordType     = null;
    this.validity       = null;
    this.length         = null;
    this.algorithm      = null;
    this.creationDate   = null;
    this.expirationDate = null;
    this.ownerTrust     = null;
    this.userId         = null;
    this.signatureClass = null;
    this.capabilities   = null;
}

function KeyFromValues(values) {
    var key = new Key(values[4]);

    key.recordType      = values[0];
    key.validity        = values[1];
    key.length          = values[2];
    key.algorithm       = values[3];
    key.creationDate    = values[5];
    key.expirationDate  = values[6];
    key.ownerTrust      = values[8];
    //key.userId          = values[9];
    //key.signatureClass  = values[10];
    key.capabilities    = values[11];

    return key;
}

Key.prototype.debug = function() {
    var x = this.id + " " + this.userIds.join(";");
    for(var i in this.subKeys)
        x += "\n\nSubkey: " + this.subKeys[i].debug();
    return x;
}

Key.prototype.matches = function(query) {
    if(this.userIds.some(function(user_id) { return user_id.contains(query); }))
        return true;

    // todo: more matching stuff

    return false;
}

function Keyring() {
    this.keys = {}; // id->key
}

Keyring.prototype.loadKeys = function() {
    var lines = callGpg(["--list-keys", "--with-colons"]).output.split("\n");

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
            key = KeyFromValues(values);
        } else {
            if(!key) return; // we need to find a public key first

            if(record_type == "sub") {
                key.subKeys[key_id] = KeyFromValues(values);
            } else if(record_type == "uid") {
                key.userIds.push(user_id);
            }
        }

    });
}

Keyring.prototype.searchKeys = function(query) {
    return Object.values(this.keys).filter(function(key) {
        return key.matches(query);
    });
}

