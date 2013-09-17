Components.utils.import("chrome://storm/content/global.jsm");
Components.utils.import("chrome://storm/content/utils.jsm");

var keyListCache = [];

$(window).load(function() {
    $("#categories").select(function() {
        $("#view-port").attr("selectedIndex", ($(this).find(":selected").attr("data-deck-index")));
    });

    $("button-list-refresh").click(function() {
        storm.keyring.loadKeys();
        buildKeyList()
    });
    buildKeyList();

    $("#filter-string").on("input", filterKeyList);
    $("#advanced-filter checkbox").on("CheckboxStateChange", filterKeyList);

    //$("button.toggle").on("click", toggleKeyRow);
    // var list = $("others-key-list");
    // list.select(function(event) {
    //     list.find("richlistitem:selected").removeClass("open").removeClass("closed").addClass(newState);
    // });
    // list.on("unselect", function() {alert("hi");});
    $("#header-utils-btn").click(function() {
        $("#advanced-filter").attr("hidden", !$(this).attr("checked"));
    })

});

function fromTemplate(id, new_id) {
    return $("#"+id).clone().attr("id", new_id);
}

function buildKeyList() {
    var listbox = $("#key-list");
    listbox.children().remove();

    keyListCache = storm.keyring.keys.slice(0);
    keyListCache.sort(function(a, b) { return a.getPrimaryUserId().realName > b.getPrimaryUserId().realName; });
    keyListCache.forEach(function(key, index) {
        var item = fromTemplate("key-list-template", "key-" + index);
        item.attr("data-keyid", key.id);

        item.addClass(key.getValidity());

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

        item.find('[name="key-id"]').attr("value", key.validity + "|" + key.ownerTrust + " " + key.formatID());
        listbox.append(item);
    });

    filterKeyList();
}

function filterKeyList() {
    var query = $("#filter-string").val();

    keyListCache.forEach(function(key, index) {
        var visible = true;
        if(query && !key.matches(query)) visible = false;
        visible = visible && document.getElementById("advanced-show-" + key.getValidity()).checked;

        $("#key-"+index).attr("hidden", !visible);
    });
}
