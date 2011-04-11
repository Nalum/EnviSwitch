var sitesTree = eval(localStorage.getItem('sitesTree')); // Get Sites Tree
var ignoredSites = eval(localStorage.getItem('ignoredSites')); // Get Ignored Sites
var elementKey, name, element, elementType, updatedSiteTree, newNode, esnode, isnode, target; // Declaring global vars
var isFolder = true; // isFolder true/false <-- Default to true. Tells dynatree if the item is a folder or not.

//Set up EnviSwitch root menu callback. Can only add folders to the root node.
function enviSwitchRootMenu(action, el){
    esnode = el.context.dtnode; // Get the current Node
    isFolder = true; // This is a folder.
    switch(action) // Do something based on action
    {
        case 'add':
            $('#add #addFolder').show();
            $('#add #addSite').hide();
            $('#add').dialog('open');
        break;
    }
}

//Set up ignored sites root menu callback. Can only add documents to the root node.
function ignoredSitesRootMenu(action, el){
    isnode = el.context.dtnode; // Get the current Node
    isFolder = false; // This is a folder.
    switch(action) // Do something based on action
    {
        case 'add':
            $('#addIgnored').dialog('open');
        break;
    }
}

// Set up folder menu callback. Can add documents to folder or edit/delete folder.
function enviSwitchFolderMenu(action, el){
    esnode = el.context.dtnode; // Get the current Node
    switch(action) // Do something based on action
    {
        case 'add':
            isFolder = false; // This is not a folder.
            
            $('#add #addFolder').hide();
            $('#add #addSite').show();
            
            if(/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/.test(esnode.data.url))
            {
                $('#add #addSite #ipAddress').text(esnode.data.url + ':');
            }
            else
            {
                $('#add #addSite #siteName').text('.' + esnode.data.url);
            }
            
            $('#add').dialog('open');
            
            $('#add #addSite #addTarget label[for=add_self]').click();
        break;
        case 'edit':
            isFolder = true; // This is a folder.
            
            if(/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/.test(esnode.data.url))
            {
                $('#edit #editFolder #wwwPrefix').hide();
            }
            else
            {
                $('#edit #editFolder #wwwPrefix').show();
            }
            
            $('#edit #name').val(esnode.data.title);
            $('#edit #editFolder #url').val(esnode.data.url);
            $('#edit #editSite #url').val(esnode.data.url);
            
            $('#edit #editFolder').show();
            $('#edit #editSite').hide();
            $('#edit').dialog('open');
        break;
        case 'delete':
            esnode.removeChildren();
            esnode.remove();
            updatedSiteTree = $("#sitesTree").dynatree("getTree").toDict();
            localStorage.setItem('sitesTree', JSON.stringify(updatedSiteTree.children));
            $('#sitesTree').dynatree("getRoot").render(true);
            
            if(localStorage.getItem('sitesTree') == 'undefined')
            {
                localStorage.setItem('sitesTree','[]');
            }
        break;
    }
}

// Set up document menu callback. Can edit/delete documents.
function enviSwitchDocumentMenu(action, el){
    esnode = el.context.dtnode; // Get the current Node
    isFolder = false; // This is not a folder.
    switch(action) // Do something based on action
    {
        case 'edit':
            $('#edit #name').val(esnode.data.title);
            $('#edit #editFolder #url').val(esnode.data.url);
            $('#edit #editSite #url').val(esnode.data.url);
            
            if(/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/.test(esnode.parent.data.url))
            {
                $('#edit #editSite #ipAddress').text(esnode.parent.data.url + ':');
            }
            else
            {
                $('#edit #editSite #siteName').text('.' + esnode.parent.data.url);
            }

            if(esnode.data.target == '_blank')
            {
                $('#edit #editSite #editTarget [for=edit_blank]').click();
            }
            else
            {
                $('#edit #editSite #editTarget [for=edit_self]').click();
            }
            
            $('#edit #editFolder').hide();
            $('#edit #editSite').show();
            $('#edit').dialog('open');
        break;
        case 'delete':
            esnode.remove();
            updatedSiteTree = $("#sitesTree").dynatree("getTree").toDict();
            localStorage.setItem('sitesTree', JSON.stringify(updatedSiteTree.children));
            $('#sitesTree').dynatree("getRoot").render(true);
            
            if(localStorage.getItem('sitesTree') == 'undefined')
            {
                localStorage.setItem('sitesTree','[]');
            }
        break;
    }
}

//Set up document menu callback. Can edit/delete documents.
function ignoredSitesDocumentMenu(action, el){
    isnode = el.context.dtnode; // Get the current Node
    isFolder = false; // This is not a folder.
    switch(action) // Do something based on action
    {
         case 'edit':
             $('#editIgnored #name').val(isnode.data.title);
             $('#editIgnored').dialog('open');
         break;
         case 'delete':
             isnode.remove();
             updatedSiteTree = $("#ignoredSites").dynatree("getTree").toDict();
             localStorage.setItem('ignoredSites', JSON.stringify(updatedSiteTree.children));
             
             if(localStorage.getItem('ignoredSites') == 'undefined')
             {
                 localStorage.setItem('ignoredSites','[]');
             }
             
             $('#ignoredSites').dynatree("getRoot").render(true);
         break;
    }
}

// Wait for document to load before we start running the system.
$(document).ready(function(){
    $('#tabs').tabs(); // Set up tabs.
    $('#addSite #addTarget, #editSite #editTarget').buttonset(); // Set up buttons for url target.
    
    // Set up Add Dialog
    $('#add').dialog({
        'autoOpen'  : false,
        'modal'     : true,
        'buttons'   : {
            'Add Item' : function(){
                name    = $('#add #name').val();
                url     = isFolder ? $('#add #addFolder #url').val() : $('#add #addSite #url').val();
                target  = $('#add #addSite #addTarget #add_blank').is(':checked') ? '_blank' : '_self';
                newNode = {
                    'title'     : name,
                    'key'       : esnode.data.key + '-' + name.replace(/ /g,'-').replace(/\./g,'-'),
                    'isFolder'  : isFolder,
                    'url'       : url,
                    'target'    : target
                };
                
                esnode.addChild(newNode);
                
                var updatedSiteTree = $("#sitesTree").dynatree("getTree").toDict();
                localStorage.setItem('sitesTree', JSON.stringify(updatedSiteTree.children));
                
                if(isFolder)
                {
                    $("#sitesTree span#ui-dynatree-enviswitch-sites-root-" + newNode.title.replace(/ /g,'-')).contextMenu({'menu' : 'enviSwitchFolderMenu'},enviSwitchFolderMenu);
                }
                else
                {
                    $("#sitesTree span#ui-dynatree-enviswitch-sites-" + newNode.key).contextMenu({'menu' : 'enviSwitchDocumentMenu'},enviSwitchDocumentMenu);
                }
                
                $('#add').dialog('close');
                $('#add #name').val('');
                $('#add #addFolder #url').val('');
                $('#add #addSite #url').val('');
                $('#add #addSite #addTarget #add_blank').attr('checked');
                $('#add #addSite #addTarget #add_self').attr('checked','checked');
                $('#add #addSite #ipAddress, #add #addSite #siteName').text('');
            },
            'Cancel' : function(){
                $('#add').dialog('close');
                $('#add #name').val('');
                $('#add #addFolder #url').val('');
                $('#add #addSite #url').val('');
                $('#add #addSite #ipAddress, #add #addSite #siteName').text('');
            }
        }
    });
    
    $('#addIgnored').dialog({
        'autoOpen'  : false,
        'modal'     : true,
        'buttons'   : {
            'Add Item' : function(){
                name    = $('#addIgnored #name').val();
                newNode = {
                    'title'     : name,
                    'key'       : isnode.data.key + '-' + name.replace(/ /g,'-').replace(/\./g,'-'),
                    'isFolder'  : isFolder,
                    'url'       : name
                };
                
                isnode.addChild(newNode);
                console.log(newNode.key);
                
                var updatedSiteTree = $("#ignoredSites").dynatree("getTree").toDict();
                localStorage.setItem('ignoredSites', JSON.stringify(updatedSiteTree.children));
                
                $("#ignoredSites span#ui-dynatree-ignored-sites-" + newNode.key).contextMenu({'menu' : 'ignoredSitesDocumentMenu'},ignoredSitesDocumentMenu);
                
                $('#addIgnored').dialog('close');
                $('#addIgnored #name').val('');
            },
            'Cancel' : function(){
                $('#addIgnored').dialog('close');
                $('#addIgnored #name').val('');
            }
        }
    });
    
    // Set up Edit dialog
    $("#edit").dialog({
        'autoOpen'  : false,
        'modal'     : true,
        'buttons'   : {
            'Update Item' : function(){
                esnode.data.title     = $('#edit #name').val();
                esnode.data.url       = isFolder ? $('#edit #editFolder #url').val() : $('#edit #editSite #url').val();
                esnode.data.target    = $('#edit #editSite #editTarget #edit_blank').is(':checked') ? '_blank' : '_self';

                var updatedSiteTree = $("#sitesTree").dynatree("getTree").toDict();
                localStorage.setItem('sitesTree', JSON.stringify(updatedSiteTree.children));
                
                $('#sitesTree').dynatree("getRoot").render(true);

                $('#edit').dialog('close');
                $('#edit #name').val('');
                $('#edit #editFolder #url').val('');
                $('#edit #editSite #url').val('');
                $('#edit #editSite #editTarget #edit_blank').attr('checked');
                $('#edit #editSite #editTarget #edit_self').attr('checked','checked');
                $('#edit #editSite #ipAddress, #edit #editSite #siteName').text('');
            },
            'Cancel' : function(){
                $('#edit').dialog('close');
                $('#edit #name').val('');
                $('#edit #editFolder #url').val('');
                $('#edit #editSite #url').val('');
                $('#edit #editSite #ipAddress, #edit #editSite #siteName').text('');
            }
        }
    });
    
    // Set up Edit dialog
    $("#editIgnored").dialog({
        'autoOpen'  : false,
        'modal'     : true,
        'buttons'   : {
            'Update Item' : function(){
                isnode.data.title     = $('#editIgnored #name').val();
                isnode.data.url       = $('#editIgnored #name').val();

                var updatedSiteTree = $("#ignoredSites").dynatree("getTree").toDict();
                localStorage.setItem('ignoredSites', JSON.stringify(updatedSiteTree.children));
                
                $('#ignoredSites').dynatree("getRoot").render(true);

                $('#editIgnored').dialog('close');
                $('#editIgnored #name').val('');
            },
            'Cancel' : function(){
                $('#editIgnored').dialog('close');
                $('#editIgnored #name').val('');
            }
        }
    });
    
    // Set up dynatree root node with Sites Tree
    $('#sitesTree').dynatree({
        'children'         : sitesTree,
        'clickFolderMode'  : 2,
        'title'            : 'EnviSwitch Root',
        'rootVisible'      : true,
        'fx'               : {
            'height'   : 'toggle',
            'duration' : 200
        },
        'onActivate'       : function(dtnode) {
            var url;
            if( dtnode.data.url.length > 0 )
            {
                if(/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/.test(dtnode.parent.data.url))
                {
                    url = 'http://' + dtnode.parent.data.url + ':' + dtnode.data.url;
                }
                else
                {
                    url = 'http://' + dtnode.data.url + '.' + dtnode.parent.data.url;
                }
            }
            else
            {
                url = 'http://' + dtnode.parent.data.url;
            }
            
            chrome.tabs.create({
                'url'       : url,
                'selected'  : false
            });
        },
        'debugLevel'        : 0,
        'cookieId'          : "ui-dynatree-enviswitch-sites-",
        'idPrefix'          : "ui-dynatree-enviswitch-sites-"
    });
    
    $('#ignoredSites').dynatree({
        'children'          : ignoredSites,
        'clickFolderMode'   : 2,
        'minExpandLevel'    : 0,
        'title'             : 'Ignored Sites Root',
        'rootVisible'       : true,
        'fx'                : {
            'height'    : 'toggle',
            'duration'  : 200
        },
        'debugLevel'        : 0,
        'cookieId'          : "ui-dynatree-ignored-sites-",
        'idPrefix'          : "ui-dynatree-ignored-sites-"
    });
    
    $("#sitesTree span#ui-dynatree-enviswitch-sites-root").contextMenu({'menu' : 'enviSwitchRootMenu'},enviSwitchRootMenu); // Set up enviswitch root menu.
    $("#ignoredSites span#ui-dynatree-ignored-sites-root").contextMenu({'menu' : 'ignoredSitesRootMenu'},ignoredSitesRootMenu); // Set up ignored sites root menu.
    $("#sitesTree span.ui-dynatree-folder:not(#ui-dynatree-enviswitch-sites-root)").contextMenu({'menu' : 'enviSwitchFolderMenu'},enviSwitchFolderMenu); // Set up enviswitch folder menu.
    $("#sitesTree span.ui-dynatree-document").contextMenu({'menu' : 'enviSwitchDocumentMenu'},enviSwitchDocumentMenu); // Set up enviswitch document menu.
    $("#ignoredSites span.ui-dynatree-document").contextMenu({'menu' : 'ignoredSitesDocumentMenu'},ignoredSitesDocumentMenu); // Set up ignored sites document menu.
    
    // Disable/Enable menu choices for root/folder/documents.
    setTimeout(function(){
        $('#enviSwitchRootMenu').disableContextMenuItems();
        $('#enviSwitchRootMenu').enableContextMenuItems('#add');
        $('#ignoredSitesRootMenu').disableContextMenuItems();
        $('#ignoredSitesRootMenu').enableContextMenuItems('#add');
        $('#enviSwitchDocumentMenu').disableContextMenuItems('#add');
        $('#ignoredSitesDocumentMenu').disableContextMenuItems('#add');
    }, 500);

    $.getJSON('manifest.json',function(data){
        $('#EnviSwitchVersion').text('v' + data.version);
    });
    
    $('#add #addFolder #url, #edit #editFolder #url').blur(function(){
        if(/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/.test($(this).val()))
        {
            $('#add #addFolder #wwwPrefix, #edit #editFolder #wwwPrefix').hide();
        }
        else
        {
            $('#add #addFolder #wwwPrefix, #edit #editFolder #wwwPrefix').show();
        }
    });
});