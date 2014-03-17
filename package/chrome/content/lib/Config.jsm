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

Components.utils.import("resource://gre/modules/Services.jsm");

this.EXPORTED_SYMBOLS = [];
this.EXPORTED_SYMBOLS.push("Config");

/**
 * A signature record inside a key.
 */
function Config() {
	
	//var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
	this.prefsService = Services.prefs;
	this.defaultPreferences = this.prefsService.getDefaultBranch("extensions.storm.");
	this.userPreferences = this.prefsService.getBranch("extensions.storm.");
	
	this.getPreferencesById = function(identityId){
		//TODO: null-check
		return this.prefsService.getBranch("extensions.storm.identity."+identityId+".");
	}
	
	function getPrefById(prefName, aPrefName, identityId){
		//...
	}
	
}

/**
 * 
 * @param aPrefName
 * @param identityId
 * @returns
 */
Config.prototype.getCharPrefById = function(aPrefName, identityId) {
	var identityPreferences = this.getPreferencesById(identityId);
	if(identityPreferences.getPrefType(aPrefName)){
		return identityPreferences.getCharPref(aPrefName);
	}else{
		return this.userPreferences.getCharPref(aPrefName);
	}
};

/**
 * 
 * @param aPrefName
 * @param value
 * @param identityId
 * @returns
 */
Config.prototype.setCharPrefById = function(aPrefName, value, identityId) {
	this.getPreferencesById(identityId).setCharPref(aPrefName, value);
};

/**
 * 
 * @param identityId
 * @returns
 */
Config.prototype.isSetForIdentity = function(identityId) {
	return this.getPreferencesById(identityId).getPrefType(aPrefName);
};