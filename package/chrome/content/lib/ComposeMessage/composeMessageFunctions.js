/**
 * The main function that is called, when someone tries to send an emails
 * or tries to save it in "drafts" etc.

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
 *
 * @TODO Implement Attachments!
 */
function handleEmailSending() {
    // messageType could be "send" or "save"
    // If "save" encrypt to yourself.
    var messageType = resolveMessageTypeString();
    var message     = getMessage();
    var subject     = document.getElementById("msgSubject");
    var sender      = getSender();
    var recipientList  = getRecipients();
    var sendMail = true;
    
   // TODO set preferences
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
    storm.log("function getSender(): BEGIN");
    var msgIdentity = document.getElementById("msgIdentity"); //whereSelected();
    var accountKey = msgIdentity.getAttribute("value");
    var identity = storm.accountList.getIdentityById(accountKey);

    var email = identity.email;
    storm.log("function getSender(): END");
    return email;
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
        if (currentInput.length > 0) {
            recipients.push(currentInput);
        }
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
        var bestKey = storm.keyring.getBestKeyForEmail(currentInput);
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
    return true;
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
};

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


