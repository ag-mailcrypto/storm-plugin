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



var keyDetailsWindowFunctions = {
    key: window.arguments[0],
    init: function() {
        if (keyDetailsWindowFunctions.key === null) {
            storm.log("Open keyDetails.xul without specifying the key ID");
            window.close();
        }
        // Close on <Escape>
        $(window).keypress(function(e) {
            if(e.keyCode == 27) closeWindow();
        });
        // Close button
        $('#button-close').on('command', function() {
            keyDetailsWindowFunctions.closeWindow();
        });
        
        // Set the textboxes readonly
        // Textboxes are necessary from a user experience point-of-view, to make
        // the values selectable and copyable.
        $('textbox.userValueReadOnly').attr('readonly', 'readonly');
        $('textbox.userValueReadOnly').prop('readonly', true);
    },
    closeWindow: function() {
        window.close();
    },
    /**
     * Updates the signatures list to the signatures of the selected user ID.
     * @param  {int} index  The index of the selected user ID. The list is cleared
     *                      for index < 0.
     */
    updateSignatures: function(index) {
        $("#signatures-children").empty();

        if(index >= 0) {
            // Insert signatures
            keyDetailsWindowFunctions.key.userIDs[index].signatures.forEach(function(signature) {
                addTreeItem(document, "signatures-children", [
                    signature.userID.realName,
                    signature.issuingKeyId,
                    signature.getCheckLevelString()
                ]);
            });
        }
    },
    displayUserIDs: function() {
        // Insert user IDs
        keyDetailsWindowFunctions.key.userIDs.forEach(function(userID, index) {
            addTreeItem(document, "user-ids-children-sigs", [userID.realName, userID.email, userID.getPureComment()]);
            addTreeItem(document, "user-ids-children", [userID.realName, userID.email, userID.getPureComment()]);
        });
        
        // Update signatures when another user ID is selected
        $("#user-ids-sigs").select(function(e) {
            keyDetailsWindowFunctions.updateSignatures($(this)[0].currentIndex);
        });
    },
    /**
     * Override the dummy data, insert the user's values into the XUL
     */
    displayUserData: function() {
        var uid = keyDetailsWindowFunctions.key.getPrimaryUserId();
        $("#email").attr("value", uid.email);
        $("#realname").attr("value", uid.realName);
        $("#comment").attr("value",  uid.comment || "[No comment]");
        $("#created").attr("value",  keyDetailsWindowFunctions.key.creationDate);
        $("#expiry").attr("value",   keyDetailsWindowFunctions.key.expirationDate || "[never]");

        $("#fingerprint").attr("value", keyDetailsWindowFunctions.key.fingerprint.replace(/(.{4})/g, function(match) { return match + " "; }));
        var newTitle = "Key details: 0x" + keyDetailsWindowFunctions.key.id + " (" + uid.realName + ")";
        $("window").attr("trust", keyDetailsWindowFunctions.key.getValidity()).attr("title", newTitle);
    },
    displayQrCode: function () {
        // generate qrcode
        var qr = qrcode(4, 'M');
        qr.addData(keyDetailsWindowFunctions.key.fingerprint);
        qr.make();
        $("#fingerprint-qr").html(qr.createImgTag(3).replace("<img", "<image"));
        
            
    },
    displayUserTrust: function () {
        // get the keys this user trusts
        keyDetailsWindowFunctions.key.getSignedKeys(storm.keyring).forEach(function(k) {
            addTreeItem(document, "trusted-keys-children", [
                k.getPrimaryUserId().realName,
                k.getPrimaryUserId().email,
                k.id,
                "unknown" // TODO
            ]);
        });

    }
}


$(window).ready(function() {
    keyDetailsWindowFunctions.init();
    keyDetailsWindowFunctions.displayUserIDs();
    keyDetailsWindowFunctions.displayUserData();
    keyDetailsWindowFunctions.displayQrCode();
    keyDetailsWindowFunctions.displayUserTrust();
});



