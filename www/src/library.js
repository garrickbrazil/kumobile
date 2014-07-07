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
 * KU Library
 *********************************************************/
 var KU_Library = {
	
	page: 0,							// last page downloaded
	type:'GENERAL^SUBJECT^GENERAL'+		// type, topic identifier
		'^^words or phrase',	
	lastValue:'',						// last value searched!
	lastestAction:'',					// latest action (contains key)
	loading: false,						// is library loading ?
	LOAD_THRESHOLD_PX: 660,				// pixels from the bottom trigger load
	reachedEnd: false,					// have we reached the end?
	typing: false,						// currently typing?
	
	/**********************************************************
	 * Get next page
	 *********************************************************/
	getNextPage: function (){

		if(!this.loading){
			
			// Now loading
			this.loading = true;
			KU_Mods.showLoading("library-header");
				
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
				var url = "http://catalog.palnet.info" + this.lastestAction + "?"
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
					KU_Library.reachedEnd = (hitlist.length < 20);
					
					// Snag the action for this session?
					if(KU_Library.page == 0){
						KU_Library.lastestAction = downloaded.find("#hitlist").first().attr("action");
					}
			
					// Next page
					KU_Library.page++;
			
					// Go through each library item
					hitlist.each(
						function(index){
							
							// Defaults
							var padding = 76;
							var minH = "120px;";
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
							
							
							// Make h1
							$('<h1></h1>',{
								'class':"main-text",
								'style':'white-space:normal;padding-left:' + padding + 'px!important;',
								'text': title
							}).appendTo(listitem);
							
							// Make p
							$('<p></p>',{
								'class':'main-text',
								'text': "By " + author,
								'style': 'padding-left:' + padding + 'px!important;'
							}).appendTo(listitem);
							
							// Make p
							$('<p></p>',{
								'class':'main-text',
								'text': "Call number: " + call_number,
								'style': 'white-space:normal;padding-left:' + padding + 'px!important;'
							}).appendTo(listitem);
							
							// Make p
							$('<p></p>',{
								'class':'main-text',
								'text': holdings_statement,
								'style': 'white-space:normal;padding-left:' + padding + 'px!important;'
							}).appendTo(listitem);
							
							
							// If no lists then make them!
							if(KU_Library.listQueue==null) KU_Library.listQueue = new Array();
							
							// Add the item to the queue to be added after complete download
							// NOTE: This is intentional so the DOM processing does not create
							// a lag and unfriendly experience, we process all at the end
							KU_Library.listQueue[KU_Library.listQueue.length] = listitem;
						
						}	
					);
					
	
					KU_Library.loading = false;	// not loading
					
						
					KU_Mods.hideLoading("library-header");

					// Go through all items in the list queue
					for(var index = 0; index < KU_Library.listQueue.length; index++){
						
						// Append to list
						KU_Library.listQueue[index].appendTo('#library-list');		
					}
					
					// Refresh and create new arrays
					$('#library-list').listview('refresh');
					KU_Library.listQueue = new Array();
						
					
				},
				
				error: function(data){
				
					KU_Mods.hideLoading("library-header");
					KU_Library.loading = false;
				}
			});	
		}
	},
	
	/**********************************************************
	 * Reinitialize
	 *********************************************************/
	reinitialize: function(){
		
		this.listQueue = new Array();
		this.page = 0;
		this.loading = false;
		this.reachedEnd = false;
		
		// Clear previous scrollbar!
		if(KU_Config.ISCROLL) $(window).trigger("resize");
	}
};


/**********************************************************
 * Library page init
 *********************************************************/
$(document).on("pageinit","#library",function(event){
	
	// Bug in JQM? Clear button flashes when loading page?
	// This line will fix it.
	$("#library .ui-input-clear").addClass("ui-input-clear-hidden");
	
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
			if(!KU_Library.loading && current > (max - KU_Library.LOAD_THRESHOLD_PX) 
				&& $('#library').is(':visible') && !(KU_Library.typing)
				&& !(KU_Library.loading) && !(KU_Library.reachedEnd)){
				
				// Get next page then refresh iScroll
				KU_Library.getNextPage();
				d.iscrollview.refresh();
			}
		}
		
		// Bind check scroll to moving and ending events
		$("#library .iscroll-wrapper").bind({
			"iscroll_onscrollmove": checkScroll,
			"iscroll_onscrollend": checkScroll,
		});
	}
	
	// Regular overflow scrolling
	else{
		
		/**********************************************************
		 * Check overflow scroll position
		 *********************************************************/
		$('#library-scroller').on("scroll",function(event){
			
			var scrollPosition = $('#library-scroller').scrollTop() 
								 + $('#library-scroller').outerHeight();

			// Break threshold?
			if($('#library-list').height() < (KU_Library.LOAD_THRESHOLD_PX 
				+ $('#library-scroller').scrollTop() + $('#library-scroller').outerHeight()) && !(KU_Library.typing)
				&& $('#library').is(':visible') && !(KU_Library.loading) && !(KU_Library.reachedEnd)){
				
				// Get the next page!
				KU_Library.getNextPage();
			}
		});
	}
	
});


/**********************************************************
 * Library page create
 *********************************************************/
$(document).on("pagecreate","#library",function(event){
	
	// Fix iScroll?
	if(KU_Config.ISCROLL) KU_Mods.fixIscroll("#library"); 
	
	// Resize and get first page for overflow
	$(window).trigger("resize");
	
	
	// Trigger for change in type select
	$("#library-select").bind("change", function(e,u){
	
		// Definitely a change?
		if(this.value != KU_Library.type){		
	
			// Clear timeout and ajax
			if(KU_Library.timeoutSent) clearTimeout(KU_Library.timeoutSent);
			if(KU_Library.sentAjax) KU_Library.sentAjax.abort();
			
			// Change type then reinitialize
			KU_Library.type = this.value;	
			KU_Library.reinitialize();
			
			// Download results
			KU_Library.getNextPage();
		}
	});
	
	// Trigger for direct change in search box
	$("#library-search").bind("change", function(e,u){
		
		// Definitely a change?
		if(this.value != KU_Library.lastValue){
		
			// Clear timeout and ajax
			if(KU_Library.timeoutSent) clearTimeout(KU_Library.timeoutSent);
			if(KU_Library.sentAjax) KU_Library.sentAjax.abort();
			
			// Change last value and reinitialize
			KU_Library.lastValue = this.value;
			KU_Library.reinitialize();
			
			// Download results
			KU_Library.getNextPage();
		}
	});
	
	// Trigger for incremental change in search box
	$("#library-search").keyup( function() {
		
		// Definitely a change?
		if(this.value != KU_Library.lastValue){
		
			// Store value
			KU_Library.lastValue = this.value;
		
			// Clear timeout
			if(KU_Library.timeoutSent) clearTimeout(KU_Library.timeoutSent);
			KU_Library.typing = true;
			
			KU_Library.timeoutSent = setTimeout(function(latestValue){
				
				// Definitely not a change?
				if(latestValue == KU_Library.lastValue){
					
					// Abort ajax
					if(KU_Library.sentAjax) KU_Library.sentAjax.abort();
					
					// Save new value, reinit, download
					KU_Library.lastValue = latestValue;
					KU_Library.reinitialize();
					KU_Library.getNextPage();
				}
				
				KU_Library.typing = false;
				
			}, KU_Config.INCR_WAIT_TIME, this.value);
		}
	});
	
	// Get page when page is first created
	KU_Library.getNextPage(); 
});