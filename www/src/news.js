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
/**  Contains all news related functions for loading and controlling the news page.
 *   @namespace
 ******************************************************************************/
KU.News = {
 
 
 
	/******************************************************************************/
	/**  Stores the last page number downloaded as denoted from Kettering's
	 *   news website kettering.edu/news/current-news. Indexing starts off
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
	/**  Tells whether or not news is currently attempting to download
	 *   or parse article lists. Essentially used to tell whether news is
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
	/**  Triggered when the news page is first initialized based on 
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
			$("#news .iscroll-wrapper").bind({
				"iscroll_onscrollmove": KU.News.checkIScroll,
				"iscroll_onscrollend": KU.News.checkIScroll,
			});
		}
		
		// Regular overflow scrolling
		else{
			
			
			// Check overflow scroll position
			$('#news-scroller').on("scroll", KU.News.checkScroll);
		}
	},
	
	
	
	/******************************************************************************/
	/**  Triggered when the news page is first created based on 
	 *   jQM page create event. 
	 *
	 *   @param {Event} event - jQM event, not actually being
	 *          used by us at the moment. 
	 *   @event
	 ******************************************************************************/
	pageCreate: function(event){
	
		// Fix iScroll?
		if(KU.ISCROLL) KU.fixIscroll("#news"); 
		
		// Resize and get first page for overflow
		else $(window).trigger("throttledresize");
		KU.News.getNextPage(); 
		
	},
	
	
	
	/******************************************************************************/
	/**  Triggered when regular scroll event happens in news scroller window
	 *   This should be used for most, or all, modern devices that support it.
	 *   Note: this detection is setup in {@link KU.ISCROLL} using
	 *   overthrow-detect library.
	 * 
	 *   @param {Object} event - event properties, not used
	 *   @event
	 ******************************************************************************/
	checkScroll: function(event){
				
		var scrollPosition = $('#news-scroller').scrollTop() + $('#news-scroller').outerHeight();

		// Break threshold?
		if($('#news-list').height() < (KU.News.LOAD_THRESHOLD_PX + $('#news-scroller').scrollTop() + 
			$('#news-scroller').outerHeight()) && $('#news').is(':visible') && !(KU.News.loading)){
			
			// Get the next page!
			KU.News.getNextPage();
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
		if(!KU.News.loading && current > (max - KU.News.LOAD_THRESHOLD_PX) && $('#news').is(':visible') 
			&& !(KU.News.loading)){
			
			// Get next page then refresh iScroll
			KU.News.getNextPage();
			d.iscrollview.refresh();
		}
	},
	
	
	
	/******************************************************************************/
	/**  Downloads and parses a Kettering news article in order to display
	 *   detailed article to the user. Usually this is triggered by a user
	 *   clicking on an article link from the main news page.
	 *
	 *   @param {string} domId - The article DOM identifier for the link that
	 *          was clicked by the user (e.g in html format, id="News-1-0")
	 *          which represents the first page article 0.
	 *   @param {string} link - Directly link to the news article located on
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
		
				// Before downloading, we should show the loading dialog on the
				// correct page
				KU.showLoading(domId);
			},
			
			success: function(data) {
			
				// Load downloaded document
				var doc = $("<div>").html(data);
				
				// Get necessary information
				var main_paragraph = doc.find('.field.field-name-body.field-type-text-with-summary.field-label-hidden');
				var title = doc.find('.news').text();
				var info = doc.find('.info').text();
				
				
				// Fix max width and height
				main_paragraph.find('*').css("max-width", "100%").css("height","auto");

				// Remove hard-coded width from table
				main_paragraph.find('table').css('width','');
				main_paragraph.css('padding','4px');

				// Get scroller content
				var scroller = $("#" + domId + "-scroller");

				// Make h1
				var header = $('<h2></h2>',{
					'style':'margin:0px;white-space:normal;padding-top:15px;padding-bottom:15px;padding-left:8px;padding-right:8px;',
					'text': title
				}).appendTo(scroller);

				// Make info
				var infoH4 = $('<h4></h4>',{
					'style':'margin:0px;white-space:normal;font-weight:normal;padding-top:15px;padding-bottom:15px;padding-left:8px;padding-right:8px;',
					'text': info
				}).appendTo(scroller);

				scroller.append(main_paragraph);

				// Resize when new elements load
				$(main_paragraph).find('*').load(function(){ $(window).trigger("resize");});
				
				// Resize anyways! in case there was nothing to load from above
				$(window).trigger("resize");
					
				// Hide and stop loading
				KU.hideLoading(domId);
				KU.News.loading = false;
			},

			error: function(data){
			
				KU.showGlobalError();
				KU.hideLoading(domId);
				KU.News.loading = false;
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
		KU.News.downloadArticle(this.id, $('#' + this.id).attr("mylink"));
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
	 *   as part of the article list for the main news page. Note that
	 *   there are no arguments, but the function uses namespace members
	 *   such as {@link KU.News.page} and {@link KU.News.queue}.
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
				KU.showLoading("news-header");
			}
			
			// Found at least one occasion where ?page=0 was different than default
			// site, ../news/current-news seems more reliable
			if(this.page != 0) var url = 'http://www.kettering.edu/news/current-news?page=' + this.page;
			else var url = 'http://www.kettering.edu/news/current-news';
			
			$.ajax({
				url: url,
				type: 'GET',
				dataType: 'html',
				success: function(data) {
					
					KU.News.page++;
			
					// Go through each news item
					$("<div>").html(data).find('.news-caption').each(
						function(index){
							
							// Get first image or use default
							if($('img',this).length > 0) var source = $('img',this).eq(0).attr('src');
							else var source = 'images/default_icon.jpg';
							
							// Setup item information
							var title = $('h3', this).text();
							var info = $('.info', this).text();
							var pageid = 'news-' + KU.News.page + '-' + index;
							var article_link = $('.more', this).attr('href');
							
							// Make link
							var link = $('<a></a>',{
								'class':"grey-grad",
								'style':"min-height:4.6em;",
								'data-transition':'none',
								'href':'#' + pageid
							});
							
							// Make img
							$('<img></img>',{
								'class':"ui-li-icon news-icon",
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
								'mylink':article_link,
								'id': pageid
							});
							
							// User previous header!
							$("#news-header").clone().appendTo(page);
							
							
							// Make page scroller
							$('<div></div>',{
								'id': pageid + '-scroller',
								'class': 'scroller'
							}).appendTo(page);
							
						
							// Article Page Create	
							$(document).on("pagecreate",'#' + pageid, KU.News.articlePageCreate);
							
							// Article Page Init
							$(document).on("pageinit",'#' + pageid, KU.News.articlePageInit);
							
							// Finally append link into a list item
							var listitem = $('<li></li>').append(link);
							
							// If no lists then make them!
							if(KU.News.listQueue==null) KU.News.listQueue = new Array();
							if(KU.News.pageQueue==null) KU.News.pageQueue = new Array();
							
							// Add the item to the queue to be added after complete download
							// NOTE: This is intentional so the DOM processing does not create
							// a lag and unfriendly experience, we process all at the end
							KU.News.listQueue[KU.News.listQueue.length] = listitem;
							KU.News.pageQueue[KU.News.pageQueue.length] = page;
						}	
					);
					
						
					KU.News.loading = false;	// not loading
					KU.News.queue--;			// one less in the queue!
					
					// Last in the queue?
					if(KU.News.queue <= 0){
						
						KU.hideLoading("news-header");

						// Go through all items in the list queue
						for(var index = 0; index < KU.News.listQueue.length; index++){
							
							// Append to list
							KU.News.listQueue[index].appendTo('#news-list');		
						}
						
						// Go through all pages in the queue
						for(var index = 0; index < KU.News.pageQueue.length; index++){
						
							// Append to the body
							KU.News.pageQueue[index].appendTo('body');		
						}
						
						// Refresh and create new arrays
						$('#news-list').listview('refresh');
						KU.News.listQueue = new Array();
						KU.News.pageQueue = new Array();
					}
					
					// More in the queue? Cool, grab another page. 
					else KU.News.getNextPage();
					
				},
				
				error: function(data){
				
					KU.showGlobalError();
					KU.hideLoading("news-header");
					KU.News.loading = false;
				}
			});	
		}
	}
};


/*
var load = 0;

function getSchedule(username, password){
	
	var frameName = "temporaryFrame";
	
	$(document.body).append("<iframe style='display:none' id='" + frameName + "' src='https://jweb.kettering.edu/cku1/twbkwbis.P_WWWLogin'>");
	
	$('iframe#' + frameName).load(function() {

		if(load == 0){
			$('iframe#' + frameName).attr('src', "https://jweb.kettering.edu/cku1/twbkwbis.P_ValLogin?sid=" + username + "&PIN=" + password);
			load++;
		}
		else if(load == 1){
			alert("HI");
			load++;
		
		}
		else if(load == 2){
			alert("Signed in...");
			$.ajax({
				url: 'https://jweb.kettering.edu/cku1/bwskfshd.P_CrseSchd',
				type: 'GET',
				dataType: 'html',
				success: function(data) {
					
					// Load downloaded document
					var doc = $("<div>").html(data);
					
					alert(doc.find(".ddlabel").text());
				}
			});		
		}
    });	
}
*/