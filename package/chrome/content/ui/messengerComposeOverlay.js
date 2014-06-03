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

// Overwrite the awAppendNewRow function, calling the original first, then settings
// some nice attributes. This is a stupid hack because thunderbird itself is one.
//var _original_awAppendNewRow = awAppendNewRow;
//awAppendNewRow = function(setFocus) {
//    _original_awAppendNewRow(setFocus);
//
//    // FIX ALL THE ROWS!
//    $(".textbox-addressingWidget").each(function() {
//        stormComposeAddressOverlayOnInput($(this)[0]);
//    });
//}

/**
 * Sets the trust icon for an address input box.
 * @param  {DOMElement} input The input box.
 */
function stormComposeAddressOverlayOnInput(input) {
    var currentInput = $(input).val();
    var icon = $(input).find(".storm-trust-icon");

    // Parse email
    var m = currentInput.match(/^.*\<(.*)\>\s*$/);
    var email = isEmail(currentInput) ? currentInput : (m ? m[1] : null);

    // Find keysreceiveKey
    var keys = email ? storm.keyring.getKeysByEmail(email) : [];

    // Find keys if they are not in our local keyring
    if(keys.length == 0 && storm.preferences.getBoolPref("autofetchKey")) {
        var found_keys = storm.keyring.searchKeyserver(email);
        if(found_keys.length == 1) {
            storm.keyring.receiveKey(found_keys[0].formatID());
        }

        keys = storm.keyring.getKeysByEmail(email);
    }

    keys = keys.sort(function(a, b) { return a.getTrustSortValue() > b.getTrustSortValue(); });

    var bestKey = keys ? keys[0] : null;
    var cls = bestKey ? bestKey.getValidity() : "none";
    var title = bestKey ? "Key validity: " + bestKey.getValidityString() : "No key found";

    // Set class
    icon.removeClass("marginal trusted untrusted invalid none").addClass(cls);
    icon.attr("tooltiptext", title);
};
