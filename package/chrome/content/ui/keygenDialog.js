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

$(window).ready(function() {
<<<<<<< HEAD
    // On expert settings: Show the tab "Advanced options"
=======
    /**
     * On expert settings: Show the tab "Advanced options"
     */
>>>>>>> 1a74036fd6e3513d00d86104533fd79d9e6d1bed
    $("#keygen-expert-settings").on("command", function() {
        $(".advances-options").show();
    });

<<<<<<< HEAD
    // On recommended settings: Hide the tab "Advanced options"
=======

    /**
     * On recommended settings: Hide the tab "Advanced options"
     */
>>>>>>> 1a74036fd6e3513d00d86104533fd79d9e6d1bed
    $("#keygen-recommended").on("command", function() {
        $(".advances-options").hide();
    });

<<<<<<< HEAD
    // Hide the tab "Advanced options" on default
=======
    /**
     * Hide the tab "Advanced options" on default
     */
>>>>>>> 1a74036fd6e3513d00d86104533fd79d9e6d1bed
    $(".advances-options").hide();
});
