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
 * KU News
 *********************************************************/
 var KU_News = {
	
	page: 0,					// last page downloaded
	queue: 0,					// queue of pages that need downloading
	loading: false,				// is news loading ?
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
				var main_paragraph = doc.find('.field.field-name-body.field-type-text-with-summary.field-label-hidden');
				var title = doc.find('.news').text();
				var info = doc.find('.info').text();
				
				
				// Fix max width and height
				main_paragraph.find('*').css("max-width", "100%").css("height","auto");

				// Remove hard-coded width from table
				main_paragraph.find('table').css('width','');
				main_paragraph.css('padding','4px');

				// Get scroller content
				var scroller = $("#" + id + "-scroller");

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

				// TODO calculate time here so the delay is *ONLY* a minimum not addition
				//setTimeout(function(){
					
					// Hide and stop loading
					KU_Mods.hideLoading(id);
					KU_News.loading = false;
				//}, KU_Config.LOAD_INDICATOR_DELAY);
			},

			error: function(data){
			
				KU_Config.showGlobalError();
				KU_Mods.hideLoading(id);
				KU_News.loading = false;
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
				KU_Mods.showLoading("news-header");
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
					
					KU_News.page++;
			
					// Go through each news item
					$("<div>").html(data).find('.news-caption').each(
						function(index){
							
							// Get first image or use default
							if($('img',this).length > 0) var source = $('img',this).eq(0).attr('src');
							else var source = 'images/default_icon.jpg';
							
							// Setup item information
							var title = $('h3', this).text();
							var info = $('.info', this).text();
							var pageid = 'news-' + KU_News.page + '-' + index;
							var article_link = $('.more', this).attr('href');
							
							// Make link
							var link = $('<a></a>',{
								'class':"grey-grad",
								'style':"min-height:66px;",
								'data-transition':'none',
								'href':'#' + pageid
							});
							
							// Make img
							$('<img></img>',{
								'class':"ui-li-icon news-icon",
								'src': source
							}).appendTo(link);
							
							// Make h1
							$('<h1></h1>',{
								'class':"main-text",
								'style':'white-space:normal',
								'text': title
							}).appendTo(link);
							
							// Make p
							$('<p></p>',{
								'class':'main-text',
								'text': info
							}).appendTo(link);
							
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
							
							/**********************************************************
							 * Article Page Create
							 *********************************************************/
							$(document).on("pagecreate",'#' + pageid, function(event){
								
								// Always use iScroll here
								KU_Mods.fixIscroll('#' + pageid);
								
								// Download article into ID, with mylink as source
								KU_News.downloadArticle(this.id, $('#' + this.id).attr("mylink"));
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
							
							// Finally append link into a list item
							var listitem = $('<li></li>').append(link);
							
							// If no lists then make them!
							if(KU_News.listQueue==null) KU_News.listQueue = new Array();
							if(KU_News.pageQueue==null) KU_News.pageQueue = new Array();
							
							// Add the item to the queue to be added after complete download
							// NOTE: This is intentional so the DOM processing does not create
							// a lag and unfriendly experience, we process all at the end
							KU_News.listQueue[KU_News.listQueue.length] = listitem;
							KU_News.pageQueue[KU_News.pageQueue.length] = page;
						
						}	
					);
					

					//setTimeout(function(){
						
						KU_News.loading = false;	// not loading
						KU_News.queue--;			// one less in the queue!
						
						// Last in the queue?
						if(KU_News.queue <= 0){
							
							KU_Mods.hideLoading("news-header");

							// Go through all items in the list queue
							for(var index = 0; index < KU_News.listQueue.length; index++){
								
								// Append to list
								KU_News.listQueue[index].appendTo('#news-list');		
							}
							
							// Go through all pages in the queue
							for(var index = 0; index < KU_News.pageQueue.length; index++){
							
								// Append to the body
								KU_News.pageQueue[index].appendTo('body');		
							}
							
							// Refresh and create new arrays
							$('#news-list').listview('refresh');
							KU_News.listQueue = new Array();
							KU_News.pageQueue = new Array();
							
						}
						
						// More in the queue? Cool, grab another page. 
						else KU_News.getNextPage();
						
					//}, KU_Config.LOAD_INDICATOR_DELAY);
				},
				
				error: function(data){
				
					KU_Config.showGlobalError();
					KU_Mods.hideLoading("news-header");
					KU_News.loading = false;
				}
			});	
		}
	}
};

/**********************************************************
 * News page init
 *********************************************************/
$(document).on("pageinit","#news",function(event){

	// Need to initialize iScroll scrolling?
	if(KU_Config.ISCROLL){
		
		/**********************************************************
		 * Check iScroll position
		 *********************************************************/
		var checkScroll = function (e,d){

			// Calculate current and maximum y coordinate
			var max = d.iscrollview.maxScrollY()*-1;
			var current = d.iscrollview.y()*-1;
			
			// At or past the threshold?
			if(!KU_News.loading && current > (max - KU_News.LOAD_THRESHOLD_PX) && $('#news').is(':visible') 
				&& !(KU_News.loading)){
				
				// Get next page then refresh iScroll
				KU_News.getNextPage();
				d.iscrollview.refresh();
			}
		}
		
		// Bind check scroll to moving and ending events
		$("#news .iscroll-wrapper").bind({
			"iscroll_onscrollmove": checkScroll,
			"iscroll_onscrollend": checkScroll,
		});
	}
	
	// Regular overflow scrolling
	else{
		
		/**********************************************************
		 * Check overflow scroll position
		 *********************************************************/
		$('#news-scroller').on("scroll",function(event){
			
			var scrollPosition = $('#news-scroller').scrollTop() + $('#news-scroller').outerHeight();

			// Break threshold?
			if($('#news-list').height() < (KU_News.LOAD_THRESHOLD_PX + $('#news-scroller').scrollTop() + 
				$('#news-scroller').outerHeight()) && $('#news').is(':visible') && !(KU_News.loading)){
				
				// Get the next page!
				KU_News.getNextPage();
			}
		});
	}
});

/**********************************************************
 * News page create
 *********************************************************/
$(document).on("pagecreate","#news",function(event){
	
	// Fix iScroll?
	if(KU_Config.ISCROLL) KU_Mods.fixIscroll("#news"); 
	
	// Resize and get first page for overflow
	else $(window).trigger("throttledresize");
	KU_News.getNextPage(); 
});