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

// Path to GPG
pref("extensions.storm.gpg.pathAutodetect",         true);
pref("extensions.storm.gpg.path",                   "/usr/bin/gpg");

// Default keyserver, in case none is chosen
pref("extensions.storm.gpg.keyserver",              "hkp://pgp.mit.edu");

// Replacement directory for gpg files, defaults to "~/.gnupg" if empty. This
// is the place where the gpg keyrings/trustdb and settings are stored. Useful
// for debugging.
pref("extensions.storm.gpg.homedir", "");

// Upon receiving a signed mail from an unknown key, perform this action:
// Accepted values: nothing|ask|marginal-owner|marginal-sign
pref("extensions.storm.receive.signedAction",       "marginal-owner");

// Autofetch key(s) from keyserver if not found in keyring
pref("extensions.storm.autofetchKey",         			true);