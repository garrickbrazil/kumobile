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
/** General KU Mobile Object containing all other namespace children as
 *  well as other configuration options and methods on a global scale.
 *  @namespace
 ******************************************************************************/
var KU = {



	/******************************************************************************/
	/**  Delay for loading minimum time for loading indicator to show for. This 
	 *   was mainly useful to prevent the indicator confusingly flashing.
	 *   @type {int}
	 *   @deprecated
	 ******************************************************************************/
	LOAD_INDICATOR_DELAY: 400,



	/******************************************************************************/
	/**  Should we switch to iScroll because the device does not support native
	 *   overflow? iScroll will work with nearly all devices but overflow will not
	 *   for many older devices, such as Android 2.X for instance. In the future
	 *   this sort of support will not be used
	 *   @deprecated
	 ******************************************************************************/
	ISCROLL: !(overthrow.support === "native"),
	
	
	
	/******************************************************************************/
	/**  Is this a device (otherwise assume its a browser). For devices, cordova
	 *   plugin will exist as object named cordova. We CANNOT even try plugins
	 *   while in a browser. This variable is how we make that determination
	 *   @type {boolean}
	 ******************************************************************************/
	isDevice: (typeof cordova != "undefined"),
	
	
	
	/******************************************************************************/
	/**  Is this an android device? Some small changes for certain features (maps
	 *   navigation for instance) must be different for the various platforms. This
	 *   must be determined at runtime though and only if we are on a device. 
	 *   @type {boolean}
	 ******************************************************************************/
	isAndroid: null,
	
	
	
	/******************************************************************************/
	/**  Is this an iOS device? Some small changes for certain features (maps
	 *   navigation for instance) must be different for the various platforms. This
	 *   must be determined at runtime though and only if we are on a device. 
	 *   @type {boolean}
	 ******************************************************************************/
	isIOS: null,
	
	
	
	/******************************************************************************/
	/** Global setting for number of pages to load at a time for such things as 
	 *  news, events, etc. 
	 *  @type {int}
	 ******************************************************************************/
	PAGES_TO_LOAD: 2,
	
	
	
	/******************************************************************************/
	/** Global setting for how long to wait for incremental searching. Note: this
	 *  does not affect map incremental searching which uses its own.
	 *  @type {int}
	 ******************************************************************************/
	INCR_WAIT_TIME: 800,
	
	
	
	/******************************************************************************/
	/** Triggered one time when the device is considered ready by jQM event. 
	 *  @event
	 ******************************************************************************/
	ready: function(){
	
		if(KU.isDevice){
		
			// Android or iOS?
			KU.isAndroid = (window.device.platform.toLowerCase() == "android");
			KU.isIOS = (window.device.platform.toLowerCase() == "ios");
		}
		else{
		
			// Not even a device..
			KU.isAndroid = false;
			KU.isIOS = false;
		}
	},
	
	
	
	/******************************************************************************/
	/** Shows a global error with absolutely no value! This should rarely be used 
	 *  in the future. 
	 ******************************************************************************/
	showGlobalError: function(){
	
		alert("Oops :(");
	},
	
	
	
	/******************************************************************************/
	/** Fixes a container to use iScroll instead of overflow scrolling.
	 *  @param {string} page - id for which element to fix (e.g #mycontainer)
	 ******************************************************************************/
	fixIscroll: function(page){

		// Create a new iScroll container
		var iscroller = $('<div></div>', {
			'class': 'iscroll-custom',
			'data-iscroll':''
		});
		
		// Append to the given page (e.g '#news')
		$(page).append(iscroller);
		
		// Move regular content into the new iScroll
		$(page + ' .iscroll-custom').append($(page + ' .scroller'));
		
		// Remove styling and class for the old scroller (uses overflow)
		$(page + ' .scroller').attr('style','');
		$(page + ' .scroller').removeClass('scroller');
		$(page + ' .header').css('position','relative');
		
		// Resize the window for iScroll container
		$(window).trigger("resize");
	},
	
	
	
	/******************************************************************************/
	/** Shows loading indicator with a given id
	 *  @param {string} id - identifier for which page to show indicator on (e.g mypage)
	 ******************************************************************************/
	showLoading: function(id){
		
		$('#' + id + " .loading-indicator").css('display','block');
	},
	
	
	
	/******************************************************************************/
	/** Hide loading indicator with a given id
	 *  @param {string} id - identifier for which page to hide indicator on (e.g mypage)
	 ******************************************************************************/
	hideLoading: function(id){
		
		$('#' + id + " .loading-indicator").css('display','none');
	},
	
	
	
	/******************************************************************************/
	/** Kettering's adapted obfuscation method. This is used to deobfuscate
	 *  the phone and room numbers! 
	 *  @param {string} message - message to deobfuscate
	 ******************************************************************************/
	 ketteringObfuscate: function(message) {

		var aZ = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
		var nM = "NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm0123456789"
		
		var map = [];
		var converted = "";

		for (var index = 0; index <= aZ.length; index++) {map[aZ.substr(index, 1)] = nM.substr(index, 1)}

		for (var index = 0; index <= message.length; index++) {
			
			var c = message.charAt(index);
			converted  += (c in map ? map[c] : c);
		}

		return converted;

	},
	
	
	
	/******************************************************************************/
	/** Kettering's adapted obfuscation method. This is used to deobfuscate
	 *  the phone and room numbers! 
	 *  @param {string} abr - state abbreviation to convert to full state
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
		
		
		for(var index = 0; index < states.length; index++){
			var value = states[index];
			
			if (value.abbrev == abr){
				return value.name;
			}
		}
	},
	
	
	
	/******************************************************************************/
	/** Resize function to link to jQM event for throttled resize!
	 *  @param {event} event - not used
	 *  @event
	 ******************************************************************************/
	throttledResize: function (event){
	
		// Calculate scroller size
		// More usable than css calc() which isn't always supported.
		if(!KU.ISCROLL) {

			// Regular scroller
			$('.scroller').css('height', $(window).height() - $('.header').height() - 2);
			$('.scroller').css('top', $('.header').height() + 2);
			
			// Scroller with search bar!
			$('.scroller.below-searchbar').css('height', $(window).height() - $('.header-above-searchbar').height() - 3);
			$('.scroller.below-searchbar').css('top', $('.header-above-searchbar').height() + 2);
			
			// Map!
			$('#poi-info').css('top', $(window).height() - $('#poi-info').height() - 2);
			$('.map-scroller.below-searchbar').css('height', $(window).height() - $('.header-above-searchbar').height() - 3);
			$('.map-scroller.below-searchbar').css('top', $('.header-above-searchbar').height() + 2);
			$('#map_view').css('height', $(window).height() - $('.header-above-searchbar').height() - 3);
		}
		
		$('#poi-button-directions').css('width', $(window).width()/2 - 10 - 5);
		$('#poi-button-phone').css('width', $(window).width()/2 - 5 - 10-5);
		
		// Fix map
		$('.map_container').css('height', $(window).height() - $('.header-above-searchbar').height() - 3);
		$('.map_container').css('top', $('.header-above-searchbar').height() + 3);
		
		// Fix search bar size
		// More usable than css calc() which isn't always supported.	
		$('.searchbar .ui-input-search').css('width', $(window).width() - $('.searchbar .ui-select').width());
		$('#map .searchbar .ui-input-search').css('width', $(window).width());
		$('.searchbar').css('top', $('.header').height());
		
		
		// Transfer college select bar minus transfer selects
		$('#transfer-container-college .ui-select').css('width', $(window).width() - $('.searchbar .ui-select').width());
	},
	
	
	
	/******************************************************************************/
	/** Page change triggered during any page entered event through jQM
	 *  @param {event} event - not used
	 *  @event
	 ******************************************************************************/
	pageChange: function( event ) { 
	
		// Resize the window whenever we change pages
		$(window).trigger("resize"); 
		
		// If map is okay, cause it to revalidate its position and size
		setTimeout(function(){
			if(KU.Map.map != null) KU.Map.map.invalidateSize();
		},0); 
	},
	
	
	/******************************************************************************/
	/**  Triggered when the events page is first created based on 
	 *   jQM page create event. 
	 *
	 *   @param {Event} event - jQM event, not actually being
	 *          used by us at the moment. 
	 *   @event
	 ******************************************************************************/
	homePageCreate: function(event){
	
		// Adjust for iscroll?
		if(KU.ISCROLL) KU.fixIscroll('#home');

		// Resize screen
		$(window).trigger("throttledresize");
	}
	
};
