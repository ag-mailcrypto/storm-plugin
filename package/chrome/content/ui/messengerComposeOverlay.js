Components.utils.import("chrome://storm/content/lib/global.jsm");
Components.utils.import("chrome://storm/content/lib/utils.jsm");
Components.utils.import("chrome://storm/content/lib/Account/AccountList.jsm");
Components.utils.import("chrome://storm/content/lib/Keyring.jsm");
Components.utils.import("chrome://storm/content/lib/MessageDraft.jsm");

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
            var sendMail = false;
            try {
                sendMail = handleEmailSending();
            } catch (err) {
                storm.log("An error occured: " + err);
            }

            if (sendMail === false) {
                event.preventDefault();
                event.stopPropagation();
            }
        }, 
        true
    );
});

