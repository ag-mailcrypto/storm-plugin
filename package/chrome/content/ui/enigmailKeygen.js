/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the "MPL"); you may not use this file
 * except in compliance with the MPL. You may obtain a copy of
 * the MPL at http://www.mozilla.org/MPL/
 *
 * Software distributed under the MPL is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the MPL for the specific language governing
 * rights and limitations under the MPL.
 *
 * The Original Code is Enigmail.
 *
 * The Initial Developer of the Original Code is Ramalingam Saravanan.
 * Portions created by Ramalingam Saravanan <svn@xmlterm.org> are
 * Copyright (C) 2002 Ramalingam Saravanan. All Rights Reserved.
 *
 * Contributor(s):
 * Patrick Brunschwig <patrick@enigmail.net>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 * ***** END LICENSE BLOCK ***** */

// Uses: chrome://enigmail/content/enigmailCommon.js
Components.utils.import("chrome://storm/content/lib/global.jsm");
Components.utils.import("resource://enigmail/enigmailCommon.jsm");
Components.utils.import("chrome://storm/content/lib/Account/AccountList.jsm");
Components.utils.import("chrome://storm/content/lib/Keyring.jsm");
Components.utils.import("chrome://storm/content/lib/gpg.jsm");

const Ec = EnigmailCommon;

// Initialize enigmailCommon
EnigInitCommon("enigmailKeygen");

var gAccountManager = Components.classes[ENIG_ACCOUNT_MANAGER_CONTRACTID].getService(Components.interfaces.nsIMsgAccountManager);

var gUserIdentityList;
var userIdentityList;
var gUseForSigning;

var gKeygenRequest;
var gAllData = "";
var gGeneratedKey= null;
var gUsedId;

const KEYGEN_CANCELLED = "cancelled";
const KEYTYPE_DSA = 1;
const KEYTYPE_RSA = 2;

function enigmailKeygenLoad() {
    DEBUG_LOG("enigmailKeygen.js: Load\n");

  gUserIdentityList  = document.getElementById("userIdentity");
  gUserIdentityField = document.getElementById("userIdentityField");
  gUseForSigning     = document.getElementById("useForSigning");

    /**
     * Fill the user identities
     */
    accountList = new AccountList();
    identityCount = accountList.getIdentityCount();
    if (identityCount <= 0) {
        alert("ERROR: Couldn't find user identites");    
    } else if (identityCount <= 1) {
        $('.oneIdentity').show();
        $('.multipleIdentities').hide();
    } else {
        $('.oneIdentity').hide();
        $('.multipleIdentities').show();
    }
    var userIdentityList = $('#userIdentities');
    fillIdentityList(userIdentityList, accountList);

//  gUserIdentityList.focus();

/*  enigmailKeygenUpdate(true, false);

  var enigmailSvc = GetEnigmailSvc();
  if (!enigmailSvc) {
     EnigAlert(EnigGetString("accessError"));
  }

  if (enigmailSvc.agentType != "gpg") {
     EnigAlert(EnigGetString("onlyGPG"));
     return;
  }
  */
}

function enigmailOnClose() {
  var closeWin = true;
  if (gKeygenRequest) {
    closeWin = EnigConfirm(EnigGetString("keyAbort"), EnigGetString("keyMan.button.generateKeyAbort"), EnigGetString("keyMan.button.generateKeyContinue"));
  }
  if (closeWin) abortKeyGeneration();
  return closeWin;
}

function enigmailKeygenUnload() {
   DEBUG_LOG("enigmailKeygen.js: Unload\n");

   enigmailKeygenCloseRequest();
}


function enigmailKeygenUpdate(getPrefs, setPrefs) {
  DEBUG_LOG("enigmailKeygen.js: Update: "+getPrefs+", "+setPrefs+"\n");

  var noPassphrase        = document.getElementById("noPassphrase");
  var noPassphraseChecked = getPrefs ? EnigGetPref("noPassphrase")
                                     : noPassphrase.checked;

  if (setPrefs) {
    EnigSetPref("noPassphrase", noPassphraseChecked);
  }

  noPassphrase.checked = noPassphraseChecked;

  var passphrase1 = document.getElementById("passphrase");
  var passphrase2 = document.getElementById("passphraseRepeat");
  passphrase1.disabled = noPassphraseChecked;
  passphrase2.disabled = noPassphraseChecked;

/*
  var commentElement = document.getElementById("keyComment");
  if (noPassphraseChecked) {
    if (commentElement.value == "") commentElement.value = EnigGetString("keyGenNoPassphrase");
  }
  else {
    if (commentElement.value == EnigGetString("keyGenNoPassphrase")) commentElement.value = "";
  }
*/
}

function enigmailKeygenTerminate(exitCode) {
  DEBUG_LOG("enigmailKeygen.js: Terminate:\n");

  var curId = gUsedId;

  gKeygenRequest = null;

  if ((! gGeneratedKey) || gGeneratedKey == KEYGEN_CANCELLED) {
    if (! gGeneratedKey)
      EnigAlert(EnigGetString("keyGenFailed"));
    return;
  }

  var progMeter = document.getElementById("keygenProgress");
  progMeter.setAttribute("value", 100);

  if (gGeneratedKey) {
     if (gUseForSigning.checked) {
        curId.setBoolAttribute("enablePgp", true);
        curId.setIntAttribute("pgpKeyMode", 1);
        curId.setCharAttribute("pgpkeyId", "0x"+gGeneratedKey.substr(-8,8));

        enigmailKeygenUpdate(false, true);

        EnigSavePrefs();

        if (EnigConfirm(EnigGetString("keygenComplete", curId.email)+"\n\n"+EnigGetString("revokeCertRecommended"), EnigGetString("keyMan.button.generateCert"))) {
            EnigCreateRevokeCert(gGeneratedKey, curId.email, closeAndReset);
        }
        else
          closeAndReset();
     }
     else {
       if (EnigConfirm(EnigGetString("genCompleteNoSign")+"\n\n"+EnigGetString("revokeCertRecommended"), EnigGetString("keyMan.button.generateCert"))) {
          EnigCreateRevokeCert(gGeneratedKey, curId.email, closeAndReset);
       }
       else
          closeAndReset();
     }
   }
   else {
      EnigAlert(EnigGetString("keyGenFailed"));
      window.close();
   }
}

function closeAndReset() {
  var enigmailSvc = GetEnigmailSvc();
  enigmailSvc.invalidateUserIdList();
  window.close();
}

// Cleanup
function enigmailKeygenCloseRequest() {
   DEBUG_LOG("enigmailKeygen.js: CloseRequest\n");

  if (gKeygenRequest) {
    var p = gKeygenRequest;
    gKeygenRequest = null;
    p.kill(false);
  }
}


keygenValidation = {
    /**
     * @return Boolean: Is password valid?
     */
    validatePassphrase: function(newKeyParams) {

        if (!newKeyParams.passphrase && !newKeyParams.noPassphraseChecked) {
            alert("Please set a password");
            return false;
        } else if (newKeyParams.passphrase != newKeyParams.passphrase2) {
           EnigAlert(EnigGetString("passNoMatch"));
           return false;
        } else if (newKeyParams.passphrase.search(/[\x80-\xFF]/)>=0) {
            EnigAlert(EnigGetString("passCharProblem"));
            return false;
        } else if ((newKeyParams.passphrase.search(/^\s/)==0) || (newKeyParams.passphrase.search(/\s$/)>=0)) {
            EnigAlert(EnigGetString("passSpaceProblem"));
            return false;
        }
        return true;
    },
    /**
     * @return Boolean:  no parallel key generate process is running?
     */
    validateNoProcessPending: function () {
        if (gKeygenRequest) {
          let req = gKeygenRequest.QueryInterface(Components.interfaces.nsIRequest);
          if (req.isPending()) {
             EnigAlert(EnigGetString("genGoing"));
             return false;
          }
        }
        return true;
    }, 
    validateKeyExpiryDate: function(newKeyParams) {
        var multiplier = 0;
        switch (newKeyParams.timeScale) {
            case 'd': multiplier = 1; break;
            case 'w': multiplier = 7; break;
            case 'm': multiplier = 30; break;
            case 'y': multiplier = 365; break;
        }
        
        var expiryTime = Number(newKeyParams.expireInput) * multiplier;
        if (! newKeyParams.noExpiry) {
            if (expiryTime > 36500) {
                EnigAlert(EnigGetString("expiryTooLong"));
                return false;
            } else if (! (expiryTime > 0)) {
                EnigAlert(EnigGetString("expiryTooShort"));
               return false;
            }
        }
        return true;
    },
    validateKeySize: function(newKeyParams) {
        if ((newKeyParams.keyType==KEYTYPE_DSA) && (newKeyParams.keySize>3072)){
            EnigAlert(EnigGetString("dsaSizeLimit"));
            newKeyParams.keySize = 3072;
            return false;
        }
        return true;
    }
}


/**
 * Do all the validations on the Key-Generate form
 *
 * @param  {Object}  newKeyParams  All the values from the input form
 *
 * @return True: Form is ok. False: Stop processing!
 */
function validateKeygenForm(newKeyParams) {
    switch (false) {
        case keygenValidation.validatePassphrase(newKeyParams):
        case keygenValidation.validateNoProcessPending(newKeyParams):
        case keygenValidation.validateKeyExpiryDate(newKeyParams):
        case keygenValidation.validateKeySize(newKeyParams):
            return false;
            break;
        default:
            return true;
            break;
    }
}

/**
 * Read the values from the XUL centralized
 */
function getKeygenFormValues() {
    var formValues = {
            keyLength: Number(document.getElementById("keyLength").value),
            keyType: Number(document.getElementById("keyType").value),
            passphrase: document.getElementById("passphrase").value,
            passphrase2: document.getElementById("passphraseRepeat").value,
            noPassphraseChecked: document.getElementById("noPassphrase").checked,
            identities: getSelectedIdentites(),
            noExpiry: $("#noExpiry").attr('checked'),
            expireInput: $("#expireInput").val(),
            timeScale: $("#timeScale").val(),
            comment: document.getElementById("keyComment").value,
    };
    return formValues;
}

/**
 * React on pressing the button "Generate a new keypair"
 *
 * First check the form inputs. Only if "true" returns from there, continue;
 */ 
function enigmailKeygenStart() {
    var newKeyParams = getKeygenFormValues();
    
    var confirmMsg = "Are you sure?";
    if (validateKeygenForm(newKeyParams) && confirm(confirmMsg, EnigGetString("keyMan.button.generateKey"))) {
        
        // Disable all tabs.
        var allTabs = $('tab');
        allTabs.attr('disabled', true);
      
        // Allow only the "result" tab
        var resultTab = $('tab#result-tab');
        resultTab.attr('disabled', false);

        // Switch to the tab and the tabpanel (Change Focus)
        var resultTabPanel = $('tabpanel#result-tabpanel');
        var tabBox = $('tabbox#keygen-tabbox');
        tabBox[0].selectedPanel = resultTabPanel[0];
        tabBox[0].selectedTab   = resultTab[0];

       gGeneratedKey = null;
       gAllData = "";

       var enigmailSvc = GetEnigmailSvc();
       if (!enigmailSvc) {
          EnigAlert(EnigGetString("accessError"));
          return;
       }

       
        var keygenRequest = storm.keyring.generateKey(window, newKeyParams);
        var messagesAreBeingProcessed = false;
        setInterval(function() {
            if (messagesAreBeingProcessed === false) {
                messagesAreBeingProcessed = true;
                while (keygenRequest.messages.length > 0) {
                    var data = keygenRequest.messages.shift();
                    displayGpgMessages(data);
                };
                messagesAreBeingProcessed = false;
            }
        }, 50);
        keygenRequest.wait();

       
       if (!gKeygenRequest) {
          alert(EnigGetString("keyGenFailed"));
       }
    }
}

var progressMeterInterval;
function displayGpgMessages(data) {
    var l = $("#keygenConsoleBox description#keygenDetails");
    l.get(0).appendChild(document.createTextNode(data));
    
    if (progressMeterInterval) {
        clearInterval(progressMeterInterval); 
    }
    
    if (data.indexOf("Generating key") >= 0) {
        var progressMeterInterval = setInterval(function() {setProgressMeter("0", '+20');}, 100);
    } else if (data == '+' || data == '.') {
        setProgressMeter(0, '99');
        var progressMeterInterval = setInterval(function() {setProgressMeter("1", '+20');}, 100);
    } else if (data.match(/Need \d+ more bytes/)) {
        var progressMeterInterval = setInterval(function() {setProgressMeter("0", '+20');}, 100);
    } else {
        setProgressMeter(1, '99');
    }
}


function abortKeyGeneration() {
  gGeneratedKey = KEYGEN_CANCELLED;
  enigmailKeygenCloseRequest();
}

function enigmailKeygenCancel() {
  DEBUG_LOG("enigmailKeygen.js: Cancel\n");
  var closeWin=false;

  if (gKeygenRequest) {
    closeWin = EnigConfirm(EnigGetString("keyAbort"), EnigGetString("keyMan.button.generateKeyAbort"), EnigGetString("keyMan.button.generateKeyContinue"));
    if (closeWin) abortKeyGeneration();
  }
  else {
    closeWin=true;
  }

  if (closeWin) window.close();
}

function onNoExpiry() {
  var noExpiry = document.getElementById("noExpiry");
  var expireInput = document.getElementById("expireInput");
  var timeScale = document.getElementById("timeScale");

  expireInput.disabled=noExpiry.checked;
  timeScale.disabled=noExpiry.checked;
}

function getCurrentIdentity()
{
  var item = gUserIdentityList.selectedItem;
  var identityKey = item.getAttribute('id');

  var identity = gAccountManager.getIdentity(identityKey);

  return identity;
}

/**
 * Look up all the checkboxes and return the IDs of the selected identities
 *
 * @return List of Strings
 */
function getSelectedIdentitesIds() {
    var ids = [];
    $('#userIdentities checkbox').each(function() {
        if (this.checked) {
            thisId = this.id.substring("checkbox-".length);
            ids.push(thisId);
        }
    });
    return ids;
}

function getSelectedIdentites() {
    var identities = [];
    accountList = new AccountList();
    getSelectedIdentitesIds().forEach(function (uid) {
        identities.push(accountList.getIdentityById(uid));
    });
    return identities;
}

/** 
 * Past all identities of the current user into a menu
 *
 * @param  jQuery-Object: userIdentityList  This object will be filled with menu items.
 * @param  List: accountList  The list of all accounts of the current user.
 * 
 * @return void
 */
function fillIdentityList(userIdentityList, accountList) {
    var accountInterator = accountList.nextAccount();
    for (var account in accountInterator) {
        var identityInterator = account.nextIdentity();
        for (var identity in identityInterator) {
            var checkbox = document.createElement('checkbox');
            checkbox.setAttribute('checked', "true");
            checkbox.setAttribute('id', "checkbox-" + identity.key);

            var item = document.createElement('menuitem');
            //      item.setAttribute('label', identity.identityName);
            item.setAttribute('label', identity.identityName + " - " + account.getPrettyName());
            item.setAttribute('class', 'identity-popup-item');
            item.setAttribute('accountname', account.getPrettyName());
            item.setAttribute('id', identity.key);
            item.setAttribute('email', identity.email);

            var listrow = document.createElement('richlistitem');
            listrow.appendChild(checkbox);
            listrow.appendChild(item);
            userIdentityList.append(listrow);
            
            var singleIndentity = $("#userIdentityField");
            singleIndentity.val(identity.identityName + " - " + account.getPrettyName());
        }
    }
}

function setProgressMeter(id, newValue) {
    id = id || 0;
    var progMeter = document.getElementById("keygenProgress" + id);
    var progValue = Number(progMeter.newValue);
    if (newValue.substring(0,1) == '+') {
        progValue += Number(newValue.substring(1));  
        if (progValue >= 95) {
            progValue=10;
        }
    } else {
        progValue = Number(newValue);
    }
    
    progMeter.setAttribute("value", progValue);
}
