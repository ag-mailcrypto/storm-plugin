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

Components.utils.import("chrome://storm/content/lib/utils.jsm");

function openStormConfiguration() {
    openBrowserTab(window, "chrome://storm/content/ui/preferences.xul");
}

var EnigmailWarning = {
  onLoad: function() {
    // initialization code
	Application.getExtensions(function(extensions) {
		if (!extensions.has("{847b3a00-7ab1-11d4-8f02-006008948af5}")) {
		  window.alert("Enigmal isn't installed!");//" Version: " + extensions.get("{847b3a00-7ab1-11d4-8f02-006008948af5}").version);
		}
		else if (!extensions.get("{847b3a00-7ab1-11d4-8f02-006008948af5}").enabled) {
		  window.alert("Enigmal isn't enabled stuff!");
		  element = document.getElementById("storm-notification-box");
		  element.style.color = 'blue';
		  element.appendNotification("storm is better than enigmal" , 42 , '' , 'PRIORITY_INFO_LOW' , 0, 0 );
		}
	});
  }
};

window.addEventListener("load", function(e) { EnigmailWarning.onLoad(e); }, false); 
