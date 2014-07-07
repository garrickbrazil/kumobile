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
 * KU Transfer
 *********************************************************/
 var KU_Transfer = {
	
	type:'course',						// type of searching?
	lastCourse:'',						// value for last course
	lastCollege:'',						// latest college value
	loading: false,						// is transfer loading ?
	typing: false,						// currently typing?
	initialized: false,					// initialized?
	
	/**********************************************************
	 * Download colleges
	 *********************************************************/
	downloadColleges: function(){
		
		// Compile URL
		var url = 'https://okras.kettering.edu/kuapps/apex_apps.transfer_art_pkg.get_json_ces_colleges';
		
		// Store ajax (in case we need to cancel later)
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
			
				KU_Config.showGlobalError();
			}
		});	
	},
	
	/**********************************************************
	 * Download course transfers
	 *********************************************************/
	downloadCourseTrans: function (){

		if(!this.loading){
			
			// Now loading
			this.loading = true;
			KU_Mods.showLoading("transfer-header");
				
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
				KU_Mods.hideLoading("transfer-header");
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
						if(KU_Transfer.listQueue==null) KU_Transfer.listQueue = new Array();
						if(KU_Transfer.listInfoQueue==null) KU_Transfer.listInfoQueue = new Array();
						
						// Add the item to the queue to be added after complete download
						// NOTE: This is intentional so the DOM processing does not create
						// a lag and unfriendly experience, we process all at the end
						KU_Transfer.listQueue[KU_Transfer.listQueue.length] = listitem;
						KU_Transfer.listInfoQueue[KU_Transfer.listInfoQueue.length] = {"state":course.course_state};
						
					}
					
	
					// No longer loading
					KU_Transfer.loading = false;
					KU_Mods.hideLoading("transfer-header");

					// Go through all items in the list queue
					for(var index = 0; index < KU_Transfer.listQueue.length; index++){
						
						var state = KU_Transfer.listInfoQueue[index].state;
						
						if($('#transfer-list #' + state).length == 0){
							
							var fullState = KU_Mods.convertStateToFull(KU_Transfer.listInfoQueue[index].state);
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
						KU_Transfer.listQueue[index].appendTo('#transfer-list');		
					}
					
					// Refresh and create new arrays
					$('#transfer-list').listview('refresh');
					KU_Transfer.listQueue = new Array();
					KU_Transfer.listInfoQueue = new Array();
						
					// Clear previous scrollbar!
					if(KU_Config.ISCROLL) $(window).trigger("resize");
				},
				
				error: function(data){
				
					KU_Mods.hideLoading("transfer-header");
					KU_Transfer.loading = false;
				}
			});	
		}
	},
	
	/**********************************************************
	 * Download college transfers
	 *********************************************************/
	downloadCollegeTrans: function (){

		if(!this.loading){
			
			// Now loading
			this.loading = true;
			KU_Mods.showLoading("transfer-header");
				
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
							if(KU_Transfer.listInfoQueue==null) KU_Transfer.listInfoQueue = new Array();
						
							// Add the item to the queue to be added after complete download
							// NOTE: This is intentional so the DOM processing does not create
							// a lag and unfriendly experience, we process all at the end
							KU_Transfer.listQueue[KU_Transfer.listQueue.length] = listitem;
							KU_Transfer.listInfoQueue[KU_Transfer.listInfoQueue.length] = {"subject":course.kucourse};
						}
						
					}
					
	
					// No longer loading
					KU_Transfer.loading = false;
					KU_Mods.hideLoading("transfer-header");

					// Go through all items in the list queue
					for(var index = 0; index < KU_Transfer.listQueue.length; index++){
						
						var subject = KU_Transfer.listInfoQueue[index].subject;

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
							KU_Transfer.listQueue[index].appendTo('#transfer-list');	
						}
					}
					
					// Refresh and create new arrays
					$('#transfer-list').listview('refresh');
					KU_Transfer.listQueue = new Array();
						
					// Clear previous scrollbar!
					if(KU_Config.ISCROLL) $(window).trigger("resize");
				},
				
				error: function(data){
				
					KU_Mods.hideLoading("transfer-header");
					KU_Transfer.loading = false;
				}
			});	
		}
	},
	
	/**********************************************************
	 * Reinitialize
	 *********************************************************/
	reinitialize: function(){
		
		this.listQueue = new Array();
		this.listInfoQueue = new Array();
		this.loading = false;
		
		// Clear previous scrollbar!
		if(KU_Config.ISCROLL) $(window).trigger("resize");
	}
};

/**********************************************************
 * Transfer page init
 *********************************************************/
$(document).on("pageinit","#transfer",function(event){
	KU_Transfer.initialized = true;
	
	// Bug in JQM? Clear button flashes when loading page?
	// This line will fix it.
	$("#transfer .ui-input-clear").addClass("ui-input-clear-hidden");
	
	$(window).trigger("resize");
});

/**********************************************************
 * Transfer page create
 *********************************************************/
$(document).on("pagecreate","#transfer",function(event){
	
	// Fix iScroll?
	if(KU_Config.ISCROLL) KU_Mods.fixIscroll("#transfer"); 
	
	// Resize and get first page for overflow
	$(window).trigger("resize");
	
	
	// Change type from Course --> College
	$("#transfer-courseBar #transfer-select").bind("change", function(e,u){
		
		if(this.value == "college"){
			// Reset back to course
			$(this).val('course');
			$(this).selectmenu('refresh', true) 
			
			// Stop downloading
			if(KU_Transfer.timeoutSent) clearTimeout(KU_Transfer.timeoutSent);
			if(KU_Transfer.sentAjax) KU_Transfer.sentAjax.abort();
			
			// Change type then reinitialize
			KU_Transfer.type = this.value;	
			KU_Transfer.reinitialize();
			$("#transfer-list li").remove();
			
			// Hide yourself
			$("#transfer-courseBar").hide();
			
			// Show the college bar
			$("#transfer-collegeBar").show();
			
			// Download college list?
			if($("#transfer-college option").length == 0){
			
				KU_Transfer.downloadColleges();
				$("#transfer-collegeBar select").prop('selectedIndex', -1);
				$("#transfer-container-college .ui-select span").text("Select college...");
				$("#transfer-container-college .ui-select span").css("color","#A0A0A0");
			}
			
			// Download last college?
			else if(KU_Transfer.lastCollege != ""){
				KU_Transfer.downloadCollegeTrans();
			}
			
			// Show select college hint!
			else{
				$("#transfer-collegeBar select").prop('selectedIndex', -1);
				$("#transfer-container-college .ui-select span").text("Select college...");
				$("#transfer-container-college .ui-select span").css("color","#A0A0A0");
			}
		}
	});
	
	// Change type from College --> Course
	$("#transfer-collegeBar #transfer-select").bind("change", function(e,u){
		
		if(this.value == "course"){
			// Reset back to course
			$(this).val('college');
			$(this).selectmenu('refresh', true) 
			
			// Stop downloading
			if(KU_Transfer.timeoutSent) clearTimeout(KU_Transfer.timeoutSent);
			if(KU_Transfer.sentAjax) KU_Transfer.sentAjax.abort();
			
			// Change type then reinitialize
			KU_Transfer.type = this.value;	
			KU_Transfer.reinitialize();
			$("#transfer-list li").remove();
			
			// Hide yourself
			$("#transfer-collegeBar").hide();
			
			// Show the college bar
			$("#transfer-courseBar").show();
			
			// Need to show last course?
			if(KU_Transfer.lastCourse != ""){
				KU_Transfer.downloadCourseTrans();
			}
		}
	});
	
	// Trigger for direct change in search box
	$("#transfer-search").bind("change", function(e,u){
		
		// Definitely a change?
		if(this.value != KU_Transfer.lastCourse){
		
			// Clear timeout and ajax
			if(KU_Transfer.timeoutSent) clearTimeout(KU_Transfer.timeoutSent);
			if(KU_Transfer.sentAjax) KU_Transfer.sentAjax.abort();
			
			// Change last value and reinitialize
			KU_Transfer.lastCourse = this.value;
			KU_Transfer.reinitialize();
			
			// Download results
			KU_Transfer.downloadCourseTrans();
		}
	});
	
	// Trigger for direct change in search box
	$("#transfer-college").bind("change", function(e,u){
		
		// Definitely a change?
		if(this.value != KU_Transfer.lastCollege){
		
			// Clear timeout and ajax
			if(KU_Transfer.timeoutSent) clearTimeout(KU_Transfer.timeoutSent);
			if(KU_Transfer.sentAjax) KU_Transfer.sentAjax.abort();
			
			// Change last value and reinitialize
			KU_Transfer.lastCollege = this.value;
			KU_Transfer.reinitialize();
			
			// Download results
			KU_Transfer.downloadCollegeTrans();
		}
	});
	
	// Trigger for incremental change in search box
	$("#transfer-search").keyup( function() {
		
		// Definitely a change?
		if(this.value != KU_Transfer.lastCourse){
		
			// Store value
			KU_Transfer.lastCourse = this.value;
		
			// Clear timeout
			if(KU_Transfer.timeoutSent) clearTimeout(KU_Transfer.timeoutSent);
			KU_Transfer.typing = true;
			
			KU_Transfer.timeoutSent = setTimeout(function(latestValue){
				
				// Definitely not a change?
				if(latestValue == KU_Transfer.lastCourse){
					
					// Abort ajax
					if(KU_Transfer.sentAjax) KU_Transfer.sentAjax.abort();
					
					// Save new value, reinit, download
					KU_Transfer.lastCourse = latestValue;
					KU_Transfer.reinitialize();
					KU_Transfer.downloadCourseTrans();
				}
				
				KU_Transfer.typing = false;
				
			}, KU_Config.INCR_WAIT_TIME, this.value);
		}
	});
	
	// Download college list?
	if($("#transfer-college option").length == 0){
	
		KU_Transfer.downloadColleges();
	}
});