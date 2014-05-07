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
Components.utils.import("resource:///modules/gloda/mimemsg.js");
  
this.EXPORTED_SYMBOLS = [];
this.EXPORTED_SYMBOLS.push("MessageDraft");

/**
 * Represents an email message.
 * Is created on hitting the send button.
 */
function MessageDraft() {
    this.cleartext      = '';
    this.sender         = '';
    this.recipientList  = [];

    this.sendSigned = true;
    this.sendEncrypted = true;
    
    this.saveSigned = false;
    this.saveEncrypted = false;
}

/**
 * 
 */
MessageDraft.prototype.setSendSigned = function(sendSigned) {    
    this.sendSigned = sendSigned;
}

/**
 * 
 */
MessageDraft.prototype.setSendEncrypted = function(sendEncrypted) {    
    this.sendEncrypted = sendEncrypted;
}

/**
 * 
 */
MessageDraft.prototype.setSaveSigned = function(saveSigned) {    
    this.saveSigned = saveSigned;
}

/**
 * 
 */
MessageDraft.prototype.setSaveEncrypted = function(saveEncrypted) {    
    this.saveEncrypted = saveEncrypted;
}

/**
 * 
 */
MessageDraft.prototype.setCleartext = function(cleartext) {
    this.cleartext = cleartext;
}

/**
 * 
 */
MessageDraft.prototype.getCleartext = function() {
    return this.cleartext;
}
/**
 * 
 */
MessageDraft.prototype.setRecipientList = function(recipientList) {
    this.recipientList = recipientList;
}

/**
 * 
 */
MessageDraft.prototype.setSender = function(sender) {
    this.sender = sender;
}

/**
 * 
 */
MessageDraft.prototype.getSendSigned = function() {    
    return this.sendSigned;
}

/**
 * 
 */
MessageDraft.prototype.getSendEncrypted = function() {    
    return this.sendEncrypted;
}

/**
 * 
 */
MessageDraft.prototype.getSaveSigned = function() {    
    return this.saveSigned;
}

/**
 * 
 */
MessageDraft.prototype.getSaveEncrypted = function() {    
    return this.saveEncrypted;
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
    storm.log("function getEncryptedMessageForRecipients() BEGIN");
    // Get a list of all the recipients, that have no valid key
    var recipientsWithoutKey = [];
    for (var i = 0; i < this.recipientList.length; i++){
    	var recipient = this.recipientList[i];
        if (null != storm.keyring.getBestKeyForEmail(recipient)) {
            storm.log("Key found for: " + recipient);
        } else {
            storm.log("No Key found for: " + recipient);
            recipientsWithoutKey.push(recipient);
        }
    }
    var encryptedMessageForRecipients;
    // encrypt message if all recipients have keys
    if(recipientsWithoutKey.length === 0){
        this._buildRecipientKeyList();
    	encryptedMessageForRecipients = storm.gpg.signEncryptContent(this.cleartext, null, this.encryptionKeyList);
    }else{
    	// TODO handle case of recipients without a key
    }
    storm.log("function getEncryptedMessageForRecipients() END");
	return encryptedMessageForRecipients;
}

/**
 * Encrypts with the privateKey!
 * @returns String
 */
MessageDraft.prototype.getEncryptedMessageForDraft = function() {
    storm.log("function getEncryptedMessageForDraft() BEGIN");
    var findSecretKey = true;
    this.signKey = storm.keyring.getBestKeyForEmail(this.getSender(), findSecretKey);
    var signedAndEncryptedMessage = storm.gpg.signEncryptContent(this.cleartext, null, [this.signKey]);
    storm.log("function getEncryptedMessageForDraft() END");
    return signedAndEncryptedMessage;    
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
    findSecretKey = true;
    this.signKey = storm.keyring.getBestKeyForEmail(this.getSender(), findSecretKey);
    this._buildRecipientKeyList();
    this.signedAndEncryptedMessage = storm.gpg.signEncryptContent(this.cleartext, this.signKey, this.encryptionKeyList);
    storm.log("function getSignedAndEncryptedMessageText() END");
    return this.signedAndEncryptedMessage;    
}

/**
 * Private method to gather the keys for all recipients
 */
MessageDraft.prototype._buildRecipientKeyList = function(){
	this.encryptionKeyList = new Array();
	var recipientList = this.getRecipientList();
	for (var i = 0; i < recipientList.length; i++) {
	    recipient = recipientList[i];
	    firstEmail = storm.keyring.getBestKeyForEmail(recipient);
	    this.encryptionKeyList.push(firstEmail);
	}
}

