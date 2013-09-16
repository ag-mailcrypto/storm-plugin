Components.utils.import("chrome://storm/content/utils.jsm");
Components.utils.import("chrome://storm/content/Keyring.jsm");

window.addEventListener("load", function(e) {
    onLoad();
}, false);

function onLoad() {
    var keyring = new Keyring();
    keyring.loadKeys();
    window.alert(keyring.searchKeys("2bienkow")[0].fingerprint);
}
