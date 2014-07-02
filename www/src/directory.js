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
 * KU Directory
 *********************************************************/
 var KU_Directory = {
	
	page: 0,					// last page downloaded
	queue: 0,					// queue of pages that need downloading
	tid:'All',					// tid, topic identifier
	lastValue:'',				// last value searched!
	loading: false,				// is directory loading ?
	LOAD_THRESHOLD_PX: 660,		// pixels from the bottom trigger load
	reachedEnd: false,			// have we reached the end?
	typing: false,						// currently typing?
	
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
				// show loading indicator!
				this.queue = KU_Config.PAGES_TO_LOAD;
				KU_Mods.showLoading("directory-header");
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
					KU_Directory.page++;
					
					// Check for end? Reset queue if true
					var downloaded = $("<div>").html(data).find('.directory-caption');
					KU_Directory.reachedEnd = (downloaded.length < 10);					
					if(KU_Directory.reachedEnd) KU_Directory.queue = 0;

			
					// Go through each directory item
					downloaded.each(
						function(index){
							
							// Defaults
							var padding = 76;
							var minH = "120px;";
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
							
							// Make h1
							$('<h1></h1>',{
								'class':"main-text",
								'style':'white-space:normal;padding-left:' + padding + 'px!important;',
								'text': title
							}).appendTo(listitem);
							
							$('.inside span', this).each(
								function(i){
									
									
									var info = $(this).clone().children().remove().end().text();
									var bold = $(this).hasClass("bold");
									if($(this).hasClass("obfuscated")){
										info = info.split("").reverse().join("");
										info = KU_Mods.ketteringObfuscate(info);
									}
									
									//info = info.replace("1700 University Ave",""); 
									
									if(!(info.replace(/\s+/g, '') == "" || $(this).find('.tel').length > 0)){
										// Make p
										$('<p></p>',{
											'class':'main-text',
											'text': info,
											'style': (bold)?('font-weight:bold;padding-left:' + padding + 'px!important;'):('padding-left:' + padding + 'px!important;')
										}).appendTo(listitem);
									}
							});
							
							// If no lists then make them!
							if(KU_Directory.listQueue==null) KU_Directory.listQueue = new Array();
							
							// Add the item to the queue to be added after complete download
							// NOTE: This is intentional so the DOM processing does not create
							// a lag and unfriendly experience, we process all at the end
							KU_Directory.listQueue[KU_Directory.listQueue.length] = listitem;
						
						}	
					);
					
	
					KU_Directory.loading = false;	// not loading
					KU_Directory.queue--;			// one less in the queue!
					
					// Last in the queue?
					if(KU_Directory.queue <= 0){
						
						KU_Mods.hideLoading("directory-header");

						// Go through all items in the list queue
						for(var index = 0; index < KU_Directory.listQueue.length; index++){
							
							// Append to list
							KU_Directory.listQueue[index].appendTo('#directory-list');		
						}
						
						// Refresh and create new arrays
						$('#directory-list').listview('refresh');
						KU_Directory.listQueue = new Array();
						
					}
					
					// More in the queue? Cool, grab another page. 
					else KU_Directory.getNextPage();
				},
				
				error: function(data){
				
					KU_Mods.hideLoading("directory-header");
					KU_Directory.loading = false;
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
		this.queue = 0;
		this.loading = false;
		this.reachedEnd = false;

		// Clear previous scrollbar!
		if(KU_Config.ISCROLL) $(window).trigger("resize");
	}
};


/**********************************************************
 * Directory page init
 *********************************************************/
$(document).on("pageinit","#directory",function(event){
	
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
			if(!KU_Directory.loading && current > (max - KU_Directory.LOAD_THRESHOLD_PX) 
				&& $('#directory').is(':visible') && !(KU_Directory.typing)
				&& !(KU_Directory.loading) && !(KU_Directory.reachedEnd)){
				
				// Get next page then refresh iScroll
				KU_Directory.getNextPage();
				d.iscrollview.refresh();
			}
		}
		
		// Bind check scroll to moving and ending events
		$("#directory .iscroll-wrapper").bind({
			"iscroll_onscrollmove": checkScroll,
			"iscroll_onscrollend": checkScroll,
		});
	}
	
	// Regular overflow scrolling
	else{
		
		/**********************************************************
		 * Check overflow scroll position
		 *********************************************************/
		$('#directory-scroller').on("scroll",function(event){
			
			var scrollPosition = $('#directory-scroller').scrollTop() 
								 + $('#directory-scroller').outerHeight();

			// Break threshold?
			if($('#directory-list').height() < (KU_Directory.LOAD_THRESHOLD_PX 
				+ $('#directory-scroller').scrollTop() + $('#directory-scroller').outerHeight())
				&& $('#directory').is(':visible') && !(KU_Directory.typing) 
				&& !(KU_Directory.loading) && !(KU_Directory.reachedEnd)){
				
				// Get the next page!
				KU_Directory.getNextPage();
			}
		});
	}
});


/**********************************************************
 * Directory page create
 *********************************************************/
$(document).on("pagecreate","#directory",function(event){
	
	// Fix iScroll?
	if(KU_Config.ISCROLL) KU_Mods.fixIscroll("#directory"); 
	
	// Resize and get first page for overflow
	$(window).trigger("resize");
	
	
	// Trigger for change in TID select
	$("#directory-select").bind("change", function(e,u){
	
		// Definitely a change?
		if(this.value != KU_Directory.tid){		
	
			// Clear timeout and ajax
			if(KU_Directory.timeoutSent) clearTimeout(KU_Directory.timeoutSent);
			if(KU_Directory.sentAjax) KU_Directory.sentAjax.abort();
			
			// Change TID then reinitialize
			KU_Directory.tid = this.value;
			KU_Directory.reinitialize();
			
			// Download results
			KU_Directory.getNextPage();
		}
	});
	
	// Trigger for direct change in search box
	$("#directory-search").bind("change", function(e,u){
		
		// Definitely a change?
		if(this.value != KU_Directory.lastValue){
		
			// Clear timeout and ajax
			if(KU_Directory.timeoutSent) clearTimeout(KU_Directory.timeoutSent);
			if(KU_Directory.sentAjax) KU_Directory.sentAjax.abort();
			
			// Change last value and reinitialize
			KU_Directory.lastValue = this.value;
			KU_Directory.reinitialize();
			
			// Download results
			KU_Directory.getNextPage();
		}
	});
	
	// Trigger for incremental change in search box
	$("#directory-search").keyup( function() {
		
		// Definitely a change?
		if(this.value != KU_Directory.lastValue){
		
			// Store value
			KU_Directory.lastValue = this.value;
		
			// Clear timeout
			if(KU_Directory.timeoutSent) clearTimeout(KU_Directory.timeoutSent);
			KU_Directory.typing = true;
			
			KU_Directory.timeoutSent = setTimeout(function(latestValue){
				
				// Definitely not a change?
				if(latestValue == KU_Directory.lastValue){
					
					// Abort ajax
					if(KU_Directory.sentAjax) KU_Directory.sentAjax.abort();
					
					// Save new value, reinit, download
					KU_Directory.lastValue = latestValue;
					KU_Directory.reinitialize();
					KU_Directory.getNextPage();
				}
				
				KU_Directory.typing = false;
				
			}, KU_Config.INCR_WAIT_TIME, this.value);
		}
	});
	
	// Get page when page is first created
	KU_Directory.getNextPage(); 
});