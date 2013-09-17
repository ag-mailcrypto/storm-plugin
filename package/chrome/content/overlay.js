Components.utils.import("chrome://storm/content/global.jsm");
Components.utils.import("chrome://storm/content/utils.jsm");

window.addEventListener("load", function() {
    storm.keyring.loadKeys();
    //window.alert(storm.keyring.searchKeys("2bienkow")[0].fingerprint);
}, false);
