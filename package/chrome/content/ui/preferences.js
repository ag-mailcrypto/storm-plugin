Components.utils.import("chrome://storm/content/lib/global.jsm");
Components.utils.import("chrome://storm/content/lib/Keyring.jsm");
Components.utils.import("chrome://storm/content/lib/AccountList.jsm");
Components.utils.import("chrome://storm/content/lib/utils.jsm");

var keyListCache = [];
var accountListCache = [];

$(window).load(function() {
    $("#categories").select(function() {
        var selected = $(this).find(":selected");
        $("#view-port").attr("selectedIndex", (selected.attr("data-deck-index")));
        if(selected.attr("id").startsWith("tab-keys-")) {
            buildKeyList();
        }
        
        $("#view-port .view-pane").attr("class", "view-pane").addClass(selected.attr("id"));
    });

    $("#button-list-refresh").click(function() {
        storm.keyring.loadKeys();
        buildKeyList();
    });

    buildKeyList();
    buildAccountList();

    $("#filter-string").on("input", filterKeyList);
    $("#advanced-filter checkbox").on("CheckboxStateChange", filterKeyList);

    $("#advanced-filter-button").on("command", function() {
        $("#advanced-filter").attr("hidden", !$(this).attr("checked"));
    });

    $("#key-list").on("command", ".key-sign-button", function() {
        var id = $(this).parents(".key").attr("data-keyid");
        storm.ui.dialogSignKey(window, storm.keyring.getKey(id));
    });

    $("#key-list").on("command", ".key-details-button", function() {
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

    $(".create-key").on("command", function() {
        storm.ui.dialogCreateKey(window);
    });

    $("#key-list").on("click", ".key-header", function() {
        $(this).parents(".key").toggleClass("open");
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

        item.find('.key-info').attr("tooltiptext", "Trust Status: " + key.getValidityString());

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

function buildAccountList() {
    var listbox = $("#account-list > treechildren");
    listbox.children().remove();

    var privateKeys = $("#tab-keys-own:selected").size() > 0;

    accountListCache = storm.accountList.accounts;
    accountListCache.sort(function(a, b) { return a.getEmail().toLowerCase() > b.getEmail().toLowerCase(); });
    accountListCache.forEach(function(account, index) {
        var item = fromTemplate("account-list-template", "account-" + index);
        item.find('[name="email"]').attr("label", account.email);
        item.find('[name="key"]').attr("label", account.key);
        listbox.append(item);
    });
}
