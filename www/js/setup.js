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


// Setup the project!
// Note: this should be the last JS file loaded!!
document.addEventListener("deviceready", KUMobile.ready, false);
$.mobile.defaultPageTransition = "none";
$(window).on( "pagechange", KUMobile.pageChange);
$(window).on( "resize", KUMobile.throttledResize);



// News
$(document).on("pageinit","#news", KUMobile.News.pageInit);
$(document).on("pagecreate","#news", KUMobile.News.pageCreate);


// Events
$(document).on("pageinit","#events", KUMobile.Events.pageInit);
$(document).on("pagecreate","#events", KUMobile.Events.pageCreate);


// Directory
$(document).on("pageinit","#directory", KUMobile.Directory.pageInit);
$(document).on("pagecreate","#directory", KUMobile.Directory.pageCreate);


// Library
$(document).on("pageinit","#library", KUMobile.Library.pageInit);
$(document).on("pagecreate","#library", KUMobile.Library.pageCreate);


// Transfer page init
$(document).on("pageinit","#transfer", KUMobile.Transfer.pageInit);
$(document).on("pagecreate","#transfer", KUMobile.Transfer.pageCreate);

// Map
$(document).on("pageinit","#map", KUMobile.Map.pageInit);
$(document).on("pagecreate","#map", KUMobile.Map.pageCreate);