Components.utils.import("chrome://storm/content/lib/global.jsm");
Components.utils.import("chrome://storm/content/lib/utils.jsm");
Components.utils.import("chrome://storm/content/lib/Account/AccountList.jsm");
Components.utils.import("chrome://storm/content/lib/Keyring.jsm");

/**
 * Process the receivers email address, as soon as it changes
 */
$(window).load(function() {
    // AWESOME WORKAROUND EVENT INJECTION FOR CRAPPY EVENT DESIGN!
    // Appends the onInput function to the onInput attribute, because it somehow
    // does not work using $.on() -- doh!
    var widget = $(".textbox-addressingWidget");
    widget.attr("oninput", widget.attr("oninput") + "; stormComposeAddressOverlayOnInput(this);");


    /**
     * Add an event listener that is triggered before sending an email.
     */
    window.addEventListener('compose-send-message',
        function (event) {
            try {
                handleEmailSending();
            } catch (err) {
                storm.log("An error occured: " + err);
            }

            var question = "Storm asks: Do you really want to send this email?";
            var answer = confirm(question);
            if (answer == false) {
                event.preventDefault();
                event.stopPropagation();
            }

        }, 
        true
    );
});

var sendEncrypted = true;
var sendSigned = true;

var setSendConfig = function(){
    storm.log('setting send key config checkboxes');
    // TODO get values from config
    document.getElementById("config-send-encrypted").setAttribute("checked", sendEncrypt);
    document.getElementById("config-send-signed").setAttribute("checked", sendSigned);
};

var toggleSignedCheckbox = function(){
    storm.log('toggle signed checkbox');
    sendSigned = !sendSigned;
    document.getElementById("config-send-signed").setAttribute("checked", sendSigned);
}

var toggleEncryptCheckbox = function(){
    storm.log('toggle encrypted checkbox');
    sendEncrypted = !sendEncrypted;
    document.getElementById("config-send-encrypted").setAttribute("checked", sendEncrypted);
}
