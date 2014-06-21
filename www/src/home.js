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
 * Home page create
 *********************************************************/
$(document).on("pagecreate", "#home", function(event){
	
	// Adjust for iscroll?
	if(KU_Config.ISCROLL) KU_Mods.fixIscroll('#home');
	
	// Resize screen
	else $(window).trigger("throttledresize");
});