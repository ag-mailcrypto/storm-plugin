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
Components.utils.import("chrome://storm/content/lib/global.jsm");
Components.utils.import("chrome://storm/content/lib/Keyring.jsm");



var settingsWindowFunctions = {
    key: window.arguments[0],
    init: function() {
        // Close on <Escape>
        $(window).keypress(function(e) {
            if(e.keyCode == 27) closeWindow();
        });
        // Close button
        $('#button-close').on('command', function() {
            settingsWindowFunctions.closeWindow();
        });
        
    },
    closeWindow: function() {
        window.close();
    }

};


$(window).ready(function() {
    settingsWindowFunctions.init();
});



