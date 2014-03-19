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
Components.utils.import("chrome://storm/content/lib/Account/AccountList.jsm");
Components.utils.import("chrome://storm/content/lib/utils.jsm");

$(window).load(function() {
    $("#button-search").on("command", function() {
        searchKeys($("#input-search").val());
    });
    $("#loading-icon").hide();
    $("#empty-icon").hide();

    $("#button-close").on("command", function() {
        window.close();
    });
});

function onImport(key) {
    storm.keyring.receiveKey(key.id);
    storm.keyring.loadKeys();
    return storm.keyring.getKey(key.id);
}

function searchKeys(query) {
    $("#loading-icon").show();
    $("#empty-icon").hide();

    var listbox = document.getElementById("search-results-list");
    while(listbox.hasChildNodes()) {
        listbox.removeChild(listbox.lastChild);
    }

    var keys = storm.keyring.searchKeyserver(query);

    // Fill listbox with keys
    keys.forEach(function(key, index) {
        item = document.createElement("richlistitem");
        item.setAttribute("class", "key-list-item");
        item.setAttribute("id", "key-" + index);
        listbox.appendChild(item);
        item = listbox.lastChild;
        item.mode = "import";
        item.onImport = onImport;
        item.key = key;
    });

    $("#loading-icon").hide();
    if(keys.length == 0) {
        $("#empty-icon").show();
    }
}
