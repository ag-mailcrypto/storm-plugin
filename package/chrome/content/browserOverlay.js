function openStormConfiguration() {
  let url = "about:addons";
  let tabmail = document.getElementById("tabmail");
  if (!tabmail) {
    // Try opening new tabs in an existing 3pane window
    let mail3PaneWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                                    .getService(Components.interfaces.nsIWindowMediator)
                                    .getMostRecentWindow("mail:3pane");
    if (mail3PaneWindow) {
      tabmail = mail3PaneWindow.document.getElementById("tabmail");
      mail3PaneWindow.focus();
    }
  }

  if (tabmail) {
    tabmail.openTab("contentTab", {contentPage: url});
  } else {
    window.openDialog("chrome://messenger/content/", "_blank",
                      "chrome,dialog=no,all", null,
                      { tabType: "contentTab",
                        tabParams: {contentPage: url} });
  }
}
