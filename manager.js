
var version = localStorage.getItem('version');

/*
if (version !== null && version < '0.2.4') {
    var rulesetsStr = localStorage.getItem('rulesets');
    if (rulesetsStr) {
        var rulesets = JSON.parse(rulesetsStr);
        rulesets.forEach(rule => {
            rule.enabled = true;
        });
        localStorage.setItem('rulesets', JSON.stringify(rulesets));
    }
}
*/
if (!version || version != chrome.runtime.getManifest().version) {
    // Open the options page directly after installing or updating the extension
    localStorage.setItem('version', chrome.runtime.getManifest().version);
    localStorage.setItem('showChangelog', true);
    chrome.tabs.create({ url: "materiasIndex.html" });
}