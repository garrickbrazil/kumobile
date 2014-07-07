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
	},
	
	/**********************************************************
	 * Kettering Obfuscate?
	 *********************************************************/
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
				console.log("HEREERERE");
				return value.name;
			}
		}
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
	if(!KU_Config.ISCROLL) {
		$('.scroller').css('height', $(window).height() - 50);
		$('.scroller.below-searchbar').css('height', $(window).height() - 50 - 33);
	}
	
	// Fix search bar size 
	// calc(100% - 151px)
	// 151 is the width of the select and 1px for border !
	// TODO make this more dynamic size!!
	
	// General search bar minus select size
	$('.searchbar .ui-input-search').css('width', $(window).width() - 136);
	
	// Transfer search bar minus transfer selects
	$('#transfer .searchbar .ui-input-search').css('width', $(window).width() - 136);
	$('#transfer-container-college .ui-select').css('width', $(window).width() - 136);

});
