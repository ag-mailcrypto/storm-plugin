Components.utils.import("chrome://storm/content/lib/global.jsm");
Components.utils.import("chrome://storm/content/lib/utils.jsm");
Components.utils.import("chrome://storm/content/lib/Keyring.jsm");

$(window).load(function() {
    // AWESOME WORKAROUND EVENT INJECTION FOR CRAPPY EVENT DESIGN!
    // Appends the onInput function to the onInput attribute, because it somehow
    // does not work using $.on() -- doh!
    var widget = $(".textbox-addressingWidget");
    widget.attr("oninput", widget.attr("oninput" + "; stormComposeAddressOverlayOnInput(this);");
});

// Overwrite the awAppendNewRow function, calling the original first, then settings
// some nice attributes. This is a stupid hack because thunderbird itself is one.
var _original_awAppendNewRow = awAppendNewRow;
awAppendNewRow = function(setFocus) {
    _original_awAppendNewRow(setFocus);

    // FIX ALL THE ROWS!
    $(".textbox-addressingWidget").each(function() {
        stormComposeAddressOverlayOnInput($(this)[0]);
    });
}

/**
 * Sets the trust icon for an address input box.
 * @param  {DOMElement} input The input box.
 */
function stormComposeAddressOverlayOnInput(input) {
    var currentInput = $(input).val();
    var icon = $(input).find(".storm-trust-icon");

    // Parse email
    var m = currentInput.match(/^.*\<(.*)\>\s*$/);
    var email = isEmail(currentInput) ? currentInput : (m ? m[1] : null);

    // Find keys
    var keys = email ? storm.keyring.getKeysByEmail(email) : [];
    keys = keys.sort(function(a, b) { return a.getTrustSortValue() > b.getTrustSortValue(); });

    var bestKey = keys ? keys[0] : null;
    var cls = bestKey ? bestKey.getValidity() : "none";
    var title = bestKey ? "Key validity: " + bestKey.getValidityString() : "No key found";

    // Set class
    icon.removeClass("marginal trusted untrusted invalid none").addClass(cls);
    icon.attr("tooltiptext", title);
};
