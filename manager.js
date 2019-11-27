
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

// Standard Google Universal Analytics code
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga'); // Note: https protocol here
    
    ga('create', 'UA-153539932-1', 'auto'); // Enter your GA identifier
    ga('set', 'checkProtocolTask', function(){}); // Removes failing protocol check. @see: http://stackoverflow.com/a/22152353/1958200
    ga('require', 'displayfeatures');
    ga('send', 'pageview', '/mypage.html'); // Specify the virtual path