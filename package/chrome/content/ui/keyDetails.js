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
Components.utils.import("chrome://storm/content/lib/global.jsm");
Components.utils.import("chrome://storm/content/lib/Keyring.jsm");

var key = window.arguments[0];

$(window).ready(function() {
    // Insert user IDs
    key.userIDs.forEach(function(userID, index) {
        addTreeItem(document, "user-ids-children-sigs", [userID.realName, userID.email, userID.getPureComment()]);
        addTreeItem(document, "user-ids-children", [userID.realName, userID.email, userID.getPureComment()]);
    });

    // Update signatures when another user ID is selected
    $("#user-ids-sigs").select(function(e) {
        updateSignatures($(this)[0].currentIndex);
    });

    var uid = key.getPrimaryUserId();
    $("#email").attr("value", uid.email);
    $("#realname").attr("value", uid.realName);
    $("#comment").attr("value", uid.comment || "no comment");

    $("#fingerprint").attr("value", key.fingerprint.replace(/(.{4})/g, function(match) { return match + " "; }));

    // Close button
    $("#button-close").on("command", closeWindow);

    $("window").attr("trust", key.getValidity()).attr("title", "Key details: 0x" + key.id + " (" + uid.realName + ")");

    // generate qrcode
    var qr = qrcode(4, 'M');
    qr.addData(key.fingerprint);
    qr.make();
    $("#fingerprint-qr").html(qr.createImgTag(3).replace("<img", "<image"));

    // get the keys this user trusts
    key.getSignedKeys(storm.keyring).forEach(function(k) {
        addTreeItem(document, "trusted-keys-children", [
            k.getPrimaryUserId().realName,
            k.getPrimaryUserId().email,
            k.id,
            "unknown" // TODO
        ]);
    });
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
