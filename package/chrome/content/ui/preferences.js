Components.utils.import("chrome://storm/content/lib/global.jsm");
Components.utils.import("chrome://storm/content/lib/utils.jsm");

var keyListCache = [];

$(window).load(function() {
    $("#categories").select(function() {
        var selected = $(this).find(":selected");
        $("#view-port").attr("selectedIndex", (selected.attr("data-deck-index")));
        if(selected.attr("id").startsWith("tab-keys-")) {
            buildKeyList();
        }
    });

    $("button-list-refresh").click(function() {
        storm.keyring.loadKeys();
        buildKeyList()
    });
    buildKeyList();

    $("#filter-string").on("input", filterKeyList);
    $("#advanced-filter checkbox").on("CheckboxStateChange", filterKeyList);

    $("#advanced-filter-button").on("command", function() {
        $("#advanced-filter").attr("hidden", !$(this).attr("checked"));
    });

    $(".key-sign-button").on("command", function() {
        var id = $(this).parents(".key").attr("data-keyid");
        storm.ui.dialogSignKey(window, storm.keyring.getKey(id));
    });

    $(".key-details-button").on("command", function() {
        var id = $(this).parents(".key").attr("data-keyid");
        storm.ui.dialogKeyDetails(window, storm.keyring.getKey(id));
    });

    $("#import-keyserver").on("command", function() {
        storm.ui.dialogKeyserver(window);
    });

    $("#import-file").on("command", function() {
        storm.ui.dialogImportKeyFromFile(window);
    });

    $("#import-clipboard").on("command", function() {
        storm.ui.dialogImportKeyFromClipboard(window);
    });
});

function fromTemplate(id, new_id) {
    return $("#"+id).clone().attr("id", new_id);
}

function buildKeyList() {
    var listbox = $("#key-list");
    listbox.children().remove();

    var privateKeys = $("#tab-keys-own:selected").size() > 0;

    keyListCache = storm.keyring.keys.filter(function(key) { return key.isPrivate() == privateKeys; }).slice(0);
    keyListCache.sort(function(a, b) { return a.getPrimaryUserId().realName.toLowerCase() > b.getPrimaryUserId().realName.toLowerCase(); });
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

        item.find('[name="key-id"]').attr("value", key.formatID());
        listbox.append(item);
    });

    filterKeyList();
}

function filterKeyList() {
    var query = $("#filter-string").val();
    query = new RegExp(escapeRegExp(query), "i"); // i = case insensitive

    keyListCache.forEach(function(key, index) {
        var visible = true;
        if(query && !key.matches(query)) visible = false;
        visible = visible && document.getElementById("advanced-show-" + key.getValidity()).checked;

        $("#key-"+index).attr("hidden", !visible);
    });
}
