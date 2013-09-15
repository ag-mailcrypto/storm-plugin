Components.utils.import("resource://storm/subprocess/subprocess.jsm");

var EXPORTED_SYMBOLS = [];

EXPORTED_SYMBOLS.push("callGpg");
/**
 * Calls the GPG executable with the specified arguments.
 * @param arguments:    An array of command line argument strings
 * @param input:        Input passed to stdin (optional)
 */
function callGpg(arguments, input) {
    input = input || "";

    var result = {
        output: "",
        error: "",
        code: null
    };

    var env = Components.classes["@mozilla.org/process/environment;1"].getService(Components.interfaces.nsIEnvironment);
    var GPG_AGENT_INFO = env.get("GPG_AGENT_INFO");

    subprocess.call({
        command:     "/usr/bin/gpg",
        arguments:   arguments,
        //charset: "UTF-8",
        environment: ["GPG_AGENT_INFO="+GPG_AGENT_INFO],
        //workdir: "/tmp",
        stdin: input,
        stdout: function(data) {
            result.output += data;
        },
        stderr: function(data) {
            result.error += data;
        },
        done: function(data) {
            result.code = data.exitCode;
        },
        mergeStderr: false
    }).wait();

    return result;
}

EXPORTED_SYMBOLS.push("signContent");
function signContent(content, passphrase) {
    var args = [];
    args.push("--clearsign");
    args.push("--passphrase-fd");
    args.push("0");
    args.push("--batch");
    args.push("--yes");
    //args.push("-u");
    //args.push("signing-key-id");

    var r = callGpg(args, function(pipe) {
        pipe.write(passphrase + "\n");
        pipe.write(content);
        pipe.close();
    });
    return r.error ? r.error : r.output;
}

EXPORTED_SYMBOLS.push("promptPassphrase");
function promptPassphrase(window) {
    var result = {};
    var check = {};

    var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
    success = promptService.promptPassword(window, "Passphrase Required",
        "Please enter the passphrase for your secret key", result, "Remember my passphrase", check);
    return {
        passphrase: result.value,
        remember: check.value
    }
}

