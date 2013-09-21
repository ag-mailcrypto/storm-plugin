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
function GPGError(message) {
    this.message = message;
    this.typeString = "GPG Error";
}

this.EXPORTED_SYMBOLS.push("TypeError");
function TypeError(message) {
    this.message = message;
    this.typeString = "Type Error";
}

this.EXPORTED_SYMBOLS.push("gpgStderrThrow");
function gpgStderrThrow(data) {
    throw new GPGError(data);
}
