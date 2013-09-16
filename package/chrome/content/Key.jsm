Components.utils.import("chrome://storm/content/utils.jsm");

this.EXPORTED_SYMBOLS = [];

this.EXPORTED_SYMBOLS.push("Key");
/**
 * A Key object represents one record in the keyring, either a public key,
 * private key, or subkey. It can have multiple userIds and subKeys.
 */
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
    this.fingerprint    = null;
}

/**
 * Returns whether this key is of primary type, i.e. public ("pub") or
 * private/secret ("sec") record.
 */
Key.prototype.isPrimary = function() {
    return this.recordType == "pub" || this.recordType == "sec";
}

/**
 * Returns whether this key is of private type, i.e. "sec" or "ssb" record.
 */
Key.prototype.isPrivate = function() {
    return this.recordType == "sec" || this.recordType == "ssb";
}

/**
 * Returns a debug output string with information about the key.
 */
Key.prototype.debug = function() {
    var x = this.id + " " + this.userIds.join(";");
    for(var i in this.subKeys)
        x += "\n\nSubkey: " + this.subKeys[i].debug();
    return x;
}

/**
 * Returns whether this key matches a query string, e.g. mail address or
 * full name (searches in userIds).
 * @param query     The search string, checked with "contains".
 */
Key.prototype.matches = function(query) {
    if(this.userIds.some(function(user_id) { return user_id.contains(query); }))
        return true;

    // TODO: more matching stuff
    return false;
}


// ============================================================================
// Helper functions
// ============================================================================

this.EXPORTED_SYMBOLS.push("createKeyFromValues");
/**
 * Creates a key object from the input of "gpg --list-keys --with-colons",
 * already split at the colons. See /usr/share/doc/gnupg/DETAILS for format
 * info.
 */
function createKeyFromValues(values) {
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
