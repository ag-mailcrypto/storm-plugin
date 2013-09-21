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

this.EXPORTED_SYMBOLS.push("signContent");
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
 */
function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}
