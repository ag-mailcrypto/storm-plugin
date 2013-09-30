// Copyright (C) 2013

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

Components.utils.import("chrome://storm/content/lib/utils.jsm");
Components.utils.import("chrome://storm/content/lib/UserID.jsm");

this.EXPORTED_SYMBOLS = [];

this.EXPORTED_SYMBOLS.push("Key");
/**
 * A Key object represents one record in the keyring, either a public key,
 * private key, or subkey. It can have multiple userIDs and subKeys.
 */
function Key(id) {
    this.id = id.toUpperCase();

    this.subKeys        = [];
    this.userIDs        = [];
    this.signatures     = [];
    this.parentKey      = null;

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
 * Returns whether this key is trusted.
 */
Key.prototype.isOwnerTrusted = function() {
    return this.ownerTrust == "m"
        || this.ownerTrust == "f"
        || this.ownerTrust == "u";
}

/**
 * Returns one of the following:
 * - trusted:   The key is signed by the user with at least marginal trust
 *              or the owner trust is set to at least marginal.
 * - untrusted: The key is valid, but neither signed nor with owner trust.
 * - invalid:   The key cannot be used, i.e. is invalid, disabled or revoked.
 */
Key.prototype.getValidity = function() {
    switch(this.validity) {
        case "m":
        case "f":
        case "u":
            return "trusted";
        case "n":
        case "o":
        case "-":
        case "q":
        case "":
            return this.isOwnerTrusted() ? "trusted" : "untrusted";
        case "i":
        case "d":
        case "r":
        case "e":
            return "invalid";
    }
}

/**
 * Returns a describing Status String for the Key Validity
 */
Key.prototype.getValidityString = function() {
    switch(this.validity) {
        case "m":
            return "marginal valid";
        case "f":
            return "fully valid";
        case "u":
            return "ultimately valid";
        case "n":
            return "valid";
        case "o":
        case "q":
        case "-":
            return "untrusted";
        case "i":
            return "invalid";
        case "d":
            return "disabled";
        case "r":
            return "revoked";
        case "e":
            return "expired";
        return "unknown";
    }
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
    var x = this.id + " " + this.userIDs.join(";");
    this.subKeys.forEach(function(subkey) {
        x += "\n\nSubkey: " + subkey.debug();
    });
    return x;
}

/**
 * Returns whether this key matches a query regex, e.g. mail address or
 * full name (searches in userIDs).
 * @param regex     The search regex.
 */
Key.prototype.matches = function(regex) {
    return this.id.match(regex)
        || this.userIDs.some(function(user_id) { return user_id.matches(regex); })
        || this.subKeys.some(function(sub_key) { return sub_key.matches(regex); })
        ;
    // TODO: Maybe other data matching?
}

/**
 * Returns the primary uid.
 */
Key.prototype.getPrimaryUserId = function() {
    return this.userIDs && this.userIDs[0] || new UserID("No User-Id <none@example.com>");
}

/**
 * Returns the primary uid.
 */
Key.prototype.formatID = function() {
    return "0x" + this.id.substr(-8);
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

    // Create primary user-id entry, which is contained in the "pub" record in
    // some gpg versions when there is only one uid available
    if(values[9]) key.userIDs.push(new UserID(values[9]));

    return key;
}
