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



/******************************************************************************/
/**  Contains all library related functions for loading and controlling the
 *   library page.
 *   @namespace
 ******************************************************************************/
 KU.Library = {
	
	
	
	/******************************************************************************/
	/**  Stores the last page number downloaded. Note: for library we use the external
	 *   site at http://catalog.palnet.info instead of Kettering's own site, therefore
	 *   this page number is only used as a convenience for us. Their system works by
	 *   a complex hitlist, see {@link KU.Library.getNextPage} for more details.
	 *   @type {int} 
	 ******************************************************************************/
	page: 0,
	

	
	/******************************************************************************/
	/**  Tells whether or not library is currently attempting to download
	 *   or parse article lists. Essentially used to tell whether library is
	 *   considered to be busy. 
	 *   @type {boolean}
	 ******************************************************************************/
	loading: false,
	
	
	
	/******************************************************************************/
	/**  Designates the minimum number of pixels that the user can scroll
	 *   (calculated from the bottom) before another load event is triggered.
	 *   @constant {int}
	 ******************************************************************************/
	LOAD_THRESHOLD_PX: 660,
	
	
	
	/******************************************************************************/
	/**  Type of searching for Kettering's library. This basically represents the 
	 *   method of searching that will be used by the system. Note: the naming 
	 *   convention is a bit funky and NOT controlled by KU-Mobile.
	 *   @type {string}
	 ******************************************************************************/
	type: 'GENERAL^SUBJECT^GENERAL^^words or phrase',
	
	
	
	/******************************************************************************/
	/**  Represents the last/current value the user has searched for from the free
	 *   text field / search bar located on the library page. 
	 *   @type {string}
	 ******************************************************************************/
	lastValue:'',
	
	
	
	/******************************************************************************/
	/**  Represents the last/current action from catalog planet's site. This is
	 *   essentially a key needed to continue cycling through pages from the most
	 *   recent search on catalog planets Kettering site. See {@link KU.Library.getNextPage}
	 *   @type {string}
	 ******************************************************************************/
	lastAction:'',
	
	
	
	/******************************************************************************/
	/**  Tells whether or not the user has reached the end of the scrolling. This is
	 *   useful mainly to prevent the load to continuously trigger when there are no
	 *   more results that need to be shown. Obviously this starts off false and 
	 *   is detected during {@link KU.Library.getNextPage}.
	 *   @type {boolean}
	 ******************************************************************************/
	reachedEnd: false,
	
	
	
	/******************************************************************************/
	/**  Is the user currently typing? This is mainly used to ensure we do not do 
	 *   certain loads or other things when we consider the user is typing.
	 *   @type {boolean}
	 ******************************************************************************/
	typing: false,
	
	
	
	/******************************************************************************/
	/**  Contains the current list of article DOM li tag items that still need
	 *   to be added to the DOM (much faster to add all at once after load
	 *   is done downloading). This helps prevent the app from seeming to 
	 *   hang or become unresponsive.
	 *   @type {Object[]}
	 ******************************************************************************/
	listQueue: null,
	
	
	
	/******************************************************************************/
	/**  Contains the last ajax call sent! This allows us to abort the call if the
	 *   user re-searches in any way (dropdown, or searchbar)
	 *   @type {Ajax}
	 ******************************************************************************/
	sentAjax: null,
	
	
	
	/******************************************************************************/
	/**  Contains the last timeout call sent! This allows us to restart the timeout if
	 *   the user re-searches in any way (dropdown, or searchbar). The major benefit
	 *   of this is that it gives us the feeling of incremental searching, e.g we send
	 *   a timeout of some milliseconds whenever the KEY_UP event triggers, as well
	 *   as cancelling out the last timeout we sent. 
	 *   @type {Timeout}
	 ******************************************************************************/
	sentTimeout: null,
	
	
	
	/******************************************************************************/
	/**  Triggered when the library page is first initialized based on 
	 *   jQM page init event. 
	 *
	 *   @param {Event} event - jQM event, not actually being
	 *          used by us at the moment. 
	 *   @event
	 ******************************************************************************/
	pageInit: function(event){
		
		// Bug in JQM? Clear button flashes when loading page?
		// This line will fix it.
		$("#library .ui-input-clear").addClass("ui-input-clear-hidden");
		
		// Need to initialize iScroll scrolling?
		if(KU.ISCROLL){
			
			
			// Bind check scroll to moving and ending events
			$("#library .iscroll-wrapper").bind({
				"iscroll_onscrollmove": KU.Library.checkIScroll,
				"iscroll_onscrollend": KU.Library.checkIScroll,
			});
		}
		
		// Regular overflow scrolling
		else{
			
			
			// Check overflow scroll position
			$('#library-scroller').on("scroll", KU.Library.checkScroll);
		}
		
	},
	
	
	
	/******************************************************************************/
	/**  Triggered when the library page is first created based on 
	 *   jQM page create event. 
	 *
	 *   @param {Event} event - jQM event, not actually being
	 *          used by us at the moment. 
	 *   @event
	 ******************************************************************************/
	pageCreate: function(event){
	
		// Fix iScroll?
		if(KU.ISCROLL) KU.fixIscroll("#library"); 
		
		// Resize and get first page for overflow
		$(window).trigger("resize");
		
		
		// Trigger for change in type select
		$("#library-select").bind("change", KU.Library.typeChangeEvent);
		
		// Trigger for direct change in search box
		$("#library-search").bind("change", KU.Library.searchDirectChangeEvent);
		
		// Trigger for incremental change in search box
		$("#library-search").keyup(KU.Library.searchIncrementalChangeEvent);
		
		// Get page when page is first created
		KU.Library.getNextPage(); 
		
	},
	
	
	
	/******************************************************************************/
	/**  Triggered when the user does a key up event in order to simulate incremental
	 *   searching for the attached search bar. 
	 *   @event
	 ******************************************************************************/
	searchIncrementalChangeEvent: function() {
			
		// Definitely a change?
		if(this.value != KU.Library.lastValue){
		
			// Store value
			KU.Library.lastValue = this.value;
		
			// Clear timeout
			if(KU.Library.sentTimeout) clearTimeout(KU.Library.sentTimeout);
			KU.Library.typing = true;
			
			KU.Library.sentTimeout = setTimeout(function(latestValue){
				
				// Definitely not a change?
				if(latestValue == KU.Library.lastValue){
					
					// Abort ajax
					if(KU.Library.sentAjax) KU.Library.sentAjax.abort();
					
					// Save new value, reinit, download
					KU.Library.lastValue = latestValue;
					KU.Library.reinitialize();
					KU.Library.getNextPage();
				}
				
				KU.Library.typing = false;
				
			}, KU.INCR_WAIT_TIME, this.value);
		}
	},
	
	
	
	/******************************************************************************/
	/**  Triggered when the user does a direct change. The direct change includes 
	 *   typing then changing focus or pressing the clear button. This is redundant
	 *   to the incremental search event, except for the clear button!
	 *   @event
	 ******************************************************************************/
	searchDirectChangeEvent: function(e,u){
			
		// Definitely a change?
		if(this.value != KU.Library.lastValue){
		
			// Clear timeout and ajax
			if(KU.Library.sentTimeout) clearTimeout(KU.Library.sentTimeout);
			if(KU.Library.sentAjax) KU.Library.sentAjax.abort();
			
			// Change last value and reinitialize
			KU.Library.lastValue = this.value;
			KU.Library.reinitialize();
			
			// Download results
			KU.Library.getNextPage();
		}
	},
	
	
	
	/******************************************************************************/
	/**  Triggered when the user does a change to the TID/department drop down box.
	 *   When this happens, we generally need to redo the search. 
	 *   @event
	 ******************************************************************************/
	typeChangeEvent: function(e,u){
		
		// Definitely a change?
		if(this.value != KU.Library.type){		
	
			// Clear timeout and ajax
			if(KU.Library.sentTimeout) clearTimeout(KU.Library.sentTimeout);
			if(KU.Library.sentAjax) KU.Library.sentAjax.abort();
			
			// Change type then reinitialize
			KU.Library.type = this.value;	
			KU.Library.reinitialize();
			
			// Download results
			KU.Library.getNextPage();
		}
	},
	
	
	
	/******************************************************************************/
	/**  Triggered when regular scroll event happens in library scroller window
	 *   This should be used for most, or all, modern devices that support it.
	 *   Note: this detection is setup in {@link KU.ISCROLL} using
	 *   overthrow-detect library.
	 * 
	 *   @param {Object} event - event properties, not used
	 *   @event
	 ******************************************************************************/
	checkScroll: function(event){
				
		var scrollPosition = $('#library-scroller').scrollTop() 
							 + $('#library-scroller').outerHeight();

		// Break threshold?
		if($('#library-list').height() < (KU.Library.LOAD_THRESHOLD_PX 
			+ $('#library-scroller').scrollTop() + $('#library-scroller').outerHeight()) && !(KU.Library.typing)
			&& $('#library').is(':visible') && !(KU.Library.loading) && !(KU.Library.reachedEnd)){
			
			// Get the next page!
			KU.Library.getNextPage();
		}
	},
	
	
	
	/******************************************************************************/
	/**  Triggered when iScroll is moved or ended during a scrolling
	 *   transition. Note this is only used at the moment for older devices
	 *   which do not support overflow. 
	 * 
	 *   @param {Object} e - event, not used
	 *   @param {Object} d - contains iscrollview and alike properties
	 *   @event
	 ******************************************************************************/
	checkIScroll: function (e,d){

		// Calculate current and maximum y coordinate
		var max = d.iscrollview.maxScrollY()*-1;
		var current = d.iscrollview.y()*-1;
		
		// At or past the threshold?
		if(!KU.Library.loading && current > (max - KU.Library.LOAD_THRESHOLD_PX) 
			&& $('#library').is(':visible') && !(KU.Library.typing)
			&& !(KU.Library.loading) && !(KU.Library.reachedEnd)){
			
			// Get next page then refresh iScroll
			KU.Library.getNextPage();
			d.iscrollview.refresh();
		}
	},
	
	
	
	/******************************************************************************/
	/**  Downloads the next page in order to gain another 10 articles
	 *   as part of the article list for the main library page. Note that
	 *   there are no arguments, but the function uses namespace members.
	 ******************************************************************************/
	getNextPage: function (){

		if(!this.loading){
			
			// Now loading
			this.loading = true;
			KU.showLoading("library-header");
				
			// First page is restful based
			if(this.page == 0){ 
			
				// Clear entire list for page 0
				$("#library-list li").remove();
				
				// Compile URL
				var url = 'http://elibrary.palnet.info/uhtbin/cgisirsi/x/0/0/57/5?'
							+ 'library=KU&location=KUMAIN&match_on=KEYWORD&shadow=NO'
							+ '&user_id=kuweb&srchfield1=' + encodeURIComponent(this.type) 
							+ '&searchdata1=' + encodeURIComponent(this.lastValue);
			}
			
			// Next page? No more restfulness :(
			else{
			
				// Compile URL
				var url = "http://catalog.palnet.info" + this.lastAction + "?"
							+ "firsthit=&lasthit=&form_type=" + "JUMP%5E" + ((this.page*20) + 1);
			}
			
			
			// Store ajax (in case we need to cancel later)
			this.sentAjax = $.ajax({
				url: url,
				type: 'GET',
				dataType: 'html',
				success: function(data) {
					
					// Check for end? Reset queue if true
					var downloaded = $("<div>").html(data);
					var hitlist = downloaded.find('.hit_list_row');
					KU.Library.reachedEnd = (hitlist.length < 20);
					
					// Snag the action for this session?
					if(KU.Library.page == 0){
						KU.Library.lastAction = downloaded.find("#hitlist").first().attr("action");
					}
			
					// Next page
					KU.Library.page++;
			
					// Go through each library item
					hitlist.each(
						function(index){
							
							// Defaults
							var padding = "5.2em";
							var minH = "7.85em;";
							var imgClass = "library-icon";
							var defaultIcon = '/sites/all/themes/kettering/images/placeholders/11.jpg';
							
							// Get first image or use default
							if($('.hit_list_list_cover script',this).length > 0){
								
								// Tricky interpretation of the hitlist script
								// NOTE: this is usually dynamically loaded by the below script...
								// we will not do this, instead lets parse the arguments out
								// then interpret them ourselves..
								var horribleScript = $('.hit_list_list_cover script',this).eq(0).text()
													.replace(/\s/g, '').replace("getHitCover('", '')
													.replace("');", '');
								
								var source = "";
								
								// Save img source
								var args = horribleScript.split("','");
								
								if(args.length == 8){
									source = args[0] + "isbn="
											+ args[2].replace(/,.+/g,'') + "/SC.GIF"
											+ "&client=" + args[1]
											+ "&type=xw12&upc=&oclc=" 
											+ args[4].replace(/,.+/g,'');							
								}
							}
							else {

								// Use default source
								var source = 'images/default_library_icon.jpg';
							}

							// Setup item information
							var title = $('.title', this).first().text().trim();
							var author = $(".author",this).first().text().trim();
							var call_number = $(".call_number",this).first().text().trim();
							var holdings_statement = $(".holdings_statement",this).first().text().trim();
							
							// Make listitem
							var listitem = $('<li></li>',{
								'class':"grey-grad",
								'style':"min-height:" + minH,
								'data-transition':'none',
							});
							
							// Make img
							$('<img></img>',{ 
								'src': source,
								'class':'ui-li-icon'
							})

								// Check on image natural size
								.load(function(){
							
									// Use default if it is that small!
									if(this.height == 1) this.src = "images/default_library_icon.jpg";

									// Apply class styles
									$(this).addClass("library-icon");
								})
								// Apply default on error as well
								.error(function() {
									this.src = "images/default_library_icon.jpg";
								})
							.appendTo(listitem);
							
							var textContainer = $('<div></div>', {
								'style':'line-height:1.1em!important;padding-left:' + padding + "!important;"
							}).appendTo(listitem);
							
							// Make h1
							$('<h1></h1>',{
								'style':'white-space:normal;',
								'text': title
							}).appendTo(textContainer);
							
							// Make p
							$('<p></p>',{
								'text': "By " + author,
							}).appendTo(textContainer);
							
							// Make p
							$('<p></p>',{
								'text': "Call number: " + call_number,
								'style': 'white-space:normal;'
							}).appendTo(textContainer);
							
							// Make p
							$('<p></p>',{
								'text': holdings_statement,
								'style': 'white-space:normal;'
							}).appendTo(textContainer);
							
							
							// If no lists then make them!
							if(KU.Library.listQueue==null) KU.Library.listQueue = new Array();
							
							// Add the item to the queue to be added after complete download
							// NOTE: This is intentional so the DOM processing does not create
							// a lag and unfriendly experience, we process all at the end
							KU.Library.listQueue[KU.Library.listQueue.length] = listitem;
						
						}	
					);
					
	
					KU.Library.loading = false;	// not loading
					
						
					KU.hideLoading("library-header");

					// Go through all items in the list queue
					for(var index = 0; index < KU.Library.listQueue.length; index++){
						
						// Append to list
						KU.Library.listQueue[index].appendTo('#library-list');		
					}
					
					// Refresh and create new arrays
					$('#library-list').listview('refresh');
					KU.Library.listQueue = new Array();
						
					
				},
				
				error: function(data){
				
					KU.hideLoading("library-header");
					KU.Library.loading = false;
				}
			});	
		}
	},
	
	/******************************************************************************/
	/**  Reinitializes all properties of {@link KU.Library} as if to restore
	 *   a new/default instance of the namespace.
	 ******************************************************************************/
	reinitialize: function(){
		
		this.listQueue = new Array();
		this.page = 0;
		this.loading = false;
		this.reachedEnd = false;
		
		// Clear previous scrollbar!
		if(KU.ISCROLL) $(window).trigger("resize");
	}
	
	
	
};