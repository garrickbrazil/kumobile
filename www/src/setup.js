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
document.addEventListener("deviceready", KU.ready, false);
$.mobile.defaultPageTransition = "none";
$(window).on( "pagechange", KU.pageChange);
$(window).on( "throttledresize", KU.throttledResize);


// Home
$(document).on("pagecreate", "#home", KU.homePageCreate);


// News
$(document).on("pageinit","#news", KU.News.pageInit);
$(document).on("pagecreate","#news", KU.News.pageCreate);


// Map
$(document).on("pageinit","#map", KU.Map.pageInit);
$(document).on("pagecreate","#map", KU.Map.pageCreate);


// Library
$(document).on("pageinit","#library", KU.Library.pageInit);
$(document).on("pagecreate","#library", KU.Library.pageCreate);


// Events
$(document).on("pageinit","#events", KU.Events.pageInit);
$(document).on("pagecreate","#events", KU.Events.pageCreate);


// Directory
$(document).on("pageinit","#directory", KU.Directory.pageInit);
$(document).on("pagecreate","#directory", KU.Directory.pageCreate);


// Transfer page init
$(document).on("pageinit","#transfer", KU.Transfer.pageInit);
$(document).on("pagecreate","#transfer", KU.Transfer.pageCreate);