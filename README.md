# STORM Thunderbird Plugin

**S**ecurity **T**hrough **O**pportunistic enc<strong>R</strong>yption **M**ethods

This is, of course, a WIP title.

## Installation

Make sure you have all submodules up-to-date. To do so, run:

    git submodule update --init

For development, clone this repo somewhere (now called `$REPO`) and create the
following symlink:

    cd ~/.thunderbird/*.default/extensions/
    ln -s $REPO/package/ storm@ag-mailcrypto.informatik.uni-hamburg.de

For production, zip up the `package/` folder, rename extension to `xpi` and
use addon manager in thunderbird to install.

Also check out our [development guide](https://github.com/ag-mailcrypto/storm-plugin/wiki/Development-guide).

## License (GPLv3)

See `LICENSE` file for full license text.

    Copyright (C) 2013

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.

