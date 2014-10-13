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
/**  Contains all events related functions for loading and controlling the events page.
 *   @namespace
 ******************************************************************************/
KU.Events = {
	
	
	
	/******************************************************************************/
	/**  Stores the last page number downloaded as denoted from Kettering's
	 *   event website kettering.edu/events. Indexing starts off at 0 and 
	 *   continues on to an unbounded limit.
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
	/**  Tells whether or not events is currently attempting to download
	 *   or parse article lists. Essentially used to tell whether events is
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
	/**  Contains the current list of article DOM li tag items that still need
	 *   to be added to the DOM (much faster to add all at once after load
	 *   is done downloading). This helps prevent the app from seeming to 
	 *   hang or become unresponsive.
	 *   @type {Object[]}
	 ******************************************************************************/
	listQueue: null,
	
	
	
	/******************************************************************************/
	/**  Contains the current list of pages DOM data-role="page" 
	 *   items that still need to be added to the DOM (much faster to 
	 *   add all at once after load is done downloading). This helps 
	 *   prevent the app from seeming to hang or become unresponsive.
	 *   @type {Object[]}
	 ******************************************************************************/
	pageQueue: null,
	
	
	
	/******************************************************************************/
	/**  Triggered when the events page is first initialized based on 
	 *   jQM page init event. 
	 *
	 *   @param {Event} event - jQM event, not actually being
	 *          used by us at the moment. 
	 *   @event
	 ******************************************************************************/
	pageInit: function(event){

		// Need to initialize iScroll scrolling?
		if(KU.ISCROLL){
			
			// Bind check scroll to moving and ending events
			$("#events .iscroll-wrapper").bind({
				"iscroll_onscrollmove": KU.Events.checkIScroll,
				"iscroll_onscrollend": KU.Events.checkIScroll,
			});
		}
		
		// Regular overflow scrolling
		else{
			
			// Check overflow scroll position
			$('#events-scroller').on("scrollstop", KU.Events.checkScroll);
		}
	},
	
	
	
	/******************************************************************************/
	/**  Triggered when the events page is first created based on 
	 *   jQM page create event. 
	 *
	 *   @param {Event} event - jQM event, not actually being
	 *          used by us at the moment. 
	 *   @event
	 ******************************************************************************/
	pageCreate: function(event){
	
		// Fix iScroll?
		if(KU.ISCROLL) KU.fixIscroll("#events");
		
		// Resize and get first page for overflow
		else $(window).trigger("throttledresize");
		KU.Events.getNextPage();
		
	},
	
	
	
	/******************************************************************************/
	/**  Triggered when regular scroll event happens in events scroller window
	 *   This should be used for most, or all, modern devices that support it.
	 *   Note: this detection is setup in {@link KU.ISCROLL} using
	 *   overthrow-detect library.
	 * 
	 *   @param {Object} event - event properties, not used
	 *   @event
	 ******************************************************************************/
	checkScroll: function(event){
				
		var scrollPosition = $('#events-scroller').scrollTop() + $('#events-scroller').outerHeight();

		// Break threshold?
		if($('#events-list').height() < (KU.Events.LOAD_THRESHOLD_PX + $('#events-scroller').scrollTop() 
			+ $('#events-scroller').outerHeight()) && $('#events').is(':visible') && !(KU.Events.loading)){

			// Get the next page!
			KU.Events.getNextPage();
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
		
		if(!KU.Events.loading && current > (max - KU.Events.LOAD_THRESHOLD_PX) && $('#events').is(':visible') 
			&& !(KU.Events.loading)){
			
			// Get next page then refresh iScroll
			KU.Events.getNextPage();
			d.iscrollview.refresh();
		}
	},
	
	
	
	/******************************************************************************/
	/**  Downloads and parses a Kettering events article in order to display
	 *   detailed article to the user. Usually this is triggered by a user
	 *   clicking on an article link from the main events page.
	 *
	 *   @param {string} domId - The article DOM identifier for the link that
	 *          was clicked by the user (e.g in html format, id="Events-1-0")
	 *          which represents the first page article 0.
	 *   @param {string} link - Directly link to the events article located on
	 *          Kettering's main website.
	 ******************************************************************************/
	downloadArticle:function (domId, link){
	
		// Now loading
		this.loading = true;
	
		$.ajax({
			url: 'http://www.kettering.edu/' + link,
			type: 'GET',
			dataType: 'html',
			beforeSend: function(){
				KU.showLoading(domId);
			},
			success: function(data) {
			
				// Load downloaded document
				var doc = $("<div>").html(data);
				
				// Get necessary information
				var main_paragraph = doc.find('.content.clearfix').css('padding','4px');
				var title = doc.find('.title.inside').text();

				// Fix max width and height
				main_paragraph.find('*').css("max-width", "100%").css("height","auto");

				// Get scroller content
				var scroller = $('#' + domId + "-scroller");	   

				// Make h1
				var header = $('<h2></h2>',{
					'style':'margin:0px;white-space:normal;padding-top:15px;padding-bottom:15px;padding-left:4px;padding-right:4px;;',
					'text': title
				}).appendTo(scroller);


				// Bold labels
				main_paragraph.find('label').css('font-weight','bold').css("padding-top","14px").css('margin','0px');

				scroller.append(main_paragraph);

				// Resize when new elements load
				$(main_paragraph).find('*').load(function(){ $(window).trigger("resize"); });

				// Resize anyways! in case there was nothing to load from above
				$(window).trigger("resize");
				
				// Hide and stop loading
				KU.hideLoading(domId);
				KU.Events.loading = false;
			},
			
			error: function(data){
				
				KU.showGlobalError();
				KU.hideLoading(domId);
				KU.Events.loading = false;
			}
		});	
	},
	
	
	
	/******************************************************************************/
	/**  Called on create of an article page. Mainly this function just
	 *   attempts to download the article and show it. 
	 *
	 *   @param {Event} event - jQM event, not actually being
	 *          not actually being used by us at the moment. 
	 *   @event
	 ******************************************************************************/
	articlePageCreate: function(event){
								
		// Always use iScroll here
		KU.fixIscroll('#' + this.id);
		
		// Download article into ID, with mylink as source
		KU.Events.downloadArticle(this.id, $('#' + this.id).attr("mylink"));
	},
	
	
	
	/******************************************************************************/
	/**  Called on init of an article page. Mainly this function just
	 *   sets up an iScroll with the proper configuration.
	 *
	 *   @param {Event} event - jQM event, not actually being
	 *          not actually being used by us at the moment. 
	 *   @event
	 ******************************************************************************/
	articlePageInit: function(event){
							
		// Fancy iScroll options
		$('#' + this.id + " .iscroll-wrapper").data("mobileIscrollview").iscroll.options.zoom = true;
		$('#' + this.id + " .iscroll-wrapper").data("mobileIscrollview").iscroll.options.hScroll = true;
		$('#' + this.id + " .iscroll-wrapper").data("mobileIscrollview").iscroll.options.hScrollbar = true;
	},
	
	
	
	/******************************************************************************/
	/**  Downloads the next page in order to gain another 10 articles
	 *   as part of the article list for the main events page. Note that
	 *   there are no arguments, but the function uses namespace members
	 *   such as {@link KU.Events.page} and {@link KU.Events.queue}.
	 ******************************************************************************/
	getNextPage: function (){
  	
		if(!this.loading){
			
			// Now loading
			this.loading = true;
			
			// Empty queue?
			if(this.queue <= 0){ 
				
				// Initialize the queue
				// start with default pages
				// show loading indicator!
				this.queue = KU.PAGES_TO_LOAD;
				KU.showLoading("events-header");
			}
			
			$.ajax({
				url: 'http://www.kettering.edu/events?page=' + KU.Events.page,
				type: 'GET',
				dataType: 'html',
				success: function(data) {
					
					KU.Events.page++;
					
					// Go through each events item
					$("<div>").html(data).find('.views-row').each(
						function(index){
							
							// Get first image or use default
							if($('img',this).length > 0) var source = $('img',this).eq(0).attr('src');
							else var source = '';
							
							// Default icon (no need to load)
							if(source == '/sites/all/themes/kettering/images/events/default_event_icon.jpg' || source == ''){
								source = 'images/default_icon.jpg';
							}
							
							// Title and info
							var title = $('h3', this).text();
							var info = $('.info', this).text();
							var pageid = 'events-' + KU.Events.page + '-' + index;
							var article_link = $('h3 a', this).attr('href');
							
							// Make link
							var link = $('<a></a>',{
								'class':"grey-grad",
								'style':"min-height:4.6em;",
								'data-transition':'none',
								'href':'#' + pageid
							});
							
							// Make img
							$('<img></img>',{
								'class':"ui-li-icon events-icon",
								'src': source
							}).appendTo(link);
							
							var textContainer = $('<div></div>', {
								'class':'main-text',
								'style':'line-height:1.1em!important;'
							}).appendTo(link);
							
							// Make h1
							$('<h1></h1>',{
								'style':'white-space:normal',
								'text': title
							}).appendTo(textContainer);
							
							// Make p
							$('<p></p>',{
								'style':'white-space:normal',
								'text': info
							}).appendTo(textContainer);
							
							
							var page = $('<div></div>',{
								'class':"grey-uniform",
								'data-role':'page',
								'data-transition':'none',
								'mylink':article_link,
								'id': pageid
							});

							// User previous header!
							$("#events-header").clone().appendTo(page);
							
							// Make page scroller
							var page_scroller = $('<div></div>',{
								'id': pageid + '-scroller',
								'class': 'scroller'
							}).appendTo(page);
							

							// Article Page Create
							$(document).on("pagecreate",'#' + pageid, KU.Events.articlePageCreate);


							// Article Page Init
							$(document).on("pageinit",'#' + pageid, KU.Events.articlePageInit);
							
							// First event on that day?
							if($(this).hasClass('views-row-1')){
							
								// Get month, day
								var month = $('.datebox',this).find('.month').text();
								var day = $('.datebox',this).find('.lower .dow').text();
								
								// Replace (funny way to do this...)
								month = month.replace('Jan','January');
								month = month.replace('Feb','February');
								month = month.replace('Mar','March');
								month = month.replace('Apr','April');
								month = month.replace('Jun','June');
								month = month.replace('Jul','July');
								month = month.replace('Aug','August');
								month = month.replace('Sep','September');
								month = month.replace('Oct','October');
								month = month.replace('Nov','Novemeber');
								month = month.replace('Dec','December');
								
								// Day of the week
								dayOfWeek = $('<div></div>',{
									'text': day
								});
								
								// Day of the month
								monthDay = $('<div></div>',{
									'style':'float:right',
									'text': month + " " + $('.datebox',this).find('.day').text()
								});
								
								// Create the date bar as divider!
								var date_bar = $('<li></li>',{
									'data-role': 'list-divider',
									'class':"read-only-grad date-bar",
									'id':month +  $('.datebox',this).find('.day').text()
								}).append(monthDay).append(dayOfWeek);
								
								
								// Add the date_bar to the queue only if it does NOT already exist
								if($("#" + month +  $('.datebox',this).find('.day').text()).length == 0
									&& KU.Events.latestDividerMonth != month +  $('.datebox',this).find('.day').text()){
									
									// If no lists then make them!
									if(KU.Events.listQueue==null) KU.Events.listQueue = new Array();
									if(KU.Events.pageQueue==null) KU.Events.pageQueue = new Array();
									
									// Add the item to the queue to be added after complete download
									KU.Events.listQueue[KU.Events.listQueue.length] = date_bar;	
								}
								
								KU.Events.latestDividerMonth = month +  $('.datebox',this).find('.day').text();
								
							}
							
							
							// Finally append link into a list item
							var listitem = $('<li></li>').append(link);
							
							// If no lists then make them!
							if(KU.Events.listQueue==null) KU.Events.listQueue = new Array();
							if(KU.Events.pageQueue==null) KU.Events.pageQueue = new Array();
							
							// Add the item to the queue to be added after complete download
							// NOTE: This is intentional so the DOM processing does not create
							// a lag and unfriendly experience, we process all at the end
							KU.Events.listQueue[KU.Events.listQueue.length] = listitem;
							KU.Events.pageQueue[KU.Events.pageQueue.length] = page;
											
						}
					);
				  
					KU.Events.loading = false;	// not loading
					KU.Events.queue--;			// one less in the queue!
					
					// Last in the queue?		
					if(KU.Events.queue <= 0){
						KU.hideLoading("events-header");
						
						// Go through all items in the list queue
						for(var index = 0; index < KU.Events.listQueue.length; index++){
							
							// Append to list
							KU.Events.listQueue[index].appendTo('#events-list');		
						}
													
						// Go through all pages in the queue
						
						for(var index = 0; index < KU.Events.pageQueue.length; index++){
							
							// Append to the body
							KU.Events.pageQueue[index].appendTo('body');		
						}
						
						// Refresh and create new arrays
						$('#events-list').listview('refresh');
						KU.Events.listQueue = new Array();
						KU.Events.pageQueue = new Array();
					
					}
					
					// More in the queue? Cool, grab another page. 
					else KU.Events.getNextPage();
					
				},
					
				error: function(data){
					KU.showGlobalError();
					KU.hideLoading("events-header");
					KU.Events.loading = false;
				}
			});
		}
	}
};