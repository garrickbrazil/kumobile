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
 *  Contains all news related functions for loading and controlling the news page.
 *
 *  @class KUMobile.News
 ******************************************************************************/
KUMobile.News = {
 
 
    /******************************************************************************
     *  Current page number as referenced from the news website.
     *
     *  @attribute page
     *  @type {int}
     *  @for KUMobile.News
     *  @default 0
     ******************************************************************************/
    page: 0,
 
    
    /******************************************************************************
     *  Number of pages to load from the news website after a trigger event occurs.
     *
     *  @attribute PAGES_TO_LOAD
     *  @type {int}
     *  @for KUMobile.News
     *  @default 2
     ******************************************************************************/
    PAGES_TO_LOAD: 2,
	
	
    /******************************************************************************
     *  Is the news page loading?
     *
     *  @attribute loading
     *  @type {boolean}
     *  @for KUMobile.News
     *  @default false
     ******************************************************************************/
	loading: false,
	
	
    /******************************************************************************
     *  Designates the minimum number of pixels that the user can scroll
	 *  (calculated from the bottom) before another load event is triggered.
     *
     *  @attribute LOAD_THRESHOLD_PX
     *  @type {int}
     *  @for KUMobile.News
     *  @default 660
     ******************************************************************************/	
	LOAD_THRESHOLD_PX: 660,

	
    /******************************************************************************
     *  How many pages that need to be downloaded still. This is used to asynchronously
     *  download pages.
     *
     *  @attribute queue
     *  @type {int}
     *  @for KUMobile.News
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
     *  @for KUMobile.News
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
     *  @for KUMobile.News
     *  @private 
     ******************************************************************************/	
	pageQueue: [],
	

    /******************************************************************************
     *  Triggered when the news page is first initialized based on jQuery Mobile
     *  pageinit event.
	 *
     *  @event pageInit
     *  @for KUMobile.News
     ******************************************************************************/	
	pageInit: function(event){

        // Check overflow scroll position
        $('#news-scroller').on("scroll", KUMobile.News.scroll);

	},	
	
	
    /******************************************************************************
     *  Triggered when the news page is first created based on jQuery Mobile
     *  pagecreate event. This is called after the page itself is created but 
     *  before any jQuery Mobile styling is applied.
	 *
     *  @event pageCreate
     *  @for KUMobile.News
     ******************************************************************************/
	pageCreate: function(event){
		
		// Resize and get first page
		$(window).trigger("throttledresize");
		KUMobile.News.loadNextPage(); 
		
	},
	
	
	/******************************************************************************
     *  Triggered when regular scroll event happens in news scroller window. It 
     *  is used to check if the user is *near* the bottom of the page, so more
     *  content can be loaded (simulate *infinite scrolling*).
	 *
     *  @event scroll
     *  @for KUMobile.News
     ******************************************************************************/	
	scroll: function(event){
		
        // Get scroll position
		var scrollPosition = $('#news-scroller').scrollTop() + $('#news-scroller').outerHeight();

		// Break threshold?
		if($('#news-list').height() < (KUMobile.News.LOAD_THRESHOLD_PX + $('#news-scroller').scrollTop() + 
			$('#news-scroller').outerHeight()) && $('#news').is(':visible') && !(KUMobile.News.loading)){
			
			// Get the next page!
			KUMobile.News.loadNextPage();
		}
	},
	
    
    /******************************************************************************
     *  Loads and displays the next set of news items.
	 *
     *  @method loadNextPage
     *  @for KUMobile.News
     *  @example
     *      KUMobile.News.loadNextPage();
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
				this.queue = KUMobile.News.PAGES_TO_LOAD;
				KUMobile.showLoading("news-header");
                
			}
			
            /* Success */
			var success = function(items){
                
                // Increment page
                KUMobile.News.page++;
                
                // Setup data
                for(var index = 0; index < items.length; index++){
                 
                    // Current item and template
                    var item = items[index];
                    var captionTpl = Handlebars.getTemplate("news-item");
                    var pageTpl = Handlebars.getTemplate("dynamic-page");
                    var pageId = 'news-' + KUMobile.News.page + '-' + index;
                    
                    // Caption data
                    var captionHtml = captionTpl({
                        "title": item.title,
                        "imgUrl": (item.imgUrl=="")?("img/default_icon.jpg"):(item.imgUrl),
                        "info": item.author + " | " + item.date,
                        "pageId": pageId
                    });
                    
                    // Page data
                    var pageHtml = pageTpl({
                       "link": item.detailsUrl,
                       "pageId": pageId,
                       "headerTitle": "News",
                       "scrollerId": pageId + "-scroller"
                    });
                    
                    // Register event
                    $(document).on("pagecreate",'#' + pageId, KUMobile.News.articlePageCreate);
                    
                    // Add list item to queue
                    KUMobile.News.listQueue[KUMobile.News.listQueue.length] = captionHtml;
                    KUMobile.News.pageQueue[KUMobile.News.pageQueue.length] = pageHtml;
                    
                }
                
                // Flush?
                if(--KUMobile.News.queue <= 0){
                    
                    // Not loading
                    KUMobile.hideLoading("news-header");
                    KUMobile.News.loading = false;
                    
                    // Go through all list items
                    for (var index = 0; index < KUMobile.News.listQueue.length; index++){
                        
                        // Append to news list
                        $(KUMobile.News.listQueue[index]).appendTo("#news-list");
                    }
                    
                    // Go through all page items
                    for (var index = 0; index < KUMobile.News.pageQueue.length; index++){
                        
                        // Append to news list
                        $(KUMobile.News.pageQueue[index]).appendTo("body");
                    }
                 
                    // Refresh and clear both lists
                    $('#news-list').listview('refresh');
                    KUMobile.News.listQueue = [];
                    KUMobile.News.pageQueue = [];
                    
                }
                
                // More news to be downloaded!
                else {
                    
                    // Load more
                    KUMobile.News.loading = false;
                    KUMobile.News.loadNextPage();
                }
                
            };
            
            /* Fail */
            var failure = function(error){
                
                // Not loading anymore presumably..
                KUMobile.hideLoading("news-header");
                KUMobile.News.loading = false;
                
                alert("Sorry the news could not be loaded :(. Check your" +
                " internet connection. If the issue persists then please"+
                " create a bug at github.com/garrickbrazil/kumobile/issues/new");
            };
            
            // Get next page
            KU.News.nextPage(success, failure);
        }
    },
       
       
    /******************************************************************************
     *  Called on create of an article page. Mainly this function just
	 *  attempts to download the article and show it. 
	 *
     *  @event articlePageCreate
     *  @for KUMobile.News
     ******************************************************************************/
	articlePageCreate: function(event){
		
        
        // Now loading
		KUMobile.News.loading = true;
        KUMobile.showLoading(this.id);
        var identifier = this.id;
        
        var success = function(article){
         
            var articleTpl = Handlebars.getTemplate("news-article");
            
            var html = articleTpl({
                "title": article.title,
                "info": article.headerInfo
            });
            
            $(html).appendTo("#" + identifier + "-scroller");
            
            mainParagraph = $(article.mainHtml);
            
            // Fix max width and height
            mainParagraph.find('*').css("max-width", "100%").css("height","auto");

            // Remove hard-coded width from table
            mainParagraph.find('table').css('width','');
            mainParagraph.css('padding','4px');

            // Remove "Related" fields
            mainParagraph.find("h3").each(function(i){
                
                // Related header
                if($(this).text() === "Related:"){
                    
                    // Find all links under it
                    $(this).parent().parent().parent().find("tr td ul li a").each(function(j){
                        
                        // Remove!
                        $(this).parent().parent().parent().parent().remove();
                    });
                    
                    // Remove related!
                    $(this).parent().parent().remove();    
                }
                    
            });

            
            // Fix youtube videos
            mainParagraph.find("embed").each(function(i){

                if($(this).attr("src") != undefined && 
                   $(this).attr("src").indexOf("youtube")){
                        
                    // Complex regex
                    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                    var match = $(this).attr("src").match(regExp);
                    
                    // Match?
                    if (match && match[2].length == 11) {
                        
                        var id = match[2];
                        
                        var youtubeFrame = $("<iframe></iframe>",{
                            "width":"100%",
                            "height":"auto",
                            "src":"http://www.youtube.com/embed/" + id + "?version=3&rel=0&amp;controls=0&amp;showinfo=0",
                            "frameborder":"0",
                            "allowfullscreen":"true"
                        });
                        
                        $(this).parent().append(youtubeFrame);
                        $(this).remove();
                    }
                    
                } 
               
            });
            //<iframe width="100%" height="215" src="http://www.youtube.com/embed/4YW47qfoKwI?version=3&rel=0&amp;controls=0&amp;showinfo=0" frameborder="0" allowfullscreen></iframe>

            
            // Append
            mainParagraph.appendTo("#" + identifier + "-scroller");
            
            // Resize when new elements load
            $(mainParagraph).find('*').load(function(){ $(window).trigger("resize");});
            
            // Resize anyways! in case there was nothing to load from above
            $(window).trigger("resize");
            
            // Done loading!
            KUMobile.hideLoading(identifier);
            KUMobile.News.loading = false;
         
        }
        
        var failure = function(error){
         
            // Not loading anymore presumably..
            KUMobile.hideLoading(identifier);
            KUMobile.News.loading = false;
            
            alert("Sorry the news could not be loaded :(. Check your" +
            " internet connection. If the issue persist then please"+
            " create a bug at github.com/garrickbrazil/kumobile/issues/new");
        }
        
        // Get the article!
        KU.News.downloadArticle($('#' + identifier).attr("kulink"), success, failure)
        
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