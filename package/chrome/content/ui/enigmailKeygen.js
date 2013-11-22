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
//  gUserIdentityField = document.getElementById("userIdentityField");
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





/**
 * This function shows the progress of the key generating action.
 * 
 * @param  String  data: Contains the return text from calling the GPG command
 * @return Void
 *
 * STATE 0 - Main Key, collection Randomness
 * STATE 0.1 - Not enough entropy
 * STATE 1 - Main Key, generating
 * STATE 2 - Sub Key, collection Randomness
 * STATE 2.1 - Not enough entropy
 * STATE 3 - Sub Key, generating
 */
var progressMeterInterval;
var state = -1;
function displayGpgMessages(data) {
    var l = $("#keygenConsoleBox description#keygenDetails");
    l.get(0).appendChild(document.createTextNode(data));
    
    if (data.indexOf("Generating key") >= 0) {
        state = 0;
        setProgressMeter("" + state, '5');
    } else if (data.indexOf("gpg:") >= 0) {
        if (progressMeterInterval) {
            clearInterval(progressMeterInterval); 
        }
        setProgressMeter(state, '100');
        state = state + 1;
        setProgressMeter(state, '5');
    }
    
    progressMeterInterval = setInterval(function() {setProgressMeter(state, '+1');}, 100);
    
    
    if (data.indexOf("Generating key") >= 0) {
    } else if (data.substring(0,1) == '+' || data.substring(0,1) == '.') {
    } else if (data.match(/Need \d+ more bytes/)) {
    } else {
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

/**
 *
 */
function setProgressMeter(id, newValue) {
    id = id || "0";
    var progMeter = document.getElementById("keygenProgress" + id);
    if (!progMeter) { return; }
    var progValue = Number(progMeter.value);
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
