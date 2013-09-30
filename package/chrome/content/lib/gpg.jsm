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
Components.utils.import("resource://storm/subprocess/subprocess.jsm");
Components.utils.import("chrome://storm/content/lib/errors.jsm");

this.EXPORTED_SYMBOLS = [];

this.EXPORTED_SYMBOLS.push("GPG");
/**
 * This class groups the interface to GPG.
 */
function GPG() {}

/**
 * Calls the GPG executable with the specified arguments.
 * @param {Array} arguments          An array of command line argument strings
 * @param {String|Function} input    Input passed to stdin (optional)
 * @param {Function} stdout optional Function that handles console output from gpg.
 *                                   Makes this function return immediately and asynchronous.
 * @returns {String}                 The program output.
 * @throws {GPGError}                If gpg prints output to stderr.
 */
GPG.prototype.call = function(arguments, input, stdout) {
    input = input || "";

    var result = {
        output: "",
        code: null
    };

    var env = Components.classes["@mozilla.org/process/environment;1"].getService(Components.interfaces.nsIEnvironment);
    var GPG_AGENT_INFO = env.get("GPG_AGENT_INFO");

    // Override gpg --homedir

    if(arguments.indexOf("--homedir") !== -1) {
        storm.log("ERROR: Argument '--homedir <dir>' is not allowed outside gpg.call()");
        return;
    }

    var gpgHomedir = storm.preferences.getCharPref("gpg.homedir");
    if(gpgHomedir) {
        arguments.push("--homedir");
        arguments.push(gpgHomedir);
    }

    try {
        var p = subprocess.call({
            command:     storm.preferences.getCharPref("gpg.path"),
            arguments:   arguments,
            //charset: "UTF-8",
            environment: ["GPG_AGENT_INFO="+GPG_AGENT_INFO],
            //workdir: "/tmp",
            stdin: input,
            stderr: gpgStderrThrow,
            stdout: stdout || function(data) {
                result.output += data;
            },
            done: function(data) {
                result.code = data.exitCode;
            },
            mergeStderr: false
        });
        // If no custom function is provided, wait for all the output.
        if(!stdout) {
            p.wait();
        }
    } catch(err) {
        if(typeof(err) == "GPGError") {
            throw err;
        } else {
            // file not exists or something
            storm.log("Error during gpg.call: " + err);
        }
    }

    if(result.code) {
        storm.log("GPG result code: " + result.code);
    }

    return result.output;
}

// Prepare the instance
storm.gpg = new GPG();
