Components.utils.import("chrome://storm/content/lib/global.jsm");
Components.utils.import("chrome://storm/content/lib/Account/AccountList.jsm");
Components.utils.import("chrome://storm/content/lib/Keyring.jsm");
Components.utils.import("chrome://storm/content/lib/gpg.jsm");

var globalKeygenRequest;

/**
 * Pre-enter the right values into the wizard window
 */
function stormPrepareWizardWindow() {
    gUserIdentityList  = document.getElementById("userIdentity");
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
    fillIdentityList(userIdentityList, accountList, ["only-identity"]);

    /**
     * Enable/Disable the selection of single identities for this (to be generated) key
     */
    $('richlistbox.multipleIdentities, richlistbox.multipleIdentities checkbox').attr('disabled', 'true');
    $('#selectIdentities').on('command', function(){
        if ($('#selectIdentities').val() == 'all') {
            $('richlistbox.multipleIdentities, richlistbox.multipleIdentities checkbox').attr('disabled', 'true');
        } else if ($('#selectIdentities').val() == 'selected') {
            $('richlistbox.multipleIdentities, richlistbox.multipleIdentities checkbox').removeAttr('disabled');
        }
    });

    /**
     * On changing the selected identities ...
     */
    $('#selectIdentities, richlistbox.multipleIdentities').on('command', function(){
        fillMainIdentityDom();
    });    
    fillMainIdentityDom();    

    $('#advanced-options-toggle').on('click', function(){
        $('section#advanced-options').attr('hidden', 'false');
    });
}


function fillMainIdentityDom() {
    var idContainerOuter = $('#mainIdentity')
    var idContainerInner = idContainerOuter.find('menupopup');
    var selectedIdCaption = idContainerInner.val();
    
    idContainerInner.empty();
    idContainerOuter.removeAttr('label');
    
    var ids = getSelectedIdentities();
    $.each(ids, function(id, identity) {
        identityCaption = identity.identityName;
        var idItem = document.createElement('menuitem');
        idItem.setAttribute('label', identityCaption);
        idItem.setAttribute('value', identity.key);
        idItem.setAttribute('id', 'menuitem-' + identity.key);
        if (identityCaption == selectedIdCaption) {
            idItem.setAttribute('selected', 'true');
            idContainerOuter.attr('label', identityCaption);
        }
        idContainerInner.append(idItem);
    });
    if (idContainerOuter.attr('label') == '') {
        idContainerOuter.attr('label', ids[0].identityName);
    }
}


/** 
 * Parse all identities of the current user into a menu
 *
 * @param  jQuery-Object: userIdentityList  This object will be filled with menu items.
 * @param  List: accountList  The list of all accounts of the current user.
 * @param  Options: Possible values "only-identity"
 * 
 * @return void
 */
function fillIdentityList(userIdentityList, accountList, options) {
    var accountInterator = accountList.nextAccount();
    var uniqueEntries = [];
    for (var account in accountInterator) {
        var identityInterator = account.nextIdentity();
        for (var identity in identityInterator) {
            // What is to be displayed?            
            var identityCaption = identity.identityName;
            if (options.length == 0 || options.indexOf("only-identity") == -1) {
                identityCaption += " - " + account.getPrettyName();
            }
            // if this entry is already there?
            if($.inArray(identityCaption, uniqueEntries) === -1) {
                uniqueEntries.push(identityCaption);
            } else {
                continue;
            }

            var checkbox = document.createElement('checkbox');
            checkbox.setAttribute('checked', "true");
            checkbox.setAttribute('id', "checkbox-" + identity.key);

            var item = document.createElement('menuitem');
            //      item.setAttribute('label', identity.identityName);
            item.setAttribute('label', identityCaption);
            item.setAttribute('class', 'identity-popup-item');
            item.setAttribute('accountname', account.getPrettyName());
            item.setAttribute('id', identity.key);
            item.setAttribute('email', identity.email);

            var listrow = document.createElement('richlistitem');
            listrow.appendChild(checkbox);
            listrow.appendChild(item);
            userIdentityList.append(listrow);


            var singleIndentity = $("#userIdentityField");
            singleIndentity.val(identityCaption);
        }
    }
}

/**
 * Enable/Disable the expiry date field on checkbox
 */
function onNoExpiry() {
    var noExpiry = document.getElementById("noExpiry");
    var expireInput = document.getElementById("expireInput");
    var timeScale = document.getElementById("timeScale");

    expireInput.disabled=noExpiry.checked;
    timeScale.disabled=noExpiry.checked;
}

/**
 * Enable/Disable the passphrase field on checkbox
 */
function onNoPassphrase() {
    var checkbox = $('#passphraseBox checkbox');
    var passphraseInput = $('#passphraseBox textbox');

    if (checkbox.prop('checked')) {
        passphraseInput.attr('disabled', 'true');
    } else {
        passphraseInput.removeAttr('disabled');
    }
}

/**
 *
 */
function getMainIdentity() {
    var item = $('#mainIdentity');
    var identityKey = $(item.get(0).selectedItem).attr('value');
    if (!identityKey) { // if none is selected, use the first entry
        identityKey = item.find('menuitem:first-child').eq(0).attr('value');
    }
    var accountList = new AccountList();
    var identity = accountList.getIdentityById(identityKey);

    return identity;
}

/**
 * Look up all the checkboxes and return the IDs of the selected identities
 *
 * @return List of Strings (e.g. "id0" or "id5")
 */
function getSelectedIdentityIds() {
    var ids = [];
    $('#userIdentities checkbox').each(function() {
        if (this.checked || $('#selectIdentities').val() == 'all') {
            thisId = this.id.substring("checkbox-".length);
            ids.push(thisId);
        }
    });
    return ids;
}

/**
 * Look up all the IDs of the selected identities and identity objects
 *
 * @return List of identity objects
 */
function getSelectedIdentities() {
    var identities = [];
    var accountList = new AccountList();
    getSelectedIdentityIds().forEach(function (uid) {
        identities.push(accountList.getIdentityById(uid));
    });
    return identities;
}


/**
 * React on pressing the button "Generate a new keypair"
 *
 * First check the form inputs. Only if "true" returns from there, continue;
 * Open the result window and pass the arguments for generating.
 */ 
function stormKeygenTrigger() {
    var newKeyParams = getKeygenFormValues();
    
    var confirmMsg = "Are you sure?";
    if (validateKeygenForm(newKeyParams) && confirm(confirmMsg, "Really generate Key")) {
        window.openDialog("chrome://storm/content/ui/stormKeygenResult.xul", "", "", "", newKeyParams);
        return true;
    }
    return false;
}

function stormKeygenStart(newKeyParams) {
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

    /**
     * Callback function, to be called after key generation is complete.
     */    
    onFinish = function() {
        if (keygenRequest && keygenRequest.newKeyId) {
            storm.keyring.loadKeys();
            var keyObject = storm.keyring.getKey(keygenRequest.newKeyId);
            window.openDialog("chrome://storm/content/ui/keyDetails.xul", "", "", keyObject);

            if ($("#close-result-window-after-finish").prop('checked')) {
                window.close();
            }
        }
        else {
            alert("keyGenFailed");
        }
    };
    keygenRequest.onFinish = onFinish;
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
        case keygenValidation.validateIdentities(newKeyParams):
        case keygenValidation.validateMainIdentity(newKeyParams):
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
            identities: getSelectedIdentities(),
            mainIdentity: getMainIdentity(),
            noExpiry: $("#noExpiry").attr('checked'),
            expireInput: $("#expireInput").val(),
            timeScale: $("#timeScale").val(),
            comment: document.getElementById("keyComment").value,
    };
    return formValues;
}


function displayGpgMessages(data) {
    var l = $("#keygenDetails");
    l.get(0).appendChild(document.createElement('p').appendChild(document.createTextNode(data)));   
}
