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
	PAGES_TO_LOAD: 2,								// number of pages to load at a time

	/**********************************************************
	 * Global error message
	 *********************************************************/
	showGlobalError: function(){
	
		alert("Oops :(");
	}
};