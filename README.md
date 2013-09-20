# STORM Thunderbird Plugin

**S**ecurity **T**rough **O**pporunistic enc<strong>R</strong>yption **M**ethods

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
