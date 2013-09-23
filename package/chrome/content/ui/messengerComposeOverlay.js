Components.utils.import("chrome://storm/content/lib/global.jsm");
Components.utils.import("chrome://storm/content/lib/utils.jsm");
Components.utils.import("chrome://storm/content/lib/Keyring.jsm");

$(window).load(function() {

	// AWESOME WORKAROUND EVENT INJECTION FOR CRAPPY EVENT DESIGN!
	// TODO FIX BUG: A new Row is "copied" from the first Row on creation.
	// It is copied with the (for the new empty(!) Line) visible and wrong Icon...

	var oldOnInput = $(".textbox-addressingWidget").attr("oninput");

	Application.console.log(oldOnInput);

	$(".textbox-addressingWidget").attr("oninput", oldOnInput + "; stormComposeAddressOverlayOnInput(this);");
});

function stormComposeAddressOverlayOnInput(input) {

	var currentInput = $(input).val();
	var icon = $(input).find(".composeWindowTrustLevelIcon");

    //parse email
    var m = currentInput.match(/^.*\<(.*)\>\s*$/);
    var email;
    if (m)
    {
    	email = m[1];
    } else if (isEmail(currentInput))
    {
    	email = currentInput
    }

    if (email)
    {
    	if (storm.keyring.getKeysByEmail(email).some(function(key) {
    		Application.console.log(key.getValidity());
    		return key.getValidity() == "trusted";
    	}))
    	{
    		icon.addClass("trusted").removeClass("invalid untrusted");
    	}
    	if (storm.keyring.getKeysByEmail(email).some(function(key) {
    		return key.getValidity() == "untrusted";
    	}))
    	{
    		icon.addClass("untrusted").removeClass("invalid trusted");
    	}

    } else {
    	icon.addClass("invalid").removeClass("trusted untrusted")
    }
};