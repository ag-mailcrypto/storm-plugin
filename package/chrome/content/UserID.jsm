var REGEX_UID = /^(.*?)\s*(\(.*\))?\s*\<(.*)\>$/;

this.EXPORTED_SYMBOLS = [];

this.EXPORTED_SYMBOLS.push("UserID");
function UserID(raw) {
    this.raw = raw;
    this.realName   = null;
    this.email      = null;
    this.comment    = null;
    this.parsed = this.parse();
}

/**
 * Parses the raw value into its parts and saves them into the object.
 * @returns True if successful, false otherwise.
 */
UserID.prototype.parse = function() {
    var m = REGEX_UID.exec(this.raw);
    if(!m) return false;
    this.realName   = m[1];
    this.comment    = m[2];
    this.email      = m[3];
    return true;
}

/**
 * Returns whether this UserID matches a query regex, e.g. mail address or
 * full name.
 * @param regex     The search regex.
 */
UserID.prototype.matches = function(regex) {
    return raw.match(regex);
}

/**
 * Returns the raw value for debug display.
 */
UserID.prototype.toString = function() {
    return this.raw;
}
