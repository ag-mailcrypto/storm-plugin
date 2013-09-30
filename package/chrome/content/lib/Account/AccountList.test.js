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

Components.utils.import("chrome://storm/content/lib/Account.jsm");
this.EXPORTED_SYMBOLS = [];

this.EXPORTED_SYMBOLS.push("AccountList");

function AccountList() {
    this.accounts = [];
    this.loadAccounts();
}

AccountList.prototype.loadAccounts = function() {
    //TODO load Accounts from config
    var account = {email:"test@test.de", key:"0817398237"};
    this.accounts.push(account);
}

AccountList.prototype.getAccount = function(email) {
    return this.accounts.filter(function(account){
        return account.email === email;
    });
}

// Prepare the instance
Components.utils.import("chrome://storm/content/lib/global.jsm");
storm.accountList = new AccountList();
