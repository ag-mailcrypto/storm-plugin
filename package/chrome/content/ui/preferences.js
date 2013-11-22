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
Components.utils.import("chrome://storm/content/lib/Keyring.jsm");
Components.utils.import("chrome://storm/content/lib/AccountList.jsm");
Components.utils.import("chrome://storm/content/lib/utils.jsm");

var keyListCache = [];
var accountListCache = [];

$(window).load(function() {
    // Category (left menu) switches view-port
    $("#categories").select(function() {
        var selected = $(this).find(":selected");
        $("#view-port").attr("selectedIndex", (selected.attr("data-deck-index")));

        // rebuild key list if switching to a key list viewport
        if(selected.attr("id").startsWith("tab-keys-")) {
            buildKeyList();
        }

        $("#view-port .view-pane").attr("class", "view-pane").addClass(selected.attr("id"));
    });

    // Refresh the key list
    $("#button-list-refresh").click(function() {
        storm.keyring.loadKeys();
        buildKeyList();
    });

    // Initial list setup
    buildKeyList();
    buildAccountList();

    // Filter change event
    $("#filter-string").on("input", filterKeyList);
    $("#advanced-filter checkbox").on("CheckboxStateChange", filterKeyList);
    $("#advanced-filter-button").on("command", function() {
        $("#advanced-filter").attr("hidden", !$(this).attr("checked"));
    });

    // Generate key button
    $(".generate-key").on("command", function() {
        storm.ui.dialogGenerateKey(window);
    });

    // Import menu buttons
    $("#import-keyserver").on("command", function() {
        storm.ui.dialogKeyserver(window);
    });
    $("#import-file").on("command", function() {
        storm.ui.dialogImportKeyFromFile(window);
    });
    $("#import-clipboard").on("command", function() {
        storm.ui.dialogImportKeyFromClipboard(window);
    });

    // Preferences
    $("#textbox-gpg-pathAutodetect").on("command", updatePreferencesTab);
    updatePreferencesTab();
});

/**
 * Updates the preferences tab to disable/enable elements based on other
 * preferences, e.g. autodetect vs. manual value.
 */
function updatePreferencesTab() {
    $("#textbox-gpg-path").prop("disabled", $("#textbox-gpg-pathAutodetect")[0].checked);
}

/**
 * Clones a DOM Element.
 * @param  {String}         The ID of the template element.
 * @param  {String}         The ID for the cloned version.
 * @return {DOMElement}     The clone.
 */
function fromTemplate(id, new_id) {
    return $("#"+id).clone().attr("id", new_id);
}

/**
 * Builds a key list with the values from either `keys` or `secretKeys` array,
 * depending on the tab selected.
 */
function buildKeyList() {
    // Select which key list (secret/public) to use, and copy it (.slice)
    var secretKeys = $("#tab-keys-own:selected").size() > 0;
    if(secretKeys) {
        keyListCache = storm.keyring.secretKeys.slice(0);
    } else {
        keyListCache = storm.keyring.keys.slice(0);
    }

    // Sort by real name
    keyListCache.sort(function(a, b) { return a.getPrimaryUserId().realName.toLowerCase() > b.getPrimaryUserId().realName.toLowerCase(); });

    // Get and clear listbox
    var listbox = document.getElementById("key-list");
    while(listbox.hasChildNodes()) {
        listbox.removeChild(listbox.lastChild);
    }

    // Fill listbox with keys
    keyListCache.forEach(function(key, index) {
        item = document.createElement("richlistitem");
        item.setAttribute("class", "key-list-item");
        item.setAttribute("id", "key-" + index);
        listbox.appendChild(item);
        item = listbox.lastChild;
        item.mode = (secretKeys ? "secret" : "public");
        item.key = key;
    });

    // Run the filter directly after building the list
    filterKeyList();
}

/**
 * Filters the key list according to the filter elements.
 */
function filterKeyList() {
    var query = $("#filter-string").val();
    query = new RegExp(escapeRegExp(query), "i"); // i = case insensitive

    // The key list, sorted as rendered, is cached by buildKeyList, so we
    // can access them here and assume they match the DOM keys
    keyListCache.forEach(function(key, index) {
        var visible = true;
        if(query && !key.matches(query)) visible = false;
        var validityFilter = key.getValidity();
        if(validityFilter == "marginal") validityFilter = "trusted";
        visible = visible && document.getElementById("advanced-show-" + validityFilter).checked;

        $("#key-"+index).attr("hidden", !visible);
    });
}

/**
 * Builds the list of account mappings.
 */
function buildAccountList() {
    var listbox = $("#account-list > treechildren");
    listbox.children().remove();

    var secretKeys = $("#tab-keys-own:selected").size() > 0;

    accountListCache = storm.accountList.accounts;
    accountListCache.sort(function(a, b) { return a.getEmail().toLowerCase() > b.getEmail().toLowerCase(); });
    accountListCache.forEach(function(account, index) {
        var item = fromTemplate("account-list-template", "account-" + index);
        item.find('[name="email"]').attr("label", account.email);
        item.find('[name="key"]').attr("label", account.key);
        listbox.append(item);
    });
}
