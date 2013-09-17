Components.utils.import("chrome://storm/content/global.jsm");
Components.utils.import("chrome://storm/content/utils.jsm");

$(window).load(function() {
    $("#categories").select(function() {
        $("#view-port").attr("selectedIndex", ($(this).find(":selected").attr("data-deck-index")));
    });

    $("button-list-refresh").click(buildKeyList);
    buildKeyList();

    //$("button.toggle").on("click", toggleKeyRow);
    // var list = $("others-key-list");
    // list.select(function(event) {
    //     list.find("richlistitem:selected").removeClass("open").removeClass("closed").addClass(newState);
    // });
    // list.on("unselect", function() {alert("hi");});

});

function fromTemplate(id, new_id) {
    return $("#"+id).clone().attr("id", new_id);
}

function buildKeyList() {
    var listbox = $("#key-list");
    var keys = storm.keyring.keys;

    listbox.children().remove();

    keys.forEach(function(key, index) {
        var item = fromTemplate("key-list-template", "key-" + index);
        item.attr("data-keyid", key.id);

        var primaryUid = key.getPrimaryUserId();
        item.find('[name="primary-uid-name"]').attr("value", primaryUid.realName);
        item.find('[name="primary-uid-comment"]').attr("value", primaryUid.comment);

        var useridsListbox = item.find('[name="user-ids"]');
        useridsListbox.children().remove();

        key.userIDs.forEach(function(userID, index) {
            var uid = fromTemplate("user-id", "key-" + key.id + "-uid-" + index);
            uid.find('[name="name"]').attr("value", userID.realName);
            uid.find('[name="comment"]').attr("value", userID.comment);
            uid.find('[name="email"]').attr("value", userID.email);
            useridsListbox.append(uid);
        });

        item.find('[name="key-id"]').attr("value", key.formatID());
        listbox.append(item);
    });
}
