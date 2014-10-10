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
 * KU Mobile Configuration
 *********************************************************/
var KU_Config = {

	LOAD_INDICATOR_DELAY: 400,						// minimum spinner time
	ISCROLL: !(overthrow.support === "native"),		// iScroll only?
	isDevice: (typeof cordova != "undefined"),		// device or emulator?
	isAndroid: null,								// is android? cannot check until ready
	isIOS: null,								// is iOS? cannot check until ready
	PAGES_TO_LOAD: 2,								// number of pages to load at a time
	INCR_WAIT_TIME: 800,							// ms to wait before incremental search
	
	ready: function(){
	
		if(KU_Config.isDevice){
		
			// Android?
			KU_Config.isAndroid = (window.device.platform.toLowerCase() == "android");
			KU_Config.isIOS = (window.device.platform.toLowerCase() == "ios");
		}
	},
	
	/**********************************************************
	 * Global error message
	 *********************************************************/
	showGlobalError: function(){
	
		alert("Oops :(");
	}
};

document.addEventListener("deviceready", KU_Config.ready, false);

