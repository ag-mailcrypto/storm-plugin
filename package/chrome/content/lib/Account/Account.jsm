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

Components.utils.import("chrome://storm/content/lib/Account/Identity.jsm");
this.EXPORTED_SYMBOLS = [];

this.EXPORTED_SYMBOLS.push("Account");

function Account(tbAccount) {
    this.tbAccount = tbAccount;
}

const STORM_ACCOUNT_MANAGER_CONTRACTID = "@mozilla.org/messenger/account-manager;1";

/**
 * Iterate through the identities of this account
 */
Account.prototype.nextIdentity = function() {
    // Load the thunderbird Account Manager
    var thunderbirdAccountManager = Components.classes[STORM_ACCOUNT_MANAGER_CONTRACTID].getService(Components.interfaces.nsIMsgAccountManager);

    var tbIdentityInterface = this.tbAccount.identities; // "account1,account2,account4,account3"
    var tbIdentities = queryISupArray(tbIdentityInterface,
                                       Components.interfaces.nsIMsgIdentity);

    for (var i = 0; i < tbIdentities.length; i++) {
        yield tbIdentities[i];
    }
}

/**
 * Return the "pretty name" of an account
 */
Account.prototype.getPrettyName = function() {
    var thunderbirdAccountManager = Components.classes[STORM_ACCOUNT_MANAGER_CONTRACTID].getService(Components.interfaces.nsIMsgAccountManager);
    var serverSupports, inServer;
    var prettyName;
    var identityIterator = this.nextIdentity();
    var itentity = identityIterator.next();
    try {
        // Gecko >= 20
        serverSupports = thunderbirdAccountManager.getServersForIdentity(itentity);
        if (serverSupports.length > 0) {
            inServer = serverSupports.queryElementAt(0, Components.interfaces.nsIMsgIncomingServer);
        }
    }
    catch (ex) {
        // Gecko < 20
        serverSupports = thunderbirdAccountManager.GetServersForIdentity(itentity);
        if (serverSupports.GetElementAt(0)) {
            inServer = serverSupports.GetElementAt(0).QueryInterface(Components.interfaces.nsIMsgIncomingServer);
        }
    }
    if (inServer) {
        prettyName = inServer.prettyName;
    }
    return prettyName;
}


this.EXPORTED_SYMBOLS.push("queryISupArray");
function queryISupArray(supportsArray, iid) {
  var result = [];
  var i;
  try {
    // Gecko <= 20
    for (i=0; i<supportsArray.Count(); i++) {
      result.push(supportsArray.GetElementAt(i).QueryInterface(iid));
    }
  }
  catch(ex) {
    // Gecko > 20
    for (i=0; i<supportsArray.length; i++) {
      result.push(supportsArray.queryElementAt(i, iid));
    }
  }

  return result;
}
