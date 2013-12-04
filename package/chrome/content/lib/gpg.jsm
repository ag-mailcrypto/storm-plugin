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
 * @param {Array} arguments         An array of command line argument strings
 * @param {String|Function} input   Input passed to stdin (optional)
 * @returns {String}                The program output.
 * @throws {GPGError}               If gpg prints output to stderr.
 */
GPG.prototype.call = function(arguments, input) {
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
        // add to beginning (for queries like --search-keys the end needs to be clean)
        // Push them in reverse order!
        arguments.unshift(gpgHomedir);
        arguments.unshift("--homedir");
    }

    try {
        subprocess.call({
            command:     storm.preferences.getCharPref("gpg.path"),
            arguments:   arguments,
            //charset: "UTF-8",
            environment: ["GPG_AGENT_INFO="+GPG_AGENT_INFO],
            //workdir: "/tmp",
            stdin: input,
            stderr: function(data) {
                storm.log("GPG Error: " + data);
            },
            stdout: function(data) {
                result.output += data;
            },
            done: function(data) {
                result.code = data.exitCode;
            },
            mergeStderr: false
        }).wait();
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

/**
 * Encrypts or signs the content for the specified key. By default, an armored ASCII block
 * is generated.
 * @param {String}  content         The string to encrypt.
 * @param {Key}     signingKey      A key to sign with, if desired. This should
 *                                  rather be a private key.
 * @param {Key}     encryptionKey   A key to encrypt with, if desired. Should
 *                                  obviously be a public key.
 */
GPG.prototype.signEncryptContent = function(content, signingKey, encryptionKey) {
    var args = ["--armor"];

    if(encryptionKey == null && signingKey == null) {
        storm.log("Warning: neither encryption nor signing key specified for signEncryptContent(). Returning input content.");
        return content;
    }

    var signatureType = "clearsign";

    if(encryptionKey != null) {
        args.push("--encrypt");
        args.push("--recipient");
        args.push(encryptionKey.id);
        signatureType = "sign";
    }

    if(signingKey != null) {
        args.push("--" + signatureType);
        args.push("--local-user");
        args.push(signingKey.id);
    }

    return storm.gpg.call(args, function(pipe) {
        pipe.write(content);
        pipe.close();
    });
};

// Prepare the instance
storm.gpg = new GPG();
