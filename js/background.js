var currentTab;

localStorage.setItem('currentTabId', 0);

if(localStorage.getItem('sitesTree') == null)
{
	localStorage.setItem('sitesTree','[]');
}

if(localStorage.getItem('ignoredSites') == null)
{
    localStorage.setItem('ignoredSites','[]');
}

var sitesTree;
var ignoredSites;

function checkCurrentTab(tab)
{
    var ignored = false;
    if(typeof(tab) == "object")
    {
        var url = tab.url.replace('http://','').replace('https://','').replace('chrome:','').replace('chrome-extension:','').split('/');
        sitesTree = eval(localStorage.getItem('sitesTree'));
        ignoredSites = eval(localStorage.getItem('ignoredSites'));
        
        $.each(ignoredSites,function(i,o){
            if(url[0].indexOf(o.url) != -1)
            {
                chrome.pageAction.hide(tab.id);
                ignored = true;
                return false;
            }
            else
            {
                ignored = false;
            }
        });
        
        if(!ignored)
        {
            if(sitesTree.length > 0)
            {
                $.each(sitesTree,function(i, o){
                    if(url[0].indexOf(o.url) != -1)
                    {
                        chrome.pageAction.setIcon({'tabId':tab.id,'path':'images/switch_16.png'});
                    }
                    else
                    {
                        chrome.pageAction.setIcon({'tabId':tab.id,'path':'images/switch_16_off.png'});
                    }
                    
                    if(url[0].length > 0)
                    {
                        chrome.pageAction.show(tab.id);
                    }

                    if(url[0].indexOf(o.url) != -1)
                    {
                        return false;
                    }
                });
            }
            else if(sitesTree.length == 0 && url[0].length > 0)
            {
                console.log('sitesTree.length == 0');
                chrome.pageAction.setIcon({'tabId':tab.id,'path':'images/switch_16_off.png'});
                chrome.pageAction.show(tab.id);
            }
        }
    }
}

chrome.tabs.onSelectionChanged.addListener(function(newTabId, selectInfo) {
    chrome.tabs.get(newTabId,function(tab){
        localStorage.setItem('currentTabId', tab.id);
        checkCurrentTab(tab);
    });
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
	chrome.tabs.get(tabId,function(tab){
        localStorage.setItem('currentTabId', tab.id);
        checkCurrentTab(tab);
    });
});

chrome.windows.onFocusChanged.addListener(function(windowId){
    chrome.tabs.getSelected(windowId,function(tab){
        localStorage.setItem('currentTabId', tab.id);
        checkCurrentTab(tab);
    });
});