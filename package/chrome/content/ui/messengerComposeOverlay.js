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


    storm.log("preparing stuff");
    window.addEventListener('compose-send-message', function (event) {
        var messageType = resolveMessageTypeString();
        
        // TODO: get message body
        // TODO: check if subject should be merged into body?
        // 
        // TODO: handle attatchments
        // TODO: check if attatchments should be merged into body?

        // TODO: sign/encrypt body
        //       LOOP: receipients and use respective key
        // TODO: sign/encrypt attatchments if there are and the should be encryptet (options)
        //       LOOP: receipients and use respective key
        //       
        // TODO: attatch own public key?

        var subject   = document.getElementById("msgSubject");
        var message   = getMessage();
        var senderKey = getSenderKey();
        var receipientKeys = getReceipientKeys();
        
        storm.log("============================================");
        storm.log("messageType:    " + messageType);
        storm.log("senderKeyId:    " + senderKey.id);
        storm.log("messageText:    " + message);
        storm.log("receipientKeys: [\n" + receipientKeys.each(function(key) {
            return "                " + key.id + ", \n";
        }) + "                ]");
        storm.log("============================================");

        event.preventDefault();
        event.stopPropagation();
    }, true);
});

/**
 * resolves if the message should be encrypted with the receipient key or the own
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

function getSenderKey() {
    var msgIdentity = document.getElementById("msgIdentity"); //whereSelected();

    // 'accountkey' contains the accountkey which might be better to resolve the actual email... 
    // but for now the description only contains the email 
    var selectedEmail = msgIdentity.getAttribute("description");

    var key = null;
    var keys = storm.keyring.getKeysByEmail(selectedEmail, true);
    
    if(keys.length > 0) {
        key = keys[0];
    }

    return key;
}

function getReceipientKeys() {
    var receipientKeys = [];

    $(".textbox-addressingWidget").each(function() {
        var input = $(this)[0];
        var currentInput = $(input).val();

        var bestKey = getBestKeyForEmail(currentInput);
        if(bestKey) {
            receipientKeys.push(bestKey);
        }
    });

    return receipientKeys;
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

function getBestKeyForEmail(currentInput) {
    // Parse email
    var m = currentInput.match(/^.*\<(.*)\>\s*$/);
    var email = isEmail(currentInput) ? currentInput : (m ? m[1] : null);

    // Find keys
    var keys = email ? storm.keyring.getKeysByEmail(email) : [];
    keys = keys.sort(function(a, b) { return a.getTrustSortValue() > b.getTrustSortValue(); });

    var bestKey = keys ? keys[0] : null;

    return bestKey;
}
