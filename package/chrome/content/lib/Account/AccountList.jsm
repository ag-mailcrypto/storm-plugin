// Copyright (C) 2013

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

Components.utils.import("chrome://storm/content/lib/Account/Account.jsm");
Components.utils.import("chrome://storm/content/lib/Account/Identity.jsm");
this.EXPORTED_SYMBOLS = [];

this.EXPORTED_SYMBOLS.push("AccountList");

function AccountList() {
    this.accounts = [];
    this.loadAccounts();
}

const STORM_ACCOUNT_MANAGER_CONTRACTID = "@mozilla.org/messenger/account-manager;1";

AccountList.prototype.loadAccounts = function() {
    // Load the thunderbird Account Manager
    var thunderbirdAccountManager = Components.classes[STORM_ACCOUNT_MANAGER_CONTRACTID].getService(Components.interfaces.nsIMsgAccountManager);

    var tbAccountInterface = thunderbirdAccountManager.accounts; // "account1,account2,account4,account3"
    var tbAccounts = queryISupArray(tbAccountInterface,
                                       Components.interfaces.nsIMsgAccount);
    for (var i = 0; i < tbAccounts.length; i++) {
        var account = new Account(tbAccounts[i]);        
        this.accounts.push(account);
    }
}

/**
 * Return an iterator for all accounts
 */
AccountList.prototype.nextAccount = function() {
    for (var i = 0; i < this.accounts.length; i++) {
        yield this.accounts[i];
    }
}

AccountList.prototype.getAccount = function(email) {
    return this.accounts.filter(function(account){
        return account.email === email;
    });
}

/**
 * Iterate through all accounts and their identities and return them
 *
 * @return List
 */
AccountList.prototype.getAllIdentities = function() {
    var allIdentities = [];
    var accountInterator = this.nextAccount();
    for (var account in accountInterator) {
        var identityInterator = account.nextIdentity();
        for (var identity in identityInterator) {
            allIdentities.push(identity);
        }
    }
    return allIdentities;

}

/**
 * Return the number of identities of the user
 */
AccountList.prototype.getIdentityCount = function() {
    return this.getAllIdentities().length;
}


// Prepare the instance
Components.utils.import("chrome://storm/content/lib/global.jsm");
storm.accountList = new AccountList();
