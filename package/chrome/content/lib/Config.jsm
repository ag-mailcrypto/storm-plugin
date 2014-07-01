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

// Always place the EXPORTED_SYMBOLS array on the very top of your jsm file!
this.EXPORTED_SYMBOLS = ["Config"];

Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("chrome://storm/content/lib/global.jsm");

/**
 * A class for accessing configuration/preferences of all kinds at a central place in a uniform way.
 * If no value is set on the requested level, the getter methods will fall back to the value of the next lower level in the hierarchy (default, user, identity)
 *  
 * e.g. storm.config.defaultPrefs.get("gpg.path") to access the default value of a pref
 * e.g. storm.config.userPrefs.get("gpg.path") to access a user specific value of a pref
 * e.g. storm.config.identityPrefs(identityId).get("gpg.path") to access a identity specific value of a pref
 * 
 * Besides it is possible to access the enigmail configs via the variable "enigmail" the same way as above
 * e.g. storm.config.enigmail.defaultPrefs.get("keyserver")
 * e.g. storm.config.enigmail.userPrefs.get("keyserver")
 * e.g. storm.config.enigmail.identityPrefs(identityId).get("pgpkeyId")
 */

function Config(){
	this.defaultPrefs = Services.prefs.getDefaultBranch("extensions.storm.");
	this.userPrefs = Services.prefs.getBranch("extensions.storm.");
	
	this.enigmail = new EnigmailConfig();
}

Config.prototype.identityPrefs = function(identityId){
    return new IdentityPrefBranchWrapper(identityId, "extensions.storm.identity.", this.userPrefs);
};

/**
 * see above
 */
function EnigmailConfig(){
    this.defaultPrefs = Services.prefs.getDefaultBranch("extensions.enigmail.");
    this.userPrefs = Services.prefs.getBranch("extensions.enigmail.");
}

EnigmailConfig.prototype.identityPrefs = function(identityId){
    return new IdentityPrefBranchWrapper(identityId, "mail.identity.", this.userPrefs);
};


/**
 * A class for accessing the identityPrefs of a specific identity the same way as the defaultPrefs and userPrefs branch.
 * This behavior is realized as a wrapper class that overwrites the getters and delegates the (non overwritten) method calls to the original methods.
 * (Inheritance would be nicer, yes, but i think it isn't possible for the (C?) implementation of nsIPrefBranch)
 * NOT IMPLEMENTED: getComplexValue, setComplexValue
 *
 * @param identityId
 * @param identityRoot
 * @param userPrefs
 * @returns {IdentityPrefBranchWrapper}
 */
function IdentityPrefBranchWrapper(identityId, identityRoot, userPrefs){
	
	this.identityId = identityId;
	this.identityRoot = identityRoot;
	this.userPrefs = userPrefs;
	
	this.identityPrefs = Services.prefs.getBranch(this.identityRoot + this.identityId + ".");
	
	/**
	 * private helper function for the delegating getters
	 * (should be private)
	 * 
	 * @param aPrefName
	 * @param funcName
	 * @returns String
	 */
	this.getPrefByFuncName = function(aPrefName, funcName){
		if(this.identityPrefs.getPrefType(aPrefName)){
			return this.identityPrefs[funcName](aPrefName);
		}else{
			return this.userPrefs[funcName](aPrefName);
		}
	};

}

/*
 * getters will fall back to original nsIPrefBranch values, if no specific value for this identity is set
 */
IdentityPrefBranchWrapper.prototype.getCharPref = function(aPrefName) {
	return this.getPrefByFuncName(aPrefName, "getCharPref");
};
IdentityPrefBranchWrapper.prototype.getBoolPref = function(aPrefName) {
	return this.getPrefByFuncName(aPrefName, "getBoolPref");
};
IdentityPrefBranchWrapper.prototype.getIntPref = function(aPrefName) {
	return this.getPrefByFuncName(aPrefName, "getIntPref");
};
IdentityPrefBranchWrapper.prototype.getPrefType = function(aPrefName) {
	return this.getPrefByFuncName(aPrefName, "getPrefType");
};


/*
 * these methods will just delegate to the original nsIPrefBranch functions of the identityPrefs branch (without doing anything special)
 */
IdentityPrefBranchWrapper.prototype.setCharPref = function() {
	this.identityPrefs.setCharPref.apply(this, arguments);
};
IdentityPrefBranchWrapper.prototype.setBoolPref = function() {
	this.identityPrefs.setBoolPref.apply(this, arguments);
};
IdentityPrefBranchWrapper.prototype.setIntPref = function() {
	this.identityPrefs.setIntPref.apply(this, arguments);
};
IdentityPrefBranchWrapper.prototype.addObserver = function() {
	this.identityPrefs.addObserver.apply(this, arguments);
};
IdentityPrefBranchWrapper.prototype.removeObserver = function() {
	this.identityPrefs.removeObserver.apply(this, arguments);
};
IdentityPrefBranchWrapper.prototype.deleteBranch = function() {
	this.identityPrefs.deleteBranch.apply(this, arguments);
};
IdentityPrefBranchWrapper.prototype.resetBranch = function() {
	this.identityPrefs.resetBranch.apply(this, arguments);
};
IdentityPrefBranchWrapper.prototype.lockPref = function() {
	this.identityPrefs.lockPref.apply(this, arguments);
};
IdentityPrefBranchWrapper.prototype.unlockPref = function() {
	this.identityPrefs.unlockPref.apply(this, arguments);
};
IdentityPrefBranchWrapper.prototype.getChildList = function() {
	this.identityPrefs.getChildList.apply(this, arguments);
};
IdentityPrefBranchWrapper.prototype.prefIsLocked = function() {
	return this.identityPrefs.prefIsLocked.apply(this, arguments);
};

/*
 * additional methods that are not given in the interface nsIPrefBranch
 */
IdentityPrefBranchWrapper.prototype.isSet = function(aPrefName) {
	return (this.identityPrefs.getPrefType(aPrefName) != 0);
};
