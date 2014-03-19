const KEYTYPE_DSA = 1;
const KEYTYPE_RSA = 2;

keygenValidation = {
    /**
     * @return Boolean: Is password valid?
     */
    validatePassphrase: function(newKeyParams) {

        if (!newKeyParams.passphrase && !newKeyParams.noPassphraseChecked) {
            alert("Please set a password");
            return false;
        } else if (newKeyParams.passphrase != newKeyParams.passphrase2) {
           alert(("passNoMatch"));
           return false;
        } else if (newKeyParams.passphrase.search(/[\x80-\xFF]/)>=0) {
            alert(("passCharProblem"));
            return false;
        } else if ((newKeyParams.passphrase.search(/^\s/)==0) || (newKeyParams.passphrase.search(/\s$/)>=0)) {
            alert(("passSpaceProblem"));
            return false;
        }
        return true;
    },
    /**
     * @return Boolean:  no parallel key generate process is running?
     */
    validateNoProcessPending: function () {
        if (globalKeygenRequest) {
          let req = globalKeygenRequest.QueryInterface(Components.interfaces.nsIRequest);
          if (req.isPending()) {
             alert(("genGoing"));
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
                alert(("expiryTooLong"));
                return false;
            } else if (! (expiryTime > 0)) {
                alert(("expiryTooShort"));
               return false;
            }
        }
        return true;
    },
    validateKeySize: function(newKeyParams) {
        if ((newKeyParams.keyType==KEYTYPE_DSA) && (newKeyParams.keySize>3072)){
            alert(("dsaSizeLimit"));
            newKeyParams.keySize = 3072;
            return false;
        }
        return true;
    },
    validateIdentities: function(newKeyParams) {
        if (newKeyParams.identities && newKeyParams.identities.length > 0) {
            return true;
        }
        alert("Unknown Error 511");
        return false;
    },
    validateMainIdentity: function(newKeyParams) {
        if (newKeyParams.mainIdentity && newKeyParams.mainIdentity.key.length > 2) {
            return true;
        }
        alert("Unknown Error 476");
        return false;
    }
}

