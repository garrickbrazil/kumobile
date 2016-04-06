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
 *  Contains all generic functions, events, and feature classes.
 *
 *  @module KUMobile
 *  @class KUMobile
 ******************************************************************************/
var KUMobile = {
    
    
    /******************************************************************************
     *  Last page of the application
     *
     *  @attribute lastPage
     *  @type {boolean}
     *  @for KUMobile
     *  @default 'home'
     ******************************************************************************/
    lastPage: 'home',
    
    
    /******************************************************************************
     *  Contains the version information loaded from the app manifest! Note: this
     *  is only available after the device ready function is called, until then 
     *  it is null
     *
     *  @attribute version
     *  @type {String}
     *  @for KUMobile
     *  @default null
     ******************************************************************************/
	version: null,
    
    
    /******************************************************************************
     *  Event triggered after the home page initialization!
	 *
     *  @event ready
     *  @for KUMobile
     ******************************************************************************/
    homeLoaded: function(){
        
        // Patch Windows Phone scrolling
        if (navigator.userAgent.match(/IEMobile/)){
            var ieBodyHeight = $("body").outerHeight();
            var ieBodyHeightNew = ieBodyHeight - 55;
            $("head").append('<meta name="viewport" content="height=' + ieBodyHeightNew + '" />');
        }
        
        if(typeof KU === 'undefined'){
            KUMobile.safeAlert(
                "Error", 
                "There were problems connecting to the internet. Please check your connectivity and restart the application.", 
                "ok"
            );
        }
        else{
            
            // Pre-load initial announcements and news
            KUMobile.Announcements.loadNextPage();
            KUMobile.News.loadNextPage();
            
            // Create and initialize the student page 
            // (in case there is a chance for auto login)
            $("#student").trigger("pagecreate");
            $("#student").trigger("pageinit");
            
        }
    },
    
	
    /******************************************************************************
     *  Event triggered when the device is ready, registered with "deviceready".
     *  The primary purpose is to determine what type of device we are on (Android,
     *  iOS, Windows). Note: this is only triggered if you are ON a device!
	 *
     *  @event ready
     *  @for KUMobile
     ******************************************************************************/
    ready: function(){
        
        // Determine if it is a device
        KUMobile.Config.isDevice = (typeof cordova != "undefined");
        
        // No page transitions!
        $.mobile.defaultPageTransition = "none";
        
		if(KUMobile.Config.isDevice){
		
			// Android, iOS, or Windows?
			KUMobile.Config.isAndroid = (window.device.platform.toLowerCase() == "android");
			KUMobile.Config.isIOS = (window.device.platform.toLowerCase() == "ios");
            KUMobile.Config.isWindows = (window.device.platform.toLowerCase() == "windows");
            
		}
		else{
		
			// Not even a device..
			KUMobile.Config.isAndroid = false;
			KUMobile.Config.isIOS = false;
            KUMobile.Config.isWindows = false;
		}
        
        // Get version and update the about page
        cordova.getAppVersion(function (version) {
            
            // Update version
            KUMobile.version = "v" + version;
            $("#about #version").text(KUMobile.version);
            
            // Email subject
            var subject = "KUMobile Feedback: " + KUMobile.version;
            
            // Add platform to subject
            if (KUMobile.Config.isAndroid) subject += " on Android";
            else if (KUMobile.Config.isIOS) subject += " on iOS";
            else if (KUMobile.Config.isWindows) subject += " on Windows";
            
            // Update feedback button
            $("#feedback").attr("href", "mailto:garrick@garrickmail.net?subject=" + encodeURI(subject));
            
        });
        
        // Hide splash screen (delay to give html a chance to render)
        setTimeout(navigator.splashscreen.hide, 250);
        
        /* alert("Debug version. If you see this message than beware you are using a potentially unstable debug version. Email garrick@garrickmail.net to ask for a stable version."); */
	},
    
    
    
    /******************************************************************************
     *  Displays the loading indicator on the page with the given id
     *
     *  @method showLoading
	 *  @param {string} id - identifier for which page to show indicator on
     *  @for KUMobile
     *  @return {void}
     *  @example
     *      KUMobile.showLoading("news-page");
     ******************************************************************************/
	showLoading: function(id){
		
        // Display loading indicator
		$('#' + id + " .loading-indicator").css('display','block');
	},
    
	
	/******************************************************************************
     *  Hides the loading indicator on the page with the given id
     *
     *  @method hideLoading
	 *  @param {string} id - identifier for which page to show indicator on
     *  @for KUMobile
     *  @return {void}
     *  @example
     *      KUMobile.hideLoading("news-page");
     ******************************************************************************/
	hideLoading: function(id){
        
		$('#' + id + " .loading-indicator").css('display','none');
	},
	
	
    /******************************************************************************
     *  Converts a state name from abbreviation to full state name. If the
     *  conversion does not work it will simply return the abbreviation to be safe!
     *
     *  @method convertStateToFull
	 *  @param {string} abr - state abbreviation to convert to full state
     *  @for KUMobile
     *  @return {string}
     *  @example
     *      var state = KUMobile.convertStateToFull("MI");
     ******************************************************************************/
	convertStateToFull: function(abr){
		
		var states = new Array(                         {'name':'Alabama', 'abbrev':'AL'},          {'name':'Alaska', 'abbrev':'AK'},
			{'name':'Arizona', 'abbrev':'AZ'},          {'name':'Arkansas', 'abbrev':'AR'},         {'name':'California', 'abbrev':'CA'},
			{'name':'Colorado', 'abbrev':'CO'},         {'name':'Connecticut', 'abbrev':'CT'},      {'name':'Delaware', 'abbrev':'DE'},
			{'name':'Florida', 'abbrev':'FL'},          {'name':'Georgia', 'abbrev':'GA'},          {'name':'Hawaii', 'abbrev':'HI'},
			{'name':'Idaho', 'abbrev':'ID'},            {'name':'Illinois', 'abbrev':'IL'},         {'name':'Indiana', 'abbrev':'IN'},
			{'name':'Iowa', 'abbrev':'IA'},             {'name':'Kansas', 'abbrev':'KS'},           {'name':'Kentucky', 'abbrev':'KY'},
			{'name':'Louisiana', 'abbrev':'LA'},        {'name':'Maine', 'abbrev':'ME'},            {'name':'Maryland', 'abbrev':'MD'},
			{'name':'Massachusetts', 'abbrev':'MA'},    {'name':'Michigan', 'abbrev':'MI'},         {'name':'Minnesota', 'abbrev':'MN'},
			{'name':'Mississippi', 'abbrev':'MS'},      {'name':'Missouri', 'abbrev':'MO'},         {'name':'Montana', 'abbrev':'MT'},
			{'name':'Nebraska', 'abbrev':'NE'},         {'name':'Nevada', 'abbrev':'NV'},           {'name':'New Hampshire', 'abbrev':'NH'},
			{'name':'New Jersey', 'abbrev':'NJ'},       {'name':'New Mexico', 'abbrev':'NM'},       {'name':'New York', 'abbrev':'NY'},
			{'name':'North Carolina', 'abbrev':'NC'},   {'name':'North Dakota', 'abbrev':'ND'},     {'name':'Ohio', 'abbrev':'OH'},
			{'name':'Oklahoma', 'abbrev':'OK'},         {'name':'Oregon', 'abbrev':'OR'},           {'name':'Pennsylvania', 'abbrev':'PA'},
			{'name':'Rhode Island', 'abbrev':'RI'},     {'name':'South Carolina', 'abbrev':'SC'},   {'name':'South Dakota', 'abbrev':'SD'},
			{'name':'Tennessee', 'abbrev':'TN'},        {'name':'Texas', 'abbrev':'TX'},            {'name':'Utah', 'abbrev':'UT'},
			{'name':'Vermont', 'abbrev':'VT'},          {'name':'Virginia', 'abbrev':'VA'},         {'name':'Washington', 'abbrev':'WA'},
			{'name':'West Virginia', 'abbrev':'WV'},    {'name':'Wisconsin', 'abbrev':'WI'},        {'name':'Wyoming', 'abbrev':'WY'},
			{'name':'British Columbia', 'abbrev':'BC'}, {'name':'District of Columnia', 'abbrev':'DC'}, {'name':'Ontario', 'abbrev':'ON'},
			{'name':'Puerto Rico', 'abbrev':'PR'}, 		{'name':'Alberta', 'abbrev':'AB'}, 			{'name':'New Brunswick', 'abbrev':'NB'},
			{'name':'Nova Scotia', 'abbrev':'NS'},		{'name':'Quebec', 'abbrev':'PQ'}
			);
		
		
        // Check all states
		for(var index = 0; index < states.length; index++){
			
            // Val
            var value = states[index];
			
            // Match?
			if (value.abbrev == abr){
				return value.name;
			}
		}
        
        // Last resort, just return the abbreviation
        return abr;
	},
	
    
    /******************************************************************************
     *  Binds a jquery event safely by first removing any prexisting event! This
     *  prevents it from being binded twice.
     *
     *  @method safeBinder
	 *  @param {string} event - jquery mobile event name
     *  @param {string} query - jquery query for element to bind
     *  @param {function} callback - function to be called on event trigger
     *  @for KUMobile
     *  @example
     *      KUMobile.safeBinder("pageinit", "#mydiv", myfunction);
     ******************************************************************************/
    safeBinder: function(event, query, callback){
        
        $(document).off(event, query).on(event, query, callback);
        
    },
    
    
    /******************************************************************************
     *  Shows a dialog with given information when on a device, otherwise uses built
     *  in dialog using vanilla javascript alerts!
     *
     *  @method safeAlert
	 *  @param {string} title - title the alert should have
     *  @param {string} message - the message to display in body
     *  @param {string} button - name of the button to use
     *  @param {boolean} [expectedPage] - page which is expected to show dialog on
     *  @for KUMobile
     *  @example
     *      KUMobile.safeAlert("Fun title", "Fun message", "ok");
     ******************************************************************************/
    safeAlert: function(title, message, button, expectedPage){
      
      // Adjust expected to be empty if not provided
      if (typeof expectedPage === 'undefined') expectedPage = "";
      
      // Only show from the correct page
      else if (expectedPage != "" && $.mobile.activePage.attr('id') != expectedPage
        || $.mobile.activePage.attr('id') == "home" && expectedPage != "home") return;
      
      // Use navigator alert for device, and regular alert otherwise
      if(KUMobile.Config.isDevice) navigator.notification.alert(message, function(){}, title, button);
      else alert(title + "\n\n" + message);
      
    },
    
    
    /******************************************************************************
     *  Scrolls an overflow container to a certain element
     *
     *  @method scrollTo
	 *  @param {string} containerQuery - container query string
     *  @param {string} elementQuery - element query string
     *  @for KUMobile
     *  @example
     *      KUMobile.scrollTo("#container", "#mydiv");
     ******************************************************************************/
    scrollTo: function(containerQuery, elementQuery){
        
        var container = $(containerQuery);
        var scrollTo = $(containerQuery + " " + elementQuery);

        container.scrollTop(
            scrollTo.offset().top - container.offset().top + container.scrollTop()
        );
        
    },
	

    /******************************************************************************
     *  Resize function to link to jQM event for throttled resize. The purpose is
     *  that this resize function is controlled to not occur *too quickly* and
     *  advanced resizing can be done here. Alternative to this is just to use 
     *  css calc(), but not fully supported across all target devices as of
     *  time of development (2/26/2015).
     *
     *  @event throttledResize
     *  @for KUMobile
     ******************************************************************************/
	throttledResize: function (event){
        
        // Get page id
        if (!(typeof ($.mobile) === "undefined") && !(typeof ($.mobile.activePage) === "undefined")) var id = "#" + $.mobile.activePage.attr('id');
        else var id = "body"
        
        // Regular scroller
        $(id + ' .scroller').css('height', $(window).height() - $(id + ' .header').height() - 2);
        $(id + ' .scroller').css('top', $(id + ' .header').height() + 2);
        
        // Login
        $('#login-box').css('height', $(window).height() - $('.header').height() - 2);
        $('#login-box').css('top', $('.header').height() + 2);
        
        // Compute login box position
        var loginTop = $('#login-box').height()*.38 - $('.login-container').height()/2;
        if(loginTop < 0) loginTop = 0;
        if($('.login-container').height() > 0) $('.login-container').css('top', loginTop);
        
        // Header center and not cut off
        $(id + " .header-title").each(function(i){
            
            // Properties
            var backButton, backButtonRight;
            backButton = $(this).parent().find(".back-button");
            
            // Calculate back size
            if(backButton.size() > 0) backButtonRight = backButton.eq(0).outerWidth() + backButton.eq(0).offset().left + 10;
            else backButtonRight = 0;
            
            // Try to get real width, or fallback on regular width
            var width = $(this).prop("realwidth");
            if(typeof width == "undefined") width = $(this).width();
            
            // Calculate header left 
            // then make sure it does not cut off
            var headerLeft = $(this).parent().width()*.5 - width*.5;
            if(headerLeft < backButtonRight) headerLeft = backButtonRight;
            $(this).css('left', headerLeft);
            
            // Calculate width 
            // and resize when necessary
            var maxWidth = $(this).parent().width() - headerLeft - 30;
            if (width >= maxWidth){
                
                // Store real width before changing to current max
                if(typeof $(this).prop("realwidth") == "undefined") $(this).prop("realwidth", $(this).width());
                $(this).css("width", maxWidth);
            }
            else $(this).css("width", "auto");

        });
        
        // Scroller with search bar!
        $(id + ' .scroller.below-searchbar').css('height', $(window).height() - $(id + ' .header-with-searchbar').height() - 3);
        $(id + ' .scroller.below-searchbar').css('top', $(id + ' .header-with-searchbar').height() + 2);
        
        // Directions buttons
        /** TODO: this needs to be fixed so it is not hard coded! BE WARNED! **/
		$('#poi-button-directions').css('width', $(window).width()/2 - 10 - 5);
		$('#poi-button-phone').css('width', $(window).width()/2 - 5 - 10 - 5);
        
        // Map!
        $('#poi-info').css('top', $(window).height() - $('#poi-info').height() - 2);
        $('.map-scroller.below-searchbar').css('height', $(window).height() - $('.header-with-searchbar').height() - 3);
        $('.map-scroller.below-searchbar').css('top', $('.header-with-searchbar').height() + 2);
        $('#map_view').css('height', $(window).height() - $('.header-with-searchbar').height() - 3);
		    
		// Fix map
		$('.map_container').css('height', $(window).height() - $('.header-with-searchbar').height() - 3);
		$('.map_container').css('top', $('.header-with-searchbar').height() + 3);
	
		// Fix search bar size
		// More usable than css calc() which isn't always supported.	
		$(id + ' .searchbar .ui-input-search').css('width', $(window).width() - $(id + ' .searchbar .ui-select').width());
		$('#map .searchbar .ui-input-search').css('width', $(window).width());
		$(id + ' .searchbar').css('top', $(id + ' .header').height());
        $(id + ' .select-bar').css('top', $(id + ' .header').height());
		
        // Dropdown full width
        $("#final-grades-header .ui-select").css("width", $(window).width());
        $("#schedule-header .ui-select").css("width", $(window).width());
        $("#schedule-planner-terms-container .ui-select").css("width", $(window).width());
        
        $("#schedule-options-generate-button").css("width", $("#schedule-options-generate-button").parent().width()*.8);
        
        // Schedule planner course dialog, full width
        $(".wide-popup").css("width", $(window).width()*.80);
        
        // General dialog scrollers
        $(".dialog-scroller").css("max-height", $(window).height()*.60);
        
		// Transfer and degree eval selects
		$('#transfer-container-college .ui-select').css('width', $(window).width() - $('#transfer .searchbar .ui-select').width());
        $('#degree-evaluation-options-container .ui-select').css('width', $(window).width() - $('#degree-evaluation .searchbar #generate-degree-evaluation').outerWidth());
        
	},
    
    
    /******************************************************************************
     *  Adds a 'new' indicator for every selected element
     *
     *  @method addNewIndicator
	 *  @param {string} selector - query string to add indicators to
     *  @for KUMobile
     *  @example
     *      KUMobile.addNewIndicator("#list li.special");
     ******************************************************************************/
    addNewIndicator: function(selector){

        // Template
        var tpl = Handlebars.getTemplate("new-indicator");
    
        // Add for each selected
        $(selector).each(function(i){ $(this).append(tpl); });
      
    },
    
    
    /******************************************************************************
     *  Takes in html string or DOM elements and removes all dangerous entities
     *  such as scripts and on* functions. 
     *
     *  @method sanitize
	 *  @param {string} dom - html or DOM element which needs to be sanitized
     *  @for KUMobile
     *  @return {jQuery DOM}
     *  @example
     *      KUMobile.sanitize(htmlStr);
     ******************************************************************************/
    sanitize: function(dom){
        
        var dom = $(dom);
        
        // Allowed tags white list
        var allowed = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol', 
            'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div', 'span',
            'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'label', 'img' ];
            
        $("*", dom).each(function(i){
            
            var passed = false;
            
            var youtubePattern = /(\\\\)?www.youtube.com\/embed*/;
            
            // Check against white list
            for (var tag = 0; tag < allowed.length; tag++){
                if ($(this).prop("tagName").toLowerCase() === allowed[tag]) passed = true;
            }
            
            // Whitelist Youtube iframes only
            if ($(this).prop("tagName").toLowerCase() === "iframe" && youtubePattern.test($(this).attr("src"))){
                $(this).attr("src", $(this).attr("src").replace("//www", "http://www"));
                passed = true;
            }
        
            // If passed, then check onclicks and styles
            if (passed){
        
                // Get attributes
                var attrs = this.attributes;
                
                // Go through all attributes
                for (var i = 0; i < attrs.length; i++){
                    
                    var name = attrs[i].nodeName;
                    
                    // Style
                    if (name.indexOf("style") > -1) $(this).removeAttr(name);
                    
                    // On*
                    if (name.indexOf("on") > -1) $(this).removeAttr(name);
                }
            }
            else{
                $(this).remove();
            }
            
        });
        
        
        
        return dom;
      
    },
    
	
	/******************************************************************************
     *  Triggered any time a page is changed as registered by jQuery Mobile. 
     *  The primary purpose is to allow us to resize to be safe that all elements 
     *  are scaled properly.
     *
     *  @event pageChange
     *  @for KUMobile
     ******************************************************************************/
	pageChange: function( event ) { 

        // Page traveling to does not exist? Then go back!!
        if($("#" + $.mobile.activePage.attr('id')).length == 0) $.mobile.back();

        // Page we've changed to 
        else{
        
            // Coming from news -> home?
            if (KUMobile.lastPage == "news" && $.mobile.activePage.attr('id') == "home"){
                
                // Clear main news indicator
                $("#news-listitem .new-icon-indicator").remove();
                $("#news-listitem").removeClass("ui-li-has-count");
                
                // Clear all news item indicators
                $("#news-list li .new-icon-indicator").remove();
                $("#news-list li").removeClass("ui-li-has-count");
                
                // Refresh list
                $("#news-list").listview("refresh");
                $("#home ul").listview("refresh");
                
                // Make a new list
                var saveList = [];
                
                // Copy current live list
                $("#news-list li a div.main-text").each(function(i){ 
                    
                    if(saveList.length < 100) saveList[saveList.length] = $("h1", this).text().trim();
                });
                
                // Retrieve old list
                var oldList = window.localStorage.getItem("ku_news_read");
                
                if(oldList != null){
                
                    try{
                                    
                        // Parse array
                        oldList = JSON.parse(oldList);
                    }
                    catch(error){ oldList = []; }
                }
                else oldList = [];
                
                for (var i = 0; i < oldList.length && saveList.length < 100; i++){
                    
                    var found = false;
                    
                    // See if it is already in the list?
                    for (var saveIndex = 0; saveIndex < saveList.length; saveIndex++){
                        
                        if(saveList[saveIndex] === oldList[i]) found = true;
                    }
                    
                    // Not in the list? Then add it!
                    if(!found) saveList[saveList.length] = oldList[i];
                    
                }
                
                // Store latest news
                window.localStorage.setItem("ku_news_read", JSON.stringify(saveList));
            }
            
            // Coming from announcements -> home?
            if (KUMobile.lastPage == "announcements" && $.mobile.activePage.attr('id') == "home"){
                
                
                
                // Clear main announcements indicator
                $("#announcements-listitem .new-icon-indicator").remove();
                $("#announcements-listitem").removeClass("ui-li-has-count");
                
                // Clear all announcements item indicators
                $("#announcements-list li .new-icon-indicator").remove();
                $("#announcements-list li").removeClass("ui-li-has-count");
                
                // Refresh list
                $("#announcements-list").listview("refresh");
                $("#home ul").listview("refresh");
                
                // Make a new list
                var saveList = [];
                
                // Copy current live list
                $("#announcements-list li div").each(function(i){ 
                    
                    if(saveList.length < 100) saveList[saveList.length] = $("h1", this).text().trim();
                });
                
                // Retrieve old list
                var oldList = window.localStorage.getItem("ku_announcements_read");
                
                if(oldList != null){
                    
                    try{
                        
                        // Parse array
                        oldList = JSON.parse(oldList);
                    }
                    catch(error){ oldList = []; }
                }
                
                else oldList = [];
                
                for (var i = 0; i < oldList.length && saveList.length < 100; i++){
                    
                    var found = false;
                    
                    // See if it is already in the list?
                    for (var saveIndex = 0; saveIndex < saveList.length; saveIndex++){
                        
                        if(saveList[saveIndex] === oldList[i]) found = true;
                    }
                    
                    // Not in the list? Then add it!
                    if(!found) saveList[saveList.length] = oldList[i];
                    
                }
                
                // Store latest announcements
                window.localStorage.setItem("ku_announcements_read", JSON.stringify(saveList));
                
            }
            
            // Resize the window whenever we change pages
            KUMobile.throttledResize();
            
            // If map is okay, cause it to revalidate its position and size
            // there are often map issues related to going back and forth 
            // between the map and changing perspectives. It is most efficient
            // to revalidate the map size in a page change event instead of 
            // the resize!
            setTimeout(function(){
                if(KUMobile.Map.map != null) KUMobile.Map.map.invalidateSize();
            },0); 
            
            // Last page 
            KUMobile.lastPage = $.mobile.activePage.attr('id');
        }
	},
    
};
