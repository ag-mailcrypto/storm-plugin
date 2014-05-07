Components.utils.import("chrome://storm/content/lib/global.jsm");
Components.utils.import("chrome://storm/content/lib/utils.jsm");
Components.utils.import("chrome://storm/content/lib/Account/AccountList.jsm");
Components.utils.import("chrome://storm/content/lib/Keyring.jsm");
Components.utils.import("chrome://storm/content/lib/MessageDraft.jsm");

/**
 * Register a Storm Message Draft as a global object
 */
messageDraftObject = new MessageDraft();
// TODO get values from config
messageDraftObject.setSendEncrypted(true);
messageDraftObject.setSendSigned(true);

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
    
    // set window config
    // signing
    var sendSigned = messageDraftObject.getSendSigned();
    $('#storm-button-sign').attr('checked', sendSigned);
//    // encrypting
    var sendEncrypted = messageDraftObject.getSendEncrypted();
    storm.log("verschlüsselt senden? "+sendEncrypted);
    if(sendEncrypted){
    	$('#storm-button-send').attr("label", "Verschlüsselt senden");
    	$('#storm-button-send').removeClass('send-unencrypted');
    	$('#storm-button-send').addClass('send-encrypted');
    	$('#storm-button-send-subbutton').attr("label", "Unverschlüsselt senden");
    	$('#storm-button-send-subbutton').removeClass('send-encrypted');
    	$('#storm-button-send-subbutton').addClass('send-unencrypted');
    }else{
    	$('#storm-button-send').attr("label","Unverschlüsselt senden");
    	$('#storm-button-send').removeClass('send-encrypted');
    	$('#storm-button-send').addClass('send-unencrypted');
    	$('#storm-button-send-subbutton').attr("label", "Verschlüsselt senden");
    	$('#storm-button-send-subbutton').removeClass('send-unencrypted');
    	$('#storm-button-send-subbutton').addClass('send-encrypted');
    }
    
    $('#storm-button-sign').click(function(){
    	var state = $(this).attr('checked');
    	messageDraftObject.setSendSigned(state);
    });

    $('#storm-button-send').click(function(){
    	var encryptMessage = $(this).hasClass("send-encrypted");
    	if(encryptMessage){
    		messageDraftObject.setSendEncrypted(true);
    	}else{
    		messageDraftObject.setSendEncrypted(false);
    	}
    });

    $('#storm-button-send-subbutton').click(function(){
    	var encryptMessage = $(this).hasClass("send-encrypted");
    	if(encryptMessage){
    		messageDraftObject.setSendEncrypted(true);
    	}else{
    		messageDraftObject.setSendEncrypted(false);
    	}
    });
    
});

var setSendConfig = function(){
    storm.log('setting send key config checkboxes');
    document.getElementById("config-send-encrypted").setAttribute("checked", messageDraftObject.getSendEncrypted());
    document.getElementById("config-send-signed").setAttribute("checked", messageDraftObject.getSendSigned());
};

var toggleSignedCheckbox = function(){
    storm.log('toggle signed checkbox');
    var sendSigned = !messageDraftObject.getSendSigned();
    messageDraftObject.setSendSigned(sendSigned);
};

var toggleEncryptCheckbox = function(){
    storm.log('toggle encrypted checkbox');
    var sendEncrypted = !messageDraftObject.getSendEncrypted();
    messageDraftObject.setSendEncrypted(sendEncrypted);
};
