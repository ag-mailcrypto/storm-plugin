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

Components.utils.import("chrome://storm/content/lib/UserID.jsm");

this.EXPORTED_SYMBOLS = [];

this.EXPORTED_SYMBOLS.push("Signature");
/**
 * A signature record inside a key.
 */
function Signature() {
    this.targetUserID       = null;

    this.issuingKeyId       = null;
    this.creationDate       = null;
    this.userID             = null;
    this.signatureType      = null;
    this.signatureAlgorithm = null;
}

/**
 * See RFC-4880.
 * @returns {String} A human readable string describing the type of the signature.
 */
Signature.prototype.debugType = function() {
    var t = parseInt(this.signatureType.substr(0, 2), 16);
    switch(t) {
        case 0x00: return "Signature of a binary document.";
        case 0x01: return "Signature of a canonical text document.";
        case 0x02: return "Standalone signature.";
        case 0x10: return "UserID Signature: no level";
        case 0x11: return "UserID Signature: no verification";
        case 0x12: return "UserID Signature: casual verification";
        case 0x13: return "UserID Signature: careful verification";
        case 0x20: return "Key revocation signature";
        case 0x28: return "Subkey revocation signature";
        case 0x18: return "Subkey Binding Signature";
        case 0x19: return "Primary Key Binding Signature";
        case 0x1F: return "Signature directly on a key";
        case 0x30: return "Certification revocation signature";
        case 0x40: return "Timestamp signature.";
        case 0x50: return "Third-Party Confirmation signature.";
        default:   return "Unknow signature type.";
    }
}

/**
 * Returns whether this is exportable or local.
 * @return {bool} True if exportable, false if local.
 */
Signature.prototype.isExportable = function() {
    return this.signatureType.endsWith("x");
}

/**
 * Returns the check level (0..3) for UID signatures. If this is no UID signature,
 * returns -1.
 */
Signature.prototype.getCheckLevel = function() {
    var t = parseInt(this.signatureType.substr(0, 2), 16);
    return ((t >= 0x10 && t <= 0x13) || t == 0x18 || t == 0x19) ? (t - 0x10) : -1;
}

/**
 * Returns the check level (see `getCheckLevel`), but as a string for displaying.
 */
Signature.prototype.getCheckLevelString = function() {
    switch(this.getCheckLevel()) {
        case 0: return "unknown";
        case 1: return "no checking";
        case 2: return "casual checking";
        case 3: return "careful checking";
        case 8: return "own key";
        case 9: return "own key";
        default: return "invalid";
    }
}

this.EXPORTED_SYMBOLS.push("createSignatureFromValues");
/**
 * Creates a new signature object from --with-colons values, similar to
 * `createKeyFromValues`.
 * @param {Array} values    Array of values split at the colons.
 * @return {Signature}      The newly created signature object.
 */
function createSignatureFromValues(values) {
    var sig = new Signature();
    sig.issuingKeyId        = values[4];
    sig.creationDate        = values[5];
    sig.userID              = new UserID(values[9]);
    sig.signatureType       = values[10];
    sig.signatureAlgorithm  = values[15];
    return sig;
}
