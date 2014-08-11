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

/**********************************************************
 * KU Events
 *********************************************************/
var KU_Events = {
	page: 0,					// last page downloaded
	queue: 0,					// queue of pages that need downloading
	loading: false,				// is events loading ?
	LOAD_THRESHOLD_PX: 660,		// pixels from the bottom trigger load
	
	/**********************************************************
	 * Download article
	 *********************************************************/
	downloadArticle:function (id, link){
	
		// Now loading
		this.loading = true;
	
		$.ajax({
			url: 'http://www.kettering.edu/' + link,
			type: 'GET',
			dataType: 'html',
			beforeSend: function(){
				KU_Mods.showLoading(id);
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
				var scroller = $('#' + id + "-scroller");	   

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
				KU_Mods.hideLoading(id);
				KU_Events.loading = false;
			},
			
			error: function(data){
				
				KU_Config.showGlobalError();
				KU_Mods.hideLoading(id);
				KU_Events.loading = false;
			}
		});	
	},
	
	/**********************************************************
	 * Get next page
	 *********************************************************/
	getNextPage: function (){
  	
		if(!this.loading){
			
			// Now loading
			this.loading = true;
			
			// Empty queue?
			if(this.queue <= 0){ 
				
				// Initialize the queue
				// start with default pages
				// show loading indicator!
				this.queue = KU_Config.PAGES_TO_LOAD;
				KU_Mods.showLoading("events-header");
			}
			
			$.ajax({
				url: 'http://www.kettering.edu/events?page=' + KU_Events.page,
				type: 'GET',
				dataType: 'html',
				success: function(data) {
					
					KU_Events.page++;
					
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
							var pageid = 'events-' + KU_Events.page + '-' + index;
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
							
							/**********************************************************
							 * Article Page Create
							 *********************************************************/
							$(document).on("pagecreate",'#' + pageid,function(event){
								
								// Always use iScroll here
								KU_Mods.fixIscroll('#' + pageid);
								
								// Download article into ID, with mylink as source
								KU_Events.downloadArticle(this.id, $('#' + this.id).attr("mylink"));
							});

							/**********************************************************
							 * Article Page Init
							 *********************************************************/
							$(document).on("pageinit",'#' + pageid,function(event){
								
								// Fancy iScroll options
								$('#' + pageid + " .iscroll-wrapper").data("mobileIscrollview").iscroll.options.zoom = true;
								$('#' + pageid + " .iscroll-wrapper").data("mobileIscrollview").iscroll.options.hScroll = true;
								$('#' + pageid + " .iscroll-wrapper").data("mobileIscrollview").iscroll.options.hScrollbar = true;
							});
							
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
									&& KU_Events.latestDividerMonth != month +  $('.datebox',this).find('.day').text()){
									
									// If no lists then make them!
									if(KU_Events.listQueue==null) KU_Events.listQueue = new Array();
									if(KU_Events.pageQueue==null) KU_Events.pageQueue = new Array();
									
									// Add the item to the queue to be added after complete download
									KU_Events.listQueue[KU_Events.listQueue.length] = date_bar;	
								}
								
								KU_Events.latestDividerMonth = month +  $('.datebox',this).find('.day').text();
								
							}
							
							
							// Finally append link into a list item
							var listitem = $('<li></li>').append(link);
							
							// If no lists then make them!
							if(KU_Events.listQueue==null) KU_Events.listQueue = new Array();
							if(KU_Events.pageQueue==null) KU_Events.pageQueue = new Array();
							
							// Add the item to the queue to be added after complete download
							// NOTE: This is intentional so the DOM processing does not create
							// a lag and unfriendly experience, we process all at the end
							KU_Events.listQueue[KU_Events.listQueue.length] = listitem;
							KU_Events.pageQueue[KU_Events.pageQueue.length] = page;
											
						}
					);
				  
					//setTimeout(function(){
						
						KU_Events.loading = false;	// not loading
						KU_Events.queue--;			// one less in the queue!
						
						// Last in the queue?		
						if(KU_Events.queue <= 0){
							KU_Mods.hideLoading("events-header");
							
							// Go through all items in the list queue
							for(var index = 0; index < KU_Events.listQueue.length; index++){
								
								// Append to list
								KU_Events.listQueue[index].appendTo('#events-list');		
							}
														
							// Go through all pages in the queue
							
							for(var index = 0; index < KU_Events.pageQueue.length; index++){
								
								// Append to the body
								KU_Events.pageQueue[index].appendTo('body');		
							}
							
							// Refresh and create new arrays
							$('#events-list').listview('refresh');
							KU_Events.listQueue = new Array();
							KU_Events.pageQueue = new Array();
						
						}
						
						// More in the queue? Cool, grab another page. 
						else KU_Events.getNextPage();
					//}, KU_Config.LOAD_INDICATOR_DELAY);        
				},
					
				error: function(data){
					KU_Config.showGlobalError();
					KU_Mods.hideLoading("events-header");
					KU_Events.loading = false;
				}
			});
		}
	}
};

/**********************************************************
 * Events page init
 *********************************************************/
$(document).on("pageinit","#events",function(event){
	
	// Need to initialize iScroll scrolling?
	if(KU_Config.ISCROLL){
		
		/**********************************************************
		 * Check iScroll position
		 *********************************************************/
		var checkScroll = function (e,d){

			// Calculate current and maximum y coordinate
			var max = d.iscrollview.maxScrollY()*-1;
			var current = d.iscrollview.y()*-1;
			
			if(!KU_Events.loading && current > (max - KU_Events.LOAD_THRESHOLD_PX) && $('#events').is(':visible') 
				&& !(KU_Events.loading)){
				
				// Get next page then refresh iScroll
				KU_Events.getNextPage();
				d.iscrollview.refresh();
			}
		}
		
		// Bind check scroll to moving and ending events
		$("#events .iscroll-wrapper").bind({
			"iscroll_onscrollmove": checkScroll,
			"iscroll_onscrollend": checkScroll,
		});
	}
	
	// Regular overflow scrolling
	else{
		
		/**********************************************************
		 * Check overflow scroll position
		 *********************************************************/
		$('#events-scroller').on("scrollstop",function(){
		
			var scrollPosition = $('#events-scroller').scrollTop() + $('#events-scroller').outerHeight();

			// Break threshold?
			if($('#events-list').height() < (KU_Events.LOAD_THRESHOLD_PX + $('#events-scroller').scrollTop() 
				+ $('#events-scroller').outerHeight()) && $('#events').is(':visible') && !(KU_Events.loading)){

				// Get the next page!
				KU_Events.getNextPage();
			}
		});
	}
});

/**********************************************************
 * Events page create
 *********************************************************/
$(document).on("pagecreate","#events",function(event){

	// Fix iScroll?
	if(KU_Config.ISCROLL) KU_Mods.fixIscroll("#events");
	
	// Resize and get first page for overflow
	else $(window).trigger("throttledresize");
	KU_Events.getNextPage();
});