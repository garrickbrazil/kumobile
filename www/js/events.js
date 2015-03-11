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
 *  Contains all events related functions for loading and controlling the events
 *  page.
 *
 *  @class KUMobile.Events
 ******************************************************************************/
KUMobile.Events = {
	
	
	/******************************************************************************
     *  Current page number as referenced from the events website.
     *
     *  @attribute page
     *  @type {int}
     *  @for KUMobile.Events
     *  @default 0
     ******************************************************************************/
     page: 0,
	
    
    /******************************************************************************
     *  Number of pages to load from the events website after a trigger event occurs.
     *
     *  @attribute PAGES_TO_LOAD
     *  @type {int}
     *  @for KUMobile.Events
     *  @default 2
     ******************************************************************************/
    PAGES_TO_LOAD: 2,
	
    
    /******************************************************************************
     *  Is the events page loading?
     *
     *  @attribute loading
     *  @type {boolean}
     *  @for KUMobile.Events
     *  @default false
     ******************************************************************************/
	loading: false,
    
    
    /******************************************************************************
     *  Designates the minimum number of pixels that the user can scroll
	 *  (calculated from the bottom) before another load event is triggered.
     *
     *  @attribute LOAD_THRESHOLD_PX
     *  @type {int}
     *  @for KUMobile.Events
     *  @default 660
     ******************************************************************************/	
	LOAD_THRESHOLD_PX: 660,

	
    /******************************************************************************
     *  How many pages that need to be downloaded still. This is used to asynchronously
     *  download pages.
     *
     *  @attribute queue
     *  @type {int}
     *  @for KUMobile.Events
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
     *  @for KUMobile.Events
     *  @private 
     ******************************************************************************/
	listQueue: [],
	
	
    /******************************************************************************
     *  Contains the current list of pages DOM data-role="page" 
	 *  items that still need to be added to the DOM (much faster to 
	 *  add all at once after load is done downloading). This helps 
	 *  prevent the app from seeming to hang or become unresponsive.
	 *
     *  @attribute pageQueue
     *  @type {Array}
     *  @for KUMobile.Events
     *  @private 
     ******************************************************************************/	
	pageQueue: [],
	
    
    /******************************************************************************
     *  The latest divider month & day combo is kept track of as an easy way to
     *  know when a datebar needs to be added!
	 *
     *  @attribute pageQueue
     *  @type {Array}
     *  @for KUMobile.Events
     *  @private 
     ******************************************************************************/	
    latestDividerMonth: "",
    
	
	/******************************************************************************
     *  Triggered when the events page is first initialized based on jQuery Mobile
     *  pageinit event.
	 *
     *  @event pageInit
     *  @for KUMobile.Events
     ******************************************************************************/
	pageInit: function(event){
			
        // Check overflow scroll position
        $('#events-scroller').on("scrollstop", KUMobile.Events.scroll);

	},
	
	
    /******************************************************************************
     *  Triggered when the events page is first created based on jQuery Mobile
     *  pagecreate event. This is called after the page itself is created but 
     *  before any jQuery Mobile styling is applied.
	 *
     *  @event pageCreate
     *  @for KUMobile.Events
     ******************************************************************************/
	pageCreate: function(event){
		
		// Resize and get first page for overflow
		$(window).trigger("throttledresize");
		KUMobile.Events.loadNextPage();
		
	},
	
	
	
    /******************************************************************************
     *  Triggered when regular scroll event happens in events scroller window. It 
     *  is used to check if the user is *near* the bottom of the page, so more
     *  content can be loaded (simulate *infinite scrolling*).
	 *
     *  @event scroll
     *  @for KUMobile.Events
     ******************************************************************************/
	scroll: function(event){

        // Get scroll position
		var scrollPosition = $('#events-scroller').scrollTop() + $('#events-scroller').outerHeight();

		// Break threshold?
		if($('#events-list').height() < (KUMobile.Events.LOAD_THRESHOLD_PX + $('#events-scroller').scrollTop() 
			+ $('#events-scroller').outerHeight()) && $('#events').is(':visible') && !(KUMobile.Events.loading)){

			// Get the next page!
			KUMobile.Events.loadNextPage();
		}
	},
	
    
    /******************************************************************************
     *  Loads and displays the next set of events items.
	 *
     *  @method loadNextPage
     *  @for KUMobile.Events
     *  @example
     *      KUMobile.Events.loadNextPage();
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
				this.queue = KUMobile.Events.PAGES_TO_LOAD;
				KUMobile.showLoading("events-header");
                
			}
			
            /* Success */
			var success = function(items){
                
                // Increment page
                KUMobile.Events.page++;
                
                // Setup data
                for(var index = 0; index < items.length; index++){
                 
                    // Current item and template
                    var item = items[index];
                    var captionTpl = Handlebars.getTemplate("events-item");
                    var pageTpl = Handlebars.getTemplate("dynamic-page");
                    var datebarTpl = Handlebars.getTemplate("events-datebar");
                    var pageId = 'events-' + KUMobile.Events.page + '-' + index;
                    
                    // Caption data
                    var captionHtml = captionTpl({
                        "title": item.title,
                        "imgUrl": (item.imgUrl=="")?("img/default_icon.jpg"):(item.imgUrl),
                        "info": item.time + " | " + item.location,
                        "pageId": pageId
                    });
                    
                    // Page data
                    var pageHtml = pageTpl({
                       "link": item.detailsUrl,
                       "pageId": pageId,
                       "headerTitle": "Events",
                       "scrollerId": pageId + "-scroller"
                    });
                    
                    // Register event
                    $(document).on("pagecreate",'#' + pageId, KUMobile.Events.articlePageCreate);
                    
                    
                    // Date bar already exist?
                    if(KUMobile.Events.latestDividerMonth != (item.month + item.dayOfTheMonth)){
                        
                        // Make
                        var datebar = datebarTpl({
                            "monthDay": item.month + " " + item.dayOfTheMonth,
                            "day": item.dayOfTheWeek
                        });
                        
                        // Add to queue
                        KUMobile.Events.listQueue[KUMobile.Events.listQueue.length] = datebar;
                        
                        // Save latest
                        KUMobile.Events.latestDividerMonth = (item.month + item.dayOfTheMonth);
                    
                    }
                    
                    
                    // Add list item to queue
                    KUMobile.Events.listQueue[KUMobile.Events.listQueue.length] = captionHtml;
                    KUMobile.Events.pageQueue[KUMobile.Events.pageQueue.length] = pageHtml;
                    
                    
                }
                
                // Flush?
                if(--KUMobile.Events.queue <= 0){
                    
                    // Not loading
                    KUMobile.hideLoading("events-header");
                    KUMobile.Events.loading = false;
                    
                    // Go through all list items
                    for (var index = 0; index < KUMobile.Events.listQueue.length; index++){
                        
                        // Append to events list
                        $(KUMobile.Events.listQueue[index]).appendTo("#events-list");
                    }
                    
                    // Go through all page items
                    for (var index = 0; index < KUMobile.Events.pageQueue.length; index++){
                        
                        // Append to events list
                        $(KUMobile.Events.pageQueue[index]).appendTo("body");
                    }
                 
                    // Refresh and clear both lists
                    $('#events-list').listview('refresh');
                    KUMobile.Events.listQueue = [];
                    KUMobile.Events.pageQueue = [];
                    
                }
                
                // More events to be downloaded!
                else {
                    
                    // Load more
                    KUMobile.Events.loading = false;
                    KUMobile.Events.loadNextPage();
                }
                
            };
            
            /* Fail */
            var failure = function(error){
                
                // Not loading anymore presumably..
                KUMobile.hideLoading("events-header");
                KUMobile.Events.loading = false;
                
                alert("Sorry the events could not be loaded :(. Check your" +
                " internet connection. If the issue persists then please"+
                " create a bug at github.com/garrickbrazil/kumobile/issues/new");
            };
            
            // Get next page
            KU.Events.nextPage(success, failure);
        }
    },
       
       
    /******************************************************************************
     *  Called on create of an article page. Mainly this function just
	 *  attempts to download the article and show it. 
	 *
     *  @event articlePageCreate
     *  @for KUMobile.Events
     ******************************************************************************/
	articlePageCreate: function(event){
		
        
        // Now loading
		KUMobile.Events.loading = true;
        KUMobile.showLoading(this.id);
        var identifier = this.id;
        
        var success = function(article){
         
            var articleTpl = Handlebars.getTemplate("events-article");
            
            var html = articleTpl({
                "title": article.title,
            });
            
            $(html).appendTo("#" + identifier + "-scroller");
            
            mainParagraph = $(article.mainHtml);
            
            // Fix max width and height
            mainParagraph.find('*').css("max-width", "100%").css("height","auto");

            // Remove hard-coded width from table
            mainParagraph.find('table').css('width','');
            mainParagraph.css('padding','8px')
            
            // Append
            mainParagraph.appendTo("#" + identifier + "-scroller");
            
            mainParagraph.find('label')
                .css('font-weight','bold')
                .css("padding-top","14px")
                .css('margin','0px');
            
            // Resize when new elements load
            $(mainParagraph).find('*').load(function(){ $(window).trigger("resize");});
            
            // Resize anyways! in case there was nothing to load from above
            $(window).trigger("resize");
            
            // Done loading!
            KUMobile.hideLoading(identifier);
            KUMobile.Events.loading = false;
         
        }
        
        var failure = function(error){
         
            // Not loading anymore presumably..
            KUMobile.hideLoading(identifier);
            KUMobile.Events.loading = false;
            
            alert("Sorry the events could not be loaded :(. Check your" +
            " internet connection. If the issue persist then please"+
            " create a bug at github.com/garrickbrazil/kumobile/issues/new");
        }
        
        // Get the article!
        KU.Events.downloadEventDetails($('#' + identifier).attr("kulink"), success, failure)
        
	}
	
};