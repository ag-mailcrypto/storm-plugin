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

Components.utils.import("chrome://storm/content/lib/utils.jsm");

var key = window.arguments[0];

$(window).ready(function() {
    // Insert user IDs
    key.userIDs.forEach(function(userID, index) {
        addTreeItem(document, "user-ids-children", [userID.realName, userID.email, userID.getPureComment()]);
    });

    // Update signatures when another user ID is selected
    $("#user-ids").select(function(e) {
        updateSignatures($(this)[0].currentIndex);
    });

    // Close button
    $("#button-close").on("command", closeWindow);
});

/**
 * Updates the signatures list to the signatures of the selected user ID.
 * @param  {int} index  The index of the selected user ID. The list is cleared
 *                      for index < 0.
 */
function updateSignatures(index) {
    $("#signatures-children").empty();

    if(index >= 0) {
        // Insert signatures
        key.userIDs[index].signatures.forEach(function(signature) {
            addTreeItem(document, "signatures-children", [
                signature.userID.realName,
                signature.issuingKeyId,
                signature.getCheckLevelString()
            ]);
        });
    }
}

// Close on <Escape>
$(window).keypress(function(e) {
    if(e.keyCode == 27) closeWindow();
});

function closeWindow() {
    window.close();
}
