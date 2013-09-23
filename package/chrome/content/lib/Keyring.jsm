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

Components.utils.import("chrome://storm/content/lib/global.jsm");
Components.utils.import("chrome://storm/content/lib/gpg.jsm");
Components.utils.import("chrome://storm/content/lib/utils.jsm");
Components.utils.import("chrome://storm/content/lib/Key.jsm");
Components.utils.import("chrome://storm/content/lib/UserID.jsm");
Components.utils.import("chrome://storm/content/lib/Signature.jsm");

this.EXPORTED_SYMBOLS = [];

this.EXPORTED_SYMBOLS.push("Keyring");
/**
 * A Keyring is responsible for loading and storing keys from GPG. The most
 * important properties are the `keys` and `secretKeys` arrays.
 */
function Keyring() {
    this.keys = [];
    this.secretKeys = [];
    this.loadKeys();
}

/**
 * Loads all keys from GPG into the arrays `keys` and `secretKeys`.
 */
Keyring.prototype.loadKeys = function() {
    // INFO: "--list-sigs" list public keys, just like
    //       "--list-public-keys --with-sigs-list",
    //       but it is backwards compatible
    this.keys       = parseKeys(storm.gpg.call(["--list-sigs",        "--with-colons", "--with-fingerprint"]).split("\n"));
    this.secretKeys = parseKeys(storm.gpg.call(["--list-secret-keys", "--with-colons", "--with-fingerprint"]).split("\n"));
}

/**
 * Parses a list of record lines (from GPG --with-colons) into keys and their
 * respective subrecords.
 * @param {Array} keyList   An array of lines with records, separated by colons (`:`), as
 *                          described in /usr/share/doc/gnupg/DETAILS
 * @return {Array}          An array of keys that reference their subrecords.
 */
function parseKeys(keyList) {
    var keys = [];
    var key = null, subkey = null, userID = null, signature = null;

    keyList.forEach(function(keyLine) {
        if(keyLine == "") return;
        var values = keyLine.split(":");

        var record_type = values[0],
            validity = values[1],
            key_id = values[4],
            expiration = values[6],
            user_id = values[9];

        switch(record_type) {
            case "pub":
            case "sec":
                key = createKeyFromValues(values);
                keys.push(key);
                subkey = key;
                if(key.userIDs.length) userID = key.userIDs[0];
                break;
            case "sub":
            case "ssb":
                subkey = createKeyFromValues(values);
                subkey.parentKey = key;
                if(subkey.userIDs.length) userID = subkey.userIDs[0];
                key.subKeys.push(subkey);
                break;
            case "uid":
                userID = new UserID(user_id);
                key.userIDs.push(userID);
                break;
            case "fpr":
                // field 10 is used for fingerprint here
                key.fingerprint = user_id;
                break;
            case "sig":
                signature = createSignatureFromValues(values);
                signature.targetUserID = userID;
                userID.signatures.push(signature);
                break;
            default:
                // others are unhandled
                break;
        }
    });

    return keys;
}

/**
 * Returns a Key object from the keyring, matching the given id.
 *
 * @param  {String} id  The requested keyId, beginning with 0x or not, it must
 *                      end with 8 or 16 hex digits.
 * @return {Key}        Return the first key ending with the given id string.
 */
Keyring.prototype.getKey = function(id) {
    id = id.toUpperCase();
    if(id.startsWith("0X")) id = id.substr(2);

    if(id.length != 8 && id.length != 16) return null;

    return this.keys.filter(function(key) {
        return key.id.endsWith(id);
    })[0];
}

/**
 * Returns all keys that contain at least one UserID with the given mail address
 * (case insensitive).
 *
 * @param  {String} email   The email to search for.
 * @return {Array}          Array of matching keys.
 */
Keyring.prototype.getKeysByEmail = function(email) {
    email = email.toLowerCase();

    return this.keys.filter(function(key) {
        return key.userIDs.some(function(userID) {
            return userID.parsed && userID.email.toLowerCase() == email;
        });
    });
};

/**
 * Searches for a query (or regex) in all keys. See `Key.matches` for more
 * description on matching.
 * @param  {String} query  The query string, as regex.
 * @return {Array}         An array of all matching keys.
 */
Keyring.prototype.searchKeys = function(query) {
    return this.keys.filter(function(key) {
        return key.matches(query);
    });
}

// Prepare the instance
Components.utils.import("chrome://storm/content/lib/global.jsm");
storm.keyring = new Keyring();
