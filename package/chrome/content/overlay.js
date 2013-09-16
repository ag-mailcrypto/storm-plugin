Components.utils.import("chrome://storm/content/utils.jsm");
Components.utils.import("chrome://storm/content/Keyring.jsm");

window.addEventListener("load", function(e) {
    onLoad();
}, false);

function onLoad() {
    var k = new Keyring();
    k.loadKeys();

    var pass = promptPassphrase().passphrase;
    alert(signContent("CONTENT", pass));
}
