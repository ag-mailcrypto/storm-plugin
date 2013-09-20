Components.utils.import("chrome://storm/content/lib/utils.jsm");

var key = window.arguments[0];

$(window).ready(function() {
    // Insert user IDs
    key.userIDs.forEach(function(userID) {
        addTreeItem(document, "user-ids-children", [userID.realName, userID.email, userID.getPureComment()]);
    });

    // Close button
    $("#button-close").on("command", closeWindow);
});

$(window).keypress(function(e) {
    // Close on <Escape>
    if(e.keyCode == 27) closeWindow();
});


function closeWindow() {
    window.close();
}
