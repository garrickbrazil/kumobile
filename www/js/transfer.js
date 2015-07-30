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


/******************************************************************************
 *  Contains all transfer related functions for loading and controlling the
 *  transfer page.
 *
 *  @class KUMobile.Transfer
 ******************************************************************************/
KUMobile.Transfer = {
	
    
    /******************************************************************************
     *  Is the transfer page loading?
     *
     *  @attribute loading
     *  @type {boolean}
     *  @for KUMobile.Transfer
     *  @default false
     ******************************************************************************/
	loading: false,
    
    
    /******************************************************************************
     *  Type of searching for Kettering's transfer. Represents the method of 
     *  searching that will be used by the system. 
     *
     *  @attribute type
     *  @type {string}
     *  @for KUMobile.Transfer
     *  @default "course"
     ******************************************************************************/
	type: "course",
	
	
    /******************************************************************************
     *  Represents the last value the user has searched for in the transfer
     *
     *  @attribute lastValue
     *  @type {string}
     *  @for KUMobile.Transfer
     *  @default ""
     ******************************************************************************/
	lastValue: "",

    
    /******************************************************************************
     *  Represents the last college the user has searched for in the transfer
     *
     *  @attribute lastCollege
     *  @type {string}
     *  @for KUMobile.Transfer
     *  @default ""
     ******************************************************************************/
	lastCollege: "",
	
	
	/******************************************************************************
     *  Is the user currently typing?
     *
     *  @attribute typing
     *  @type {boolean}
     *  @for KUMobile.Transfer
     *  @default false
     ******************************************************************************/    
	typing: false,

    
    /******************************************************************************
     *  Contains the current list of article DOM <li> tag items that still need
	 *  to be added to the DOM (much faster to add all at once after load
	 *  is done downloading). This helps prevent the application from seeming to 
	 *  hang or become unresponsive.
     *
     *  @attribute listQueue
     *  @type {Array}
     *  @for KUMobile.Transfer
     *  @private 
     ******************************************************************************/
	listQueue: [],
	

	/******************************************************************************
     *  Contains the last timeout call sent. This allows us to restart the timeout if
	 *  the user re-searches in any way (dropdown, or searchbar). The major benefit
	 *  of this is that it gives us the feeling of incremental searching, e.g we send
	 *  a timeout of some milliseconds whenever the KEY_UP event triggers, as well
	 *  as cancelling out the last timeout we sent. 
     *
     *  @attribute sentTimeout
     *  @type {Object}
     *  @for KUMobile.Transfer
     *  @private
     ******************************************************************************/
	sentTimeout: null,


    /******************************************************************************
     *  Contains the latest separator keyvalue so we can detect when a new
     *  separator is needed.
     *
     *  @attribute lastState
     *  @type {string}
     *  @for KUMobile.Transfer
     *  @private
     ******************************************************************************/
    lastSeparator: "",
	
	
	/******************************************************************************
     *  Triggered when the transfer page is first initialized based on jQuery Mobile
     *  pageinit event.
	 *
     *  @event pageInit
     *  @for KUMobile.Transfer
     ******************************************************************************/
	pageInit: function(event){
		
		// Bug in JQM? Clear button flashes when loading page?
		// This line will fix it.
		$("#transfer .ui-input-clear").addClass("ui-input-clear-hidden");
		
	},
	
	
    /******************************************************************************
     *  Triggered when the transfer page is first created based on jQuery Mobile
     *  pagecreate event. This is called after the page itself is created but 
     *  before any jQuery Mobile styling is applied.
	 *
     *  @event pageCreate
     *  @for KUMobile.Transfer
     ******************************************************************************/
	pageCreate: function(event){
	
		// Resize and get first page for overflow
		$(window).trigger("resize");
		
        
        /* Success for college list download*/
        var success = function(colleges){
            
            // Re-enable!
            $("#transfer-courseBar select").removeAttr("disabled");
            $("#transfer-search").removeAttr("disabled");
            
            // Go through all departments
            for(var i in colleges){
                
                // Current college
                var college = colleges[i];
                
                // Add college option!
                $("<option></option>",{
                    "value": college.code,
                    "text": college.name
                }).appendTo("#transfer-college");
            }
            
            // Change type from Course --> College
            $("#transfer-courseBar #transfer-select").bind("change", KUMobile.Transfer.changeTypeToCollege);
            
            // Change type from Course <-- College
            $("#transfer-collegeBar #transfer-select").bind("change", KUMobile.Transfer.changeTypeToCourse);
            
            // Trigger for change in TID select
            $("#transfer-college").bind("change", KUMobile.Transfer.collegeChange);
            
            // Trigger for direct change in search box
            $("#transfer-search").bind("change", KUMobile.Transfer.directSearch);
            
            // Trigger for incremental change in search box
            $("#transfer-search").keyup( KUMobile.Transfer.incrementalSearch);
            
            // Not loading anymore
            KUMobile.hideLoading("transfer-header");
            KUMobile.Transfer.loading = false;

        };

        /* Fail */
        var failure = function(error){
            
            // Not loading anymore presumably..
            KUMobile.hideLoading("transfer-header");
            KUMobile.Transfer.loading = false;
            
            KUMobile.safeAlert("Error", "Sorry the transfer colleges could not be loaded. Check your" +
                    " internet connection. If the issue persists then please report the bug.", "ok");
        };
        
        
        // Get the departments!
        KU.Transfer.getColleges(success, failure);
        
        // Disable the selection
        $("#transfer-courseBar select").attr("disabled","disabled");
        $("#transfer-search").attr("disabled","disabled");
        
         // Show loading
        KUMobile.showLoading("transfer-header");
        KUMobile.Transfer.loading = true;
        
        // Setup college bar hint
        $("#transfer-collegeBar select").prop('selectedIndex', -1);
        $("#transfer-container-college .ui-select span").text("Select college...");
        $("#transfer-container-college .ui-select span").css("color","#A0A0A0");
        
	},
	
	
    /******************************************************************************
     *  Triggered when the user does a key up event in order to simulate incremental
	 *  searching for the attached search bar. 
	 *
     *  @event incrementalSearch
     *  @for KUMobile.Transfer
     ******************************************************************************/
	incrementalSearch: function() {
			
		// Definitely a change?
		if(this.value != KUMobile.Transfer.lastValue){
		
			// Store value
			KUMobile.Transfer.lastValue = this.value;
		
			// Clear timeout
			if(KUMobile.Transfer.sentTimeout) clearTimeout(KUMobile.Transfer.sentTimeout);
			KUMobile.Transfer.typing = true;
			
			KUMobile.Transfer.sentTimeout = setTimeout(function(latestValue){
				
				// Definitely not a change?
				if(latestValue == KUMobile.Transfer.lastValue){
					
					// Abort ajax
					KU.Transfer.abort();
					
					// Save new value, reinit, download
					KUMobile.Transfer.lastValue = latestValue;
					KUMobile.Transfer.reinitialize();
					KUMobile.Transfer.loadByCourse();
				}
				
				KUMobile.Transfer.typing = false;
				
			}, KUMobile.Config.DEFAULT_INCR_WAIT_TIME, this.value);
		}
	},
	
	
    /******************************************************************************
     *  Triggered when the user does a direct change. The direct change includes 
	 *  typing then changing focus or pressing the clear button. This is redundant
	 *  to the incremental search event, *except for the clear button!!*
	 *
     *  @event directSearch
     *  @for KUMobile.Transfer
     ******************************************************************************/	
	directSearch: function(e,u){
			
		// Definitely a change?
		if(this.value != KUMobile.Transfer.lastValue){
		
			// Clear timeout and ajax
			if(KUMobile.Transfer.sentTimeout) clearTimeout(KUMobile.Transfer.sentTimeout);
			KU.Transfer.abort();
			
			// Change last value and reinitialize
			KUMobile.Transfer.lastValue = this.value;
			KUMobile.Transfer.reinitialize();
			
			// Download results
			KUMobile.Transfer.loadByCourse();
		}
	},
	
	
    /******************************************************************************
     *  Triggered when the user does a change to the college drop down box.
	 *  When this happens, we need to redo the search.  
	 *
     *  @event collegeChange
     *  @for KUMobile.Transfer
     ******************************************************************************/    
	collegeChange: function(e,u){
		
		// Definitely a change?
		if(this.value != KUMobile.Transfer.lastCollege){		
	
			// Clear timeout and ajax
			if(KUMobile.Transfer.sentTimeout) clearTimeout(KUMobile.Transfer.sentTimeout);
			KU.Transfer.abort();
			
			// Change TID then reinitialize
			KUMobile.Transfer.lastCollege = this.value;
			KUMobile.Transfer.reinitialize();
			
			// Download results
			KUMobile.Transfer.loadByCollege();
		}
	},
	
    
    /******************************************************************************
     *  Triggered when user chooses the type 'course'. For this we need to rearrange
	 *  some of the DOM elements.
	 *
     *  @event changeTypeToCourse
     *  @for KUMobile.Transfer
     ******************************************************************************/
	changeTypeToCourse: function(e,u){
		
		if(this.value == "course"){
            
			// Reset back to course
			$(this).val('college');
			$(this).selectmenu('refresh', true) 
			
			// Stop downloading
			if(KUMobile.Transfer.sentTimeout) clearTimeout(KUMobile.Transfer.sentTimeout);
			KU.Transfer.abort();
			
			// Change type then reinitialize
			KUMobile.Transfer.type = this.value;	
			KUMobile.Transfer.reinitialize();
			$("#transfer-list li").remove();
			
			// Hide the college bar
			$("#transfer-collegeBar").hide();
			
			// Show the course bar
			$("#transfer-courseBar").show();
			
			// Need to show last course?
			if(KUMobile.Transfer.lastValue != ""){
                
                // Load!
				KUMobile.Transfer.loadByCourse();
			}
		}
	},
    
    
    /******************************************************************************
     *  Triggered when user chooses the type 'college'. For this we need to rearrange
	 *  some of the DOM elements.
	 *
     *  @event changeTypeToCollege
     *  @for KUMobile.Transfer
     ******************************************************************************/
	changeTypeToCollege: function(e,u){
		
		if(this.value == "college"){
			
            // Reset back to course
			$(this).val('course');
			$(this).selectmenu('refresh', true) 
			
			// Stop downloading
			if(KUMobile.Transfer.sentTimeout) clearTimeout(KUMobile.Transfer.sentTimeout);
			KU.Transfer.abort();
			
			// Change type then reinitialize
			KUMobile.Transfer.type = this.value;	
			KUMobile.Transfer.reinitialize();
			$("#transfer-list li").remove();
			
			// Hide the course bar
			$("#transfer-courseBar").hide();
			
			// Show the college bar
			$("#transfer-collegeBar").show();
			
			// Download last college?
			if(KUMobile.Transfer.lastCollege != ""){
                
                // Load!
				KUMobile.Transfer.loadByCollege();
			}
			
		}
	},
    
	
    /******************************************************************************
     *  Loads and displays the current set of transfer items searched by course.
	 *
     *  @method loadByCourse
     *  @for KUMobile.Transfer
     *  @example
     *      KUMobile.Transfer.loadByCourse();
     ******************************************************************************/
	loadByCourse: function (){
		
        
		if(!this.loading){
			
			// Now loading
			this.loading = true;
            KUMobile.showLoading("transfer-header");

            // Clear entire list for page 0
			$("#transfer-list li").remove();
            
            var subject, idNum;
            
            // Pattern for course id as PR-NUM
			var coursePatternDash = /([a-zA-Z]+)-(\d\d\d)/g;
			var courseSeparatedDash = coursePatternDash.exec(this.lastValue);
			
			// Pattern for \s for course id as PR NUM
			var coursePatternSpace = /([a-zA-Z]+)\s(\d\d\d)/g;
			var courseSeparatedSpace = coursePatternSpace.exec(this.lastValue);
			
			// Pattern for course id as PRNUM
			var coursePatternNT = /([a-zA-Z]+)(\d\d\d)/g;
			var courseSeparatedNT = coursePatternNT.exec(this.lastValue);
			
			// Match course id pattern for dash?
			if(courseSeparatedDash != null && courseSeparatedDash.length == 3){
				subject = courseSeparatedDash[1];
				idNum = courseSeparatedDash[2];
			}
			
			// Match course id pattern for \s?
			else if(courseSeparatedSpace != null && courseSeparatedSpace.length == 3){
				subject = courseSeparatedSpace[1];
				idNum = courseSeparatedSpace[2];
			}
			
			// Match course id pattern for nothing?
			else if(courseSeparatedNT != null && courseSeparatedNT.length == 3){
				subject = courseSeparatedNT[1];
				idNum = courseSeparatedNT[2];
			}
			
			// No match?
			else {
				KUMobile.hideLoading("transfer-header");
				this.loading = false;
				return;
			}
            
			
            /* Success */
			var success = function(items){
                
                
                // Setup data
                for(var index in items){
                 
                    // Current item and template
                    var item = items[index];
                    var courseTpl = Handlebars.getTemplate("transfer-bycourse-item");
                    var barTpl = Handlebars.getTemplate("transfer-bar");
                    
                    
                    // Add state divider bar?
                    if(KUMobile.convertStateToFull(item.college.state) 
                        != KUMobile.Transfer.lastSeparator){
                    
                        // Divider
                        var div = barTpl({
                            "id": "ku" + KUMobile.convertStateToFull(item.college.state),
                            "title": KUMobile.convertStateToFull(item.college.state)
                        });
                        
                        // Save to list and update last separator
                        KUMobile.Transfer.listQueue[KUMobile.Transfer.listQueue.length] = div;
                        KUMobile.Transfer.lastSeparator = KUMobile.convertStateToFull(item.college.state);
                    }
                    
                    // Course data
                    var course = courseTpl({
                        "college": item.college.name,
                        "title": item.transTitle,
                        "equivalent": item.transCourseId,
                        "location": item.college.city + ", " + item.college.state
                        
                    });
                    
                    // Add list item to queue
                    KUMobile.Transfer.listQueue[KUMobile.Transfer.listQueue.length] = course;
                    
                }
                
                    
                // Not loading
                KUMobile.hideLoading("transfer-header");
                KUMobile.Transfer.loading = false;
                    
                // Go through all list items
                for (var index in KUMobile.Transfer.listQueue){
                    
                    // Append to transfer list
                    $(KUMobile.Transfer.listQueue[index]).appendTo("#transfer-list");
                    
                }

                // Refresh and clear both lists
                $('#transfer-list').listview('refresh');
                KUMobile.Transfer.listQueue = [];
                
            };
            
            /* Fail */
            var failure = function(error){
                
                // Not loading anymore presumably..
                KUMobile.hideLoading("transfer-header");
                KUMobile.Transfer.loading = false;
                
                KUMobile.safeAlert("Error", "Sorry the transfer courses could not be loaded. Check your" +
                    " internet connection. If the issue persists then please report the bug.", "ok");
            };
            
            // Search!
            KU.Transfer.searchByCourseId(subject, idNum , "ALL", success, failure);
            
        }
    },
	
    
    /******************************************************************************
     *  Loads and displays the current set of transfer items searched by college.
	 *
     *  @method loadByCollege
     *  @for KUMobile.Transfer
     *  @example
     *      KUMobile.Transfer.loadByCollege();
     ******************************************************************************/
	loadByCollege: function (){
        
		if(!this.loading){
			
			// Now loading
			this.loading = true;
            KUMobile.showLoading("transfer-header");

            // Clear entire list for page 0
			$("#transfer-list li").remove();
			
            /* Success */
			var success = function(items){
                
                
                // Setup data
                for(var index in items){
                 
                    // Current item and template
                    var item = items[index];
                    var courseTpl = Handlebars.getTemplate("transfer-bycollege-item");
                    var barTpl = Handlebars.getTemplate("transfer-bar");
                    
                    // Pattern and exec
                    var coursePattern = /([a-zA-Z]+)\s([\d]+)/g;
                    var courseSeparated = coursePattern.exec(item.kuCourseId);
                    
                    // Match course id pattern?
                    if(courseSeparated != null && courseSeparated.length == 3
                        && courseSeparated[1] != KUMobile.Transfer.lastSeparator){
                        
                        var subject = courseSeparated[1];
                    
                        // Divider
                        var div = barTpl({
                            "id": "ku" + subject,
                            "title": subject
                        });
                        
                        // Save to list and update last separator
                        KUMobile.Transfer.listQueue[KUMobile.Transfer.listQueue.length] = div;
                        KUMobile.Transfer.lastSeparator = subject
                    }
                    
                    // Course data
                    var course = courseTpl({
                        "title": item.kuTitle,
                        "kuCourseId": item.kuCourseId,
                        "equivalent": item.transCourseId,
                        "credits": item.credits
                        
                    });
                    
                    // Add list item to queue
                    KUMobile.Transfer.listQueue[KUMobile.Transfer.listQueue.length] = course;
                    
                }
                
                    
                // Not loading
                KUMobile.hideLoading("transfer-header");
                KUMobile.Transfer.loading = false;
                    
                // Go through all list items
                for (var index in KUMobile.Transfer.listQueue){
                    
                    // Append to transfer list
                    $(KUMobile.Transfer.listQueue[index]).appendTo("#transfer-list");
                    
                }

                // Refresh and clear both lists
                $('#transfer-list').listview('refresh');
                KUMobile.Transfer.listQueue = [];
                
            };
            
            /* Fail */
            var failure = function(error){
                
                // Not loading anymore presumably..
                KUMobile.hideLoading("transfer-header");
                KUMobile.Transfer.loading = false;
                
                KUMobile.safeAlert("Error", "Sorry the transfer courses could not be loaded. Check your" +
                    " internet connection. If the issue persists then please report the bug.", "ok");
            };
            
            // Search!
            KU.Transfer.searchByCollege(this.lastCollege, success, failure);
            
        }
    },
	
	
    /******************************************************************************
     *  Reinitializes all properties of KUMobile.Transfer as if to restore
	 *  a new/default instance.
	 *
     *  @method reinitialize
     *  @for KUMobile.Transfer
     *  @example
     *      KUMobile.Transfer.reinitialize();
     ******************************************************************************/	
	reinitialize: function(){
		
        // Reset properties!
		this.listQueue = [];
		this.page = 0;
        this.lastSeparator = "";
		this.loading = false;
		this.reachedEnd = false;

	}
		
	
};