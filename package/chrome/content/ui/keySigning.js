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

var key = null;

function updateUserIDs(index) {
    var userIdentityList = $("#userIdentities");

    key.userIDs.forEach(function(uid, index) {
        var checkbox = document.createElement('checkbox');
        checkbox.setAttribute('checked', "true");
        checkbox.setAttribute('id', "checkbox-" + index);
        checkbox.setAttribute('index', index);
        checkbox.setAttribute('label', uid.toString());

        userIdentityList.append(checkbox);
    });
}

function displayQrCode() {
    // generate qrcode
    var qr = qrcode(4, 'M');
    qr.addData(key.fingerprint);
    qr.make();
    $("#fingerprint-qr").html(qr.createImgTag(3).replace("<img", "<image"));
}

function updateKeyData() {
    $("#fingerprint").val(formatFingerprint(key.fingerprint));
    $("#realname").text(key.getPrimaryUserId().realName);
}

function cancel() {
    window.close();
}

function getSelectedUserIds() {
    var ids = [];
    $("#userIdentities checkbox").each(function() {
        if($(this).attr("checked")) {
            ids.push(key.userIDs[$(this).attr("index")]);
        }
    });
    return ids;
}

$(window).ready(function() {
    key = window.arguments[0];

    updateUserIDs();
    updateKeyData();
    displayQrCode();

    $(window).keypress(function(e) {
        if(e.keyCode == 27) cancel();
    });

    $("#button-cancel").on("command", function() {
        cancel();
    });

    $("#userIdentities").on("command", "checkbox", function() {
        $("#button-sign").attr("disabled", getSelectedUserIds().length <= 0);
    });

    $("#button-sign").on("command", function() {
        var ids = getSelectedUserIds();
        if(ids.length <= 0) {
            alert("Please select at least one user ID to sign.");
            return;
        }

        var signatureLevel = $("#signature-level :selected").val();
        storm.gpg.signKey(key, ids, signatureLevel);
        window.close();
        // TODO: refresh key list
    });
});
