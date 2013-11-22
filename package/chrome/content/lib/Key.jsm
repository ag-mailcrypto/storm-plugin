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
Components.utils.import("chrome://storm/content/lib/global.jsm");

this.EXPORTED_SYMBOLS = [];

this.EXPORTED_SYMBOLS.push("Key");
/**
 * A Key object represents one record in the keyring, either a public key,
 * secret key, or subkey. It can have multiple userIDs and subKeys.
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
            return "marginal";
        case "f":
        case "u":
            return "trusted";
        case "n":
        case "o":
        case "-":
        case "q":
        case "":
            return "untrusted";
        case "i":
        case "d":
        case "r":
        case "e":
            return "invalid";
    }
}

/**
 * Utility for sorting key by "best trust". Order is:
 *     trusted - marginal - untrusted - invalid
 * Best trust has lowest value here.
 * @return {int} An index for sorting.
 */
Key.prototype.getTrustSortValue = function () {
    switch(this.getValidity()) {
        case "trusted": return 0;
        case "marginal": return 1;
        case "untrusted": return 2;
        case "invalid": return 3;
        default: return 4;
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
 * secret ("sec") record.
 */
Key.prototype.isPrimary = function() {
    return this.recordType == "pub" || this.recordType == "sec";
}

/**
 * Returns whether this key is of secret type, i.e. "sec" or "ssb" record.
 */
Key.prototype.isSecret = function() {
    return this.recordType == "sec" || this.recordType == "ssb";
}

/**
 * Returns the pair of this key, if any.
 * @return {Object} Object with properties "secret" and "public".
 */
Key.prototype.getKeypair = function() {
    if(this.isSecret()) {
        return { public: this.getOtherKey(), secret: this };
    } else {
        return { public: this, secret: this.getOtherKey() };
    }
}

/**
 * Returns the secret key to a public key and vice versa.
 * @return {Key} The matching other key.
 */
Key.prototype.getOtherKey = function() {
    return storm.keyring.getKey(this.id, !this.isSecret());
}

/**
 * Returns the public key to this key, if available, or this key itself, if public.
 * @return {Key} The matching public key.
 */
Key.prototype.getPublicKey = function() {
    return this.isSecret() ? this.getOtherKey() : this;
}

/**
 * Returns the secret key to this key, if available, or this key itself, if secret.
 * @return {Key} The matching secret key.
 */
Key.prototype.getSecretKey = function() {
    return this.isSecret() ? this : this.getOtherKey();
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
