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
 *  Contains all library related functions for loading and controlling the
 *  library page.
 *
 *  @class KUMobile.Library
 ******************************************************************************/
KUMobile.Library = {
	
    
    /******************************************************************************
     *  Current page number as referenced from the library website.
     *
     *  @attribute page
     *  @type {int}
     *  @for KUMobile.Library
     *  @default 0
     ******************************************************************************/
     page: 0,
	
    
    /******************************************************************************
     *  Is the library page loading?
     *
     *  @attribute loading
     *  @type {boolean}
     *  @for KUMobile.Library
     *  @default false
     ******************************************************************************/
	loading: false,
    
    
    /******************************************************************************
     *  Designates the minimum number of pixels that the user can scroll
	 *  (calculated from the bottom) before another load event is triggered.
     *
     *  @attribute LOAD_THRESHOLD_PX
     *  @type {int}
     *  @for KUMobile.Library
     *  @default 660
     ******************************************************************************/	
	LOAD_THRESHOLD_PX: 660,
    
    
    /******************************************************************************
     *  Type of searching for Kettering's library. Represents the method of 
     *  searching that will be used by the system. 
     *
     *  @attribute type
     *  @type {string}
     *  @for KUMobile.Library
     *  @default "GENERAL^SUBJECT^GENERAL^^words or phrase"
     ******************************************************************************/
	type: "GENERAL^SUBJECT^GENERAL^^words or phrase",
	
	
    /******************************************************************************
     *  Represents the last value the user has searched for in the library
     *
     *  @attribute lastValue
     *  @type {string}
     *  @for KUMobile.Library
     *  @default ""
     ******************************************************************************/
	lastValue: "",
	
	
	/******************************************************************************
     *  Tells whether or not the user has reached the end of the scrolling.
     *
     *  @attribute reachedEnd
     *  @type {boolean}
     *  @for KUMobile.Library
     *  @default false
     ******************************************************************************/
	reachedEnd: false,
	
	
	/******************************************************************************
     *  Is the user currently typing?
     *
     *  @attribute typing
     *  @type {boolean}
     *  @for KUMobile.Library
     *  @default false
     ******************************************************************************/    
	typing: false,

    
    /******************************************************************************
     *  Contains the current list of article DOM <li> tag items that still need
	 *  to be added to the DOM (much faster to add all at once after load
	 *  is done downloading). This helps prevent the application from seeming to 
	 *  hang or become unresponsive.
     *
     *  @attribute listQueue
     *  @type {Array}
     *  @for KUMobile.Library
     *  @private 
     ******************************************************************************/
	listQueue: [],
	

	/******************************************************************************
     *  Contains the last timeout call sent. This allows us to restart the timeout if
	 *  the user re-searches in any way (dropdown, or searchbar). The major benefit
	 *  of this is that it gives us the feeling of incremental searching, e.g we send
	 *  a timeout of some milliseconds whenever the KEY_UP event triggers, as well
	 *  as cancelling out the last timeout we sent. 
     *
     *  @attribute sentTimeout
     *  @type {Object}
     *  @for KUMobile.Library
     *  @private
     ******************************************************************************/
	sentTimeout: null,
	
	
	/******************************************************************************
     *  Triggered when the library page is first initialized based on jQuery Mobile
     *  pageinit event. This is called after the page itself is created and 
     *  initialized, therefore it is proper to do the event bindings here.
	 *
     *  @event pageInit
     *  @for KUMobile.Library
     ******************************************************************************/
	pageInit: function(event){
		
		// Bug in JQM? Clear button flashes when loading page?
		// This line will fix it.
		$("#library .ui-input-clear").addClass("ui-input-clear-hidden");
		
        // Check overflow scroll position
        $('#library-scroller').on("scroll", KUMobile.Library.scroll);

	},
	
	
    /******************************************************************************
     *  Triggered when the library page is first created based on jQuery Mobile
     *  pagecreate event. This is called after the page itself is created but 
     *  before any jQuery Mobile styling is applied.
	 *
     *  @event pageCreate
     *  @for KUMobile.Library
     ******************************************************************************/
	pageCreate: function(event){
	
		// Resize and get first page for overflow
		$(window).trigger("resize");
		
        
        // Get search options
        var options = KU.Library.getSearchOptions();
        
        // Cycle through all options
        for (var i in options){
            
            var option = options[i];
            
            // Add each section optio to the select menu
            $("<option></option>",{
                "value": option.valueId,
                "text": option.name
            }).appendTo("#library-select");
            
        }
        
        
        // Fix select menu!
        $("#library-select").selectmenu("refresh", true);
        
        // Trigger for change in TID select
        $("#library-select").bind("change", KUMobile.Library.categoryChange);
        
        // Trigger for direct change in search box
        $("#library-search").bind("change", KUMobile.Library.directSearch);
        
        // Trigger for incremental change in search box
        $("#library-search").keyup( KUMobile.Library.incrementalSearch);
        
        // Get page when page is first created
        KUMobile.Library.loadNextPage(); 
        
	},
	
	
    /******************************************************************************
     *  Triggered when the user does a key up event in order to simulate incremental
	 *  searching for the attached search bar. 
	 *
     *  @event incrementalSearch
     *  @for KUMobile.Library
     ******************************************************************************/
	incrementalSearch: function() {
			
		// Definitely a change?
		if(this.value != KUMobile.Library.lastValue){
		
			// Store value
			KUMobile.Library.lastValue = this.value;
		
			// Clear timeout
			if(KUMobile.Library.sentTimeout) clearTimeout(KUMobile.Library.sentTimeout);
			KUMobile.Library.typing = true;
			
			KUMobile.Library.sentTimeout = setTimeout(function(latestValue){
				
				// Definitely not a change?
				if(latestValue == KUMobile.Library.lastValue){
					
					// Abort ajax
					KU.Library.abort();
					
					// Save new value, reinit, download
					KUMobile.Library.lastValue = latestValue;
					KUMobile.Library.reinitialize();
					KUMobile.Library.loadNextPage();
				}
				
				KUMobile.Library.typing = false;
				
			}, KUMobile.Config.DEFAULT_INCR_WAIT_TIME, this.value);
		}
	},
	
	
    /******************************************************************************
     *  Triggered when the user does a direct change. The direct change includes 
	 *  typing then changing focus or pressing the clear button. This is redundant
	 *  to the incremental search event, *except for the clear button!!*
	 *
     *  @event directSearch
     *  @for KUMobile.Library
     ******************************************************************************/	
	directSearch: function(e,u){
			
		// Definitely a change?
		if(this.value != KUMobile.Library.lastValue){
		
			// Clear timeout and ajax
			if(KUMobile.Library.sentTimeout) clearTimeout(KUMobile.Library.sentTimeout);
			KU.Library.abort();
			
			// Change last value and reinitialize
			KUMobile.Library.lastValue = this.value;
			KUMobile.Library.reinitialize();
			
			// Download results
			KUMobile.Library.loadNextPage();
		}
	},
	
	
    /******************************************************************************
     *  Triggered when the user does a change to the category drop down box.
	 *  When this happens, we generally need to redo the search.  
	 *
     *  @event categoryChange
     *  @for KUMobile.Library
     ******************************************************************************/    
	categoryChange: function(e,u){
		
		// Definitely a change?
		if(this.value != KUMobile.Library.type){		
	
			// Clear timeout and ajax
			if(KUMobile.Library.sentTimeout) clearTimeout(KUMobile.Library.sentTimeout);
			KU.Library.abort();
			
			// Change TID then reinitialize
			KUMobile.Library.type = this.value;
			KUMobile.Library.reinitialize();
			
			// Download results
			KUMobile.Library.loadNextPage();
		}
	},
	
	
    /******************************************************************************
     *  Triggered when regular scroll event happens in library scroller window. It 
     *  is used to check if the user is *near* the bottom of the page, so more
     *  content can be loaded (simulate *infinite scrolling*).
	 *
     *  @event scroll
     *  @for KUMobile.Library
     ******************************************************************************/
	scroll: function(event){
				
        // Get scroll position
		var scrollPosition = $('#library-scroller').scrollTop() 
							 + $('#library-scroller').outerHeight();

		// Break threshold?
		if($('#library-list').height() < (KUMobile.Library.LOAD_THRESHOLD_PX 
			+ $('#library-scroller').scrollTop() + $('#library-scroller').outerHeight())
			&& $('#library').is(':visible') && !(KUMobile.Library.typing) 
			&& !(KUMobile.Library.loading) && !(KUMobile.Library.reachedEnd)){
			
			// Get the next page!
			KUMobile.Library.loadNextPage();
		}
	},
	
	
    /******************************************************************************
     *  Loads and displays the next set of library items.
	 *
     *  @method loadNextPage
     *  @for KUMobile.Library
     *  @example
     *      KUMobile.Library.loadNextPage();
     ******************************************************************************/
	loadNextPage: function (){
		
		if(!this.loading){
			
			// Now loading
			this.loading = true;
            KUMobile.showLoading("library-header");
            
            
            // Clear list if we are on page 0!
            if(this.page == 0) $("#library-list li").remove();
			
            /* Success */
			var success = function(items){
                
                // Increment page
                KUMobile.Library.page++;
                
                // Check for end
                KUMobile.Library.reachedEnd = (items.length < 20);
                
                // Setup data
                for(var index = 0; index < items.length; index++){
                 
                    // Current item and template
                    var item = items[index];
                    var bookTpl = Handlebars.getTemplate("library-item");
                    
                    // Book data
                    var book = bookTpl({
                        "title": item.title,
                        "imgUrl": (item.imgUrl=="")?("img/default_library_icon.jpg"):(item.imgUrl),
                        "author": item.author,
                        "callNumber": item.callNumber,
                        "holdings": item.holdings,
                    });                    
                    
                    // Add list item to queue
                    KUMobile.Library.listQueue[KUMobile.Library.listQueue.length] = book;
                    
                }
                
                    
                // Not loading
                KUMobile.hideLoading("library-header");
                KUMobile.Library.loading = false;
                    
                // Go through all list items
                for (var index = 0; index < KUMobile.Library.listQueue.length; index++){
                    
                    // Append to library list
                    var bookDom = $(KUMobile.Library.listQueue[index]);
                    
                    // Manual check for image error!
                    $("img", bookDom).load(function(){
                
                        // Use default!
                        if(this.height == 1) this.src = "img/default_library_icon.jpg";

                        // Apply class styles
                        $(this).addClass("library-icon");
                    });
                    
                    
                    // Regular image error?
                    $("img", bookDom).error(function() {
                        
                        // Use default!
                        this.src = "img/default_library_icon.jpg";
                        
                        // Apply class styles
                        $(this).addClass("library-icon");
                    });
                    
                    bookDom.appendTo("#library-list");
                }

                // Refresh and clear both lists
                $('#library-list').listview('refresh');
                KUMobile.Library.listQueue = [];
                
            };
            
            /* Fail */
            var failure = function(error){
                
                // Not loading anymore presumably..
                KUMobile.hideLoading("library-header");
                KUMobile.Library.loading = false;
                
                alert("Sorry the library could not be loaded :(. Check your" +
                " internet connection. If the issue persists then please"+
                " create a bug at github.com/garrickbrazil/kumobile/issues/new");
            };
            
            // New search !?
            if(this.page == 0) KU.Library.search(this.lastValue, this.type, success, failure);
            
            // Get next page !?
            else KU.Library.nextPage(success, failure);
            
        }
    },
	
	
    /******************************************************************************
     *  Reinitializes all properties of KUMobile.Library as if to restore
	 *  a new/default instance.
	 *
     *  @method reinitialize
     *  @for KUMobile.Library
     *  @example
     *      KUMobile.Library.reinitialize();
     ******************************************************************************/	
	reinitialize: function(){
		
        // Reset properties!
		this.listQueue = [];
		this.page = 0;
		this.loading = false;
		this.reachedEnd = false;

	}
		
	
};