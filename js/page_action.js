var sitesTree = eval(localStorage.getItem('sitesTree'));
var ignoredSites = eval(localStorage.getItem('ignoredSites'));
var currentSite;
var currentSiteUrl;

chrome.tabs.get((localStorage.getItem('currentTabId')*1), function(tab){
    var url = tab.url.replace('http://','').replace('https://','').split('/');
    
    $('#url').blur(function(){
        if(/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/.test($(this).val()))
        {
            $('#liveUrlIP').text($(this).val() + ':');
            $('#devUrlIP').text($(this).val() + ':');
            $('#liveUrlSite').text('');
            $('#devUrlSite').text('');
        }
        else
        {
            $('#liveUrlIP').text('');
            $('#devUrlIP').text('');
            $('#liveUrlSite').text('.' + $(this).val());
            $('#devUrlSite').text('.' + $(this).val());
        }
    });
    

    if(/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}:[0-9]*/.test(url))
    {
        $('#url').val(url[0].replace(/:[0-9]*?$/,'')).blur();
        $('#title').val(url[0].replace(/:[0-9]*?$/,''));
        $('#wwwPrefix').hide();
    }
    else if(/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/.test(url))
    {
        $('#url').val(url[0]).blur();
        $('#title').val(url[0]);
        $('#wwwPrefix').hide();
    }
    else if(/^[a-zA-Z0-9-_]*\.[a-zA-Z0-9-_]*\.[a-zA-Z0-9-_\.]*/.test(url))
    {
        $('#url').val(url[0].replace(/^[a-zA-Z0-9-_]*?\./,'')).blur();
        $('#title').val(url[0].replace(/^[a-zA-Z0-9-_]*?\./,''));
        $('#wwwPrefix').show();
        $('#liveUrl').val('www');
        $('#devUrl').val('dev');
    }
    else if(/^[a-zA-Z0-9-_]*\.[a-zA-Z0-9-_\.]*/.test(url))
    {
        $('#url').val(url[0]).blur();
        $('#title').val(url[0]);
        $('#wwwPrefix').show();
        $('#liveUrl').val('www');
        $('#devUrl').val('dev');
    }
    
    $('button').button();
    $('button').click(function(){
        if($(this).find('span').text() === 'Add Site')
        {
            var newNode = {
                'title'     : $('#title').val(),
                'key'       : 'root-' + $('#title').val().replace(/ /g, '-').replace(/\./g, '-'),
                'isFolder'  : true,
                'url'       : $('#url').val(),
                'children'  : [
                    {
                        'title'     : $('#liveTitle').val(),
                        'key'       : 'root-' + $('#title').val().replace(/ /g, '-').replace(/\./g, '-') + '-' + $('#liveTitle').val().replace(/ /g, '-').replace(/\./g, '-'),
                        'isFolder'  : false,
                        'url'       : $('#liveUrl').val()
                    },
                    {
                        'title'     : $('#devTitle').val(),
                        'key'       : 'root-' + $('#title').val().replace(/ /g, '-').replace(/\./g, '-') + '-' + $('#devTitle').val().replace(/ /g, '-').replace(/\./g, '-'),
                        'isFolder'  : false,
                        'url'       : $('#devUrl').val()
                    }
                ]
            };
            sitesTree[sitesTree.length] = newNode;
            chrome.pageAction.setIcon({'tabId':tab.id,'path':'images/switch_16.png'});
            $('#newSite').html('<p>This site is now ignored</p>');
            localStorage.setItem('sitesTree', JSON.stringify(sitesTree));
            $('body').trigger('loadSitesTree');
        }
        else if($(this).find('span').text() === 'Ignore Site')
        {
            var newNode = {
                'title'     : $('#title').val(),
                'isFolder'  : false,
                'url'       : $('#url').val()
            };
            ignoredSites[ignoredSites.length] = newNode;
            chrome.pageAction.hide(tab.id);
            $('#newSite').html('<p>This&nbsp;site&nbsp;is&nbsp;now&nbsp;ignored.</p>');
            localStorage.setItem('ignoredSites', JSON.stringify(ignoredSites));
        }
    });
    
    $('body').bind('loadSitesTree',function(){
        $.each(sitesTree,function(i, o){
            if(url[0].indexOf(o.url) !== -1)
            {
                currentSite = o;
                currentSiteUrl = o.url;
                
                $.each(currentSite.children,function(i,o){
                    if(url[0].indexOf(o.url.replace('http://','')) !== -1)
                    {
                        o.activate = true;
                    }
                });
                
                $('#newSite').hide();
                
                $('#sitesTree').dynatree({
                    'children'     : currentSite.children,
                    'title'        : currentSite.title,
                    'selectMode'   : 3,
                    'debugLevel'   : 0,
                    'rootVisible'  : true,
                    'fx'           : {
                        'height'   : 'toggle',
                        'duration' : 200
                    },
                    'onActivate'   : function(dtnode) {
                        var url;
                        if(dtnode.data.url.length > 0)
                        {
                            if(/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/.test(currentSiteUrl))
                            {
                                url = 'http://' + currentSiteUrl + ':' + dtnode.data.url;
                            }
                            else
                            {
                                url = 'http://' + dtnode.data.url + '.' + currentSiteUrl;
                            }
                        }
                        else
                        {
                            url = 'http://' + currentSiteUrl;
                        }
                        
                        if( dtnode.data.target == '_blank' )
                        {
                            chrome.tabs.create({
                                'url'   : url
                            });
                        }
                        else if( dtnode.data.target == '_self' )
                        {
                            var tabId = localStorage.getItem('currentTabId')*1;
                            chrome.tabs.update(tabId,{
                                'url'   : url
                            });
                        }
                    }
                });
            }
        });
    });
    
    $('body').trigger('loadSitesTree');
});