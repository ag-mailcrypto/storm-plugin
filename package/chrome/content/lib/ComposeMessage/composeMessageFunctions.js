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

    if (messageType == 'save') {
        // @TODO Saved messages are to be encrypted with the owner's public key.
        return;
    }

    storm.log("============================================");
    storm.log("| messageType:     " + messageType);
    storm.log("| messageText:     " + message);
    storm.log("| sender:          " + sender);
    storm.log("| recipients:    [" + $.each(listOfRecipients, function(key) {
          return "" + key.id + ",";
        }) + "]");

    var signedMessage = signMessage(message, sender);
    

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
    
    storm.log("| encryptedMessageText: " + encryptedMessage);
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

    setMessage(signedMessage);
    alert("[Storm] Look into the logs for more info.");

    var question = "[Storm] Shall Storm replace your email with an armored encrypted openPGP block?"
    if (confirm(question)) {
        setMessage(encryptedMessage);
//    } else {
//        setMessage(message);
    }
}

/**
 * @TODO Currently only the first recipient's key is used
 */
function encryptMessage(message, listOfRecipients) {
    storm.log("function encryptMessage(): BEGIN");
    var encryptedMessage = message;
//    $.each(listOfRecipients, function(recipient) {
        var encryptKey = getBestKeyForEmail(listOfRecipients[0]);
        if (null != encryptKey) {
            encryptedMessage = storm.gpg.signEncryptContent(message, null, encryptKey);
        }
//    });
    storm.log("function encryptMessage(): END");
    return encryptedMessage;
}

/**
 * Sign Message if Valid Key can be found
 *
 * @TODO We don't want inline signatures. We want PGP/MIME.
 * @TODO Control Flow
 *
 * @return Wrapped Text
 */
function signMessage(message, sender) {
    storm.log("function signMessage(): BEGIN");
    signKey = getBestKeyForEmail(sender);
    var signedMessage = message;
    if (null != signKey) {
       signedMessage = storm.gpg.signEncryptContent(message, signKey);
    }
    storm.log("function signMessage(): END");
    return signedMessage;
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

/**
 * Get the sending identity's email address 
 *
 *  for(var key in msgIdentity){
 *    storm.log("msgIdentity[" + key + "] = "  +  msgIdentity[key]);
 *  }
 * log: msgIdentity[value] = id2
 * log: msgIdentity[label] = Marius Stübs <marius.stuebs@posteo.de>
 * log: msgIdentity[description] = Posteo-Account
 */
function getSender() {
//    storm.log("function getSender(): BEGIN");
    var msgIdentity = document.getElementById("msgIdentity"); //whereSelected();
    var accountKey = msgIdentity.getAttribute("value");
    var identity = gAccountManager.getIdentity(accountKey);

//    storm.log("function getSender(): END");
    return identity.email;
}

/**
 *
 * Returns a Private Key
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
    storm.log("function getRecipients(): BEGIN");
    var recipients = [];
    $(".textbox-addressingWidget").each(function() {
        var input = $(this)[0];
        var currentInput = $(input).val();
        recipients.push(currentInput);
    });
    storm.log("function getRecipients(): END");
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

function setMessage(message) {
    var editor = GetCurrentEditor();
    // https://developer.mozilla.org/en-US/docs/User:groovecoder/Compose_New_Message
    try {
        editor.beginTransaction();  
        editor.beginningOfDocument();   
        editor.selectAll();
        editor.insertText(message);  
        editor.insertLineBreak();  
        editor.endTransaction();  
    } catch(ex) {  
        Components.utils.reportError(ex);  
        return false;  
    }
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

