/*
 	This file is part of KUMobile.

	KUMobile is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    KUMobile is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with KUMobile.  If not, see <http://www.gnu.org/licenses/>.
*/


/******************************************************************************
 *  Contains all announcements related functions for loading and controlling the
 *  announcements page.
 *
 *  @class KUMobile.Announcements
 ******************************************************************************/
KUMobile.Announcements = {
 
 
    /******************************************************************************
     *  Current page number as referenced from the announcements website.
     *
     *  @attribute page
     *  @type {int}
     *  @for KUMobile.Announcements
     *  @default 0
     ******************************************************************************/
    page: 0,
 
    
    /******************************************************************************
     *  Number of pages to load from the website after a trigger event occurs.
     *
     *  @attribute PAGES_TO_LOAD
     *  @type {int}
     *  @for KUMobile.Announcements
     *  @default 2
     ******************************************************************************/
    PAGES_TO_LOAD: 2,
	
	
    /******************************************************************************
     *  Is the announcements page loading?
     *
     *  @attribute loading
     *  @type {boolean}
     *  @for KUMobile.Announcements
     *  @default false
     ******************************************************************************/
	loading: false,
	
	
    /******************************************************************************
     *  Designates the minimum number of pixels that the user can scroll
	 *  (calculated from the bottom) before another load event is triggered.
     *
     *  @attribute LOAD_THRESHOLD_PX
     *  @type {int}
     *  @for KUMobile.Announcements
     *  @default 660
     ******************************************************************************/	
	LOAD_THRESHOLD_PX: 660,

	
    /******************************************************************************
     *  How many pages that need to be downloaded still. This is used to asynchronously
     *  download pages.
     *
     *  @attribute queue
     *  @type {int}
     *  @for KUMobile.Announcements
     *  @default 0
     *  @private 
     ******************************************************************************/
	queue: 0,
	
    
    /******************************************************************************
     *  Contains the current list of article DOM <li> tag items that still need
	 *  to be added to the DOM (much faster to add all at once after load
	 *  is done downloading). This helps prevent the application from seeming to 
	 *  hang or become unresponsive.
     *
     *  @attribute listQueue
     *  @type {Array}
     *  @for KUMobile.Announcements
     *  @private 
     ******************************************************************************/
	listQueue: [],    


    /******************************************************************************
     *  Triggered when the announcements page is first initialized based on jQuery 
     *  Mobile pageinit event.
	 *
     *  @event pageInit
     *  @for KUMobile.Announcements
     ******************************************************************************/	
	pageInit: function(event){
        
        KUMobile.Announcements.initialized = true;
        
        // Check overflow scroll position
        $('#announcements-scroller').on("scroll", KUMobile.Announcements.scroll);

	},	
	
	
    /******************************************************************************
     *  Triggered when the announcements page is first created based on jQuery Mobile
     *  pagecreate event. This is called after the page itself is created but 
     *  before any jQuery Mobile styling is applied.
	 *
     *  @event pageCreate
     *  @for KUMobile.Announcements
     ******************************************************************************/
	pageCreate: function(event){
		
		// Resize and get first page
		$(window).trigger("throttledresize");
		KUMobile.Announcements.loadNextPage(); 
		
	},
	
	
	/******************************************************************************
     *  Triggered when regular scroll event happens in announcements scroller window. 
     *  It is used to check if the user is *near* the bottom of the page, so more
     *  content can be loaded (simulate *infinite scrolling*).
	 *
     *  @event scroll
     *  @for KUMobile.Announcements
     ******************************************************************************/	
	scroll: function(event){
		
        // Get scroll position
		var scrollPosition = $('#announcements-scroller').scrollTop() + $('#announcements-scroller').outerHeight();

		// Break threshold?
		if($('#announcements-list').height() < (KUMobile.Announcements.LOAD_THRESHOLD_PX + $('#announcements-scroller').scrollTop() + 
			$('#announcements-scroller').outerHeight()) && $('#announcements').is(':visible') && !(KUMobile.Announcements.loading)){
			
			// Get the next page!
			KUMobile.Announcements.loadNextPage();
		}
	},
	
    
    /******************************************************************************
     *  Loads and displays the next set of items.
	 *
     *  @method loadNextPage
     *  @for KUMobile.Announcements
     *  @example
     *      KUMobile.Announcements.loadNextPage();
     ******************************************************************************/
	loadNextPage: function (){
        
		if(!this.loading){
			
			// Now loading
			this.loading = true;
			
			// Empty queue?
			if(this.queue <= 0){ 
			
				// Initialize the queue
				// start with default pages
				// show loading indicator!
				this.queue = KUMobile.Announcements.PAGES_TO_LOAD;
				KUMobile.showLoading("announcements-header");
                
			}
			
            /** Success **/
			var success = function(items){
                
                // Increment page
                KUMobile.Announcements.page++;
                
                // Setup data
                for(var index = 0; index < items.length; index++){
                 
                    // Current item and template
                    var item = items[index];
                    var captionTpl = Handlebars.getTemplate("announcements-item");
                    var pageId = 'announcements-' + KUMobile.Announcements.page + '-' + index;
                    
                    // Fix up main html
                    var main = KUMobile.sanitize($("<div></div>").html(item.mainHtml));
                    main.find("hr").remove();
                    main.find("img").remove();
                    
                    var found = false;
                    
                    main.children().each(function(i){
                        
                        if (!found) found = $(this).attr("title") == "READ MORE";
                        if (found) $(this).remove();
                        
                    });
                    
                    // Caption data
                    var captionHtml = captionTpl({
                        "title": item.title,
                        "mainHtml": main.html()
                    });
                    
                    // Add list item to queue
                    KUMobile.Announcements.listQueue[KUMobile.Announcements.listQueue.length] = captionHtml;
                    
                }
                
                // Flush?
                if(--KUMobile.Announcements.queue <= 0){
                    
                    // Not loading
                    KUMobile.hideLoading("announcements-header");
                    KUMobile.Announcements.loading = false;
                    
                    // Go through all list items
                    for (var index = 0; index < KUMobile.Announcements.listQueue.length; index++){
                        
                        // Append to announcements list
                        $(KUMobile.Announcements.listQueue[index]).appendTo("#announcements-list");
                    }
                    
                    // Setup link opener
                    KUMobile.safeBinder("click", "#announcements-list li a", function(e){
                        
                        // Android open? Otherwise use _system target
                        if (KUMobile.Config.isAndroid) navigator.app.loadUrl($(this).attr('href'), {openExternal : true});
                        else window.open($(this).attr('href'), '_system');
                        
                        // Prevent default
                        e.preventDefault();
                        return false;
                        
                    });
                 
                    // Check for new articles only during initialization
                    if(KUMobile.Announcements.initialized != true){
                        
                        // Get read
                        var announcements_list = window.localStorage.getItem("ku_announcements_read");
                        
                        // Make empty or parse array
                        if(announcements_list != null){
                        
                            try{
                                
                                // Parse announcements array
                                announcements_list = JSON.parse(announcements_list);
                                
                            }
                            catch(object){
                                announcements_list = [];
                                
                            }
                        
                            // Go through each list item
                            $("#announcements-list li div").each(function(i){
                                
                                // Get id
                                var id = $("h1", this).text().trim();
                                var found = false;
                                
                                // Search for match
                                for (var readIndex = 0; readIndex < announcements_list.length; readIndex++){
                                    if (id == announcements_list[readIndex]) found = true;
                                }
                                
                                // Not found?
                                if (!found){
                                    
                                    KUMobile.addNewIndicator("#announcements-listitem a div.main-text");
                                    $("#home ul").listview("refresh");
                                    KUMobile.addNewIndicator(this);
                                }
                                
                            });
                            
                        }
                        
                    }
                 
                    // Refresh and clear lists
                    if(KUMobile.Announcements.initialized) $('#announcements-list').listview('refresh');
                    KUMobile.Announcements.listQueue = [];
                    
                }
                
                // More to be downloaded!
                else {
                    
                    // Load more
                    KUMobile.Announcements.loading = false;
                    KUMobile.Announcements.loadNextPage();
                }
                
            };
            
            /** Fail **/
            var failure = function(error){
                
                // Not loading anymore presumably..
                KUMobile.hideLoading("announcements-header");
                KUMobile.Announcements.loading = false;
                
                KUMobile.safeAlert("Error", "Sorry the announcements could not be loaded. Check your" +
                " internet connection. If the issue persists then please report the bug.", "ok");
            };
            
            // Get next page
            KU.Announcements.nextPage(success, failure);
        }
    }
	
};
