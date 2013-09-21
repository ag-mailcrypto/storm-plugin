Components.utils.import("chrome://storm/content/lib/UserID.jsm");

this.EXPORTED_SYMBOLS = [];

this.EXPORTED_SYMBOLS.push("Signature");
function Signature() {
    this.targetUserID       = null;

    this.issuingKeyId       = null;
    this.creationDate       = null;
    this.userID             = null;
    this.signatureType      = null;
    this.signatureAlgorithm = null;
}

/**
 * According to RFC-4880...
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
 * Returns whether this is exportable (true) or local (false).
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
 * Returns the check level (0..3) for UID signatures. If this is no UID signature,
 * returns -1.
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
 *
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
