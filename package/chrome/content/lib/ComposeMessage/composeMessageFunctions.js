/**
 * The main function that is called, when someone tries to send an emails
 * or tries to save it in "drafts" etc.
 */
function handleEmailSending() {
    // messageType could be "send" or "save"
    // If "save" encrypt to yourself.
    var messageType = resolveMessageTypeString();
    var message     = getMessage();
    var subject     = document.getElementById("msgSubject");
    var sender      = getSender();
    var listOfRecipients  = getRecipients();

    storm.log("============================================");
    storm.log("messageType:     " + messageType);
    storm.log("messageText:     " + message);
    storm.log("sender:          " + sender);
    try {
        storm.log("recipients:    [" + $.each(listOfRecipients, function(key) {
              return "" + key.id + ",";
            }) + "]");
        storm.log("Yeah it is possible to list all recipients");
    } catch(err) {
        storm.log("So sad! It is not possible to list all recipients");
    }

    // Sign Message if Valid Key can be found
    var signedMessage = message;
    if (null != getBestKeyForEmail(sender)) {
        signedMessage = signMessage(text, sender);
    }
    storm.log("signedMessage: " + signedMessage);
    

    // Get a list of all the recipients, that have no valid key
    var recipientsWithoutKey = [];
    $.each(listOfRecipients, function(recipient) {
        if (null != getBestKeyForEmail(recipient)) {
            storm.log("Key found for: " + recipient);
            recipientsWithoutKey.push(recipient);
        } else {
            storm.log("No Key found for: " + recipient);
        }
    });
    
    // If empty(recipientsWithoutKey) then encrypt()
    var encryptedMessage = signedMessage;
    if (recipientsWithoutKey.length === 0) {
        encryptedMessage = encryptMessage(signedMessage, listOfRecipients);
    }
    
    storm.log("encryptedMessageText: " + encryptedMessage);
    storm.log("============================================");


    // TODO: get message body
    // TODO: check if subject should be merged into body?
    //
    // TODO: handle attatchments
    // TODO: check if attatchments should be merged into body?

    // TODO: sign/encrypt body
    //       LOOP: recipients and use respective key
    // TODO: sign/encrypt attatchments if there are and the should be encryptet (options)
    //       LOOP: recipients and use respective key
    //       
    // TODO: attatch own public key?

}
/**
 * resolves if the message should be encrypted with the recipient key or the own
 * @return {string} send|save
 */
function resolveMessageTypeString() {
    var msgcomposeWindow    = document.getElementById("msgcomposeWindow");
    var sendMsgType         = parseInt(msgcomposeWindow.getAttribute("msgtype"));
    var deliveryMode        = Components.interfaces.nsIMsgCompDeliverMode;

    var now             = deliveryMode.Now;
    var later           = deliveryMode.Later;
    var save            = deliveryMode.Save;
    var saveAs          = deliveryMode.SaveAs;
    var saveAsDraft     = deliveryMode.SaveAsDraft;
    var saveAsTemplate  = deliveryMode.SaveAsTemplate;
    var sendUnsent      = deliveryMode.SendUnsent;
    var autoSaveAsDraft = deliveryMode.AutoSaveAsDraft;

    if(sendMsgType == now || 
       sendMsgType == later) {
        return "send";
    } else if(sendMsgType == save || 
              sendMsgType == saveAs || 
              sendMsgType == saveAsDraft || 
              sendMsgType == saveAsTemplate || 
              sendMsgType == autoSaveAsDraft) {
        return "save";
    }
}


function getSender() {
    var msgIdentity = document.getElementById("msgIdentity"); //whereSelected();

    // 'accountkey' contains the accountkey which might be better to resolve the actual email... 
    // but for now the description only contains the email 
    var selectedEmail = msgIdentity.getAttribute("description");

    return selectedEmail;
}

/**
 *
 * @return the key of the sender or NULL
 */
function getKeyByEmail(selectedEmail) {
    var key = null;
    var keys = storm.keyring.getKeysByEmail(selectedEmail, true);
    
    if(keys.length > 0) {
        key = keys[0];
    }

    return key;
}

/**
 * @return Array: The Recipients of this email
 */
function getRecipients() {
    var recipients = [];
    $(".textbox-addressingWidget").each(function() {
        var input = $(this)[0];
        var currentInput = $(input).val();
        recipients.push(currentInput);
    });
    return recipients;
}



function getRecipientKeys(recipients) {
    if( Object.prototype.toString.call( someVar ) !== '[object Array]' ) {
        recipients = [];
        storm.log('Error: Array expected.');
    }

    var recipientKeys;
    recipientKeys.each(function() {
        var bestKey = getBestKeyForEmail(currentInput);
        if(bestKey) {
            recipientKeys.push(bestKey);
        }
    });

    return recipientKeys;
}

function getMessage() {
    var editor = GetCurrentEditor();  
    var OutputRaw = 4;

    var message = editor.outputToString('text/plain', OutputRaw);

    return message;
}

// Overwrite the awAppendNewRow function, calling the original first, then settings
// some nice attributes. This is a stupid hack because thunderbird itself is one.
var _original_awAppendNewRow = awAppendNewRow;
awAppendNewRow = function(setFocus) {
    _original_awAppendNewRow(setFocus);

    // FIX ALL THE ROWS!
    $(".textbox-addressingWidget").each(function() {
        stormComposeAddressOverlayOnInput($(this)[0]);
    });
}

/**
 * Sets the trust icon for an address input box.
 * @param  {DOMElement} input The input box.
 */
function stormComposeAddressOverlayOnInput(input) {
    var currentInput = $(input).val();
    var icon = $(input).find(".storm-trust-icon");
    
    var bestKey = getBestKeyForEmail(currentInput);
    var cls = bestKey ? bestKey.getValidity() : "none";
    var title = bestKey ? "Key validity: " + bestKey.getValidityString() : "No key found";

    // Set class
    icon.removeClass("marginal trusted untrusted invalid none").addClass(cls);
    icon.attr("tooltiptext", title);
};

/**
 *
 */
function getBestKeyForEmail(currentInput) {
    storm.log("function getBestKeyForEmail(): BEGIN");
    storm.log("    using "+currentInput+"");

    // Make sure this input is a string
    if (typeof currentInput !== 'string') {
        currentInput = '';
    }

    // Parse email
    var m = currentInput.match(/^.*\<(.*)\>\s*$/);
    var email = isEmail(currentInput) ? currentInput : (m ? m[1] : null);

    // Find keys
    var keys = email ? storm.keyring.getKeysByEmail(email) : [];
    keys = keys.sort(function(a, b) { return a.getTrustSortValue() > b.getTrustSortValue(); });

    var bestKey = keys ? keys[0] : null;

    storm.log("function getBestKeyForEmail(): END");
    return bestKey;
}


function signMessage(text, sender) {
    storm.log("function signMessage(): BEGIN");
    var signedMessage = "-- signed by " + sender + " BEGIN --";
    signedMessage += "-- used key: " + getBestKeyForEmail(sender) + "";
    signedMessage += text;
    signedMessage += "-- signed by " + sender + " END SIGNATURE --";
    storm.log("function signMessage(): END");
    return signedMessage;
}

function encryptMessage(text, recipient) {
    storm.log("function encryptMessage(): BEGIN");
    var encryptedMessage = "-- encrypted for " + recipient + " BEGIN --";
    encryptedMessage += "-- used key: " + getBestKeyForEmail(recipient) + "";
    encryptedMessage += text;
    encryptedMessage += "-- encrypted for " + recipient + " END SIGNATURE --";
    storm.log("function encryptMessage(): END");
    return encryptedMessage;
}
