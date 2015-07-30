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
 *  Contains all directory related functions for loading and controlling the
 *  directory page. This only takes faculty directory into consideration.
 *
 *  @class KUMobile.Directory
 ******************************************************************************/
KUMobile.Directory = {
	
    
    /******************************************************************************
     *  Current page number as referenced from the directory website.
     *
     *  @attribute page
     *  @type {int}
     *  @for KUMobile.Directory
     *  @default 0
     ******************************************************************************/
     page: 0,
	
    
    /******************************************************************************
     *  Number of pages to load from the directory website after a trigger event occurs.
     *
     *  @attribute PAGES_TO_LOAD
     *  @type {int}
     *  @for KUMobile.Directory
     *  @default 2
     ******************************************************************************/
    PAGES_TO_LOAD: 2,
	
    
    /******************************************************************************
     *  Is the directory page loading?
     *
     *  @attribute loading
     *  @type {boolean}
     *  @for KUMobile.Directory
     *  @default false
     ******************************************************************************/
	loading: false,
    
    
    /******************************************************************************
     *  Designates the minimum number of pixels that the user can scroll
	 *  (calculated from the bottom) before another load event is triggered.
     *
     *  @attribute LOAD_THRESHOLD_PX
     *  @type {int}
     *  @for KUMobile.Directory
     *  @default 660
     ******************************************************************************/	
	LOAD_THRESHOLD_PX: 660,
    
    
    /******************************************************************************
     *  The latest topic identifier for Kettering's directory searching. This 
	 *  represents the department the user has selected to filter by.
     *
     *  @attribute tid
     *  @type {string}
     *  @for KUMobile.Directory
     *  @default "All"
     ******************************************************************************/
	tid: "All",
	
	
    /******************************************************************************
     *  Represents the last value the user has searched for in the directory
     *
     *  @attribute lastValue
     *  @type {string}
     *  @for KUMobile.Directory
     *  @default ""
     ******************************************************************************/
	lastValue: "",
	
	
	/******************************************************************************
     *  Tells whether or not the user has reached the end of the scrolling.
     *
     *  @attribute reachedEnd
     *  @type {boolean}
     *  @for KUMobile.Directory
     *  @default false
     ******************************************************************************/
	reachedEnd: false,
	
	
	/******************************************************************************
     *  Is the user currently typing?
     *
     *  @attribute typing
     *  @type {boolean}
     *  @for KUMobile.Directory
     *  @default false
     ******************************************************************************/    
	typing: false,

	
    /******************************************************************************
     *  How many pages that need to be downloaded still. This is used to asynchronously
     *  download pages.
     *
     *  @attribute queue
     *  @type {int}
     *  @for KUMobile.Directory
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
     *  @for KUMobile.Directory
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
     *  @for KUMobile.Directory
     *  @private
     ******************************************************************************/
	sentTimeout: null,
	
	
    /******************************************************************************
     *  Deobfuscation method to properly interpret directory information
     *
     *  @method deobfuscate
	 *  @param {string} message - whacky string to deobfuscate
     *  @for KUMobile.Directory
     *  @return {string}
     *  @example
     *      var secret = KUMobile.Directory.deobfuscate("insert-crazy-message-here");
     ******************************************************************************/
	 deobfuscate: function(message) {

        // Alphabet
		var aZ = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
		var nM = "NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm0123456789"
		
        
		var map = [];
		var converted = "";

        // Create map
		for (var index = 0; index <= aZ.length; index++) {map[aZ.substr(index, 1)] = nM.substr(index, 1)}

        // Caesar
		for (var index = 0; index <= message.length; index++) {
			
			var c = message.charAt(index);
			converted  += (c in map ? map[c] : c);
		}

		return converted;
	},
    
	
	/******************************************************************************
     *  Triggered when the directory page is first initialized based on jQuery Mobile
     *  pageinit event. 
     *
     *  @event pageInit
     *  @for KUMobile.Directory
     ******************************************************************************/
	pageInit: function(event){
		
		// Bug in JQM? Clear button flashes when loading page?
		// This line will fix it.
		$("#directory .ui-input-clear").addClass("ui-input-clear-hidden");
		
        // Check overflow scroll position
        $('#directory-scroller').on("scroll", KUMobile.Directory.scroll);

	},
	
	
    /******************************************************************************
     *  Triggered when the directory page is first created based on jQuery Mobile
     *  pagecreate event. This is called after the page itself is created but 
     *  before any jQuery Mobile styling is applied.
	 *
     *  @event pageCreate
     *  @for KUMobile.Directory
     ******************************************************************************/
	pageCreate: function(event){
	
		// Resize and get first page for overflow
		$(window).trigger("resize");
		
        
        /* Success for department download*/
        var success = function(tids){
        
            // Disable the selection
            $("#directory-select").removeAttr("disabled");
            $("#directory-search").removeAttr("disabled");            
        
        
            // Go through all departments
            for(var i in tids){
                
                // Current department
                var tid = tids[i];
                
                // Don't add the first, this is preconfigured!
                if(i != 0){
                    $("<option></option>",{
                        "value": tid.valueId,
                        "text": tid.name
                    }).appendTo("#directory-select");
                }
                
            }
        
            $("#directory-select").selectmenu("refresh", true);
                    
            // Trigger for change in TID select
            $("#directory-select").bind("change", KUMobile.Directory.tidChange);
            
            // Trigger for direct change in search box
            $("#directory-search").bind("change", KUMobile.Directory.directSearch);
            
            // Trigger for incremental change in search box
            $("#directory-search").keyup( KUMobile.Directory.incrementalSearch);
            
            // Get page when page is first created
            KUMobile.Directory.loadNextPage(); 
        };

        /* Fail */
        var failure = function(error){
            
            // Not loading anymore presumably..
            KUMobile.hideLoading("directory-header");
            KUMobile.Directory.loading = false;
            
            KUMobile.safeAlert("Error", "Sorry the directory departments could not be loaded. Check your" +
                " internet connection. If the issue persists then please report the bug.", "ok");
                
        };
        
        // Disable the selection
        $("#directory-select").attr("disabled","disabled");
        $("#directory-search").attr("disabled","disabled");
        
        // Show that we are loading!
        KUMobile.showLoading("directory-header");

        // Get the departments!
        KU.Directory.getDepartments(success, failure);
	},
	
	
    /******************************************************************************
     *  Triggered when the user does a key up event in order to simulate incremental
	 *  searching for the attached search bar. 
	 *
     *  @event incrementalSearch
     *  @for KUMobile.Directory
     ******************************************************************************/
	incrementalSearch: function() {
			
		// Definitely a change?
		if(this.value != KUMobile.Directory.lastValue){
		
			// Store value
			KUMobile.Directory.lastValue = this.value;
		
			// Clear timeout
			if(KUMobile.Directory.sentTimeout) clearTimeout(KUMobile.Directory.sentTimeout);
			KUMobile.Directory.typing = true;
			
			KUMobile.Directory.sentTimeout = setTimeout(function(latestValue){
				
				// Definitely not a change?
				if(latestValue == KUMobile.Directory.lastValue){
					
					// Abort ajax
					KU.Directory.abort();
					
					// Save new value, reinit, download
					KUMobile.Directory.lastValue = latestValue;
					KUMobile.Directory.reinitialize();
					KUMobile.Directory.loadNextPage();
				}
				
				KUMobile.Directory.typing = false;
				
			}, KUMobile.Config.DEFAULT_INCR_WAIT_TIME, this.value);
		}
	},
	
	
    /******************************************************************************
     *  Triggered when the user does a direct change. The direct change includes 
	 *  typing then changing focus or pressing the clear button. This is redundant
	 *  to the incremental search event, *except for the clear button!!*
	 *
     *  @event directSearch
     *  @for KUMobile.Directory
     ******************************************************************************/	
	directSearch: function(e,u){
			
		// Definitely a change?
		if(this.value != KUMobile.Directory.lastValue){
		
			// Clear timeout and ajax
			if(KUMobile.Directory.sentTimeout) clearTimeout(KUMobile.Directory.sentTimeout);
			KU.Directory.abort();
			
			// Change last value and reinitialize
			KUMobile.Directory.lastValue = this.value;
			KUMobile.Directory.reinitialize();
			
			// Download results
			KUMobile.Directory.loadNextPage();
		}
	},
	
	
    /******************************************************************************
     *  Triggered when the user does a change to the TID/department drop down box.
	 *  When this happens, we generally need to redo the search.  
	 *
     *  @event tidChange
     *  @for KUMobile.Directory
     ******************************************************************************/    
	tidChange: function(e,u){
		
		// Definitely a change?
		if(this.value != KUMobile.Directory.tid){		
	
			// Clear timeout and ajax
			if(KUMobile.Directory.sentTimeout) clearTimeout(KUMobile.Directory.sentTimeout);
			KU.Directory.abort();
			
			// Change TID then reinitialize
			KUMobile.Directory.tid = this.value;
			KUMobile.Directory.reinitialize();
			
			// Download results
			KUMobile.Directory.loadNextPage();
		}
	},
	
	
    /******************************************************************************
     *  Triggered when regular scroll event happens in directory scroller window. It 
     *  is used to check if the user is *near* the bottom of the page, so more
     *  content can be loaded (simulate *infinite scrolling*).
	 *
     *  @event scroll
     *  @for KUMobile.Directory
     ******************************************************************************/
	scroll: function(event){
				
        // Get scroll position
		var scrollPosition = $('#directory-scroller').scrollTop() 
							 + $('#directory-scroller').outerHeight();

		// Break threshold?
		if($('#directory-list').height() < (KUMobile.Directory.LOAD_THRESHOLD_PX 
			+ $('#directory-scroller').scrollTop() + $('#directory-scroller').outerHeight())
			&& $('#directory').is(':visible') && !(KUMobile.Directory.typing) 
			&& !(KUMobile.Directory.loading) && !(KUMobile.Directory.reachedEnd)){
			
			// Get the next page!
			KUMobile.Directory.loadNextPage();
		}
	},
	
	
    /******************************************************************************
     *  Loads and displays the next set of directory items.
	 *
     *  @method loadNextPage
     *  @for KUMobile.Directory
     *  @example
     *      KUMobile.Directory.loadNextPage();
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
				this.queue = KUMobile.Directory.PAGES_TO_LOAD;
				KUMobile.showLoading("directory-header");
                
			}
            
            // Clear list if we are on page 0!
            if(this.page == 0) $("#directory-list li").remove();
			
            /* Success */
			var success = function(items){
                
                // Increment page
                KUMobile.Directory.page++;
                
                // Check for end
                KUMobile.Directory.reachedEnd = (items.length < 10);
                if(items.length < 10) KUMobile.Directory.queue = 0;
                
                // Setup data
                for(var index = 0; index < items.length; index++){
                 
                    // Current item and template
                    var item = items[index];
                    var contactTpl = Handlebars.getTemplate("directory-item");
                    
                    // Contact data
                    var contact = contactTpl({
                        "title": item.fullName,
                        "imgUrl": 
                            (item.imgUrl=="" || item.imgUrl=="http://www.kettering.edu/sites/all/themes/kettering/images/placeholders/11.jpg")
                            ?("img/default_directory_icon.jpg"):(item.imgUrl),
                        "info": item.info
                    });                    
                    
                    // Add list item to queue
                    KUMobile.Directory.listQueue[KUMobile.Directory.listQueue.length] = contact;                    
                    
                }
                
                // Flush?
                if(--KUMobile.Directory.queue <= 0){
                    
                    // Not loading
                    KUMobile.hideLoading("directory-header");
                    KUMobile.Directory.loading = false;
                    
                    // Go through all list items
                    for (var index = 0; index < KUMobile.Directory.listQueue.length; index++){
                        
                        // Append to directory list
                        $(KUMobile.Directory.listQueue[index]).appendTo("#directory-list");
                    }

                    // Refresh and clear both lists
                    $('#directory-list').listview('refresh');
                    KUMobile.Directory.listQueue = [];
                    
                }
                
                // More in the queue? Cool, grab another page.
                else {
                    
                    // Load more
                    KUMobile.Directory.loading = false;
                    KUMobile.Directory.loadNextPage();
                }
                
            };
            
            /* Fail */
            var failure = function(error){
                
                // Not loading anymore presumably..
                KUMobile.hideLoading("directory-header");
                KUMobile.Directory.loading = false;
                
                KUMobile.safeAlert("Error", "Sorry the directory could not be loaded. Check your" +
                    " internet connection. If the issue persists then please report the bug.", "ok");
                
            };
            
            // New search !?
            if(this.page == 0) KU.Directory.search("", this.lastValue, "", this.tid, success, failure);
            
            // Get next page !?
            else KU.Directory.nextPage(success, failure);
            
        }
    },
	
	
    /******************************************************************************
     *  Reinitializes all properties of KUMobile.Directory as if to restore
	 *  a new/default instance.
	 *
     *  @method reinitialize
     *  @for KUMobile.Directory
     *  @example
     *      KUMobile.Directory.reinitialize();
     ******************************************************************************/	
	reinitialize: function(){
		
        // Reset properties!
		this.listQueue = [];
		this.page = 0;
		this.queue = 0;
		this.loading = false;
		this.reachedEnd = false;

	}
		
	
};