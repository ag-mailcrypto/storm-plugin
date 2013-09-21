Components.utils.import("chrome://storm/content/lib/utils.jsm");

var key = window.arguments[0];

$(window).ready(function() {
    // Insert user IDs
    key.userIDs.forEach(function(userID, index) {
        addTreeItem(document, "user-ids-children", [userID.realName, userID.email, userID.getPureComment()]);
    });

    $("#user-ids").select(function(e) {
        updateSignatures($(this)[0].currentIndex);
    });

    // Close button
    $("#button-close").on("command", closeWindow);
});

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

$(window).keypress(function(e) {
    // Close on <Escape>
    if(e.keyCode == 27) closeWindow();
});


function closeWindow() {
    window.close();
}
