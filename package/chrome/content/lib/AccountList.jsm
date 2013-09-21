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
