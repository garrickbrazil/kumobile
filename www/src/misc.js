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
 * Global Defaults
 *********************************************************/
$.mobile.defaultPageTransition = "none";

/**********************************************************
 * KU Specific Modifications
 *********************************************************/
var KU_Mods = {
	
	/**********************************************************
	 * Fix iScroll
	 *********************************************************/
	fixIscroll: function(page){

		// Create a new iScroll container
		var iscroller = $('<div></div>', {
			'class': 'example-wrapper',
			'data-iscroll':''
		});
		
		// Append to the given page (e.g '#news')
		$(page).append(iscroller);
		
		// Move regular content into the new iScroll
		$(page + ' .example-wrapper').append($(page + ' .scroller'));
		
		// Remove styling and class for the old scroller (uses overflow)
		$(page + ' .scroller').attr('style','');
		$(page + ' .scroller').removeClass('scroller');
		$(page + ' .header').css('position','relative');
		
		// Resize the window for iScroll container
		$(window).trigger("resize");
	},
	
	/**********************************************************
	 * Show loading indicator
	 *********************************************************/
	showLoading: function(id){
		
		$('#' + id + " .loading-indicator").css('display','block');
	},
	
	/**********************************************************
	 * Hide loading indicator
	 *********************************************************/
	hideLoading: function(id){
		
		$('#' + id + " .loading-indicator").css('display','none');
	}
};

/**********************************************************
 * Throttled resize
 *********************************************************/
$(window).on("throttledresize", function (event){
	
	// calc(100% - 49.5px)
	// This must be performed based on height of header
	// not needed for iscroll which is setup differently
	// throttle has limited freq compared to regular resize
	// TODO make header height dynamic!
	if(!KU_Config.ISCROLL) $('.scroller').css('height', $(window).height() - 49.5);
});
