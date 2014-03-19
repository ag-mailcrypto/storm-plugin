// Import the Services module for future use, if we're not in
// a browser window where it's already loaded.
Components.utils.import('resource://gre/modules/Services.jsm');

// Create a constructor for the built-in supports-string class.
const nsSupportsString = Components.Constructor("@mozilla.org/supports-string;1", "nsISupportsString");
function SupportsString(str) {
    // Create an instance of the supports-string class
    var res = nsSupportsString();

    // Store the JavaScript string that we want to wrap in the new nsISupportsString object
    res.data = str;
    return res;
}

// Create a constructor for the built-in transferable class
const nsTransferable = Components.Constructor("@mozilla.org/widget/transferable;1", "nsITransferable");

// Create a wrapper to construct a nsITransferable instance and set its source to the given window, when necessary
function Transferable(source) {
    var res = nsTransferable();
    if ('init' in res) {
        // When passed a Window object, find a suitable privacy context for it.
        if (source instanceof Ci.nsIDOMWindow)
            // Note: in Gecko versions >16, you can import the PrivateBrowsingUtils.jsm module
            // and use PrivateBrowsingUtils.privacyContextFromWindow(sourceWindow) instead
            source = source.QueryInterface(Ci.nsIInterfaceRequestor)
                           .getInterface(Ci.nsIWebNavigation);

        res.init(source);
    }
    return res;
}


/**
 * Make the context menu "copySelected" button disabled, as long no text is selected.
 */
function copyShowHide(self) {
    var selectedText = getTextboxSelection(self);
    var disabled = 'false';
    if (selectedText.length === 0) {
        disabled = 'true';
    }
    var popupObj = $('#copyOnlyDiv');
    popupObj.find('menuitem#context-copySelection').attr('disabled', disabled);
}

/**
 * Find out which textbox is active and return the selected text
 */
function getTextboxSelection() {
    var selectedText = window.getSelection();

    if(!selectedText || selectedText == "")
    {
        var focused = window.document.activeElement;
        if(focused && focused.value)
        {
            selectedText = getSelectionFromInput(focused);
        }
    }
    return selectedText;
}

/**
 * Find out which textbox is active and return all the text
 */
function copyAll() {
    var focused = window.document.activeElement;
    var success = false;
    if(focused && focused.value)
    {
        var selectedText = getSelectionFromInput(focused, true);
        success = copyToClipboard(selectedText);
        if (!success) {
            alert("Copy failed");
        }
    }
    return success;
}

function copySelection()
{
    var selectedText = getTextboxSelection();
    var success = copyToClipboard(selectedText);
    if (!success) {
        alert("Copy failed");
    }
    return success;
}

/**
 * Copy the argument into the clipboard
 *
 * @TODO Research weird NS_ERROR_FAILURE 0x80004005 which happens time to time 
 *
 * @param {String} text
 * @return {Boolean} success
 */
function copyToClipboard(text) {
    text = "" + text;

    try {
        // Sometimes throws NS_ERROR_FAILURE 0x80004005
        const clipHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
        clipHelper.copyString(text);
    } catch (e) {
        storm.log('[STORM] ' + e);
    }
    
    var result = true;
    /*
    // permanently throws NS_ERROR_FAILURE 0x80004005
    try {
        if (text != getClipboardContent()) {
            result = false;
        }
    } catch (e) {
        storm.log('[STORM] ' + e);
    }
    */
    return result;
}

function getSelectionFromInput(focused, copyAll) {
    var focusedValue = focused.value;
    if (copyAll) {
        var selectedText = focusedValue;
    } else {
        var sel = getInputSelection(focused);
        var selectedText = "";
        if(focusedValue.length == (sel.end)) {
            selectedText = focusedValue.substring(sel.start);
        } else {
            selectedText = focusedValue.substring(sel.start, (sel.end));
        }
    }
    return selectedText;
}

/**
 * @TODO Make this work.
 * Permanently throws NS_ERROR_FAILURE 0x80004005
 */
function getClipboardContent() {
    var str = new Object(); 
    var len = new Object(); 

    var clip = Components.classes["@mozilla.org/widget/clipboard;1"].getService(Components.interfaces.nsIClipboard); 
    clip.getData(trans, clip.kGlobalClipboard); 

    var trans = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable); 
    trans.addDataFlavor("text/unicode"); 

    trans.getTransferData("text/unicode",str,len); 

    str = str.value.QueryInterface(Components.interfaces.nsISupportsString); 
    str = str.data.substring(0, len.value / 2);

    return str;
}

function paste() {
    var str = getClipboardContent();

    var focused = document.commandDispatcher.focusedElement;
    var focusedValue = focused.value; 
    var sel = getInputSelection(focused);
    focused.value = focusedValue.substring(0,sel.start) + str + focusedValue.substring(sel.end);
}

function getInputSelection(el) {
    var start = 0, end = 0, normalizedValue, range,
        textInputRange, len, endRange;

    if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
        start = el.selectionStart;
        end = el.selectionEnd;
    } else {
        range = document.selection.createRange();

        if (range && range.parentElement() == el) {
            len = el.value.length;
            normalizedValue = el.value.replace(/\r\n/g, "\n");

            // Create a working TextRange that lives only in the input
            textInputRange = el.createTextRange();
            textInputRange.moveToBookmark(range.getBookmark());

            // Check if the start and end of the selection are at the very end
            // of the input, since moveStart/moveEnd doesn't return what we want
            // in those cases
            endRange = el.createTextRange();
            endRange.collapse(false);

            if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
                start = end = len;
            } else {
                start = -textInputRange.moveStart("character", -len);
                start += normalizedValue.slice(0, start).split("\n").length - 1;

                if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
                    end = len;
                } else {
                    end = -textInputRange.moveEnd("character", -len);
                    end += normalizedValue.slice(0, end).split("\n").length - 1;
                }
            }
        }
    }

    return {
        start: start,
        end: end
    };
}
