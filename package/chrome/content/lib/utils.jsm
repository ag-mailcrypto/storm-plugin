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

this.EXPORTED_SYMBOLS = [];

this.EXPORTED_SYMBOLS.push("objectValues");
/**
 * Returns the own properties of an object, as array.
 */
function objectValues(obj) {
    var vals = [];
    for(var key in obj) {
        if(obj.hasOwnProperty(key)) {
            vals.push(obj[key]);
        }
    }
    return vals;
}

this.EXPORTED_SYMBOLS.push("cleanKeyID");
function cleanKeyID(id, length) {
    id = id.toUpperCase();
    if(id.startsWith("0x")) id = id.substring(2);
    if(length) {
        id = id.substring(id.length - length);
    }
    return id;
}

this.EXPORTED_SYMBOLS.push("compareKeyIDs");
function compareKeyIDs(a, b) {
    a = cleanKeyID(a);
    b = cleanKeyID(b);
    var minlen = Math.min(a.length, b.length);
    return a.substring(a.length - minlen) == b.substring(b.length - minlen);
}

this.EXPORTED_SYMBOLS.push("signContent");
// TODO: Move to GPG.
function signContent(content, passphrase) {
    var args = [];
    args.push("--clearsign");
    args.push("--passphrase-fd");
    args.push("0");
    args.push("--batch");
    args.push("--yes");
    //args.push("-u");
    //args.push("signing-key-id");

    return storm.gpg.call(args, function(pipe) {
        pipe.write(passphrase + "\n");
        pipe.write(content);
        pipe.close();
    });
}

this.EXPORTED_SYMBOLS.push("promptPassphrase");
// TODO: Move to GPG.
function promptPassphrase() {
    var result = {};
    var check = {};

    var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
    success = promptService.promptPassword(this.window, "Passphrase Required",
        "Please enter the passphrase for your secret key", result, "Remember my passphrase", check);
    return {
        passphrase: result.value,
        remember: check.value
    }
}

this.EXPORTED_SYMBOLS.push("openBrowserTab");
/**
 * Opens the URL in a browser tab.
 * @param window    The current window object.
 * @param url       The URL to open.
 * @param features  The window features, defaults to:
 *                  "chrome,dialog=no,toolbar=off,personalbar=off"
 */
function openBrowserTab(window, url, features) {
    features = features || "chrome,dialog=no,toolbar=off,personalbar=off";

    let tabmail = window.document.getElementById("tabmail");
    if (!tabmail) {
        // Try opening new tabs in an existing 3pane window
        let mail3PaneWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"]
            .getService(Components.interfaces.nsIWindowMediator)
            .getMostRecentWindow("mail:3pane");
        if (mail3PaneWindow) {
            tabmail = mail3PaneWindow.document.getElementById("tabmail");
            mail3PaneWindow.focus();
        }
    }

    if (tabmail) {
        tabmail.openTab("contentTab", {contentPage: url});
    } else {
        window.openDialog("chrome://messenger/content/", "_blank",
            features, null, { tabType: "contentTab", tabParams: {contentPage: url}}
        );
    }
}

this.EXPORTED_SYMBOLS.push("addTreeItem");
/**
 * Inserts an item in a tree.
 * @param {DOMElement} document     The window root document.
 * @param {String} treechildrenId   The ID of the <treechildren> element.
 * @param {Array} columns           Array of columns, as strings.
 * @return {DOMElement}             The inserted <treeitem>.
 */
function addTreeItem(document, treechildrenId, columns) {
    var item = document.createElement("treeitem");
    var row = document.createElement("treerow");
    item.appendChild(row);

    columns.forEach(function(column) {
        var cell = document.createElement("treecell");
        cell.setAttribute("label", column);
        row.appendChild(cell);
    });

    document.getElementById(treechildrenId).appendChild(item);
    return item;
}

this.EXPORTED_SYMBOLS.push("escapeRegExp");
/**
 * Escapes a string for use in regular expressions.
 * @param {String} str  The string to escape.
 * @return {String}     The escaped string.
 */
function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

this.EXPORTED_SYMBOLS.push("isEmail");
/**
 * Returns whether a string is a valid email address. Note that this may not
 * be 100% RFC-2822 compilant, but it should be good enough.
 * @param  {String} email   The email, as string.
 * @return {Boolean}        Whether this is a valid email address or not.
 */
function isEmail(email){
    return /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/.test(email);
}

this.EXPORTED_SYMBOLS.push("time");
/**
 * Times a function, printing the duration it took to execute the function to
 * the console, along with an optional message (for identification).
 * @param  {Function} callback The function to exectute.
 * @param  {String}   msg      An optional message to print alongside the time.
 * @return {any}               The return value of the function, if any.
 */
time = function(callback, msg) {
    var start = new Date().getTime();
    var result = callback();
    var end = new Date().getTime();
    var ms = end - start;

    var duration;
    if(ms > 10000) {
        duration = (ms / 1000) + "s";
    } else {
        duration = ms + "ms";
    }

    storm.log("[time] " + (msg ? msg + ": " : "") + duration);
    return result;
}

this.EXPORTED_SYMBOLS.push("cutString");
/**
 * Cuts a string to a given length when it's longer,
 * else returns the string.
 * @param  {String}  str    String that is to be cut
 * @param  {Integer} length Length of the result
 * @return {String}         The string that was cut
 */
function cutString (str, length) {
    var result;
    if ( str && str.length > length ) {
        result = str.substring(0, length) + "[...]";
    } else {
        result = str;
    }
    return result;
}

this.EXPORTED_SYMBOLS.push("urldecode");
/**
 * Decodes URL stuff from keyserver, using different methods.
 * @param  {string} msg Encoded input.
 * @return {string}     Decoded output.
 */
function urldecode(msg) {
    try {
        msg = decodeURI(msg);
    } catch(e) {}

    try {
        msg = unescape(msg);
    } catch(e) {}

    return msg;
}
