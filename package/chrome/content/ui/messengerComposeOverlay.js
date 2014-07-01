Components.utils.import("chrome://storm/content/lib/global.jsm");
Components.utils.import("chrome://storm/content/lib/utils.jsm");
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
    // set window config
    // signing
	// TODO get from enigmail settings
    var sendSigned = true;
    $('#storm-button-sign').attr('checked', sendSigned);
//    // encrypting
	// TODO get from enigmail settings
    var sendEncrypted = true;
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
    	// TODO get from enigmail settings
    });

    $('#storm-button-send').click(function(){
    	var encryptMessage = $(this).hasClass("send-encrypted");
    	if(encryptMessage){
			// TODO set enigmail settings
    		// messageDraftObject.setSendEncrypted(true);
    	}else{
			// TODO set enigmail settings
    		// messageDraftObject.setSendEncrypted(false);
    	}
    });

    $('#storm-button-send-subbutton').click(function(){
    	var encryptMessage = $(this).hasClass("send-encrypted");
    	if(encryptMessage){
			// TODO get from enigmail settings
    		// messageDraftObject.setSendEncrypted(true);
    	}else{
			// TODO get from enigmail settings
    		// messageDraftObject.setSendEncrypted(false);
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