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
     *  Event triggered when the device is ready, registered with "deviceready".
     *  The primary purpose is to determine what type of device we are on (Android,
     *  iOS, Windows). *Note*: this is only triggered if you are ON a device!
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
	
    
        // Regular scroller
        $('.scroller').css('height', $(window).height() - $('.header').height() - 2);
        $('.scroller').css('top', $('.header').height() + 2);
        
        // Scroller with search bar!
        $('.scroller.below-searchbar').css('height', $(window).height() - $('.header-with-searchbar').height() - 3);
        $('.scroller.below-searchbar').css('top', $('.header-with-searchbar').height() + 2);
        
        // Directions buttons
        /** TODO: this needs to be fixed so it is not hard coded! YE BE WARNED! **/
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
		$('.searchbar .ui-input-search').css('width', $(window).width() - $('.searchbar .ui-select').width());
		$('#map .searchbar .ui-input-search').css('width', $(window).width());
		$('.searchbar').css('top', $('.header').height());
		
		// Transfer college select bar minus transfer selects
		$('#transfer-container-college .ui-select').css('width', $(window).width() - $('.searchbar .ui-select').width());
        
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
	
		// Resize the window whenever we change pages
		$(window).trigger("resize"); 
		
		// If map is okay, cause it to revalidate its position and size
        // there are often map issues related to going back and forth 
        // between the map and changing perspectives. It is most efficient
        // to revalidate the map size in a page change event instead of 
        // the resize!
		setTimeout(function(){
			if(KUMobile.Map.map != null) KUMobile.Map.map.invalidateSize();
		},0); 
	},
    
};
