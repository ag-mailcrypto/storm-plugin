Components.utils.import("chrome://storm/content/lib/global.jsm");
Components.utils.import("chrome://storm/content/lib/Account/AccountList.jsm");
Components.utils.import("chrome://storm/content/lib/Keyring.jsm");
Components.utils.import("chrome://storm/content/lib/gpg.jsm");

/**
 * Pre-enter the right values into the wizard window
 */
function stormPrepareWizardWindow() {
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


    $('description.advanced-options').on('click', function(){
        $('section.advanced-options').slideDown();
    });
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

