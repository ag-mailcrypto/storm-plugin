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
 * @param {Function} stderr optional Function that handles stderr output from gpg.
 *                                   Makes this function return immediately and asynchronous.

 * @returns {String}                 The program output.
 * @throws {GPGError}                If gpg prints output to stderr.
 */
GPG.prototype.call = function(arguments, input, stdout, stderr, notty) {
    input = input || "";
    arguments = arguments.slice(0); // clone it, since we modify it

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

    if(notty) {
        // read from bottom to top
        arguments.unshift("0");
        arguments.unshift("--command-fd");
        arguments.unshift("1");
        arguments.unshift("--logger-fd");
        arguments.unshift("1");
        arguments.unshift("--status-fd");
        arguments.unshift("--no-tty");
    }

    try {
         storm.log("gpg.jsm: call() " + arguments);
         p = subprocess.call({
            command:     storm.preferences.getCharPref("gpg.path"),
            arguments:   arguments,
            // charset: "UTF-8",
            environment: ["GPG_AGENT_INFO="+GPG_AGENT_INFO],
            // workdir: "/tmp",
            stdin: input,
            stderr: stderr || function(data) {
                storm.log("GPG Error: " + data);
            },
            stdout: stdout || function(data) {
                result.output += data;
            },
            done: function(data) {
                result.code = data.exitCode;
                storm.log("gpg.jsm: call() terminated with exit code " + data.exitCode);
            },
            mergeStderr: false
        });
        p.wait();
    } catch(err) {
        if(typeof(err) == "GPGError") {
            throw err;
        } else {
            // file not exists or something
            storm.log("Error during gpg.call: " + err);
        }
    }

    return result.output;
}

/**
 * Encrypts or signs the content for the specified key. By default, an armored ASCII block
 * is generated.
 * @param {String}  content         The string to encrypt.
 * @param {Key}     signingKey      A key to sign with, if desired. This should
 *                                  rather be a private key.
 * @param List of {Key}  encryptionKeyList   One or more keys to encrypt with, if desired. Each one should
 *                                  obviously be a public key.
 */
GPG.prototype.signEncryptContent = function(content, signingKey, encryptionKeyList) {
    Components.utils.import("chrome://storm/content/lib/Key.jsm");
    var args = ["--armor"];

    if(encryptionKeyList == null && signingKey == null) {
        storm.log("Warning: neither encryption nor signing key specified for signEncryptContent(). Returning input content.");
        return content;
    }
    if(true == encryptionKeyList instanceof Key) {
        encryptionKeyList = new Array(encryptionKeyList);
        storm.log("Warning: EncryptionKeyList is a single Key");
    }
    if (signingKey != null && false == (signingKey instanceof Key)) {
        storm.log("Error: The signing key must be an instance of Class Key");
        storm.log("instead: " + (signingKey.constructor) + "!");
        storm.log("instead: " + (typeof signingKey) + "!");
        return content;
    }
    if (encryptionKeyList != null && null == (encryptionKeyList.length)) {
        storm.log("Error: encryptionKeyList must be an array");
        storm.log("instead: " + (encryptionKeyList.constructor) + "!");
        storm.log("instead: " + (typeof encryptionKeyList) + "!");
    }

    var signatureType = "clearsign";

    if(encryptionKeyList != null && encryptionKeyList.length != null && encryptionKeyList.length > 0) {
        for (var i = 0; i < encryptionKeyList.length; i++) {
            encryptionKey = encryptionKeyList[i];
            if (false == encryptionKey instanceof Key) {
                storm.log("Error: Each encryptionKey key must be an instance of class Key. encryptionKey[" + i + "] is not.");
                storm.log("instead: " + (encryptionKey.constructor) + "!");
                return content;
            }
            args.push("--encrypt");
            args.push("--trust-model");
            args.push("always");
            args.push("--recipient");
            args.push(encryptionKey.id);
            signatureType = "sign";
        }
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

/**
 * Signs a public key.
 * @param  {Key} key            The key to sign.
 * @param  {UserID[]} ids       The ids of the key to sign, or null to sign all keys.
 * @param  {int} signatureLevel The signature level.
 */
GPG.prototype.signKey = function(key, ids, signatureLevel) {
    var signAll = (ids == null || ids.length == key.userIDs.length);

    var args = ["--ask-cert-level", "--edit-key", key.id];
    var input = "";

    if(signAll) {
        var input = "sign\ny\n" + signatureLevel + "\ny\nsave\n";
        var text = storm.gpg.call(args, input, null, null, true); // notty=true
    } else {
        // assume the order is the same... maybe we have to check that :(
        ids.forEach(function(id) {
            uidIndex = key.userIDs.indexOf(id) + 1;
            var input = "uid " + uidIndex + "\nsign\n" + signatureLevel + "\ny\nsave\n";
            var text = storm.gpg.call(args, input, null, null, true); // notty=true
        });
    }

    storm.keyring.loadKeys();
};

// Prepare the instance
storm.gpg = new GPG();
