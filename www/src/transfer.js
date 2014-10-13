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
/**  Contains all transfer related functions for loading and controlling the
 *   transfer page.
 *   @namespace
 ******************************************************************************/
KU.Transfer = {
	
	
	
	/******************************************************************************/
	/**  Type of search, either can be course or college. By course will result
	 *   in searching by course ID via the search bar, whereas by college will
	 *   search by college name through college dropdown. 
	 *   @type {string}
	 ******************************************************************************/
	type: 'course',
	
	
	
	/******************************************************************************/
	/**  Last value the the user searched for by course id (e.g MATH-102 or MATH102)
	 *   @type {string}
	 ******************************************************************************/
	lastCourse:'',
	
	
	
	/******************************************************************************/
	/**  Last value the the user searched for by college ID. These college ID's
	 *   are specified by Kettering and downloaded dynamically with the function
	 *   {@link KU.Transfer.downloadColleges}
	 *   @type {string}
	 ******************************************************************************/
	lastCollege:'',
	
	
	
	/******************************************************************************/
	/**  Tells whether or not transfer is currently attempting to download
	 *   or parse article lists. Essentially used to tell whether transfer is
	 *   considered to be busy. 
	 *   @type {boolean}
	 ******************************************************************************/
	loading: false,
	
	
	
	/******************************************************************************/
	/**  Is the user currently typing? This is mainly used to ensure we do not do 
	 *   certain loads or other things when we consider the user is typing.
	 *   @type {boolean}
	 ******************************************************************************/
	typing: false,
	
	
	
	/******************************************************************************/
	/**  Contains the current list of article DOM li tag items that still need
	 *   to be added to the DOM (much faster to add all at once after load
	 *   is done downloading). This helps prevent the app from seeming to 
	 *   hang or become unresponsive.
	 *   @type {Object[]}
	 ******************************************************************************/
	listQueue: null,
	
	
	
	/******************************************************************************/
	/**  Contains the last ajax call sent! This allows us to abort the call if the
	 *   user re-searches in any way (dropdown, or searchbar)
	 *   @type {Ajax}
	 ******************************************************************************/
	sentAjax: null,
	
	
	
	/******************************************************************************/
	/**  Contains the last timeout call sent! This allows us to restart the timeout if
	 *   the user re-searches in any way (dropdown, or searchbar). The major benefit
	 *   of this is that it gives us the feeling of incremental searching, e.g we send
	 *   a timeout of some milliseconds whenever the KEY_UP event triggers, as well
	 *   as cancelling out the last timeout we sent. 
	 *   @type {Timeout}
	 ******************************************************************************/
	sentTimeout: null,
	
	
	
	/******************************************************************************/
	/**  Triggered when the transfer page is first initialized based on 
	 *   jQM page init event. 
	 *
	 *   @param {Event} event - jQM event, not actually being
	 *          used by us at the moment. 
	 *   @event
	 ******************************************************************************/
	pageInit: function(event){
		
		
		// Bug in JQM? Clear button flashes when loading page?
		// This line will fix it.
		$("#transfer .ui-input-clear").addClass("ui-input-clear-hidden");
		
		$(window).trigger("resize");
		
	},
	
	
	
	/******************************************************************************/
	/**  Triggered when the transfer page is first created based on 
	 *   jQM page create event. 
	 *
	 *   @param {Event} event - jQM event, not actually being
	 *          used by us at the moment. 
	 *   @event
	 ******************************************************************************/
	pageCreate: function(event){
	
		// Fix iScroll?
		if(KU.ISCROLL) KU.fixIscroll("#transfer"); 
		
		// Resize and get first page for overflow
		$(window).trigger("resize");
		
		
		// Change type from Course --> College
		$("#transfer-courseBar #transfer-select").bind("change", KU.Transfer.changeTypeToCollege);
		
		// Change type from Course <-- College
		$("#transfer-collegeBar #transfer-select").bind("change", KU.Transfer.changeTypeToCourse);
		
		
		// Trigger for direct change in college dropdown box
		$("#transfer-college").bind("change", KU.Transfer.collegeDropdownChangeEvent);
		
		
		// Trigger for direct change in search box
		$("#transfer-search").bind("change", KU.Transfer.searchDirectChangeEvent);
		
		
		// Trigger for incremental change in search box
		$("#transfer-search").keyup(KU.Transfer.searchIncrementalChangeEvent);
		
		// Download college list?
		if($("#transfer-college option").length == 0){
		
			KU.Transfer.downloadColleges();
		}
		
	},
	
	
	
	/******************************************************************************/
	/**  Triggered when the user does a key up event in order to simulate incremental
	 *   searching for the attached search bar. Note that this is done for searching
	 *   by course-ID only!
	 *   @event
	 ******************************************************************************/
	searchIncrementalChangeEvent: function() {
			
		// Definitely a change?
		if(this.value != KU.Transfer.lastCourse){
		
			// Store value
			KU.Transfer.lastCourse = this.value;
		
			// Clear timeout
			if(KU.Transfer.sentTimeout) clearTimeout(KU.Transfer.sentTimeout);
			KU.Transfer.typing = true;
			
			KU.Transfer.sentTimeout = setTimeout(function(latestValue){
				
				// Definitely not a change?
				if(latestValue == KU.Transfer.lastCourse){
					
					// Abort ajax
					if(KU.Transfer.sentAjax) KU.Transfer.sentAjax.abort();
					
					// Save new value, reinit, download
					KU.Transfer.lastCourse = latestValue;
					KU.Transfer.reinitialize();
					KU.Transfer.downloadCourseTrans();
				}
				
				KU.Transfer.typing = false;
				
			}, KU.INCR_WAIT_TIME, this.value);
		}
	},
	
	
	
	/******************************************************************************/
	/**  Triggered when the user does a direct change to search bar. Includes 
	 *   typing then changing focus or pressing the clear button. This is redundant
	 *   to the incremental search event, except for the clear button! Note that this
	 *   is done for searching by course-ID only!
	 *   @event
	 ******************************************************************************/
	searchDirectChangeEvent: function(e,u){
			
		// Definitely a change?
		if(this.value != KU.Transfer.lastCourse){
		
			// Clear timeout and ajax
			if(KU.Transfer.sentTimeout) clearTimeout(KU.Transfer.sentTimeout);
			if(KU.Transfer.sentAjax) KU.Transfer.sentAjax.abort();
			
			// Change last value and reinitialize
			KU.Transfer.lastCourse = this.value;
			KU.Transfer.reinitialize();
			
			// Download results
			KU.Transfer.downloadCourseTrans();
		}
	},
	
	
	
	/******************************************************************************/
	/**  Triggered when the user does a direct change to the college drop down.
	 *   When this occurs we need to do another search and display the results.
	 *   @event
	 ******************************************************************************/
	collegeDropdownChangeEvent: function(e,u){
		
		// Definitely a change?
		if(this.value != KU.Transfer.lastCollege){
		
			// Clear timeout and ajax
			if(KU.Transfer.sentTimeout) clearTimeout(KU.Transfer.sentTimeout);
			if(KU.Transfer.sentAjax) KU.Transfer.sentAjax.abort();
			
			// Change last value and reinitialize
			KU.Transfer.lastCollege = this.value;
			KU.Transfer.reinitialize();
			
			// Download results
			KU.Transfer.downloadCollegeTrans();
		}
	},
	
	
	
	/******************************************************************************/
	/**  Triggered when user chooses the type 'course'. For this we need to rearrange
	 *   some of the DOM elements (switch between drop down to a searchbar!).
	 *   @event
	 ******************************************************************************/
	changeTypeToCourse: function(e,u){
		
		if(this.value == "course"){
			// Reset back to course
			$(this).val('college');
			$(this).selectmenu('refresh', true) 
			
			// Stop downloading
			if(KU.Transfer.sentTimeout) clearTimeout(KU.Transfer.sentTimeout);
			if(KU.Transfer.sentAjax) KU.Transfer.sentAjax.abort();
			
			// Change type then reinitialize
			KU.Transfer.type = this.value;	
			KU.Transfer.reinitialize();
			$("#transfer-list li").remove();
			
			// Hide yourself
			$("#transfer-collegeBar").hide();
			
			// Show the college bar
			$("#transfer-courseBar").show();
			
			// Need to show last course?
			if(KU.Transfer.lastCourse != ""){
				KU.Transfer.downloadCourseTrans();
			}
		}
	},
	
	
	
	/******************************************************************************/
	/**  Triggered when user chooses the type 'college'. For this we need to rearrange
	 *   some of the DOM elements (switch between searchbar to a drop down!).
	 *   @event
	 ******************************************************************************/
	changeTypeToCollege: function(e,u){
		
		if(this.value == "college"){
			// Reset back to course
			$(this).val('course');
			$(this).selectmenu('refresh', true) 
			
			// Stop downloading
			if(KU.Transfer.sentTimeout) clearTimeout(KU.Transfer.sentTimeout);
			if(KU.Transfer.sentAjax) KU.Transfer.sentAjax.abort();
			
			// Change type then reinitialize
			KU.Transfer.type = this.value;	
			KU.Transfer.reinitialize();
			$("#transfer-list li").remove();
			
			// Hide yourself
			$("#transfer-courseBar").hide();
			
			// Show the college bar
			$("#transfer-collegeBar").show();
			
			// Download college list?
			if($("#transfer-college option").length == 0){
			
				KU.Transfer.downloadColleges();
				$("#transfer-collegeBar select").prop('selectedIndex', -1);
				$("#transfer-container-college .ui-select span").text("Select college...");
				$("#transfer-container-college .ui-select span").css("color","#A0A0A0");
			}
			
			// Download last college?
			else if(KU.Transfer.lastCollege != ""){
				KU.Transfer.downloadCollegeTrans();
			}
			
			// Show select college hint!
			else{
				$("#transfer-collegeBar select").prop('selectedIndex', -1);
				$("#transfer-container-college .ui-select span").text("Select college...");
				$("#transfer-container-college .ui-select span").css("color","#A0A0A0");
			}
		}
	},
	
	
	
	/******************************************************************************/
	/**  Downloads the list of colleges and their corresponding ID's from Kettering's
	 *   website/restful API. Then we add this to our dropdown so the user can 
	 *   select his/her preferred college to search by. 
	 ******************************************************************************/
	downloadColleges: function(){
		
		// Compile URL
		var url = 'https://okras.kettering.edu/kuapps/apex_apps.transfer_art_pkg.get_json_ces_colleges';
		

		$.ajax({
			url: url,
			type: 'GET',
			dataType: 'html',
			success: function(data) {
				
				var colleges = JSON.parse(data).entries;
				var optionsStr = "";
				
				
				// Check all colleges
				for(var index = 0; index < colleges.length; index++){
					
					var college = colleges[index];
					
					// Add option
					if(college.stvsbgi_code != null && college.stvsbgi_desc!= null){
						optionsStr += "<option value=\"" + college.stvsbgi_code + "\">" + college.stvsbgi_desc + "</option>";
					}
				}					
				
				// Append all colleges at once
				$("#transfer-college").html(optionsStr);
				
			},
			
			// Nothing much to do 
			error: function(data){
			
				KU.showGlobalError();
			}
		});	
	},
	
	
	
	/******************************************************************************/
	/**  Downloads and displays the transfer information by course-ID. Note that 
	 *   this method does not contain any arguments but still uses namespace variables.
	 ******************************************************************************/
	downloadCourseTrans: function (){

		if(!this.loading){
			
			// Now loading
			this.loading = true;
			KU.showLoading("transfer-header");
				
			// Clear entire list for page 0
			$("#transfer-list li").remove();
			
			// Pattern for -
			var coursePatternDash = /([a-zA-Z]+)-(\d\d\d)/g;
			var courseSeparatedDash = coursePatternDash.exec(this.lastCourse);
			
			// Pattern for \s
			var coursePatternSpace = /([a-zA-Z]+)\s(\d\d\d)/g;
			var courseSeparatedSpace = coursePatternSpace.exec(this.lastCourse);
			
			// Pattern for nothing!
			var coursePatternNT = /([a-zA-Z]+)(\d\d\d)/g;
			var courseSeparatedNT = coursePatternNT.exec(this.lastCourse);
			
			// Match course id pattern for dash?
			if(courseSeparatedDash != null && courseSeparatedDash.length == 3){
				var subject = courseSeparatedDash[1];
				var idNum = courseSeparatedDash[2];
			}
			
			// Match course id pattern for \s?
			else if(courseSeparatedSpace != null && courseSeparatedSpace.length == 3){
				var subject = courseSeparatedSpace[1];
				var idNum = courseSeparatedSpace[2];
			}
			
			// Match course id pattern for nothing?
			else if(courseSeparatedNT != null && courseSeparatedNT.length == 3){
				var subject = courseSeparatedNT[1];
				var idNum = courseSeparatedNT[2];
			}
			
			// No match?
			else {
				KU.hideLoading("transfer-header");
				this.loading = false;
				return;
			}
			
			// Compile URL
			var url = 'https://okras.kettering.edu/kuapps/apex_apps.transfer_art_pkg.'
						+ 'get_json_transferable_courses?as_state=ALL'
						+ '&as_subject=' + encodeURIComponent(subject.toUpperCase()) 
						+ '&as_course=' + encodeURIComponent(idNum);
			
			// Store ajax (in case we need to cancel later)
			this.sentAjax = $.ajax({
				url: url,
				type: 'GET',
				dataType: 'html',
				success: function(data) {
					
					
					var courses = JSON.parse(data).transfercourses;
					
					// Sort by state then by college
					var sorter = function(a,b) {
					  
					  if (a.course_state < b.course_state)
						 return -1;
					  else if (a.course_state > b.course_state)
						return 1;
					  else{
						if (a.college < b.college)
						 return -1;
					    else if (a.college > b.college)
						 return 1;
					    else return 0;
					  } 
					}
					
					courses.sort(sorter);
					
					for(var index = 0; index < courses.length; index++){
						
						var course = courses[index];
								
						// Defaults
						var minH = "0px;";
						
						// Setup item information
						var title = course.college;
						
						// Make listitem
						var listitem = $('<li></li>',{
							'class':"grey-grad",
							'style':"min-height:" + minH,
							'data-transition':'none',
						});
												
						// Make h1
						$('<h1></h1>',{
							'style':'white-space:normal;',
							'text': title
						}).appendTo(listitem);
						
						// Title exist?
						if(course.course_title != null){
						
							// Make p
							$('<p></p>',{
								'text': "Title: " + course.course_title,
							}).appendTo(listitem);
						}
						
						// Equivalent course exist?
						if(course.course != null){
						
							// Make p
							$('<p></p>',{
								'text': "Equivalent: " + course.course,
							}).appendTo(listitem);
						}
						
						// Location exist?
						if(course.course_city != null && course.course_state != null){
						
							// Make p
							$('<p></p>',{
								'text': "Location: " + course.course_city + ", " + course.course_state,
							}).appendTo(listitem);
						}
						
						// If no lists then make them!
						if(KU.Transfer.listQueue==null) KU.Transfer.listQueue = new Array();
						if(KU.Transfer.listInfoQueue==null) KU.Transfer.listInfoQueue = new Array();
						
						// Add the item to the queue to be added after complete download
						// NOTE: This is intentional so the DOM processing does not create
						// a lag and unfriendly experience, we process all at the end
						KU.Transfer.listQueue[KU.Transfer.listQueue.length] = listitem;
						KU.Transfer.listInfoQueue[KU.Transfer.listInfoQueue.length] = {"state":course.course_state};
						
					}
					
	
					// No longer loading
					KU.Transfer.loading = false;
					KU.hideLoading("transfer-header");

					// Go through all items in the list queue
					for(var index = 0; index < KU.Transfer.listQueue.length; index++){
						
						var state = KU.Transfer.listInfoQueue[index].state;
						
						if($('#transfer-list #' + state).length == 0){
							
							var fullState = KU.convertStateToFull(KU.Transfer.listInfoQueue[index].state);
							if(fullState == null) fullState = state;
														
							var stateDiv = $('<div></div>',{
								'text': fullState
							});
								
							// Create the date bar as divider!
							var divider = $('<li></li>',{
								'data-role': 'list-divider',
								'class':"read-only-grad date-bar",
								'id':state
							}).appendTo('#transfer-list');
							divider.append(stateDiv);
						
						}
						
						// Append to list
						KU.Transfer.listQueue[index].appendTo('#transfer-list');		
					}
					
					// Refresh and create new arrays
					$('#transfer-list').listview('refresh');
					KU.Transfer.listQueue = new Array();
					KU.Transfer.listInfoQueue = new Array();
						
					// Clear previous scrollbar!
					if(KU.ISCROLL) $(window).trigger("resize");
				},
				
				error: function(data){
				
					KU.hideLoading("transfer-header");
					KU.Transfer.loading = false;
				}
			});	
		}
	},
	
	
	
	/******************************************************************************/
	/**  Downloads and displays the transfer information by college-ID. Note that 
	 *   this method does not contain any arguments but still uses namespace variables.
	 ******************************************************************************/
	downloadCollegeTrans: function (){

		if(!this.loading){
			
			// Now loading
			this.loading = true;
			KU.showLoading("transfer-header");
				
			// Clear entire list for page 0
			$("#transfer-list li").remove();
			
			// Compile URL
			var url = 'https://okras.kettering.edu/kuapps/apex_apps.transfer_art_pkg.get_json_ces_credits?'
						+ 'as_sbgi=' + this.lastCollege;
			
			
			// Store ajax (in case we need to cancel later)
			this.sentAjax = $.ajax({
				url: url,
				type: 'GET',
				dataType: 'html',
				success: function(data) {
							
					var courses = JSON.parse(data).entries;
					
					// Sort by state then by college
					var sorter = function(a,b) {
					  
					  if (a.kucourse < b.kucourse)
						 return -1;
					  else if (a.kucourse > b.kucourse)
						return 1;
					  else{
						if (a.kucoursetitle < b.kucoursetitle)
						 return -1;
					    else if (a.kucoursetitle > b.kucoursetitle)
						 return 1;
					    else return 0;
					  } 
					}
					
					// Sort
					courses.sort(sorter);
					
					for(var index = 0; index < courses.length; index++){
						
						var course = courses[index];
						
						// Valid course?
						if(course.kucourse != null
							&& course.kucoursetitle != null
							&& course.trnscrse != null
							&& course.kucourse.trim() != ""
							&& course.kucoursetitle.trim() != ""
							&& course.trnscrse.trim() != ""){
						
							// Defaults
							var minH = "0px;";
							
							// Setup item information
							var title = course.kucoursetitle;
							
							// Make listitem
							var listitem = $('<li></li>',{
								'class':"grey-grad",
								'style':"min-height:" + minH,
								'data-transition':'none',
							});
													
							// Make h1
							$('<h1></h1>',{
								'style':'white-space:normal;',
								'text': title
							}).appendTo(listitem);
							
							// Course course exist?
							if(course.kucourse != null){
							
								// Make p
								$('<p></p>',{
									'text': "Course: " + course.kucourse,
								}).appendTo(listitem);
							}
							
							// Equivalent exist?
							if(course.trnscrse != null){
							
								// Make p
								$('<p></p>',{
									'text': "Equivalent: " + course.trnscrse,
								}).appendTo(listitem);
							}
							
							// Credits exist?
							if(course.credits != null && course.credits != ""){
							
								// Make p
								$('<p></p>',{
									'text': "Credits: " + course.credits
								}).appendTo(listitem);
							}
							
							// If no lists then make them!
							if(KU.Transfer.listInfoQueue==null) KU.Transfer.listInfoQueue = new Array();
						
							// Add the item to the queue to be added after complete download
							// NOTE: This is intentional so the DOM processing does not create
							// a lag and unfriendly experience, we process all at the end
							KU.Transfer.listQueue[KU.Transfer.listQueue.length] = listitem;
							KU.Transfer.listInfoQueue[KU.Transfer.listInfoQueue.length] = {"subject":course.kucourse};
						}
						
					}
					
	
					// No longer loading
					KU.Transfer.loading = false;
					KU.hideLoading("transfer-header");

					// Go through all items in the list queue
					for(var index = 0; index < KU.Transfer.listQueue.length; index++){
						
						var subject = KU.Transfer.listInfoQueue[index].subject;

						// Pattern and exec
						var coursePattern = /([a-zA-Z]+)\s([\d]+)/g;
						var courseSeparated = coursePattern.exec(subject);
						
						// Match course id pattern?
						if(courseSeparated != null && courseSeparated.length == 3){
							subject = courseSeparated[1];

							// Subject does not exist?
							if($('#transfer-list #' + subject).length == 0){
															
								var subjectDiv = $('<div></div>',{
									'text': subject
								});
									
								// Create the date bar as divider!
								var divider = $('<li></li>',{
									'data-role': 'list-divider',
									'class':"read-only-grad date-bar",
									'id':subject
								}).appendTo('#transfer-list');
								divider.append(subjectDiv);
							
							}
							
							// Append to list
							KU.Transfer.listQueue[index].appendTo('#transfer-list');	
						}
					}
					
					// Refresh and create new arrays
					$('#transfer-list').listview('refresh');
					KU.Transfer.listQueue = new Array();
						
					// Clear previous scrollbar!
					if(KU.ISCROLL) $(window).trigger("resize");
				},
				
				error: function(data){
				
					KU.hideLoading("transfer-header");
					KU.Transfer.loading = false;
				}
			});	
		}
	},
	
	
	
	/******************************************************************************/
	/**  Reinitializes all properties of {@link KU.Transfer} as if to restore
	 *   a new/default instance of the namespace.
	 ******************************************************************************/
	reinitialize: function(){
		
		this.listQueue = new Array();
		this.listInfoQueue = new Array();
		this.loading = false;
		
		// Clear previous scrollbar!
		if(KU.ISCROLL) $(window).trigger("resize");
	}
	
	
	
};