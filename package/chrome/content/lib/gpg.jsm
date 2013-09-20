Components.utils.import("resource://storm/subprocess/subprocess.jsm");
Components.utils.import("chrome://storm/content/lib/errors.jsm");

this.EXPORTED_SYMBOLS = [];

this.EXPORTED_SYMBOLS.push("GPG");
function GPG() {
}

/**
 * Calls the GPG executable with the specified arguments.
 * @param arguments:    An array of command line argument strings
 * @param input:        Input passed to stdin (optional)
 */
GPG.prototype.call = function(arguments, input) {
    input = input || "";

    var result = {
        output: "",
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
        stderr: gpgStderrThrow,
        stdout: function(data) {
            result.output += data;
        },
        done: function(data) {
            result.code = data.exitCode;
        },
        mergeStderr: false
    }).wait();

    if(result.code != 0) {
        throw new GPGError(result.output);
    }

    return result.output;
}

// Prepare the instance
Components.utils.import("chrome://storm/content/lib/global.jsm");
storm.gpg = new GPG();
