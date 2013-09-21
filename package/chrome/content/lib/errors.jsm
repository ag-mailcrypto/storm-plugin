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

this.EXPORTED_SYMBOLS = [];

this.EXPORTED_SYMBOLS.push("GPGError");
/**
 * Exception for runtime errors when calling GPG.
 * @param {String} message The error message.
 */
function GPGError(message) {
    this.message = message;
    this.typeString = "GPG Error";
}

this.EXPORTED_SYMBOLS.push("gpgStderrThrow");
/**
 * Used as callback function in subprocess calls, to throw a GPGError when
 * output to stderr occurs.
 * @param  {String} data  The output from stderr.
 * @throws {GPGError}     Always :)
 */
function gpgStderrThrow(data) {
    throw new GPGError(data);
}
