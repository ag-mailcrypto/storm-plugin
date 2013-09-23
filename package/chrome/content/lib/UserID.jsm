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

var REGEX_UID = /^(.*?)\s*(\(.*\))?\s*\<(.*)\>$/;

this.EXPORTED_SYMBOLS = [];

this.EXPORTED_SYMBOLS.push("UserID");
/**
 * A uid record.
 * @param {String} raw  The raw string from GPG, usually in the format
 *                      `Firstname Lastname <mail@address.org>` or
 *                      `[Error Message]`.
 */
function UserID(raw) {
    this.signatures = [];

    this.raw = raw;
    this.realName   = null;
    this.email      = null;
    this.comment    = null;
    this.parsed = this.parse();

    // If the raw userId could not be splitted,
    // use it as the realname anyway
    if (!this.parsed) {
      this.realName = raw;
    }
}

/**
 * Parses the raw value into its parts and saves them into the object.
 * @return {bool}   True if successful, false otherwise.
 */
UserID.prototype.parse = function() {
    var m = REGEX_UID.exec(this.raw);
    if(!m) return false;
    this.realName   = m[1];
    this.comment    = m[2] || "";
    this.email      = m[3];
    return true;
}

/**
 * Returns whether this UserID matches a query regex, e.g. mail address or
 * full name.
 * @param {RegExp} regex    The search regex.
 * @return {bool}           Whether this raw UID matches the regex, or not.
 */
UserID.prototype.matches = function(regex) {
    return this.raw.match(regex);
}

/**
 * Returns the raw value for debug display.
 */
UserID.prototype.toString = function() {
    return this.raw;
}

/**
 * Returns the comment without the brackets.
 * @return {String} The comment without the brackets.
 */
UserID.prototype.getPureComment = function() {
    return this.comment.replace(/^\((.*)\)$/, "$1");
}
