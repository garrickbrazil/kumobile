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
/**  Contains all directory related functions for loading and controlling the
 *   directory page. This only takes faculty directory into consideration.
 *   @namespace
 ******************************************************************************/
 KU.Directory = {
	
	
	
	/******************************************************************************/
	/**  Stores the last page number downloaded as denoted from Kettering's
	 *   directory website kettering.edu/faculty-staff/directory. Indexing starts off
	 *   at 0 and continues on to an unbounded limit.
	 *   @type {int} 
	 ******************************************************************************/
	page: 0,
	
	
	
	/******************************************************************************/
	/**  Number of pages that need to be downloaded still. This is used to
	 *   dynamically and asynchronously download more than one page at a time,
	 *   which is configured at {@link KU.PAGES_TO_LOAD}
	 *   @type {int}
	 ******************************************************************************/
	queue: 0,
	
	
	
	/******************************************************************************/
	/**  Tells whether or not directory is currently attempting to download
	 *   or parse article lists. Essentially used to tell whether directory is
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
	/**  Topic identifier for Kettering's directory searching. This basically
	 *   represents the department the user has selected to filter by. We use
	 *   'All' as the default value.
	 *   @type {string}
	 ******************************************************************************/
	tid:'All',
	
	
	
	/******************************************************************************/
	/**  Represents the last/current value the user has searched for from the free
	 *   text field / search bar located on the directory page. 
	 *   @type {string}
	 ******************************************************************************/
	lastValue:'',
	
	
	
	/******************************************************************************/
	/**  Tells whether or not the user has reached the end of the scrolling. This is
	 *   useful mainly to prevent the load to continuously trigger when there are no
	 *   more results that need to be shown. Obviously this starts off false and 
	 *   is detected during {@link KU.Directory.getNextPage}.
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
	/**  Triggered when the directory page is first initialized based on 
	 *   jQM page init event. 
	 *
	 *   @param {Event} event - jQM event, not actually being
	 *          used by us at the moment. 
	 *   @event
	 ******************************************************************************/
	pageInit: function(event){
		
		// Bug in JQM? Clear button flashes when loading page?
		// This line will fix it.
		$("#directory .ui-input-clear").addClass("ui-input-clear-hidden");
		
		// Need to initialize iScroll scrolling?
		if(KU.ISCROLL){
			
			// Bind check scroll to moving and ending events
			$("#directory .iscroll-wrapper").bind({
				"iscroll_onscrollmove": KU.Directory.checkIScroll,
				"iscroll_onscrollend": KU.Directory.checkIScroll,
			});
		}
		
		// Regular overflow scrolling
		else{
			
			// Check overflow scroll position
			$('#directory-scroller').on("scroll", KU.Directory.checkScroll);
		}
	},
	
	
	
	/******************************************************************************/
	/**  Triggered when the directory page is first created based on 
	 *   jQM page create event. 
	 *
	 *   @param {Event} event - jQM event, not actually being
	 *          used by us at the moment. 
	 *   @event
	 ******************************************************************************/
	pageCreate: function(event){
	
		// Fix iScroll?
		if(KU.ISCROLL) KU.fixIscroll("#directory"); 
		
		// Resize and get first page for overflow
		$(window).trigger("resize");
		
		
		// Trigger for change in TID select
		$("#directory-select").bind("change", KU.Directory.tidChangeEvent);
		
		// Trigger for direct change in search box
		$("#directory-search").bind("change", KU.Directory.searchDirectChangeEvent);
		
		// Trigger for incremental change in search box
		$("#directory-search").keyup( KU.Directory.searchIncrementalChangeEvent);
		
		// Get page when page is first created
		KU.Directory.getNextPage(); 
		
	},
	
	
	
	/******************************************************************************/
	/**  Triggered when the user does a key up event in order to simulate incremental
	 *   searching for the attached search bar. 
	 *   @event
	 ******************************************************************************/
	searchIncrementalChangeEvent: function() {
			
		// Definitely a change?
		if(this.value != KU.Directory.lastValue){
		
			// Store value
			KU.Directory.lastValue = this.value;
		
			// Clear timeout
			if(KU.Directory.sentTimeout) clearTimeout(KU.Directory.sentTimeout);
			KU.Directory.typing = true;
			
			KU.Directory.sentTimeout = setTimeout(function(latestValue){
				
				// Definitely not a change?
				if(latestValue == KU.Directory.lastValue){
					
					// Abort ajax
					if(KU.Directory.sentAjax) KU.Directory.sentAjax.abort();
					
					// Save new value, reinit, download
					KU.Directory.lastValue = latestValue;
					KU.Directory.reinitialize();
					KU.Directory.getNextPage();
				}
				
				KU.Directory.typing = false;
				
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
		if(this.value != KU.Directory.lastValue){
		
			// Clear timeout and ajax
			if(KU.Directory.sentTimeout) clearTimeout(KU.Directory.sentTimeout);
			if(KU.Directory.sentAjax) KU.Directory.sentAjax.abort();
			
			// Change last value and reinitialize
			KU.Directory.lastValue = this.value;
			KU.Directory.reinitialize();
			
			// Download results
			KU.Directory.getNextPage();
		}
	},
	
	
	
	/******************************************************************************/
	/**  Triggered when the user does a change to the TID/department drop down box.
	 *   When this happens, we generally need to redo the search. 
	 *   @event
	 ******************************************************************************/
	tidChangeEvent: function(e,u){
		
		// Definitely a change?
		if(this.value != KU.Directory.tid){		
	
			// Clear timeout and ajax
			if(KU.Directory.sentTimeout) clearTimeout(KU.Directory.sentTimeout);
			if(KU.Directory.sentAjax) KU.Directory.sentAjax.abort();
			
			// Change TID then reinitialize
			KU.Directory.tid = this.value;
			KU.Directory.reinitialize();
			
			// Download results
			KU.Directory.getNextPage();
		}
	},
	
	
	
	/******************************************************************************/
	/**  Triggered when regular scroll event happens in directory scroller window
	 *   This should be used for most, or all, modern devices that support it.
	 *   Note: this detection is setup in {@link KU.ISCROLL} using
	 *   overthrow-detect library.
	 * 
	 *   @param {Object} event - event properties, not used
	 *   @event
	 ******************************************************************************/
	checkScroll: function(event){
				
		var scrollPosition = $('#directory-scroller').scrollTop() 
							 + $('#directory-scroller').outerHeight();

		// Break threshold?
		if($('#directory-list').height() < (KU.Directory.LOAD_THRESHOLD_PX 
			+ $('#directory-scroller').scrollTop() + $('#directory-scroller').outerHeight())
			&& $('#directory').is(':visible') && !(KU.Directory.typing) 
			&& !(KU.Directory.loading) && !(KU.Directory.reachedEnd)){
			
			// Get the next page!
			KU.Directory.getNextPage();
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
		if(!KU.Directory.loading && current > (max - KU.Directory.LOAD_THRESHOLD_PX) 
			&& $('#directory').is(':visible') && !(KU.Directory.typing)
			&& !(KU.Directory.loading) && !(KU.Directory.reachedEnd)){
			
			// Get next page then refresh iScroll
			KU.Directory.getNextPage();
			d.iscrollview.refresh();
		}
	},
	
	
	
	/******************************************************************************/
	/**  Downloads the next page in order to gain another 10 articles
	 *   as part of the article list for the main directory page. Note that
	 *   there are no arguments, but the function uses namespace members
	 *   such as {@link KU.Directory.page} and {@link KU.Directory.queue}.
	 ******************************************************************************/
	getNextPage: function (){
		
		if(!this.loading){
			
			// Now loading
			this.loading = true;
			
			// Empty queue?
			if(this.queue <= 0){ 
			
				// Initialize the queue
				// show loading indicator!
				this.queue = KU.PAGES_TO_LOAD;
				KU.showLoading("directory-header");
			}
			
			// Found at least one occasion where ?page=0 was different than default
			if(this.page != 0){ 
				
				// Compile URL
				var url = 'http://www.kettering.edu/faculty-staff/directory?' 
							+ 'field_faculty_staff_first_value=' 
							+ '&field_faculty_staff_last_value=' + encodeURIComponent(this.lastValue) 
							+ '&field_phone_extension_value=&tid=' + this.tid
							+ '&page=0' + this.page;
			}
			
			// Page is 0
			else{
			
				// Clear entire list for page 0
				$("#directory-list li").remove();
			
				// Compile URL
				var url = 'http://www.kettering.edu/faculty-staff/directory?' 
							+ 'field_faculty_staff_first_value=' 
							+ '&field_faculty_staff_last_value=' + encodeURIComponent(this.lastValue) 
							+ '&field_phone_extension_value=&tid=' + this.tid;	
			}
			
			// Store ajax (in case we need to cancel later)
			this.sentAjax = $.ajax({
				url: url,
				type: 'GET',
				dataType: 'html',
				success: function(data) {
					
					// Next page
					KU.Directory.page++;
					
					// Check for end? Reset queue if true
					var downloaded = $("<div>").html(data).find('.directory-caption');
					KU.Directory.reachedEnd = (downloaded.length < 10);					
					if(KU.Directory.reachedEnd) KU.Directory.queue = 0;

			
					// Go through each directory item
					downloaded.each(
						function(index){
							
							// Defaults
							var padding = "5.2em";
							var minH = "7.85em;";
							var imgClass = "directory-icon";
							var defaultIcon = '/sites/all/themes/kettering/images/placeholders/11.jpg';
							
							// Get first image or use default
							if($('img',this).length > 0 && !($('img',this).eq(0).attr('src').indexOf(defaultIcon) > -1)){
								
								// Save img source
								var source = $('img',this).eq(0).attr('src');
							}
							else {

								// Use default source
								var source = 'images/default_directory_icon.jpg';
							}

							// Setup item information
							var title = $('h3', this).first().text();

							// Make listitem
							var listitem = $('<li></li>',{
								'class':"grey-grad",
								'style':"min-height:" + minH,
								'data-transition':'none',
							});
							
							// Make img
							$('<img></img>',{
								'class':"ui-li-icon " + imgClass,
								'src': source
							}).appendTo(listitem);
							
							var textContainer = $('<div></div>', {
								'style':'line-height:1.1em!important;padding-left:' + padding + "!important;"
							}).appendTo(listitem);
							
							// Make h1
							$('<h1></h1>',{
								'style':'white-space:normal;',
								'text': title
							}).appendTo(textContainer);
							
							$('.inside span', this).each(
								function(i){
									
									
									var info = $(this).clone().children().remove().end().text();
									var bold = $(this).hasClass("bold");
									if($(this).hasClass("obfuscated")){
										info = info.split("").reverse().join("");
										info = KU.ketteringObfuscate(info);
									}
									
									//info = info.replace("1700 University Ave",""); 
									
									if(!(info.replace(/\s+/g, '') == "" || $(this).find('.tel').length > 0)){
										// Make p
										$('<p></p>',{
											'text': info,
											'style': (bold)?('font-weight:bold;'):('')
										}).appendTo(textContainer);
									}
							});
							
							// If no lists then make them!
							if(KU.Directory.listQueue==null) KU.Directory.listQueue = new Array();
							
							// Add the item to the queue to be added after complete download
							// NOTE: This is intentional so the DOM processing does not create
							// a lag and unfriendly experience, we process all at the end
							KU.Directory.listQueue[KU.Directory.listQueue.length] = listitem;
						
						}	
					);
					
	
					KU.Directory.loading = false;	// not loading
					KU.Directory.queue--;			// one less in the queue!
					
					// Last in the queue?
					if(KU.Directory.queue <= 0){
						
						KU.hideLoading("directory-header");

						// Go through all items in the list queue
						for(var index = 0; index < KU.Directory.listQueue.length; index++){
							
							// Append to list
							KU.Directory.listQueue[index].appendTo('#directory-list');		
						}
						
						// Refresh and create new arrays
						$('#directory-list').listview('refresh');
						KU.Directory.listQueue = new Array();
						
					}
					
					// More in the queue? Cool, grab another page. 
					else KU.Directory.getNextPage();
				},
				
				error: function(data){
				
					KU.hideLoading("directory-header");
					KU.Directory.loading = false;
				}
			});	
		}
	},
	
	
	
	/******************************************************************************/
	/**  Reinitializes all properties of {@link KU.Directory} as if to restore
	 *   a new/default instance of the namespace.
	 ******************************************************************************/
	reinitialize: function(){
		
		this.listQueue = new Array();
		this.page = 0;
		this.queue = 0;
		this.loading = false;
		this.reachedEnd = false;

		// Clear previous scrollbar!
		if(KU.ISCROLL) $(window).trigger("resize");
	}
	
	
	
};