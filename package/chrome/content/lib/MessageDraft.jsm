// Copyright (C) 2014

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

Components.utils.import("chrome://storm/content/lib/global.jsm");
Components.utils.import("chrome://storm/content/lib/gpg.jsm");
Components.utils.import("chrome://storm/content/lib/Key.jsm");

this.EXPORTED_SYMBOLS = [];

//this.EXPORTED_SYMBOLS.push("Message");
this.EXPORTED_SYMBOLS.push("MessageDraft");

function MessageDraft(message, sender, recipientList) {
    this.cleartext      = message;
    this.sender         = sender;
    this.recipientList  = recipientList;
    
    this.encryptedMessageForRecipients = null;
    this.encryptedMessageForDraft = null;
}


/**
 * 
 */
MessageDraft.prototype.getRecipientList = function() {
    return this.recipientList;
}

/**
 * 
 */
MessageDraft.prototype.getSender = function() {
    return this.sender;
}

/**
 * 
 * @param String sendType 'save' or 'send'
 * @returns String
 */
MessageDraft.prototype.getEncryptedMessageText = function(sendType) {
    var message = this.cleartext;
    if (sendType === 'send') {
        message = this.getEncryptedMessageForRecipients();
    } else if (sendType === 'save') {
        message = this.getEncryptedMessageForDraft();    
    }
    return message;
}


/**
 * 
 * @returns String
 */
MessageDraft.prototype.getEncryptedMessageForRecipients = function() {
    
    // Get a list of all the recipients, that have no valid key
    var recipientsWithoutKey = [];
    $.each(listOfRecipients, function(recipient) {
        if (null != storm.keyring.getBestKeyForEmail(recipient)) {
            storm.log("Key found for: " + recipient);
            recipientsWithoutKey.push(recipient);
        } else {
            storm.log("No Key found for: " + recipient);
        }
    });
}

/**
 * 
 * @returns String
 */
MessageDraft.prototype.getEncryptedMessageForDraft = function() {
    return this.cleartext;    
}

/**
 * ???
 */
MessageDraft.prototype.getMimeSignature = function() {
}

/**
 * Sign Message if Valid Key can be found
 *
 * @TODO We don't want inline signatures. We want PGP/MIME.
 * @TODO Control Flow
 *
 * @returns Signed Message Text
 */
MessageDraft.prototype.getSignedMessageText = function() {
    storm.log("function getSignedMessageText() BEGIN");
    this.signKey = storm.keyring.getBestKeyForEmail(this.getSender(), true);
    this.signedMessage = storm.gpg.signEncryptContent(this.cleartext, this.signKey, null);
    storm.log("function getSignedMessageText() END");
    return this.signedMessage;    
}

MessageDraft.prototype.getSignedAndEncryptedMessageText = function() {
    storm.log("function getSignedAndEncryptedMessageText() BEGIN");
    signKeys     = storm.keyring.getKeysByEmail(this.getSender(), true);
    this.signKey = signKeys[0];
    this.encryptionKeyList = new Array();
    var recipientList = this.getRecipientList();
    for (var i = 0; i < recipientList.length; i++) {
        recipient = recipientList[i];
        firstEmail = storm.keyring.getBestKeyForEmail(recipient);
        this.encryptionKeyList.push(firstEmail);
    }
    this.signedAndEncryptedMessage = storm.gpg.signEncryptContent(this.cleartext, this.signKey, this.encryptionKeyList);
    storm.log("function getSignedAndEncryptedMessageText() END");
    return this.signedAndEncryptedMessage;    
}

