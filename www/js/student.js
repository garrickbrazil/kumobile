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
 *  Contains all student related functions for loading and controlling the
 *  student driven.
 *
 *  @class KUMobile.Student
 ******************************************************************************/
KUMobile.Student = {
		
	
    /******************************************************************************
     *  Are the student services loading something?
     *
     *  @attribute loading
     *  @type {boolean}
     *  @for KUMobile.Student
     *  @default false
     ******************************************************************************/
	loading: false,
    
    
    /******************************************************************************
     *  Is the student logged in according to the application
     *
     *  @attribute loggedIn
     *  @type {boolean}
     *  @for KUMobile.Student
     *  @default false
     ******************************************************************************/
	loggedIn: false,
    
    
    /******************************************************************************
     *  Latest courses downloaded from JWEB.
     *
     *  @attribute jwebCourses
     *  @type {Array}
     *  @for KUMobile.Student
     *  @default null
     ******************************************************************************/
	jwebCourses: null,
    
    
    /******************************************************************************
     *  Latest courses downloaded from blackboard.
     *
     *  @attribute bbCourses
     *  @type {Array}
     *  @for KUMobile.Student
     *  @default null
     ******************************************************************************/
	bbCourses: null,
    
    
    /******************************************************************************
     *  Latest jweb catalog (containing all offered courses and their times)
     *
     *  @attribute jwebCatalog
     *  @type {Array}
     *  @for KUMobile.Student
     *  @default null
     ******************************************************************************/
	jwebCatalog: null,
    
    
    /******************************************************************************
     *  Latest working schedules for schedule planner
     *
     *  @attribute workingSchedules
     *  @type {Array}
     *  @for KUMobile.Student
     *  @default null
     ******************************************************************************/
	workingSchedules: null,
    
    
    /******************************************************************************
     *  Index for the latest working schedule drawn
     *
     *  @attribute schedulePlannerIndex
     *  @type {int}
     *  @for KUMobile.Student
     *  @default null
     ******************************************************************************/
	schedulePlannerIndex: null,
    
    
    /******************************************************************************
     *  Evaluation load locked?
     *
     *  @attribute evalLocked
     *  @type {boolean}
     *  @for KUMobile.Student
     *  @default true
     ******************************************************************************/
	evalLocked: true,

    
    /******************************************************************************
     *  Triggered when the student page is first initialized based on jQuery Mobile
     *  pageinit event.
	 *
     *  @event pageInit
     *  @for KUMobile.Student
     ******************************************************************************/	
	pageInit: function(event){
        
        // Stored login information
        var user = window.localStorage.getItem("ku_username");
        var rememberMe = window.localStorage.getItem("ku_rememberme");
        var savePass = window.localStorage.getItem("ku_savepass");
        var encrypted = window.localStorage.getItem("ku_pass");
    
        // Init
        if(user != null) $('#user').attr("value", user);
        if(rememberMe === "false") $("#rememberMe").attr("checked", false).checkboxradio().checkboxradio("refresh");
        else if(rememberMe === "true") $("#rememberMe").attr("checked", true).checkboxradio().checkboxradio("refresh");
        if(savePass === "false") $("#savePass").attr("checked", false).checkboxradio().checkboxradio("refresh");
        else if(savePass === "true") $("#savePass").attr("checked", true).checkboxradio().checkboxradio("refresh");

        // Password available too?
        if(encrypted != null){
            
            // Decrypt
            var shhhhh = "foo_bar_placeholder";
            var pass = CryptoJS.DES.decrypt(encrypted, shhhhh).toString(CryptoJS.enc.Utf8);;
            
            // Fill in pass then login as usual!
            $('#pass').val(pass);
            KUMobile.Student.login();
        }
        
        $('#login-button').on("vclick", KUMobile.Student.login);
        $('#logout-button').on("vclick", KUMobile.Student.logout);
        
	},
    
    
    /******************************************************************************
     *  Triggered when the student page is first created based on jQuery Mobile
     *  pagecreate event. This is called after the page itself is created but 
     *  before any jQuery Mobile styling is applied.
	 *
     *  @event pageCreate
     *  @for KUMobile.Student
     ******************************************************************************/
	pageCreate: function(event){
		
		// Resize
		$(window).trigger("throttledresize");
        
	},


    /******************************************************************************
     *  Triggered when courses page is initialized based on jQuery Mobile
     *  pageinit event.
	 *
     *  @event pageInitCourses
     *  @for KUMobile.Student
     ******************************************************************************/	
	pageInitCourses: function(event){
    
        var bbCourses = null;
    
        // Successful blackboard download
        var successBBDownload = function(courses){
            
            bbCourses = courses;
            
            var term = null;
            
            // Try to find term 
            for (var i = 0; i < courses.length; i++){
                
                // Both terms exists, but don't match?
                if(courses[i].term && term && term != courses[i].term){
                    
                    // Guessing the term might be more appropriate
                    term = KUMobile.Student.guessTerm();
                    break;
                }
                
                // Store term, but keep searching for consistency
                if (courses[i].term) term = courses[i].term;
            }
        
            // Download from banner!
            KU.Student.JWEB.retrieveSchedule(term, successJWEBDownload, failure);
        };
        
        // Successful jweb download
        var successJWEBDownload = function(jwebCourses){
            
            KUMobile.Student.populateCourses(bbCourses, jwebCourses);
        };
        
        // Failure
        var failure = function(errMsg){

            // Presumably not loading
            KUMobile.hideLoading("courses");
            
            KUMobile.safeAlert("Error", "There was an error loading the courses potentially caused by a timeout or loss in connectivity. Please try again soon.", "ok");
            KUMobile.Student.logout();
            
        };
    
        // Start downloading
        KUMobile.showLoading("courses");
        if (KU.Student.bbCourses && KU.Student.jwebCourses) KUMobile.Student.populateCourses(KU.Student.bbCourses, KU.Student.jwebCourses);
        else KU.Student.BB.downloadCourses(successBBDownload, failure);
        
	},
    

    /******************************************************************************
     *  Triggered when current holds page is initialized based on jQuery Mobile
     *  pageinit event.
	 *
     *  @event pageInitCurrentHolds
     *  @for KUMobile.Student
     ******************************************************************************/	
	pageInitCurrentHolds: function(event){
    
        // Start downloading
        KUMobile.showLoading("current-holds");
        
        // Failure
        var failure = function(errMsg){

            // Presumably not loading
            KUMobile.hideLoading("current-holds");
            
            // Alert user
            KUMobile.safeAlert("Error", "There was an error loading the current holds potentially caused by a timeout or loss in connectivity. Please try again soon.", "ok");
            KUMobile.Student.logout();
        };
        
        // Download!
        KU.Student.JWEB.retrieveCurrentHolds(KUMobile.Student.populateCurrentHolds, failure);
        
	},
    
    
    /******************************************************************************
     *  Triggered when schedule planner page is initialized based on jQuery Mobile
     *  pageinit event.
	 *
     *  @event pageInitSchedulePlanner
     *  @for KUMobile.Student
     ******************************************************************************/	
	pageInitSchedulePlanner: function(event){
    
        // Start downloading
        KUMobile.showLoading("schedule-planner");
        
        // Successful possibilities
        var populateScheduleTerms = function(possibilities){
        
            for (var i = 0; i < possibilities.length; i++){
                        
                // Properties
                var termNum = possibilities[i];
                var termName = KUMobile.Student.toggleTermType(termNum);
                
                // Populate
                var option = $("<option></option>").val(termNum).text(termName).appendTo("#schedule-planner-terms");
                
                // Select first element
                if (i === 0) option.attr("selected", "true");
            }
            
            // Refresh menu
            $("#schedule-planner-terms").selectmenu('refresh', true);

            // At least one possibility
            if(possibilities.length > 0){
                
                
                KU.Student.JWEB.retrieveScheduleCatalog(
                    $("#schedule-planner-terms option:selected").val(), 
                    KUMobile.Student.populateSchedulePlanner, 
                    failure
                );
                
            }
            
            else failure("Could not retrieve terms.");
        }
        
        // Failure
        var failure = function(errMsg){

            // Presumably not loading
            KUMobile.hideLoading("schedule-planner");
            $("#schedule-planner-terms").removeAttr("disabled");
            $("#schedule-options-generate-button").removeAttr("disabled");
            
            // Alert user
            KUMobile.safeAlert("Error", "There was an error loading the schedule planner potentially caused by a timeout or loss in connectivity. Please try again soon.", "ok");
            KUMobile.Student.logout();
        };
        
        // Setup listeners
        KUMobile.safeBinder("change", "#schedule-planner-terms", KUMobile.Student.schedulePlannerTermChange);
        KUMobile.safeBinder("vclick", "#schedule-options-generate-button", KUMobile.Student.generatePermutations);
        
        // Loading options show empty information
        $("#schedule-planner-terms").prop('selectedIndex', -1);
        $("#schedule-planner-terms").attr("disabled","disabled");
        $("#schedule-options-generate-button").attr("disabled","disabled");
        $( "#schedule-planner-course-options-popup" ).popup( "disable" );
        
        // Download!
        KU.Student.JWEB.retrieveScheduleTerms(populateScheduleTerms, failure);
        
	},
    
    
    /******************************************************************************
     *  Triggered when schedule page is initialized based on jQuery Mobile
     *  pageinit event.
	 *
     *  @event pageInitSchedule
     *  @for KUMobile.Student
     ******************************************************************************/	
	pageInitSchedule: function(event){
    
        // Start downloading
        KUMobile.showLoading("schedule");
        
        // Successful possibilities
        var populateScheduleTerms = function(possibilities){
        
            for (var i = 0; i < possibilities.length; i++){
                        
                // Properties
                var termNum = possibilities[i];
                var termName = KUMobile.Student.toggleTermType(termNum);
                var guessedTerm = KUMobile.Student.guessTerm();
                
                // Populate
                var option = $("<option></option>").val(termNum).text(termName).appendTo("#schedule-options");
                
                // Select first element
                if (termNum === guessedTerm) option.attr("selected", "true");
            }
            
            // Refresh menu
            $("#schedule-options").selectmenu('refresh', true);

            // At least one possibility
            if(possibilities.length > 0){
                
                KU.Student.JWEB.retrieveSchedule(
                    $("#schedule-options option:selected").val(), 
                    KUMobile.Student.populateSchedule, 
                    failure
                );        
            }
            
            else failure("Could not retrieve terms.");
        }
        
        // Failure
        var failure = function(errMsg){

            // Presumably not loading
            KUMobile.hideLoading("schedule");
            $("#schedule-options").removeAttr("disabled");
        
            // Alert user
            KUMobile.safeAlert("Error", "There was an error loading the schedule potentially caused by a timeout or loss in connectivity. Please try again soon.", "ok");
            KUMobile.Student.logout();
        };
        
        // Setup listeners
        KUMobile.safeBinder("change", "#schedule-options", KUMobile.Student.scheduleTermChange);
        
        // Loading options show empty information
        $("#schedule-options").prop('selectedIndex', -1);
        $("#schedule-options").attr("disabled","disabled");
        
        // Download!
        KU.Student.JWEB.retrieveScheduleTerms(populateScheduleTerms, failure);
        
	},
    
    
    /******************************************************************************
     *  Triggered when financial aid page is initialized based on jQuery Mobile
     *  pageinit event.
	 *
     *  @event pageInitFinancialAid
     *  @for KUMobile.Student
     ******************************************************************************/	
	pageInitFinancialAid: function(event){
    
        // Start downloading
        KUMobile.showLoading("financial-aid");
        
        // Failure
        var failure = function(errMsg){

            // Presumably not loading
            KUMobile.hideLoading("financial-aid");
            
            // Alert user
            KUMobile.safeAlert("Error", "There was an error loading the financial aid information potentially caused by a timeout or loss in connectivity. Please try again soon.", "ok");
            KUMobile.Student.logout();
        };
        
        // Download!
        KU.Student.JWEB.retrieveAwardHistory(KUMobile.Student.populateFinancialAid, failure);
        
	},
    
    
    /******************************************************************************
     *  Triggered when account summary page is initialized based on jQuery Mobile
     *  pageinit event.
	 *
     *  @event pageInitAccountSummary
     *  @for KUMobile.Student
     ******************************************************************************/	
	pageInitAccountSummary: function(event){
    
        // Start downloading
        KUMobile.showLoading("account-summary");
        
        // Failure
        var failure = function(errMsg){

            // Presumably not loading
            KUMobile.hideLoading("account-summary");
            
            // Alert user
            KUMobile.safeAlert("Error", "There was an error loading the account summary information potentially caused by a timeout or loss in connectivity. Please try again soon.", "ok");
            KUMobile.Student.logout();
        };
        
        // Download!
        KU.Student.JWEB.retrieveAccountSummary(KUMobile.Student.populateAccountSummary, failure);
        
	},
    
    
    /******************************************************************************
     *  Triggered when final grades page is initialized based on jQuery Mobile
     *  pageinit event.
	 *
     *  @event pageInitFinalGrades
     *  @for KUMobile.Student
     ******************************************************************************/	
	pageInitFinalGrades: function(event){
    
        // Start downloading
        KUMobile.showLoading("final-grades");
        
        // Successful possibilities
        var populateFinalGradesPossibilities = function(possibilities){
        
            for (var i = 0; i < possibilities.length; i++){
                        
                // Properties
                var termNum = possibilities[i];
                var termName = KUMobile.Student.toggleTermType(termNum);
                
                // Populate
                var option = $("<option></option>").val(termNum).text(termName).appendTo("#final-grades-options");
                
                // Select first element
                if (i === 0) option.attr("selected", "true");
            }
            
            // Refresh menu
            $("#final-grades-options").selectmenu('refresh', true);

            // At least one possibility
            if(possibilities.length > 0){
            
                KU.Student.JWEB.retrieveFinalGrades(
                    possibilities[0], 
                    KUMobile.Student.populateFinalGrades, 
                    failure
                );
            }
        }
        
        // Failure
        var failure = function(errMsg){

            // Presumably not loading
            KUMobile.hideLoading("final-grades");
            
            // Re-enable
            $("#final-grades-options").removeAttr("disabled");
            
            // Alert user
            KUMobile.safeAlert("Error", "There was an error loading the final grades information potentially caused by a timeout or loss in connectivity. Please try again soon.", "ok");
            KUMobile.Student.logout();
        };
        
        
        // Setup listeners
        KUMobile.safeBinder("change", "#final-grades-options", KUMobile.Student.finalGradesTermChange);
        
        // Loading options show empty information
        $("#final-grades-options").prop('selectedIndex', -1);
        $("#final-grades-options").attr("disabled","disabled");
        
        // Download!
        KU.Student.JWEB.retrieveFinalTerms(populateFinalGradesPossibilities, failure);
        
	},
    
    
    /******************************************************************************
     *  Triggered when degree evaluation page is initialized based on jQuery Mobile
     *  pageinit event.
	 *
     *  @event pageInitDegreeEvaluation
     *  @for KUMobile.Student
     ******************************************************************************/	
	pageInitDegreeEvaluation: function(event){
    
        // Start downloading
        KUMobile.showLoading("degree-evaluation");
        
        // Successful possibilities
        var populateDegreePossibilities = function(possibilities){
            
            for (var i = 0; i < possibilities.length; i++){
                
                // Properties
                var date = possibilities[i];
                var index = possibilities.length - i;
                
                // Populate
                var option = $("<option></option>").val(index).text(date).appendTo("#degree-evaluation-options")
                
                // Select first element
                if (i === 0) option.attr("selected", "true");
            }
            
            // Refresh menu
            $("#degree-evaluation-options").selectmenu('refresh', true);
            
            KU.Student.JWEB.retrieveEvaluation(
                KUMobile.Student.guessTerm(), 
                possibilities.length, 
                KUMobile.Student.populateDegreeEvaluation, 
                failure
            );
        }
        
        // Failure
        var failure = function(errMsg){

            // Presumably not loading
            KUMobile.hideLoading("degree-evaluation");
            
            // Re-enable
            $("#degree-evaluation-options").removeAttr("disabled");
            KUMobile.Student.evalLocked = false;
            
            // Alert user
            KUMobile.safeAlert("Error", "There was an error loading the degree evaluation information potentially caused by a timeout or loss in connectivity. Please try again soon.", "ok");
            KUMobile.Student.logout();
        };
        
        
        // Setup listeners
        KUMobile.safeBinder("change", "#degree-evaluation-options", KUMobile.Student.degreeEvaluationChange);
        KUMobile.safeBinder("vclick", "#generate-degree-evaluation", KUMobile.Student.degreeEvaluationGenerate);
        
        
        // Loading options show empty information
        $("#degree-evaluation-options").prop('selectedIndex', -1);
        $("#degree-evaluation-options").attr("disabled","disabled");
        KUMobile.Student.evalLocked = true;
        
        
        // Download evaluation list!
        KU.Student.JWEB.retrieveEvaluationList(KUMobile.Student.guessTerm(), populateDegreePossibilities, failure);
	},
    
    
    /******************************************************************************
     *  Triggered when information page is initialized based on jQuery Mobile
     *  pageinit event.
	 *
     *  @event pageInitInformation
     *  @for KUMobile.Student
     ******************************************************************************/	
	pageInitInformation: function(event){
    
        // Start downloading
        KUMobile.showLoading("information");
        
        // Failure
        var failure = function(errMsg){

            // Presumably not loading
            KUMobile.hideLoading("information");
            
            // Alert user
            KUMobile.safeAlert("Error", "There was an error loading the student information potentially caused by a timeout or loss in connectivity. Please try again soon.", "ok");
            KUMobile.Student.logout();
        };
        
        KU.Student.JWEB.retrieveStudentInfo(KUMobile.Student.guessTerm(), KUMobile.Student.populateInformation, failure);
        
	},    
    
    
    /******************************************************************************
     *  Triggered when any single course page is initialized based on jQuery Mobile
     *  pageinit event.
	 *
     *  @event pageInitSingleCourse
     *  @for KUMobile.Student
     ******************************************************************************/	
    pageInitSingleCourse: function(event){
        
        // Loading
        KUMobile.showLoading(this.id);
        
        var identifier = this.id;
        
        // Failure
        var failure = function(errMsg){

            // Presumably not loading
            KUMobile.hideLoading(identifier);
            
            // Alert user
            KUMobile.safeAlert("Error", "There was an error loading the course information potentially caused by a timeout or loss in connectivity. Please try again soon.", "ok");
            KUMobile.Student.logout();
        };
        
        // Templates
        var gradeTpl = Handlebars.getTemplate("student-grades-page");
        var rosterTpl = Handlebars.getTemplate("student-roster-page");
        var booksTpl = Handlebars.getTemplate("student-books-page");
        
        // Start downloading content tree
        KU.Student.BB.retrieveContentTree(
            $("#" + this.id + " .bbId").text(), "",
            KUMobile.Student.populateCoursePage, failure
        );
        
        // Set up grades page
        var gradePageHtml = gradeTpl({
            "bbId": $("#" + this.id + " .bbId").text(),
        });
        
        // Set up roster page
        var rosterPageHtml = rosterTpl({
            "bbId": $("#" + this.id + " .bbId").text(),
        });
        
        // Set up books page
        var booksPageHtml = booksTpl({
            "bbId": $("#" + this.id + " .bbId").text(),
        });
        
        // Add to body and listener
        $(gradePageHtml).appendTo("body");
        KUMobile.safeBinder("pageinit",'#' + $("#" + this.id + " .bbId").text() + "-grades", KUMobile.Student.pageInitGrades);
        
        // Setup roster page
        $(rosterPageHtml).appendTo("body");
        KUMobile.safeBinder("pageinit",'#' + $("#" + this.id + " .bbId").text() + "-roster", KUMobile.Student.pageInitRoster);
        
        // Setup roster page
        $(booksPageHtml).appendTo("body");
        KUMobile.safeBinder("pageinit",'#' + $("#" + this.id + " .bbId").text() + "-books", KUMobile.Student.pageInitBooks);
        
    },
    
    
    /******************************************************************************
     *  Triggered when any course grades page is initialized based on jQuery Mobile
     *  pageinit event.
	 *
     *  @event pageInitGrades
     *  @for KUMobile.Student
     ******************************************************************************/	
    pageInitGrades: function(event){
        
        // Loading
        KUMobile.showLoading(this.id);
        var id = this.id;
        
        // Failure
        var failure = function(errMsg){

            // Presumably not loading
            KUMobile.hideLoading(id);
            
            // Alert user
            KUMobile.safeAlert("Error", "There was an error loading the grades information potentially caused by a timeout or loss in connectivity. Please try again soon.", "ok");
            KUMobile.Student.logout();
        };
        
        // Success
        var success = function(grades){
            
            // Templates
            var gradeTpl = Handlebars.getTemplate("student-course-grade-item");
        
            // Sort grades by title!
            grades.sort(function(a,b) {
                
                if (a.title.toLowerCase() > b.title.toLowerCase()) return 1;
                else if (a.title.toLowerCase() < b.title.toLowerCase()) return -1;
                else return 0;
            });
        
            // Go through all grades
            for(var i = 0; i < grades.length; i++){
                
                // Get grade and overall grade (could be letter or value)
                var grade = grades[i];
                var overallGrade = grade.grade;
                
                // Percent pattern
                percentPat = /(\d+.\d+)%/;
                
                // Fix floating percent!
                if(percentPat.test(overallGrade)){
                    
                    // Get percent and round!
                    groups = percentPat.exec(overallGrade);
                    overallGrade = Math.round(groups[1]) + "%";
                }
                
                // Is points possible an option?
                // if so then show as a percent instead!
                if(grade.pointsPossible != "" 
                    && !isNaN(grade.pointsPossible)
                    && !isNaN(overallGrade)){
                    
                    // Calculate percent
                    overallGrade = Math.round(overallGrade*100/grade.pointsPossible) + "%"; 
                }
                
                // Make html item
                var gradeHtml = gradeTpl({
                   "title": grade.title,
                   "grade": overallGrade,
                   "postedDate": grade.postedDate,
                   "status": grade.status.toUpperCase(),
                   "additionalInfo": grade.additionalInfo
                });
                
                // Add to grade list
                $(gradeHtml).appendTo("#" + id + "-list");
                
            }
            
            // Done Loading
            $("#" + id + "-list").listview('refresh');
            KUMobile.hideLoading(id);
            $("#" + id + "-list").show();
        }
         
        // Get the course grades
        KU.Student.BB.retrieveGrades($("#" + this.id + " .bbId").text(), success, failure);
        
    },
    
    
    /******************************************************************************
     *  Triggered when any course roster page is initialized based on jQuery Mobile
     *  pageinit event.
	 *
     *  @event pageInitRoster
     *  @for KUMobile.Student
     ******************************************************************************/	
    pageInitRoster: function(event){
        
        // Loading
        KUMobile.showLoading(this.id);
        var id = this.id;
        
        // Failure
        var failure = function(errMsg){

            // Presumably not loading
            KUMobile.hideLoading(id);
            
            // Alert user
            KUMobile.safeAlert("Error", "There was an error loading the roster information potentially caused by a timeout or loss in connectivity. Please try again soon.", "ok");
            KUMobile.Student.logout();
        };
        
        // Success
        var success = function(students){
            
            // Templates
            var rosterTpl = Handlebars.getTemplate("student-course-roster-item");
        
            // Go through all students
            for(var i = 0; i < students.length; i++){
                
                // Get grade and overall grade (could be letter or value)
                var student = students[i];
                
                // Make html item
                var studentHtml = rosterTpl({
                    "name": student.firstName + " " + student.lastName,
                    "email": student.email
                });
                
                // Add to grade list
                $(studentHtml).appendTo("#" + id + "-list");
                
            }
            
            // Done Loading
            $("#" + id + "-list").listview('refresh');
            KUMobile.hideLoading(id);
            $("#" + id + "-list").show();
        }
         
        // Get the course roster
        KU.Student.BB.retrieveRoster($("#" + this.id + " .bbId").text(), success, failure);
        
    },
    
    
    /******************************************************************************
     *  Triggered when any course books page is initialized based on jQuery Mobile
     *  pageinit event.
	 *
     *  @event pageInitBooks
     *  @for KUMobile.Student
     ******************************************************************************/	
    pageInitBooks: function(event){
        
        // Loading
        KUMobile.showLoading(this.id);
        
        // Initialize parameters
        var id = this.id;
        var bbId = $("#" + this.id + " .bbId").text()
        var matchingBBCourse = null;
        var matchingJWEBCourse = null;
        var section = null;
        var courseId = null;
        var term = null;
        
        // Failure
        var failure = function(errMsg){

            // Presumably not loading
            KUMobile.hideLoading(id);
            
            // Alert user
            KUMobile.safeAlert("Error", "There was an error loading the required books information potentially caused by a timeout or loss in connectivity. Please try again soon.", "ok");
            KUMobile.Student.logout();
        };
        
        // Find bb course
        for (var i = 0; i < KUMobile.Student.bbCourses.length; i++){
            
            var course = KUMobile.Student.bbCourses[i];
            
            // Found?
            if (course.bbId === bbId){

                // Store
                matchingBBCourse = course;
                if(course.section) section = course.section;
                if(course.courseId) courseId = course.courseId;
                if(course.term) term = KUMobile.Student.toggleTermType(course.term);
                break;
            }
        }
        
        // Find jweb course
        for (var i = 0; i < KUMobile.Student.jwebCourses.length; i++){
            
            var course = KUMobile.Student.jwebCourses[i];
            
            // Found?
            if (matchingBBCourse.crn === course.crn){
                
                // Store
                matchingJWEBCourse = course;
                if(!section || section == "TBD") section = course.section;
                if(!courseId || courseId == "TBD") courseId = course.courseId;
                break;
            }
        }

        // Section 1 fallback!
        if (!section || section == "TBD") section = "1"
        
        // Exit if nothing to search for
        if (!((section || section == "TBD") && courseId && term)) return;
        
        // Success
        var success = function(books, optional){
            
            // Templates
            var dividerTpl = Handlebars.getTemplate("generic-list-divider");
            var bookTpl = Handlebars.getTemplate("student-book-item");
        
            // Required books?
            if (books.length > 0) $(dividerTpl({"id":"required-books", "title": "Required"})).appendTo("#" + id + "-list");
        
            // Go through all required books
            for(var i = 0; i < books.length; i++){
                
                // Get grade and overall grade (could be letter or value)
                var book = books[i];
                
                // Fix image
                book.imgUrl = book.imgUrl.replace("//", "http://");
                
                // Make html item
                var bookHtml = bookTpl(book);
                
                // Add to list
                bookDom = $(bookHtml);
                
                // Manual check for image error!
                $("img", bookDom).load(function(){
            
                    // Use default!
                    if(this.height == 1) this.src = "img/default_library_icon.jpg";

                    // Apply class styles
                    $(this).addClass("library-icon");
                });
                
                
                // Regular image error?
                $("img", bookDom).error(function() {
                    
                    // Use default!
                    this.src = "img/default_library_icon.jpg";
                    
                    // Apply class styles
                    $(this).addClass("library-icon");
                });
                
                bookDom.appendTo("#" + id + "-list");
            }
            
            // Optional books?
            if (optional.length > 0) $(dividerTpl({"id":"optional-books", "title": "Recommended"})).appendTo("#" + id + "-list");
        
            // Go through all books
            for(var i = 0; i < optional.length; i++){
                
                // Get grade and overall grade (could be letter or value)
                var book = optional[i];
                
                // Fix image
                book.imgUrl = book.imgUrl.replace("//", "http://");
                
                // Make html item
                var bookHtml = bookTpl(book);
                
                // Add to list
                bookDom = $(bookHtml);
                
                // Manual check for image error!
                $("img", bookDom).load(function(){
            
                    // Use default!
                    if(this.height == 1) this.src = "img/default_library_icon.jpg";

                    // Apply class styles
                    $(this).addClass("library-icon");
                });
                
                
                // Regular image error?
                $("img", bookDom).error(function() {
                    
                    // Use default!
                    this.src = "img/default_library_icon.jpg";
                    
                    // Apply class styles
                    $(this).addClass("library-icon");
                });
                
                bookDom.appendTo("#" + id + "-list");
            }
            
            // Done Loading
            $("#" + id + "-list").listview('refresh');
            KUMobile.hideLoading(id);
            $("#" + id + "-list").show();
        }
        
        // Get the required books
        KU.Student.JWEB.retrieveRequiredBooks(term, courseId, section, success, failure);
        
    },
    
    
    /******************************************************************************
     *  Triggered when any course folder page is initialized based on jQuery Mobile
     *  pageinit event.
	 *
     *  @event pageInitFolder
     *  @for KUMobile.Student
     ******************************************************************************/	
    pageInitFolder: function(event){
        
        // Loading
        KUMobile.showLoading(this.id);
        var id = this.id;
        
        // Failure
        var failure = function(errMsg){

            // Presumably not loading
            KUMobile.hideLoading(id);
            
            // Alert user
            KUMobile.safeAlert("Error", "There was an error loading the folder information potentially caused by a timeout or loss in connectivity. Please try again soon.", "ok");
            KUMobile.Student.logout();
        };
        
        // Start downloading content tree
        KU.Student.BB.retrieveContentTree(
            $("#" + this.id + " .bbId").text(),
            $("#" + this.id + " .contentId").text(),
            KUMobile.Student.populateFolderPage, failure
        );
        
    },
    
    
    /******************************************************************************
     *  Populates courses into the student page based on gathered information 
     *  from KetteringJS after downloading courses.
     * 
     *  @event populateCourses
     *  @for KUMobile.Student
     ******************************************************************************/
    populateCourses: function(bbCourses, jwebCourses){
        
        // Store courses for future use
        KUMobile.Student.bbCourses = bbCourses;
        KUMobile.Student.jwebCourses = jwebCourses;
        
        // Templates
        var courseTpl = Handlebars.getTemplate("student-course-item");
        var coursePageTpl = Handlebars.getTemplate("student-course-page");
        
        // Go through courses
        for(var i = 0; i < bbCourses.length; i++){
           
           // Get course
            var course = bbCourses[i], professor = "?", location = "?";
            var days = course.days, time = course.time, title = course.courseTitle;
            var section = (course.section === "?" || course.section == "" || course.section == "TBD")? "": "-" + course.section;
            
            matchingCourse = null;
            
            // Find matching course based on CRN first
            for (var jwebIndex = 0; jwebIndex < jwebCourses.length; jwebIndex++){
                
                // Matches?
                if (jwebCourses[jwebIndex].crn == course.crn) matchingCourse = jwebCourses[jwebIndex];
            }
            
            // Find matching course based on course id as last resort
            for (var jwebIndex = 0; jwebIndex < jwebCourses.length; jwebIndex++){
                
                // Matches?
                if (!matchingCourse && jwebCourses[jwebIndex].courseId == course.courseId) matchingCourse = jwebCourses[jwebIndex];
            }
            
            // Store matching info?
            if (matchingCourse){
                
                title = matchingCourse.courseTitle;
                professor = matchingCourse.professor;
                section = (section === "")? "-" + matchingCourse.section : section;
                location = matchingCourse.location;
                
                if (time === "TBD") time = matchingCourse.time;
                if (days === "TBD") days = matchingCourse.days;
                
            }
            
            // Make course item from template
            var courseHtml = courseTpl({
                "bbId": course.bbId,
                "courseId":course.courseId + section,
                "courseTitle":title,
                "professor":professor,
                "location":location,
                "time":time,
                "days":days
            });
            
            $(courseHtml).appendTo("#courses-list");
            
            // Make course page from template
            var coursePage = coursePageTpl({
               "courseId": course.courseId + section,
               "bbId": course.bbId
            });
            
            $(coursePage).appendTo("body");
            KUMobile.safeBinder("pageinit",'#' + course.bbId + "-page", KUMobile.Student.pageInitSingleCourse);
            
        }
        
        // Refresh
        $('#courses-list').listview('refresh');
        
        // Done loading
        KUMobile.hideLoading("courses");
        
    },
    
    
    /******************************************************************************
     *  Populates course page based on initial content tree. 
     * 
     *  @event populateCoursePage
     *  @for KUMobile.Student
     ******************************************************************************/
    populateCoursePage: function(tree){
        
        // Templates
        var folderTpl = Handlebars.getTemplate("student-course-folder");
        var folderPageTpl = Handlebars.getTemplate("student-course-folder-page");
        var bbId = tree.bbId;
        
        // Go through all folders
        for(var i = tree.folders.length - 1; i >= 0; i--){
            
            // Get folder
            var folder = tree.folders[i];
            
            // Make item
            var folderHtml = folderTpl({
               "contentId": folder.contentId,
               "bbId": folder.bbId,
               "name": folder.name
            });
            
            // Make folder page
            var folderPage = folderPageTpl({
               "contentId": folder.contentId,
               "bbId": folder.bbId,
               "name": folder.name 
            });
            
            // Add folder item
            $(folderHtml).prependTo("#" + folder.bbId + "-list");
            
            // Add corresponding folder page
            $(folderPage).appendTo("body");
            $(document).on("pageinit",'#' + folder.bbId + "-" + folder.contentId + "-page", KUMobile.Student.pageInitFolder);
        }
        
        // Refresh
        $("#" + bbId + "-list").listview('refresh');
        
        // Done loading
        KUMobile.hideLoading(bbId + "-page");
        $("#" + bbId + "-list").show();
        
    },
    
    
    /******************************************************************************
     *  Populates information page based on initial content tree. 
     * 
     *  @event populateInformation
     *  @for KUMobile.Student
     ******************************************************************************/
    populateInformation: function(info){
        
        // Top information
        $("#information .fullName").text(info.fullName);
        $("#information .idNumber ").text(info.idNumber );
        $("#information .standing ").text(info.standing );
        
        // Store information or hide
        if (info.college != "") $("#information .college p").text(info.college);
        else $("#information .college").hide();
        if (info.concentration  != "") $("#information .concentration p").text(info.concentration );
        else $("#information .concentration").hide();
        if (info.major  != "") $("#information .major p").text(info.major );
        else $("#information .major").hide();
        if (info.minor  != "") $("#information .minor p").text(info.minor );
        else $("#information .minor").hide();
        if (info.program  != "") $("#information .program p").text(info.program );
        else $("#information .program ").hide();
        if (info.regularCredits  != "") $("#information .regularCredits p").text(info.regularCredits );
        else $("#information .regularCredits ").hide();
        if (info.specialty  != "") $("#information .specialty p").text(info.specialty );
        else $("#information .specialty ").hide();
        if (info.transferCredits != "") $("#information .transferCredits p").text(info.transferCredits);
        else $("#information .transferCredits").hide();
        
        // Refresh
        $("#information ul").listview('refresh');
        $("#information ul").show();
        
        // Done loading
        KUMobile.hideLoading("information");
        
    },

    
    /******************************************************************************
     *  Populates current holds page with given information
     * 
     *  @event populateCurrentHolds
     *  @for KUMobile.Student
     ******************************************************************************/
    populateCurrentHolds: function(holdsHtml){
        
        // Patterns
        var pattern = /\/.*/;
        
        // Go through all images and links
        holdsHtml = KUMobile.sanitize($("<div></div>").html(holdsHtml));
        holdsHtml.find("img").each(function(i){
            
            // Fix source so it is absolute
            if($(this).attr("src") != null && pattern.test($(this).attr("src"))){
                
                // Absolute path!
                $(this).attr("src", "http://jweb.kettering.edu" + $(this).attr("src"));   
            }
        });
        
        holdsHtml.appendTo("#current-holds-container");
    
        // Done loading
        KUMobile.hideLoading("current-holds");
        
        
    },
    
    
    /******************************************************************************
     *  Populates financial aid page based on returned information.
     * 
     *  @event populateFinancialAid
     *  @for KUMobile.Student
     ******************************************************************************/
    populateFinancialAid: function(years){
        
        // Templates
        var yearTpl = Handlebars.getTemplate("financial-aid-year");
        
        // Go through all terms
        for (var i = 0; i < years.length; i++){
            
            // Current term
            var year = years[i];

            for (var entryIndex = 0; entryIndex < year.entries.length; entryIndex++){

                // Current entry
                var entry = year.entries[entryIndex];
            
                // Fix accepted
                if(entry.accepted.trim() == "") entry.accepted = "$0.00";
                
            }
            
            // Make and add term!
            $(yearTpl({
                "years": year.years,
                "entries": year.entries
            })).appendTo("#financial-aid-list");
            
        }
        
        // Refresh and hide loading
        $("#financial-aid-list").listview('refresh');
        KUMobile.hideLoading("financial-aid");
            
    },
    
    
    /******************************************************************************
     *  Populates account summary page based on returned information. 
     * 
     *  @event populateAccountSummary
     *  @for KUMobile.Student
     ******************************************************************************/
    populateAccountSummary: function(balance, terms){
        
        // Templates
        var termTpl = Handlebars.getTemplate("account-term");
        
        // Go through all terms
        for (var i = 0; i < terms.length; i++){
            
            // Current term
            var term = terms[i];
            
            // Make and add term!
            $(termTpl({
                "name": term.term,
                "entries": term.entries,
                "balance": term.balance
            })).appendTo("#account-summary-list");
            
        }
        
        // Refresh and hide loading
        $("#account-summary-list").listview('refresh');
        KUMobile.hideLoading("account-summary");
            
    },
    
    
    /******************************************************************************
     *  Populates schedule page based on returned information. 
     * 
     *  @event populateSchedulePlanner
     *  @for KUMobile.Student
     ******************************************************************************/
    populateSchedulePlanner: function(courses){
        
        // Store courses
        KUMobile.Student.jwebCatalog = courses;
        
        // Defaults
        var lastAdded = "";
        
        // Templates
        var schedulePlannerCourseTpl = Handlebars.getTemplate("schedule-planner-course-option-add");
        
        // Clear old popup list
        $("#schedule-planner-course-options-popup-list li").remove();
        $("#schedule-planner-course-searcher").val("");
        
        // Go through every course and add to selection list
        for (var i = 0; i < courses.length; i++){
            
            // Current course
            var course = courses[i];
            
            // Extract letters from section and add to course-id
            course.courseId += course.section.replace(/\d/g, "");

            // Valid?
            if (course.courseId != "" && course.title != ""){
            
                // Already added?
                if (lastAdded != (course.courseId + ": " + course.title)){
                    
                    // Add course option to the popup list
                    $(schedulePlannerCourseTpl({
                        "courseId": course.courseId,
                        "courseTitle": course.title
                    })).appendTo("#schedule-planner-course-options-popup-list");
                    
                    lastAdded = course.courseId + ": " + course.title;
                }
            }
        }

        // Bind keyup for searcher in popup
        KUMobile.safeBinder("keyup", "#schedule-planner-course-searcher", function(){
            
            // Input value
            var input = $(this).val().trim().toLowerCase();
            
            // Found the first element
            var foundFirst = false;
            
            // Hide or show elements based on value
            $("#schedule-planner-course-options-popup-list li").each(function(i){
            
                // Options text
                var innerText = $(this).text().trim().toLowerCase();
                
                // Match?
                if(innerText.indexOf(input) > -1){

                    $(this).show();
                    
                    // Change border for first element
                    if(!foundFirst) $("a",this).attr("style", "border-top:0px!important;");
                    else $("a",this).attr("style", "");
                    
                    // First already found
                    foundFirst = true;
                }
                else $(this).hide();
                
            });
            
        });
       
        // Done loading
        $("#schedule-planner-terms").removeAttr("disabled");
        $("#schedule-options-generate-button").removeAttr("disabled");
        $( "#schedule-planner-course-options-popup" ).popup( "enable" );
        $("#schedule-planner-course-options-popup-list").listview('refresh');
        KUMobile.hideLoading("schedule-planner");
        
    },
    
    
    /******************************************************************************
     *  Populates schedule page based on returned information. 
     * 
     *  @event populateSchedule
     *  @for KUMobile.Student
     ******************************************************************************/
    populateSchedule: function(courses){
        
        // Make and add schedule
        var scheduleHtml = KUMobile.Student.generateScheduleTable(courses);
        $(scheduleHtml).appendTo("#schedule-scroller").enhanceWithin();
        
        // Done loading
        $("#schedule-options").removeAttr("disabled");
        KUMobile.hideLoading("schedule");
        
    },
    
    
    /******************************************************************************
     *  Reverts back to defaults for Student
     * 
     *  @method defaults
     *  @return {void}
     *  @for KUMobile.Student
     ******************************************************************************/
    defaults: function(){
        
        KUMobile.Student.evalLocked = true;
        KUMobile.Student.schedulePlannerIndex;
        KUMobile.Student.jwebCatalog = null;
        KUMobile.Student.bbCourses = null;
        KUMobile.Student.jwebCourses = null;
        KUMobile.Student.workingSchedules = null;
    },
    
    
    /******************************************************************************
     *  Makes and displays a schedule popup for a course. Deletes itself after close!
     * 
     *  @param {string} crn - course crn
     *  @param {string} id - course identifier
     *  @param {string} section - course section
     *  @param {string} title - course title
     *  @param {string} time - course time
     *  @param {string} location - course location
     *  @param {string} professor - course professor
     *  @method showSchedulePopup
     *  @return {void}
     *  @for KUMobile.Student
     ******************************************************************************/
    showSchedulePopup: function(crn, id, section, title, time, location, professor) {
      
        // Get course popup template
        var popupTpl = Handlebars.getTemplate("schedule-course-popup");

        // Make html course
        var template = popupTpl({
            "id": "schedule-popup-" + crn,
            "name": id + ((section != "")? "-" + section : ""),
            "title": title,
            "time": time,
            "location": location,
            "professor": professor
        });

        // Add popup and create
        $.mobile.activePage.append(template).trigger("create");
        
        // Open the popup and bind its close event
        $.mobile.activePage.find(".messagePopup").popup().popup("open").bind({

            // Unbind popup and remove from html upon close
            popupafterclose: function () { $(this).unbind("popupafterclose").remove(); }
        });
        
    },

    
    /******************************************************************************
     *  Generates the permutations of schedules based on a give course list. Returns
     *  an array of schedules html.
     * 
     *  @method generatePermutations
     *  @return {Array}
     *  @for KUMobile.Student
     ******************************************************************************/
    generatePermutations: function(){
       
        // Defaults
        var workingSchedules = [];
        var courseSets = [];
        
        // Nothing to generate with?
        if(KUMobile.Student.jwebCatalog == null) return;
        
        // Gather course sets
        $("#schedule-planner-chosen-course-list li").each(function(i){
            
            // Defaults
            var sections = [], lastCrn = "", offset = 0;
            var id = $(this).text().trim().toLowerCase();
            
            // Check all courses and add matches to sections
            for (var catalogIndex = 0; catalogIndex < KUMobile.Student.jwebCatalog.length; catalogIndex++){
                
                // Set up course, id, and meeting array
                var meetings = [];
                var course = KUMobile.Student.jwebCatalog[catalogIndex];
                var cmpId = (course.courseId + ": " + course.title).trim().toLowerCase();
                meetings[0] = course;
                
                // Add course if match
                if (cmpId === id){
                    
                    // Matches the last course crn (has more than one meeting)?
                    if (lastCrn === course.crn && lastCrn != "") sections[sections.length - 1][sections[sections.length - 1].length] = course;
                    
                    // Only one meeting so far
                    else sections[sections.length] = meetings;
                    
                    // Store latest crn
                    lastCrn = course.crn;
                }
            }
            
            // Add new course set of sections
            courseSets[i] = sections;
            
        });
        
        // Recursive generate function
        var gen = function(okay, set, courseIndex, sectionIndex, working){
            
            if( courseIndex >= set.length || sectionIndex >= set[courseIndex].length ) return;
            
            // Get current course and section
            var course = set[courseIndex][sectionIndex];
            
            // Test new course
            if (KUMobile.Student.testCourses(okay, course)){
                
                // Last course?
                if (courseIndex == set.length - 1){
                    var dup = okay.slice();
                    dup[dup.length] = course;
                    working[working.length] = dup;
                }
                
                // Not the last course, keep working
                else{
                    
                    // Duplicate, insert, and recurse to next course
                    var dup = okay.slice();
                    dup[dup.length] = course;
                    gen(dup, set, courseIndex + 1, 0, working);
                }
                
            }
            
            if (sectionIndex != set[courseIndex].length) gen(okay, set, courseIndex, sectionIndex + 1, working);
            
        }
        
        // Set off the generation
        gen([], courseSets, 0, 0, workingSchedules);
        
        // Go through each schedule and unpack to be a list of meetings
        for (var scheduleIndex = 0; scheduleIndex < workingSchedules.length; scheduleIndex++){
         
            var meetings = [];
            
            // Go through each course
            for (var courseIndex = 0; courseIndex < workingSchedules[scheduleIndex].length; courseIndex++){
                
                // Go through each meeting (usually only 1)
                for (var meetingIndex = 0; meetingIndex < workingSchedules[scheduleIndex][courseIndex].length; meetingIndex++){
                    
                    meetings[meetings.length] = workingSchedules[scheduleIndex][courseIndex][meetingIndex];
                }
            }
        
            // Store meeting list
            workingSchedules[scheduleIndex] = meetings;
        }
        
        // Sort based on the specified option
        workingSchedules.sort(function(a,b) {
            
            // Target time?
            if ($("#schedule-planner-sorting option:selected").val() == "early") var targetTime = 8*60;
            if ($("#schedule-planner-sorting option:selected").val() == "afternoon") var targetTime = 13.5*60;
            if ($("#schedule-planner-sorting option:selected").val() == "evening") var targetTime = 16*60;
            
            var total_A = 0, total_B = 0;
            
            // Add up total for a
            for (var i = 0; i < a.length; i++){
                
                var time = KUMobile.Student.parseTime(a[i].time);
                var abs = targetTime - time.start;
                if (abs < 0) abs *= -1;
                
                total_A += abs + (time.end - time.start);
            }
            
            
            // Add up total for b
            for (var i = 0; i < b.length; i++){
                
                var time = KUMobile.Student.parseTime(b[i].time);
                var abs = targetTime - time.start;
                if (abs < 0) abs *= -1;
                
                total_B += abs + (time.end - time.start);
            }
            
            if (total_A > total_B) return 1;
            else if (total_A < total_B) return -1;
            else return 0;
            
        });
        
        // Store details globally 
        KUMobile.Student.workingSchedules = workingSchedules;
        KUMobile.Student.schedulePlannerIndex = -1;
        
        // At least one schedule to show?
        if (workingSchedules.length > 0){
        
            // Delete old schedule planner results page
            $("#schedule-planner-results").remove();
            
            // Add new schedule planner results page
            $(Handlebars.getTemplate("schedule-planner-results-page")()).appendTo("body");
            $.mobile.changePage("#schedule-planner-results");
            
            // Show the first schedule
            KUMobile.Student.nextWorkingSchedule();
            
            // Start swipe
            KUMobile.safeBinder("touchstart", "#schedule-planner-results", function(e){
                
                // Save start position
                KUMobile.Student.swipeStart = {
                    "x":e.originalEvent.touches[0].pageX,
                    "y":e.originalEvent.touches[0].pageY
                };
            });
            
            // End swipe
            KUMobile.safeBinder("touchend", "#schedule-planner-results", function(e){
            
                // Get position information
                var start = KUMobile.Student.swipeStart;
                var x = e.originalEvent.changedTouches[0].pageX; 
                var y = e.originalEvent.changedTouches[0].pageY;
                
                // Threshold for left/right swipe met?
                if (start && Math.abs(x - start.x) > 25 && Math.abs(y - start.y) < 75){
                    
                    // Direction?
                    if (x - start.x < 0) KUMobile.Student.nextWorkingSchedule();
                    else KUMobile.Student.previousWorkingSchedule();
                    
                }
            });
            
        }
        
        // Sorry, but no schedules :(
        else{ 
            KUMobile.safeAlert("Schedule Planner", "No schedules appear to work with the given courses.", "ok");
            KUMobile.Student.logout();
        }
        
    },
    
    
    /******************************************************************************
     *  Populates the schedule planner results page with the next working schedule
     *
     *  @method nextWorkingSchedule
     *  @return {void}
     *  @for KUMobile.Student
     ******************************************************************************/
    nextWorkingSchedule: function(e){
        
        // In range?
        if (KUMobile.Student.schedulePlannerIndex + 1 >= KUMobile.Student.workingSchedules.length) return;
        else KUMobile.Student.schedulePlannerIndex++;
        
        // Delete inners
        $("#schedule-planner-results-scroller *").remove();
        
        // Make schedule and add to page
        $(KUMobile.Student.generateScheduleTable(
            KUMobile.Student.workingSchedules[KUMobile.Student.schedulePlannerIndex]
        )).appendTo("#schedule-planner-results-scroller").enhanceWithin();
        
        // Update index
        $("#schedule-planner-results-index").text(
            KUMobile.Student.schedulePlannerIndex + 1 + "/" + KUMobile.Student.workingSchedules.length
        );

    },
    
    
    /******************************************************************************
     *  Populates the schedule planner results page with the previous working schedule
     *
     *  @method previousWorkingSchedule
     *  @return {void}
     *  @for KUMobile.Student
     ******************************************************************************/
    previousWorkingSchedule: function(){
        
        // In range?
        if (KUMobile.Student.schedulePlannerIndex - 1 < 0) return;
        else KUMobile.Student.schedulePlannerIndex--;
        
        // Delete inner
        $("#schedule-planner-results-scroller *").remove();
        
        // Make schedule and add to page
        $(KUMobile.Student.generateScheduleTable(
            KUMobile.Student.workingSchedules[KUMobile.Student.schedulePlannerIndex]
        )).appendTo("#schedule-planner-results-scroller").enhanceWithin();
        
        // Update index
        $("#schedule-planner-results-index").text(
            KUMobile.Student.schedulePlannerIndex + 1 + "/" + KUMobile.Student.workingSchedules.length
        );
        
    },
    
    
    /******************************************************************************
     *  Parses time from a pattern like 8:00 AM-9:05 AM. Returns an object with 
     *  "start" and "end" properties representing the minutes past midnight rounded
     *  to the nearest 15 minute interval. 
     *
     *  @param {string} timeStr - the time range to parse from
     *  @method parseTime
     *  @return {Object}
     *  @for KUMobile.Student
     ******************************************************************************/
    parseTime: function(timeStr){
        
        // Defaults
        var time = {"start":-1, "end":-1};
        var timePattern = /(\d+):(\d\d) ([a-zA-Z][a-zA-Z])\s?-\s?(\d+):(\d\d) ([a-zA-Z][a-zA-Z])/;
    
        if (timePattern.test(timeStr)){
                            
            var groups = timePattern.exec(timeStr);
            
            // Store values
            var startHour = Math.floor(groups[1]);
            var startMinute = Math.floor(groups[2]);
            var endHour = Math.floor(groups[4]);
            var endMinute = Math.floor(groups[5]);
            
            // Convert to military
            if (startHour != 12 && (groups[3] === "pm" || groups[3] === "PM")) startHour += 12;
            if (endHour != 12 && (groups[6] === "pm" || groups[6] === "PM")) endHour += 12;
            
            // Round minute to 15
            if (startMinute % 15 > 7) startMinute = Math.floor(startMinute/15)*15 + 15;
            else startMinute = Math.floor(startMinute/15)*15;
            if (endMinute % 15 > 7) endMinute = Math.floor(endMinute/15)*15 + 15;
            else endMinute = Math.floor(endMinute/15)*15;
            
            // Calculate start and end of course
            time.start = startHour*60 + startMinute;
            time.end = endHour*60 + endMinute;
            
        }

        return time;
    },
    
    
    /******************************************************************************
     *  Tests courses to see if a course list works with the provided course
     *
     *  @param {Array} courses - the course list which is known to work, type 
     *      KetteringJS.Student.JWEB.CatalogEntry[]
     *  @param {Object} course - the course to be tested with, type 
     *      KetteringJS.Student.JWEB.CatalogEntry
     *  @method testCourses
     *  @return {Boolean}
     *  @for KUMobile.Student
     ******************************************************************************/
    testCourses: function(courseList, courseMeetings){
        
        // In valid input
        if (courseMeetings == null || courseMeetings.length == 0) return false;
        
        // Check all meetings for violations
        for (var i = 0; i < courseMeetings.length; i++){
            
            var course = courseMeetings[i];
            
            // Days not allowed?
            if (!($("#monday-allowed").prop("checked")) && course.days.indexOf("M") > -1) return false;
            if (!($("#tuesday-allowed").prop("checked")) && course.days.indexOf("T") > -1) return false;
            if (!($("#wednesday-allowed").prop("checked")) && course.days.indexOf("W") > -1) return false;
            if (!($("#thursday-allowed").prop("checked")) && course.days.indexOf("R") > -1) return false;
            if (!($("#friday-allowed").prop("checked")) && course.days.indexOf("F") > -1) return false;
            
            // Closed?
            if (!($("#closed-allowed").prop("checked")) && course.status.indexOf("C") > -1) return false;
        }
        
        // Defaults
        var valid = true;
        
        // Go through all meetings of course (usually length 1)
        for(var meetingIndex = 0; meetingIndex < courseMeetings.length; meetingIndex++){
            
            // Get current information
            var course = courseMeetings[meetingIndex];
            var courseTime = KUMobile.Student.parseTime(course.time);
            if (courseTime.start == -1) return false;
            
            // Go through all provided courses
            for (var i = 0; i < courseList.length; i++){
                
                var cmpCourseMeetings = courseList[i];
                
                // Go through each courses meeting list (usually length 1)
                for (var cmpMeetingIndex = 0; cmpMeetingIndex < cmpCourseMeetings.length; cmpMeetingIndex++){
                    
                    // Initialize defaults
                    var cmpCourse = cmpCourseMeetings[cmpMeetingIndex];
                    var needsCheck = false;
                    
                    // Check days
                    if (course.days.indexOf("M") > -1 && cmpCourse.days.indexOf("M") > -1) needsCheck = true;
                    else if (course.days.indexOf("T") > -1 && cmpCourse.days.indexOf("T") > -1) needsCheck = true;
                    else if (course.days.indexOf("W") > -1 && cmpCourse.days.indexOf("W") > -1) needsCheck = true;
                    else if (course.days.indexOf("R") > -1 && cmpCourse.days.indexOf("R") > -1) needsCheck = true;
                    else if (course.days.indexOf("F") > -1 && cmpCourse.days.indexOf("F") > -1) needsCheck = true;
                    
                    if (needsCheck){
                        
                        // Get compare time
                        var cmpTime = KUMobile.Student.parseTime(cmpCourse.time);
                        if(cmpTime.start == -1) return false;
                        
                        // Check if courseTime overlaps cmpTime
                        valid = valid && !(courseTime.start >= cmpTime.start && courseTime.start < cmpTime.end);
                        valid = valid && !(courseTime.end > cmpTime.start && courseTime.end <= cmpTime.end);
                        
                        // Check if cmpTime overlaps courseTime
                        valid = valid && !(cmpTime.start >= courseTime.start && cmpTime.start < courseTime.end);
                        valid = valid && !(cmpTime.end > courseTime.start && cmpTime.end <= courseTime.end);
                        
                    }
                    
                    // Done checking?
                    if (!valid) break;
                }
                
                // Done checking?
                if (!valid) break;
            }
            
            // Done checking?
            if (!valid) break;
        }
        
        return valid;
        
    },
    
    
    /******************************************************************************
     *  Generates and returns a div with a table and corresponding popups based on courses
     * 
     *  @param {Array} courses - the course data returned by KetteringJS retrieveSchedule
     *  @method generateScheduleTable
     *  @return {jQuery Div}
     *  @for KUMobile.Student
     ******************************************************************************/
     generateScheduleTable: function(courses){
        
        // Defaults
        var M = [], T = [], W = [], R = [], F = [];
        var timePattern = /(\d+):(\d\d) ([a-zA-Z][a-zA-Z])\s?-\s?(\d+):(\d\d) ([a-zA-Z][a-zA-Z])/;
        var hour = 8, militaryHour = 8, minute = 0;
        var popupTpl = Handlebars.getTemplate("schedule-course-popup");
        var maxTime = 56; 
        
        // Make empty container and table
        var container = $("<div></div>");
        var test = $("<div></div>",{"style": "display:none;"});
        var table = $("<table></table>", {
            "class": "schedule",
            "width": "100%"
        });
        
        // Go through all time slots from 8:00 AM -> 9:00 PM
        for (var timeIndex = 0; timeIndex < maxTime; timeIndex++){
         
            // First?
            if (timeIndex === 0) var cssClasses = "first ";
            else var cssClasses = "";
         
            // Make row 
            var row = $("<tr></tr>", {
                "class": (minute <= 15)? cssClasses + "more-grey" : cssClasses + "grey"
            });
            
            // Add time header
            if (minute === 0) $("<th></th>").text(hour + " " + ((militaryHour >= 12)?"PM":"AM")).appendTo(row);
            else if (minute === 15) $("<th></th>").html("&nbsp;").appendTo(row);
            else if (minute >= 30) $("<th></th>").html("&nbsp;").appendTo(row);
            
            
            // Add day information
            for (var dayIndex = 0; dayIndex < 5; dayIndex++){
                
                // Determine day
                if (dayIndex === 0){ var day = "M"; var blocks = M; }
                else if (dayIndex === 1){ var day = "T"; var blocks = T; }
                else if (dayIndex === 2){ var day = "W"; var blocks = W; }
                else if (dayIndex === 3){ var day = "R";  var blocks = R; }
                else{ var day = "F"; var blocks = F; }
                
                // Block is not already taken up?
                if(!blocks[timeIndex]){
                    
                    // Calculate current time slot
                    var time = militaryHour*60 + minute;
                    var found = false;
                    var foundCourse = null;
                    var rowspan = 1;
                    var colorIndex = 0;
                    var latestCourseTime = 0;
                    
                    // See if any courses fit into this day / time combination
                    for (var courseIndex = 0; courseIndex < courses.length; courseIndex++){
                        
                        // Current 
                        var course = courses[courseIndex];
                        
                        // Account of naming of room/location and title/courseTitle
                        // TODO this should be updated in KetteringJS instead.
                        if(course.room) course.location = course.room;
                        if(course.title) course.courseTitle = course.title;
                        
                        // Defaults
                        var startHour = -1, startMinute = -1, endHour = -1, endMinute = -1;
                        
                        // Determine hour and minute rounded to nearest 15 (military time)
                        if (timePattern.test(course.time)){
                            
                            var groups = timePattern.exec(course.time);
                            
                            // Store values
                            startHour = Math.floor(groups[1]);
                            startMinute = Math.floor(groups[2]);
                            endHour = Math.floor(groups[4]);
                            endMinute = Math.floor(groups[5]);
                            
                            // Convert to military
                            if (startHour != 12 && (groups[3] === "pm" || groups[3] === "PM")) startHour += 12;
                            if (endHour != 12 && (groups[6] === "pm" || groups[6] === "PM")) endHour += 12;
                            
                            // Round minute to 15
                            if (startMinute % 15 > 7) startMinute = Math.floor(startMinute/15)*15 + 15;
                            else startMinute = Math.floor(startMinute/15)*15;
                            if (endMinute % 15 > 7) endMinute = Math.floor(endMinute/15)*15 + 15;
                            else endMinute = Math.floor(endMinute/15)*15;
                            
                            // Calculate start and end of course
                            var courseStart = startHour*60 + startMinute;
                            var courseEnd = endHour*60 + endMinute;
                            
                            // Check if correct day and matching time
                            if (!found && course.days.indexOf(day) > -1 && courseStart === time){
                                found = true;
                                foundCourse = course;
                                colorIndex = courseIndex;
                                rowspan = (courseEnd - courseStart)/15;
                            }
                            
                            // Calculate latest end time
                            if(((endHour-8)*60 + endMinute)/15 > latestCourseTime) latestCourseTime = ((endHour-8)*60 + endMinute)/15; 
                        }
                    }
                    
                    // Round latest time to next 4th
                    if (courses.length > 0) maxTime = (Math.floor(latestCourseTime/4) + 1)*4;
                    if (maxTime < 36) maxTime = 36;
                    
                    // Add the found course!
                    if(found){
                        
                        // Make id and fix color index
                        var id = "schedule-popup-" + foundCourse.crn;
                        colorIndex = colorIndex % 12;
                        
                        // Make popup argument list
                        var argList = "'" + foundCourse.crn 
                            + "','" + foundCourse.courseId 
                            + "','" + foundCourse.section 
                            + "','" + foundCourse.courseTitle 
                            + "','" + foundCourse.time 
                            + "','" + foundCourse.location 
                            + "','" + foundCourse.professor + "'";
                        
                        if(foundCourse.status && foundCourse.status.indexOf("C") > -1) var closed = " closed-course";
                        else var closed = "";
                        
                        // Make element
                        $("<td></td>", {
                            "rowspan": rowspan,
                            "class": "course-box schedule-color" + (colorIndex) + closed,
                            "onclick": "KUMobile.Student.showSchedulePopup(" + argList + ");"
                        }).html(foundCourse.courseId).appendTo(row);
                        
                        
                        // Block the times this course takes up
                        for (var i = 0; i < rowspan; i++) blocks[timeIndex + i] = true;
                    }
                    
                    // Make empty element and add
                    else $("<td></td>").html("&nbsp;").appendTo(row);
                }
            }
            
            // Add row
            row.appendTo(table);
            
            // Next hour?
            if (minute + 15 === 60){ hour++; militaryHour++; }
            
            // Keep hour normal
            hour = hour % 12;
            if (hour === 0) hour = 12;
            
            // Increment minute by 15 mod 60
            minute += 15;
            minute = minute % 60;
            
        }
        
        // Add table to container
        table.appendTo(container);
        
        // Give back html as specified
        return container;
     },
    

    /******************************************************************************
     *  Populates final grades page based on returned information. 
     * 
     *  @event populateFinalGrades
     *  @for KUMobile.Student
     ******************************************************************************/
    populateFinalGrades: function(term, termGpa, overallGpa, grades){
        
        // Bottom info
        $("#final-grades #termGpa").text(termGpa);
        $("#final-grades #overallGpa").text(overallGpa);
        
        // Templates
        var gradeTpl = Handlebars.getTemplate("final-grade-item");
        
        // Go through all grades
        for (var i = 0; i < grades.length; i++){
            
            // Current grade
            var grade = grades[i];
            
            
            $(gradeTpl({
                "name": grade.courseId + ": " + grade.title,
                "credits": grade.earnedCredits,
                "grade": grade.grade
            })).appendTo("#final-grades-list");
            
            
        }
        
        // Refresh and show
        $("#final-grades-list").listview('refresh');
        $("#final-grades-gpa-list").listview('refresh');
        $("#final-grades-list").show();
        $("#final-grades-gpa-list").show();
        $("#final-grades-options").removeAttr("disabled");
        
        // Done loading
        KUMobile.hideLoading("final-grades");
        
    },
    
    
    /******************************************************************************
     *  Populates degree evaluation page based on returned information. 
     * 
     *  @event populateDegreeEvaluation
     *  @for KUMobile.Student
     ******************************************************************************/
    populateDegreeEvaluation: function(eval){
        
        // Remove old degree evaluation pages (if exist)
        $(".student-needs-removed.for-degree-evaluation").remove();
        
        // Top information
        $("#degree-evaluation #fullName").text(eval.fullName);
        $("#degree-evaluation #idNumber").text(eval.idNumber);
        $("#degree-evaluation #program").text(eval.majors);
        
        // Templates
        var extrainfoTpl = Handlebars.getTemplate("degree-evaluation-extrainfo-page");
        var subjectTpl = Handlebars.getTemplate("degree-evaluation-read-only-subject");
        var courseTpl = Handlebars.getTemplate("degree-evaluation-course-item");
        var sublistTpl = Handlebars.getTemplate("degree-evaluation-sublist");
        var sublistPageTpl = Handlebars.getTemplate("degree-evaluation-sublist-page");
        
        // Create and add extra information page
        var extrainfoHtml = $(extrainfoTpl({
            "degree":               eval.degree,
            "college":              eval.college,
            "majors":               eval.majors,
            "minors":               eval.minors,
            "concentrations":       eval.concentrations,
            "catalog":              eval.catalog,
            "expectedGraduation":   eval.expectedGraduation,
            "overallGPA":           eval.overallGPA,
            "programGPA":           eval.programGPA
        })).appendTo("body");
        
        // Hide the necessary elements on information page
        if (eval.degree == "") $(".degree", extrainfoHtml).hide();
        if (eval.college == "") $(".college", extrainfoHtml).hide();
        if (eval.majors == "") $(".majors", extrainfoHtml).hide();
        if (eval.minors == "") $(".minors", extrainfoHtml).hide();
        if (eval.concentrations == "") $(".concentrations", extrainfoHtml).hide();
        if (eval.catalog == "") $(".catalog", extrainfoHtml).hide();
        if (eval.expectedGraduation == "")  $(".expectedGraduation", extrainfoHtml).hide();
        if (eval.overallGPA == "") $(".overallGPA", extrainfoHtml).hide();
        if (eval.programGPA == "") $(".programGPA", extrainfoHtml).hide();
        
        // Defaults
        var sublist = 0;
        
        // Go through each evaluation area
        for (var areaIndex = 0; areaIndex < eval.evalAreas.length; areaIndex++){

            // Current area
            var area = eval.evalAreas[areaIndex];
            
            // Add subject to list
            $(subjectTpl({
                "subject": area.name,
                "satisfied": (area.met)? "Met":"Not Met"
            })).appendTo("#degree-evaluation-list");
            
            // Defaults
            var coursesForSublist = [];
            
            // Go through all courses for area
            for (var courseIndex = 0; courseIndex < area.requiredCourses.length; courseIndex++){
                
                // Current course
                var course = area.requiredCourses[courseIndex];
                
                // Check if two courses have same name in a row (electives)
                if(courseIndex + 1 < area.requiredCourses.length && course.name === area.requiredCourses[courseIndex + 1].name){
                    
                    // Make new sublist?
                    if (coursesForSublist.length == 0){
                        
                        // Make and add anchor item
                        $(sublistTpl({
                            "href": "#degree-evaluation-sublist-page" + sublist,
                            "name": course.name,
                            "color": (course.met)? "green":"red",
                            "met": (course.met)? "Met":"Not Met",
                            "description": course.details
                        })).appendTo("#degree-evaluation-list");
                        
                        // Make and add actual page!
                        $(sublistPageTpl({
                            "id": "degree-evaluation-sublist-page" + sublist,
                            "name": course.name
                        })).appendTo("body");
                        
                    }
                    
                    // Add course to sublist
                    coursesForSublist[coursesForSublist.length] = $(courseTpl({
                        "name": course.takenCourseId,
                        "color": "green",
                        "satisfied": "Met",
                        "displayForBottomInfo": (course.takenCredits  == "" && course.takenGrade == "")? "none":"block",
                        "credits": course.takenCredits,
                        "grade": course.takenGrade,
                        "displayDescription": "none",
                        "description": ""
                    }));
                    
                }
                
                // Normal course!
                else{
                
                    // Flush a sublist?
                    if (coursesForSublist.length > 0){

                        // Add course to sublist
                        coursesForSublist[coursesForSublist.length] = $(courseTpl({
                            "name": course.takenCourseId,
                            "color": "green",
                            "satisfied": "Met",
                            "displayForBottomInfo": (course.takenCredits == "" && course.takenGrade == "")? "none":"block",
                            "credits": course.takenCredits,
                            "grade": course.takenGrade,
                            "displayDescription": "none",
                            "description": ""
                        }));
                        
                        // Add list then append all courses
                        for (var i = 0; i < coursesForSublist.length; i++) $("#degree-evaluation-sublist-page" + sublist + " ul").append(coursesForSublist[i]);
                        coursesForSublist = [];
                        sublist += 1;
                    }
                    
                    else{
                        
                        // Defaults
                        var displayDescription = "";
                        var courseIdPattern = /[a-zA-Z]+\s+\d+/;
                        
                        // Need to fix course type?
                        if(courseIdPattern.test(course.name)) course.name = course.name.replace(" ", "-");
                        if(course.takenCourseId == "-") course.takenCourseId = "";
                        
                        // Check if we need to add a fulfilled message
                        if(course.takenCourseId != "" && course.name.toLowerCase() != course.takenCourseId.toLowerCase()) displayDescription = "Fulfilled by " + course.takenCourseId + ": " +  course.takenCourseTitle;
                        if(course.details != "") displayDescription = course.details + "<br><br>" + displayDescription;
                        
                        // Add course to list
                        $(courseTpl({
                            "name": course.name,
                            "color": (course.met)? "green":"red",
                            "satisfied": (course.met)? "Met":"Not Met",
                            "displayForBottomInfo": (course.takenCredits != "" || course.takenGrade != "")? "block":"none",
                            "credits": course.takenCredits,
                            "grade": course.takenGrade,
                            "displayDescription": (displayDescription == "")? "none":"block",
                            "description": displayDescription
                        })).appendTo("#degree-evaluation-list");
                    }
                }
            }
            
            // Flush a sublist?
            if (coursesForSublist.length > 0){
                
                // Add list then append all courses
                for (var i = 0; i < coursesForSublist.length; i++) $("#degree-evaluation-sublist-page" + sublist + " ul").append(coursesForSublist[i]);
                coursesForSublist = [];
                sublist += 1;
            }
            
        }
        
        // Refresh and show
        $("#degree-evaluation-list").trigger('create');
        $("#degree-evaluation-list").listview('refresh');
        $("#degree-evaluation-options").selectmenu('refresh', true);
        $("#degree-evaluation-list").show();
        $("#degree-evaluation-options").removeAttr("disabled");
        KUMobile.Student.evalLocked = false;
        
        // Done loading
        KUMobile.hideLoading("degree-evaluation");
        
    },
    
    
    /******************************************************************************
     *  Adds a planner course to the set of courses
     *
     *  @param {string} courseId - id of course
     *  @param {string} courseTitle - title of course
     *  @method addPlannerCourse
     *  @return {void}
     *  @for KUMobile.Student
     *  @example
     *      KUMobile.Student.addPlannerCourse("CS-101", "Computing & Algorithms I");
     ******************************************************************************/
    addPlannerCourse: function(courseId, courseTitle){
      
        var found = false;
      
        // Check to see if already exists?
        $("#schedule-planner-chosen-course-list li a").each(function(i){
            if((courseId + ": " + courseTitle) == $(this).text().trim()) found = true;
        });
        
        if (!found){
         
            // Make list item
            var courseHtml = Handlebars.getTemplate("schedule-planner-chosen-course-item")({
                "courseId": courseId,
                "courseTitle": courseTitle
            });
            
            // Add list item to list and refresh
            $("#schedule-planner-chosen-course-list").append(courseHtml).listview('refresh');
        }
    },
    
    
    /******************************************************************************
     *  Toggles the term type between plain text (Winter 2015) and integer (201501)
     *
     *  @param {string} input - text to be toggled, both formats accepted
     *  @method toggleTermType
     *  @return {string}
     *  @for KUMobile.Student
     *  @example
     *      var termInt = KUMobile.Student.toggleTermType("Winter 2015");
     *      var termWord = KUMobile.Student.toggleTermType("201501");
     ******************************************************************************/
    toggleTermType: function(input){
        
        var intPattern = /(\d\d\d\d)(\d\d)/;
        var wordPattern = /([a-zA-Z]+)\s+(\d\d\d\d)/;
        
        // Matches integer type?
        if(intPattern.test(input)){
            
            // Retrieve parts
            var groups = intPattern.exec(input);
            var year = groups[1];
            var term = groups[2];
            
            // Return proper word term 
            if (term == "01") return "Winter " + year;
            else if (term == "02") return "Spring " + year;
            else if (term == "03") return "Summer " + year;
            else if (term == "04") return "Fall " + year;
            
        }
        
        // Matches integer type?
        if(wordPattern.test(input)){
            
            // Retrieve parts
            var groups = wordPattern.exec(input);
            var year = groups[2];
            var term = groups[1];
            
            // Return proper int term
            if (term.toLowerCase() == "winter") return year + "01";
            else if (term.toLowerCase() == "spring") return year + "02";
            else if (term.toLowerCase() == "summer") return year + "03";
            else if (term.toLowerCase() == "fall") return year + "04";
        }
        
        return input
    },
    
    
    /******************************************************************************
     *  Tries to guess which term it is based on today's current date (e.g 201501)
     *
     *  @method guessTerm
     *  @return {string}
     *  @for KUMobile.Student
     *  @example
     *      var term = KUMobile.Student.guessTerm();
     ******************************************************************************/
    guessTerm: function(){
       
        // Today
        var date = new Date();
        
        // Year and term!
        // note: the term is essentially the quarter [1-4]
        var term = Math.round(date.getMonth()/4 + 1);
        var year = date.getFullYear();
       
        return year + "0" + term;
    },
    
    
    /******************************************************************************
     *  Attempts to open a file. Triggered after an attached file link is clicked.
     * 
     *  @event openFile
     *  @for KUMobile.Student
     ******************************************************************************/
    openFile: function(name, url, id){
    
        // Begin loading
        KUMobile.showLoading(id);
        
        // Fail callback
        var failed = function(err){
            
            // Alert the user and hide loading
            KUMobile.safeAlert("Error", "File could not be opened: " + err, "ok");
            KUMobile.hideLoading(id)
        };
        
        // Patterns
        extPattern = /.*\.[a-zA-Z0-9]+/;
        
        // Check if extension is already in name?
        if(extPattern.test(name)) {
            
            // Generate url
            var fullUrl = url + '/' + encodeURIComponent(name);
            
            // Try to open finally!
            window.handleDocumentWithURL(
                  
                // Success
                function() { 
                    KUMobile.hideLoading(id);
                },
                
                // Failure
                function(error) {
                    
                    KUMobile.safeAlert("Error", "The file could not be properly opened.", "ok");
                    KUMobile.hideLoading(id);
                }, 
                fullUrl
            );
        }
        
        // Need to determine extention first
        else{
         
            $.ajax({
               type: "HEAD",
                url: url,
                success: function(message, text, response){
                    
                    // Get content type
                    contentType = response.getResponseHeader("Content-Type");
                    
                    // Initialize mime found
                    var found = false;
                    
                    // Check all mime values
                    for(var i = 0; i < KUMobile.Student.MIMETypes.length; i++){
                        
                        // Get mime
                        mime = KUMobile.Student.MIMETypes[i];
                        
                        // Match?
                        if(mime.id === contentType){
                            
                            // Generate url
                            var fullUrl = url + '/' + encodeURIComponent(name + mime.ext);
                            
                            // Try to open finally!
                            window.handleDocumentWithURL(
                                
                                // Success
                                function() { 
                                    KUMobile.hideLoading(id);
                                },
                                
                                // Failure
                                function(error) {
                                    
                                    // Alert error and hide loading
                                    KUMobile.safeAlert("Error", "The file could not be properly opened.", "ok");
                                    KUMobile.hideLoading(id);
                                }, 
                                fullUrl
                            );
                            
                            // Found and no need to keep searching mime
                            found = true;
                            break;
                        }
                    }
                    
                    // Alert user of failure
                    if(!found) failed("Unknown Type");
                    
                },
                
                // Error
                error: function(err, textStatus, errorThrown){
                    failed("Document failed to download.");
                }
            });
        }
        
        
    },
    
    
    /******************************************************************************
     *  Populates course folder page based on a given content tree. 
     * 
     *  @event populateFolderPage
     *  @for KUMobile.Student
     ******************************************************************************/
    populateFolderPage: function(tree){

        // Initialize properties
        var folderTpl = Handlebars.getTemplate("student-course-folder");
        var itemTpl = Handlebars.getTemplate("student-course-folder-item");
        var folderPageTpl = Handlebars.getTemplate("student-course-folder-page");
        var bbId = tree.bbId;
        var contentId = tree.contentId;
        
        // Loading
        KUMobile.showLoading(bbId + contentId + "-page");
        
        // Go through all folders
        for(var i = 0; i < tree.folders.length; i++){
            
            // Get folder
            var folder = tree.folders[i];
            
            // Make item
            var folderHtml = folderTpl({
               "contentId": folder.contentId,
               "bbId": folder.bbId,
               "name": folder.name
            });
            
            // Make folder page
            var folderPage = folderPageTpl({
               "contentId": folder.contentId,
               "bbId": folder.bbId,
               "name": folder.name 
            });
            
            // Add folder item
            $(folderHtml).appendTo("#" + bbId + "-" + contentId + "-list");
            
            // Add folder page
            $(folderPage).appendTo("body");
            KUMobile.safeBinder("pageinit",'#' + folder.bbId + "-" + folder.contentId + "-page", KUMobile.Student.pageInitFolder);
            
        }
        
        
        // Go through all items
        for(var i = 0; i < tree.items.length; i++){
            
            // Get folder
            var item = tree.items[i];
            var content = KUMobile.sanitize($(item.details));
            var fullId = item.fullBBId;
            
            content.find('*').css("max-width", "90%").css("height","auto").css("white-space","normal").css("font-size",".94em");
            content.find("div:first").css("width","100%").css("max-width","100%");
            
            // Check hyperlinks
            content.find("a").each(function(index){
                
                // Fix link if necessary
                var link = $(this).attr("href");
                var onclick = $(this).attr("onclick");
                
                // Onclick pattern to redirect
                var pattern = /(.*href=')(\/.*'.*)/;
                
                // Valid onclick?
                if (onclick != null){

                    // Match pattern?
                    if(pattern.test(onclick) && pattern.exec(onclick).length == 3){
                    
                        // Create a new onclick with a valid blackboard url!
                        var groups = pattern.exec(onclick);
                        var newclick = groups[1] + "https://kettering.blackboard.com" + groups[2];
                        $(this).attr("onclick", newclick);
                    }
                }
                
                // Fix link if starts with leading slash
                var badLinkPattern = /\/.*/;
                if(link != null && badLinkPattern.test(link)) $(this).attr("href", "https://kettering.blackboard.com" + link);
                
            });
            
            
            // Check images
            content.find("img").each(function(index){
                
                var link = $(this).attr("src");
                
                // Fix link if necessary
                var badLinkPattern = /\/.*/;
                if(link != null && badLinkPattern.test(link)) $(this).attr("src", "https://kettering.blackboard.com" + link);
                
            });
            
            
            // Make item
            var itemHtml = itemTpl({
               "name": item.name,
               "content": content.html()
            });
            
            // Add folder item
            $(itemHtml).appendTo("#" + bbId + "-" + contentId + "-list");
            
            // Plug in is only available for Android and iOS
            if(KUMobile.Config.isAndroid || KUMobile.Config.isIOS){
                
                // Fix all attachments to properly open with native app            
                $("#" + bbId + "-" + contentId + "-list ul.attachments a").each(function(i){
                    
                        // Get properties
                        var name = $(this).text().trim();
                        var url = $(this).attr("href");
                        
                        // Click function
                        var onclick = function(event){
                            
                            // Prevent the normal open
                            event.preventDefault();
                            
                            // Try to open the file!
                            KUMobile.Student.openFile(name, url, bbId + "-" + contentId + "-page");
                        };
                        
                        // Setup click function (unbind to ensure nothing is rebinded)
                        $(this).unbind().click(onclick);
                });
            }
        }
        
        // No folders or items?
        if(tree.items.length == 0 && tree.folders.length == 0){
            
            // Tell user nothing to show!
            $("<div></div>").attr("class", "nothing-to-show").text("Nothing to show").appendTo("#" + bbId + "-" + contentId + "-scroller")

        }
        
        // Refresh
        $("#" + bbId + "-" + contentId + "-list").listview('refresh');
        
        // Done loading
        KUMobile.hideLoading(bbId + "-" + contentId + "-page");
        $("#" + bbId + "-" + contentId + "-list").show();
        
        
    },
    
    
    /******************************************************************************
     *  Triggered when a new evaluation generate button is clicked
	 *
     *  @event degreeEvaluationGenerate
     *  @for KUMobile.Student
     ******************************************************************************/
	degreeEvaluationGenerate: function(){
        
        // Locked?
        if (KUMobile.Student.evalLocked) return;
        
        // Loading
        KUMobile.showLoading("degree-evaluation");
        
        
        // After evaluation generation
        successfulEvalGenerate = function(){
            
            // Refresh the full page
            KUMobile.Student.pageInitDegreeEvaluation(null);
            
        }
        
        // Success for eval programs
        successfulEvalPrograms = function(evalPrograms){

            // No valid programs?
            if (evalPrograms.length < 1) failure("No valid programs found.");

            else{
                
                // Take the first program offered
                var program = evalPrograms[0];
                
                // Generate!
                KU.Student.JWEB.generateEvaluation(
                    program.sourceId, 
                    program.programId, 
                    KUMobile.Student.guessTerm(), 
                    successfulEvalGenerate, 
                    failure
                );
            }
            
            
        }
        
        // Failure
        var failure = function(errMsg){

            // Presumably not loading
            KUMobile.hideLoading("degree-evaluation");
            
            // Re-enable
            $("#degree-evaluation-options").removeAttr("disabled");
            KUMobile.Student.evalLocked = false;
            
            // Alert user
            KUMobile.safeAlert("Error", "There was an error loading the degree evaluation information potentially caused by a timeout or loss in connectivity. Please try again soon.", "ok");
            KUMobile.Student.logout();
        };
        
        // Temporarily disable
        $("#degree-evaluation-options").attr("disabled","disabled");
        KUMobile.Student.evalLocked = true;
        
        // Clear all items
        $("#degree-evaluation-list .student-needs-removed").remove();
        $("#degree-evaluation-options option").remove();
        $("#degree-evaluation-info").remove();
        
        // Get eval programs
        KU.Student.JWEB.retrieveEvalPrograms(
            KUMobile.Student.guessTerm(), 
            successfulEvalPrograms, 
            failure
        );
        
        
    },
    
    /******************************************************************************
     *  Triggered when a term for schedule planner page is selected from drop down
	 *
     *  @event schedulePlannerTermChange
     *  @for KUMobile.Student
     ******************************************************************************/
	schedulePlannerTermChange: function(e,u){    
        
        // Loading
        KUMobile.showLoading("schedule-planner");
        
        // Disable and remove course list
        $("#schedule-planner-terms").attr("disabled","disabled");
        $("#schedule-options-generate-button").attr("disabled","disabled");
        $("#schedule-planner-chosen-course-list li").remove();
        $( "#schedule-planner-course-options-popup" ).popup( "disable" );
        KUMobile.Student.jwebCatalog = null;

        // Failure
        var failure = function(errMsg){

            // Presumably not loading
            KUMobile.hideLoading("schedule-planner");
            
            // Re-enable
            $("#schedule-planner-terms").removeAttr("disabled");
            $("#schedule-options-generate-button").removeAttr("disabled");
            
            // Alert user
            KUMobile.safeAlert("Error", "There was an error loading the schedule catalog potentially caused by a timeout or loss in connectivity. Please try again soon.", "ok");
            KUMobile.Student.logout();
        };
        
        // Download new catalog
        KU.Student.JWEB.retrieveScheduleCatalog(
            $("#schedule-planner-terms option:selected").val(), 
            KUMobile.Student.populateSchedulePlanner, 
            failure
        );
        
    },        
        
    
    /******************************************************************************
     *  Triggered when a term for schedule page is selected from drop down
	 *
     *  @event scheduleTermChange
     *  @for KUMobile.Student
     ******************************************************************************/
	scheduleTermChange: function(e,u){    
        
        // Loading
        KUMobile.showLoading("schedule");
        
        // Temporarily hide, disable and clear
        $("#schedule-options").attr("disabled","disabled");
        $("#schedule-scroller .schedule").remove();
        
        // Failure
        var failure = function(errMsg){

            // Presumably not loading
            KUMobile.hideLoading("schedule");
            
            // Re-enable
            $("#schedule-options").removeAttr("disabled");
            
            // Alert user
            KUMobile.safeAlert("Error", "There was an error loading the schedule information potentially caused by a timeout or loss in connectivity. Please try again soon.", "ok");
            KUMobile.Student.logout();
        };
        
        KU.Student.JWEB.retrieveSchedule(
            $(this).val(), 
            KUMobile.Student.populateSchedule, 
            failure
        );
        
    },
    
    
    /******************************************************************************
     *  Triggered when a term for final grades is selected from drop down
	 *
     *  @event finalGradesTermChange
     *  @for KUMobile.Student
     ******************************************************************************/
	finalGradesTermChange: function(e,u){    
        
        // Loading
        KUMobile.showLoading("final-grades");
        
        // Temporarily hide, disable and clear
        $("#final-grades-list").hide();
        $("#final-grades-gpa-list").hide();
        $("#final-grades-options").attr("disabled","disabled");
        $("#final-grades-list .student-needs-removed").remove();
        
        // Failure
        var failure = function(errMsg){

            // Presumably not loading
            KUMobile.hideLoading("final-grades");
            
            // Re-enable
            $("#final-grades-options").removeAttr("disabled");
            
            // Alert user
            KUMobile.safeAlert("Error", "There was an error loading the final grade information potentially caused by a timeout or loss in connectivity. Please try again soon.", "ok");
            KUMobile.Student.logout();
        };
        
        // Try to repopulate!
        KU.Student.JWEB.retrieveFinalGrades(
            $(this).val(), 
            KUMobile.Student.populateFinalGrades, 
            failure
        );
        
    },
    
    
    /******************************************************************************
     *  Triggered when a new evaluation is selected to be loaded from the drop down
	 *
     *  @event degreeEvaluationChange
     *  @for KUMobile.Student
     ******************************************************************************/
	degreeEvaluationChange: function(e,u){
        
        // Loading
        KUMobile.showLoading("degree-evaluation");
        
        // Failure
        var failure = function(errMsg){

            // Presumably not loading
            KUMobile.hideLoading("degree-evaluation");
            
            // Re-enable
            $("#degree-evaluation-options").removeAttr("disabled");
            KUMobile.Student.evalLocked = false;
            
            // Alert user
            KUMobile.safeAlert("Error", "There was an error loading the degree evaluation information potentially caused by a timeout or loss in connectivity. Please try again soon.", "ok");
            KUMobile.Student.logout();
        };
        
        // Temporarily disable
        $("#degree-evaluation-options").attr("disabled","disabled");
        KUMobile.Student.evalLocked = true;
        
        // Clear all items
        $("#degree-evaluation-list .student-needs-removed").remove();
        $("#degree-evaluation-info").remove();
        
        // Retrieve the evaluation
        KU.Student.JWEB.retrieveEvaluation(
            KUMobile.Student.guessTerm(), 
            $(this).val(), 
            KUMobile.Student.populateDegreeEvaluation, 
            failure
        );
        
        
    },
    
    
    /******************************************************************************
     *  Failure for generic errors on the student page
	 *
     *  @event failure
     *  @for KUMobile.Student
     ******************************************************************************/
    failure: function(errMsg){

        // Clear password
        $("#pass").val("");
    
        // Presumably not loading
        KUMobile.Student.loading = false;
        KUMobile.hideLoading("student-header");
        
        if (errMsg == "") errMsg = "Sorry, there was an error"
        
        // Alert user
        KUMobile.safeAlert("Error", errMsg + ". Please try again.", "ok");
    },
    
    
    /******************************************************************************
     *  Triggered when the sign in button is pressed and we attempt to login to all
     *  student services!
	 *
     *  @event login
     *  @for KUMobile.Student
     ******************************************************************************/
    login: function(){
        
        // Already logged in or loading? Then return
        if(KUMobile.Student.loggedIn) return;
        if(KUMobile.Student.loading) return;
        
        // Loading
        KUMobile.Student.loading = true;
        KUMobile.showLoading("student-header");
    
        // Get credentials
        var user = $("#user").val().toLowerCase();
        var pass = $("#pass").val();
        var rememberMe = $("#rememberMe").prop("checked");
        var savePass = $("#savePass").prop("checked");
        
        // Either save or remove username from storage
        if(rememberMe) window.localStorage.setItem("ku_username", user);
        else window.localStorage.removeItem("ku_username");
        
        // Encrypt
        var shhhhh = "foo_bar_placeholder";
        var encrypted = CryptoJS.DES.encrypt(pass, shhhhh);
        
        // Either save or remove password from storage
        if(savePass) window.localStorage.setItem("ku_pass", encrypted);
        else window.localStorage.removeItem("ku_pass");
        
        // Store remember me state
        window.localStorage.setItem("ku_rememberme", rememberMe);
        window.localStorage.setItem("ku_savepass", savePass);
    
        /** Successful Login Status Check (BB) **/
        var successAfterLoginStatus = function(loggedIn, currentUser){
            
            // Not logged in at all?
            // then simply user credentials to login!
            if(!loggedIn) KU.Student.BB.login(user, pass, successLogin, KUMobile.Student.failure);
            
            // Logged in as a different user?
            // then log out then log in as correct user!
            else if(loggedIn && currentUser != user) KU.Student.BB.logout(successLogout, successLogout);
            
            // Correct user is already logged in?
            // then nothing to do!
            else successLogin();
            
        };
        
        /** Successful Login (overall) **/
        var successLogin = function(){
            
            // Hide loading
            KUMobile.Student.loading = false;
            KUMobile.Student.loggedIn = true;
            KUMobile.hideLoading("student-header");
            
            // 1. Clear login password
            // 2. Hide form
            // 3. Show logout button
            // 4. Show student list
            $("#student #pass").attr("value", "");
            $("#student #login-box").hide();
            $("#student #logout-button").show();
            $("#student #student-scroller").show();
            
            // Add pages
            $(Handlebars.getTemplate("student-courses-page")()).appendTo("body");
            $(Handlebars.getTemplate("student-information-page")()).appendTo("body");
            $(Handlebars.getTemplate("degree-evaluation-page")()).appendTo("body");
            $(Handlebars.getTemplate("final-grades-page")()).appendTo("body");
            $(Handlebars.getTemplate("account-summary-page")()).appendTo("body");
            $(Handlebars.getTemplate("current-holds-page")()).appendTo("body");
            $(Handlebars.getTemplate("financial-aid-page")()).appendTo("body");
            $(Handlebars.getTemplate("schedule-page")()).appendTo("body");
            $(Handlebars.getTemplate("schedule-planner-page")()).appendTo("body");
            
            // Page events
            KUMobile.safeBinder("pageinit","#courses", KUMobile.Student.pageInitCourses);
            KUMobile.safeBinder("pageinit","#information", KUMobile.Student.pageInitInformation);
            KUMobile.safeBinder("pageinit","#degree-evaluation", KUMobile.Student.pageInitDegreeEvaluation);
            KUMobile.safeBinder("pageinit","#final-grades", KUMobile.Student.pageInitFinalGrades);
            KUMobile.safeBinder("pageinit","#account-summary", KUMobile.Student.pageInitAccountSummary);
            KUMobile.safeBinder("pageinit","#current-holds", KUMobile.Student.pageInitCurrentHolds);
            KUMobile.safeBinder("pageinit","#financial-aid", KUMobile.Student.pageInitFinancialAid);
            KUMobile.safeBinder("pageinit","#schedule", KUMobile.Student.pageInitSchedule);
            KUMobile.safeBinder("pageinit","#schedule-planner", KUMobile.Student.pageInitSchedulePlanner);
            
            // Clear password
            $("#pass").val("");
            
        };
        
        /** Successful Logout (BB) **/
        var successLogout = function(){
            
            // Login!
            KU.Student.BB.login(user, pass, successLogin, KUMobile.Student.failure);
        }
        
        /** Successful Login (JWEB) **/
        var successJWEB = function(){
            
            // Check the login for BB
            KU.Student.BB.checkLogIn(successAfterLoginStatus, KUMobile.Student.failure);
            
        }
        
        // Try to login to JWEB
        KU.Student.JWEB.login(user, pass, successJWEB, KUMobile.Student.failure);
            
    },
    
    
    /******************************************************************************
     *  Triggered when the logout button is pressed and we attempt to logout of all
     *  student services!
	 *
     *  @event logout
     *  @for KUMobile.Student
     ******************************************************************************/
    logout: function(){
        
        // Suspected you are logged out!
        KUMobile.Student.loggedIn = false;
        
        // Already loading? Then return
        if(KUMobile.Student.loading) return;
        
        // Get password information
        var encrypted = window.localStorage.getItem("ku_pass");
    
        // Password available too?
        if(encrypted != null){
            
            // Decrypt
            var shhhhh = "foo_bar_placeholder";
            var pass = CryptoJS.DES.decrypt(encrypted, shhhhh).toString(CryptoJS.enc.Utf8);;
            
            // Fill in pass
            $('#pass').val(pass);
        }
        
        // Clear courses
        KUMobile.Student.bbCourses = null;
        KUMobile.Student.jwebCourses = null;
        
        // Loading
        KUMobile.Student.loading = true;
        KUMobile.showLoading("student-header");
        
        /** Successful Logout (BB) **/
        var successLogout = function(){
            
            // Hide loading
            KUMobile.Student.loading = false;
            KUMobile.hideLoading("student-header");
            
            // Clear previous items!
            $(".student-needs-removed").remove();
            
            // 1. Clear login password
            // 2. Hide logout button
            // 3. Hide student list
            // 4. Show form
            $("#student #logout-button").hide();
            $("#student #student-scroller").hide();
            $("#student #login-box").show();
            
            // Page is non-existent than change
            if ($("#" + $.mobile.activePage.attr('id')).length == 0) $.mobile.back();
            KUMobile.Student.defaults();
            $(window).trigger("resize");

        };
        
        /** Successful Logout (JWEB) **/
        var successJWEB = function(){
        
            // Logout (BB)
            KU.Student.BB.logout(successLogout, successLogout);
        }
        
        // Logout (JWEB)
        KU.Student.JWEB.logout(successJWEB, successLogout);
            
    },
    
    
    MIMETypes: [{'id':'application/vnd.hzn-3d-crossword','ext':'.x3d'},
                {'id':'video/3gpp','ext':'.3gp'},
                {'id':'video/3gpp2','ext':'.3g2'},
                {'id':'application/vnd.mseq','ext':'.mseq'},
                {'id':'application/vnd.3m.post-it-notes','ext':'.pwn'},
                {'id':'application/vnd.3gpp.pic-bw-large','ext':'.plb'},
                {'id':'application/vnd.3gpp.pic-bw-small','ext':'.psb'},
                {'id':'application/vnd.3gpp.pic-bw-var','ext':'.pvb'},
                {'id':'application/vnd.3gpp2.tcap','ext':'.tcap'},
                {'id':'application/x-7z-compressed','ext':'.7z'},
                {'id':'application/x-abiword','ext':'.abw'},
                {'id':'application/x-ace-compressed','ext':'.ace'},
                {'id':'application/vnd.americandynamics.acc','ext':'.acc'},
                {'id':'application/vnd.acucobol','ext':'.acu'},
                {'id':'application/vnd.acucorp','ext':'.atc'},
                {'id':'audio/adpcm','ext':'.adp'},
                {'id':'application/x-authorware-bin','ext':'.aab'},
                {'id':'application/x-authorware-map','ext':'.aam'},
                {'id':'application/x-authorware-seg','ext':'.aas'},
                {'id':'application/vnd.adobe.air-application-installer-package+zip','ext':'.air'},
                {'id':'application/x-shockwave-flash','ext':'.swf'},
                {'id':'application/vnd.adobe.fxp','ext':'.fxp'},
                {'id':'application/pdf','ext':'.pdf'},
                {'id':'application/vnd.cups-ppd','ext':'.ppd'},
                {'id':'application/x-director','ext':'.dir'},
                {'id':'application/vnd.adobe.xdp+xml','ext':'.xdp'},
                {'id':'application/vnd.adobe.xfdf','ext':'.xfdf'},
                {'id':'audio/x-aac','ext':'.aac'},
                {'id':'application/vnd.ahead.space','ext':'.ahead'},
                {'id':'application/vnd.airzip.filesecure.azf','ext':'.azf'},
                {'id':'application/vnd.airzip.filesecure.azs','ext':'.azs'},
                {'id':'application/vnd.amazon.ebook','ext':'.azw'},
                {'id':'application/vnd.amiga.ami','ext':'.ami'},
                {'id':'application/andrew-inset','ext':'N/A'},
                {'id':'application/vnd.android.package-archive','ext':'.apk'},
                {'id':'application/vnd.anser-web-certificate-issue-initiation','ext':'.cii'},
                {'id':'application/vnd.anser-web-funds-transfer-initiation','ext':'.fti'},
                {'id':'application/vnd.antix.game-component','ext':'.atx'},
                {'id':'application/vnd.apple.installer+xml','ext':'.mpkg'},
                {'id':'application/applixware','ext':'.aw'},
                {'id':'application/vnd.hhe.lesson-player','ext':'.les'},
                {'id':'application/vnd.aristanetworks.swi','ext':'.swi'},
                {'id':'text/x-asm','ext':'.s'},
                {'id':'application/atomcat+xml','ext':'.atomcat'},
                {'id':'application/atomsvc+xml','ext':'.atomsvc'},
                {'id':'application/atom+xml','ext':'.atom, .xml'},
                {'id':'application/pkix-attr-cert','ext':'.ac'},
                {'id':'audio/x-aiff','ext':'.aif'},
                {'id':'video/x-msvideo','ext':'.avi'},
                {'id':'application/vnd.audiograph','ext':'.aep'},
                {'id':'image/vnd.dxf','ext':'.dxf'},
                {'id':'model/vnd.dwf','ext':'.dwf'},
                {'id':'text/plain-bas','ext':'.par'},
                {'id':'application/x-bcpio','ext':'.bcpio'},
                {'id':'application/octet-stream','ext':'.bin'},
                {'id':'image/bmp','ext':'.bmp'},
                {'id':'application/x-bittorrent','ext':'.torrent'},
                {'id':'application/vnd.rim.cod','ext':'.cod'},
                {'id':'application/vnd.blueice.multipass','ext':'.mpm'},
                {'id':'application/vnd.bmi','ext':'.bmi'},
                {'id':'application/x-sh','ext':'.sh'},
                {'id':'image/prs.btif','ext':'.btif'},
                {'id':'application/vnd.businessobjects','ext':'.rep'},
                {'id':'application/x-bzip','ext':'.bz'},
                {'id':'application/x-bzip2','ext':'.bz2'},
                {'id':'application/x-csh','ext':'.csh'},
                {'id':'text/x-c','ext':'.c'},
                {'id':'application/vnd.chemdraw+xml','ext':'.cdxml'},
                {'id':'text/css','ext':'.css'},
                {'id':'chemical/x-cdx','ext':'.cdx'},
                {'id':'chemical/x-cml','ext':'.cml'},
                {'id':'chemical/x-csml','ext':'.csml'},
                {'id':'application/vnd.contact.cmsg','ext':'.cdbcmsg'},
                {'id':'application/vnd.claymore','ext':'.cla'},
                {'id':'application/vnd.clonk.c4group','ext':'.c4g'},
                {'id':'image/vnd.dvb.subtitle','ext':'.sub'},
                {'id':'application/cdmi-capability','ext':'.cdmia'},
                {'id':'application/cdmi-container','ext':'.cdmic'},
                {'id':'application/cdmi-domain','ext':'.cdmid'},
                {'id':'application/cdmi-object','ext':'.cdmio'},
                {'id':'application/cdmi-queue','ext':'.cdmiq'},
                {'id':'application/vnd.cluetrust.cartomobile-config','ext':'.c11amc'},
                {'id':'application/vnd.cluetrust.cartomobile-config-pkg','ext':'.c11amz'},
                {'id':'image/x-cmu-raster','ext':'.ras'},
                {'id':'model/vnd.collada+xml','ext':'.dae'},
                {'id':'text/csv','ext':'.csv'},
                {'id':'application/mac-compactpro','ext':'.cpt'},
                {'id':'application/vnd.wap.wmlc','ext':'.wmlc'},
                {'id':'image/cgm','ext':'.cgm'},
                {'id':'x-conference/x-cooltalk','ext':'.ice'},
                {'id':'image/x-cmx','ext':'.cmx'},
                {'id':'application/vnd.xara','ext':'.xar'},
                {'id':'application/vnd.cosmocaller','ext':'.cmc'},
                {'id':'application/x-cpio','ext':'.cpio'},
                {'id':'application/vnd.crick.clicker','ext':'.clkx'},
                {'id':'application/vnd.crick.clicker.keyboard','ext':'.clkk'},
                {'id':'application/vnd.crick.clicker.palette','ext':'.clkp'},
                {'id':'application/vnd.crick.clicker.template','ext':'.clkt'},
                {'id':'application/vnd.crick.clicker.wordbank','ext':'.clkw'},
                {'id':'application/vnd.criticaltools.wbs+xml','ext':'.wbs'},
                {'id':'application/vnd.rig.cryptonote','ext':'.cryptonote'},
                {'id':'chemical/x-cif','ext':'.cif'},
                {'id':'chemical/x-cmdf','ext':'.cmdf'},
                {'id':'application/cu-seeme','ext':'.cu'},
                {'id':'application/prs.cww','ext':'.cww'},
                {'id':'text/vnd.curl','ext':'.curl'},
                {'id':'text/vnd.curl.dcurl','ext':'.dcurl'},
                {'id':'text/vnd.curl.mcurl','ext':'.mcurl'},
                {'id':'text/vnd.curl.scurl','ext':'.scurl'},
                {'id':'application/vnd.curl.car','ext':'.car'},
                {'id':'application/vnd.curl.pcurl','ext':'.pcurl'},
                {'id':'application/vnd.yellowriver-custom-menu','ext':'.cmp'},
                {'id':'application/dssc+der','ext':'.dssc'},
                {'id':'application/dssc+xml','ext':'.xdssc'},
                {'id':'application/x-debian-package','ext':'.deb'},
                {'id':'audio/vnd.dece.audio','ext':'.uva'},
                {'id':'image/vnd.dece.graphic','ext':'.uvi'},
                {'id':'video/vnd.dece.hd','ext':'.uvh'},
                {'id':'video/vnd.dece.mobile','ext':'.uvm'},
                {'id':'video/vnd.uvvu.mp4','ext':'.uvu'},
                {'id':'video/vnd.dece.pd','ext':'.uvp'},
                {'id':'video/vnd.dece.sd','ext':'.uvs'},
                {'id':'video/vnd.dece.video','ext':'.uvv'},
                {'id':'application/x-dvi','ext':'.dvi'},
                {'id':'application/vnd.fdsn.seed','ext':'.seed'},
                {'id':'application/x-dtbook+xml','ext':'.dtb'},
                {'id':'application/x-dtbresource+xml','ext':'.res'},
                {'id':'application/vnd.dvb.ait','ext':'.ait'},
                {'id':'application/vnd.dvb.service','ext':'.svc'},
                {'id':'audio/vnd.digital-winds','ext':'.eol'},
                {'id':'image/vnd.djvu','ext':'.djvu'},
                {'id':'application/xml-dtd','ext':'.dtd'},
                {'id':'application/vnd.dolby.mlp','ext':'.mlp'},
                {'id':'application/x-doom','ext':'.wad'},
                {'id':'application/vnd.dpgraph','ext':'.dpg'},
                {'id':'audio/vnd.dra','ext':'.dra'},
                {'id':'application/vnd.dreamfactory','ext':'.dfac'},
                {'id':'audio/vnd.dts','ext':'.dts'},
                {'id':'audio/vnd.dts.hd','ext':'.dtshd'},
                {'id':'image/vnd.dwg','ext':'.dwg'},
                {'id':'application/vnd.dynageo','ext':'.geo'},
                {'id':'application/ecmascript','ext':'.es'},
                {'id':'application/vnd.ecowin.chart','ext':'.mag'},
                {'id':'image/vnd.fujixerox.edmics-mmr','ext':'.mmr'},
                {'id':'image/vnd.fujixerox.edmics-rlc','ext':'.rlc'},
                {'id':'application/exi','ext':'.exi'},
                {'id':'application/vnd.proteus.magazine','ext':'.mgz'},
                {'id':'application/epub+zip','ext':'.epub'},
                {'id':'message/rfc822','ext':'.eml'},
                {'id':'application/vnd.enliven','ext':'.nml'},
                {'id':'application/vnd.is-xpr','ext':'.xpr'},
                {'id':'image/vnd.xiff','ext':'.xif'},
                {'id':'application/vnd.xfdl','ext':'.xfdl'},
                {'id':'application/emma+xml','ext':'.emma'},
                {'id':'application/vnd.ezpix-album','ext':'.ez2'},
                {'id':'application/vnd.ezpix-package','ext':'.ez3'},
                {'id':'image/vnd.fst','ext':'.fst'},
                {'id':'video/vnd.fvt','ext':'.fvt'},
                {'id':'image/vnd.fastbidsheet','ext':'.fbs'},
                {'id':'application/vnd.denovo.fcselayout-link','ext':'.fe_launch'},
                {'id':'video/x-f4v','ext':'.f4v'},
                {'id':'video/x-flv','ext':'.flv'},
                {'id':'image/vnd.fpx','ext':'.fpx'},
                {'id':'image/vnd.net-fpx','ext':'.npx'},
                {'id':'text/vnd.fmi.flexstor','ext':'.flx'},
                {'id':'video/x-fli','ext':'.fli'},
                {'id':'application/vnd.fluxtime.clip','ext':'.ftc'},
                {'id':'application/vnd.fdf','ext':'.fdf'},
                {'id':'text/x-fortran','ext':'.f'},
                {'id':'application/vnd.mif','ext':'.mif'},
                {'id':'application/vnd.framemaker','ext':'.fm'},
                {'id':'image/x-freehand','ext':'.fh'},
                {'id':'application/vnd.fsc.weblaunch','ext':'.fsc'},
                {'id':'application/vnd.frogans.fnc','ext':'.fnc'},
                {'id':'application/vnd.frogans.ltf','ext':'.ltf'},
                {'id':'application/vnd.fujixerox.ddd','ext':'.ddd'},
                {'id':'application/vnd.fujixerox.docuworks','ext':'.xdw'},
                {'id':'application/vnd.fujixerox.docuworks.binder','ext':'.xbd'},
                {'id':'application/vnd.fujitsu.oasys','ext':'.oas'},
                {'id':'application/vnd.fujitsu.oasys2','ext':'.oa2'},
                {'id':'application/vnd.fujitsu.oasys3','ext':'.oa3'},
                {'id':'application/vnd.fujitsu.oasysgp','ext':'.fg5'},
                {'id':'application/vnd.fujitsu.oasysprs','ext':'.bh2'},
                {'id':'application/x-futuresplash','ext':'.spl'},
                {'id':'application/vnd.fuzzysheet','ext':'.fzs'},
                {'id':'image/g3fax','ext':'.g3'},
                {'id':'application/vnd.gmx','ext':'.gmx'},
                {'id':'model/vnd.gtw','ext':'.gtw'},
                {'id':'application/vnd.genomatix.tuxedo','ext':'.txd'},
                {'id':'application/vnd.geogebra.file','ext':'.ggb'},
                {'id':'application/vnd.geogebra.tool','ext':'.ggt'},
                {'id':'model/vnd.gdl','ext':'.gdl'},
                {'id':'application/vnd.geometry-explorer','ext':'.gex'},
                {'id':'application/vnd.geonext','ext':'.gxt'},
                {'id':'application/vnd.geoplan','ext':'.g2w'},
                {'id':'application/vnd.geospace','ext':'.g3w'},
                {'id':'application/x-font-ghostscript','ext':'.gsf'},
                {'id':'application/x-font-bdf','ext':'.bdf'},
                {'id':'application/x-gtar','ext':'.gtar'},
                {'id':'application/x-texinfo','ext':'.texinfo'},
                {'id':'application/x-gnumeric','ext':'.gnumeric'},
                {'id':'application/vnd.google-earth.kml+xml','ext':'.kml'},
                {'id':'application/vnd.google-earth.kmz','ext':'.kmz'},
                {'id':'application/vnd.grafeq','ext':'.gqf'},
                {'id':'image/gif','ext':'.gif'},
                {'id':'text/vnd.graphviz','ext':'.gv'},
                {'id':'application/vnd.groove-account','ext':'.gac'},
                {'id':'application/vnd.groove-help','ext':'.ghf'},
                {'id':'application/vnd.groove-identity-message','ext':'.gim'},
                {'id':'application/vnd.groove-injector','ext':'.grv'},
                {'id':'application/vnd.groove-tool-message','ext':'.gtm'},
                {'id':'application/vnd.groove-tool-template','ext':'.tpl'},
                {'id':'application/vnd.groove-vcard','ext':'.vcg'},
                {'id':'video/h261','ext':'.h261'},
                {'id':'video/h263','ext':'.h263'},
                {'id':'video/h264','ext':'.h264'},
                {'id':'application/vnd.hp-hpid','ext':'.hpid'},
                {'id':'application/vnd.hp-hps','ext':'.hps'},
                {'id':'application/x-hdf','ext':'.hdf'},
                {'id':'audio/vnd.rip','ext':'.rip'},
                {'id':'application/vnd.hbci','ext':'.hbci'},
                {'id':'application/vnd.hp-jlyt','ext':'.jlt'},
                {'id':'application/vnd.hp-pcl','ext':'.pcl'},
                {'id':'application/vnd.hp-hpgl','ext':'.hpgl'},
                {'id':'application/vnd.yamaha.hv-script','ext':'.hvs'},
                {'id':'application/vnd.yamaha.hv-dic','ext':'.hvd'},
                {'id':'application/vnd.yamaha.hv-voice','ext':'.hvp'},
                {'id':'application/vnd.hydrostatix.sof-data','ext':'.sfd-hdstx'},
                {'id':'application/hyperstudio','ext':'.stk'},
                {'id':'application/vnd.hal+xml','ext':'.hal'},
                {'id':'text/html','ext':'.html'},
                {'id':'application/vnd.ibm.rights-management','ext':'.irm'},
                {'id':'application/vnd.ibm.secure-container','ext':'.sc'},
                {'id':'text/calendar','ext':'.ics'},
                {'id':'application/vnd.iccprofile','ext':'.icc'},
                {'id':'image/x-icon','ext':'.ico'},
                {'id':'application/vnd.igloader','ext':'.igl'},
                {'id':'image/ief','ext':'.ief'},
                {'id':'application/vnd.immervision-ivp','ext':'.ivp'},
                {'id':'application/vnd.immervision-ivu','ext':'.ivu'},
                {'id':'application/reginfo+xml','ext':'.rif'},
                {'id':'text/vnd.in3d.3dml','ext':'.3dml'},
                {'id':'text/vnd.in3d.spot','ext':'.spot'},
                {'id':'model/iges','ext':'.igs'},
                {'id':'application/vnd.intergeo','ext':'.i2g'},
                {'id':'application/vnd.cinderella','ext':'.cdy'},
                {'id':'application/vnd.intercon.formnet','ext':'.xpw'},
                {'id':'application/vnd.isac.fcs','ext':'.fcs'},
                {'id':'application/ipfix','ext':'.ipfix'},
                {'id':'application/pkix-cert','ext':'.cer'},
                {'id':'application/pkixcmp','ext':'.pki'},
                {'id':'application/pkix-crl','ext':'.crl'},
                {'id':'application/pkix-pkipath','ext':'.pkipath'},
                {'id':'application/vnd.insors.igm','ext':'.igm'},
                {'id':'application/vnd.ipunplugged.rcprofile','ext':'.rcprofile'},
                {'id':'application/vnd.irepository.package+xml','ext':'.irp'},
                {'id':'text/vnd.sun.j2me.app-descriptor','ext':'.jad'},
                {'id':'application/java-archive','ext':'.jar'},
                {'id':'application/java-vm','ext':'.class'},
                {'id':'application/x-java-jnlp-file','ext':'.jnlp'},
                {'id':'application/java-serialized-object','ext':'.ser'},
                {'id':'text/x-java-source,java','ext':'.java'},
                {'id':'application/javascript','ext':'.js'},
                {'id':'application/json','ext':'.json'},
                {'id':'application/vnd.joost.joda-archive','ext':'.joda'},
                {'id':'video/jpm','ext':'.jpm'},
                {'id':'image/jpeg','ext':'.jpeg, .jpg'},
                {'id':'video/jpeg','ext':'.jpgv'},
                {'id':'application/vnd.kahootz','ext':'.ktz'},
                {'id':'application/vnd.chipnuts.karaoke-mmd','ext':'.mmd'},
                {'id':'application/vnd.kde.karbon','ext':'.karbon'},
                {'id':'application/vnd.kde.kchart','ext':'.chrt'},
                {'id':'application/vnd.kde.kformula','ext':'.kfo'},
                {'id':'application/vnd.kde.kivio','ext':'.flw'},
                {'id':'application/vnd.kde.kontour','ext':'.kon'},
                {'id':'application/vnd.kde.kpresenter','ext':'.kpr'},
                {'id':'application/vnd.kde.kspread','ext':'.ksp'},
                {'id':'application/vnd.kde.kword','ext':'.kwd'},
                {'id':'application/vnd.kenameaapp','ext':'.htke'},
                {'id':'application/vnd.kidspiration','ext':'.kia'},
                {'id':'application/vnd.kinar','ext':'.kne'},
                {'id':'application/vnd.kodak-descriptor','ext':'.sse'},
                {'id':'application/vnd.las.las+xml','ext':'.lasxml'},
                {'id':'application/x-latex','ext':'.latex'},
                {'id':'application/vnd.llamagraphics.life-balance.desktop','ext':'.lbd'},
                {'id':'application/vnd.llamagraphics.life-balance.exchange+xml','ext':'.lbe'},
                {'id':'application/vnd.jam','ext':'.jam'},
                {'id':'application/vnd.lotus-1-2-3','ext':'.123'},
                {'id':'application/vnd.lotus-approach','ext':'.apr'},
                {'id':'application/vnd.lotus-freelance','ext':'.pre'},
                {'id':'application/vnd.lotus-notes','ext':'.nsf'},
                {'id':'application/vnd.lotus-organizer','ext':'.org'},
                {'id':'application/vnd.lotus-screencam','ext':'.scm'},
                {'id':'application/vnd.lotus-wordpro','ext':'.lwp'},
                {'id':'audio/vnd.lucent.voice','ext':'.lvp'},
                {'id':'audio/x-mpegurl','ext':'.m3u'},
                {'id':'video/x-m4v','ext':'.m4v'},
                {'id':'application/mac-binhex40','ext':'.hqx'},
                {'id':'application/vnd.macports.portpkg','ext':'.portpkg'},
                {'id':'application/vnd.osgeo.mapguide.package','ext':'.mgp'},
                {'id':'application/marc','ext':'.mrc'},
                {'id':'application/marcxml+xml','ext':'.mrcx'},
                {'id':'application/mxf','ext':'.mxf'},
                {'id':'application/vnd.wolfram.player','ext':'.nbp'},
                {'id':'application/mathematica','ext':'.ma'},
                {'id':'application/mathml+xml','ext':'.mathml'},
                {'id':'application/mbox','ext':'.mbox'},
                {'id':'application/vnd.medcalcdata','ext':'.mc1'},
                {'id':'application/mediaservercontrol+xml','ext':'.mscml'},
                {'id':'application/vnd.mediastation.cdkey','ext':'.cdkey'},
                {'id':'application/vnd.mfer','ext':'.mwf'},
                {'id':'application/vnd.mfmp','ext':'.mfm'},
                {'id':'model/mesh','ext':'.msh'},
                {'id':'application/mads+xml','ext':'.mads'},
                {'id':'application/mets+xml','ext':'.mets'},
                {'id':'application/mods+xml','ext':'.mods'},
                {'id':'application/metalink4+xml','ext':'.meta4'},
                {'id':'application/vnd.ms-powerpoint.template.macroenabled.12','ext':'.potm'},
                {'id':'application/vnd.ms-word.document.macroenabled.12','ext':'.docm'},
                {'id':'application/vnd.ms-word.template.macroenabled.12','ext':'.dotm'},
                {'id':'application/vnd.mcd','ext':'.mcd'},
                {'id':'application/vnd.micrografx.flo','ext':'.flo'},
                {'id':'application/vnd.micrografx.igx','ext':'.igx'},
                {'id':'application/vnd.eszigno3+xml','ext':'.es3'},
                {'id':'application/x-msaccess','ext':'.mdb'},
                {'id':'video/x-ms-asf','ext':'.asf'},
                {'id':'application/x-msdownload','ext':'.exe'},
                {'id':'application/vnd.ms-artgalry','ext':'.cil'},
                {'id':'application/vnd.ms-cab-compressed','ext':'.cab'},
                {'id':'application/vnd.ms-ims','ext':'.ims'},
                {'id':'application/x-ms-application','ext':'.application'},
                {'id':'application/x-msclip','ext':'.clp'},
                {'id':'image/vnd.ms-modi','ext':'.mdi'},
                {'id':'application/vnd.ms-fontobject','ext':'.eot'},
                {'id':'application/vnd.ms-excel','ext':'.xls'},
                {'id':'application/vnd.ms-excel.addin.macroenabled.12','ext':'.xlam'},
                {'id':'application/vnd.ms-excel.sheet.binary.macroenabled.12','ext':'.xlsb'},
                {'id':'application/vnd.ms-excel.template.macroenabled.12','ext':'.xltm'},
                {'id':'application/vnd.ms-excel.sheet.macroenabled.12','ext':'.xlsm'},
                {'id':'application/vnd.ms-htmlhelp','ext':'.chm'},
                {'id':'application/x-mscardfile','ext':'.crd'},
                {'id':'application/vnd.ms-lrm','ext':'.lrm'},
                {'id':'application/x-msmediaview','ext':'.mvb'},
                {'id':'application/x-msmoney','ext':'.mny'},
                {'id':'application/vnd.openxmlformats-officedocument.presentationml.presentation','ext':'.pptx'},
                {'id':'application/vnd.openxmlformats-officedocument.presentationml.slide','ext':'.sldx'},
                {'id':'application/vnd.openxmlformats-officedocument.presentationml.slideshow','ext':'.ppsx'},
                {'id':'application/vnd.openxmlformats-officedocument.presentationml.template','ext':'.potx'},
                {'id':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','ext':'.xlsx'},
                {'id':'application/vnd.openxmlformats-officedocument.spreadsheetml.template','ext':'.xltx'},
                {'id':'application/vnd.openxmlformats-officedocument.wordprocessingml.document','ext':'.docx'},
                {'id':'application/vnd.openxmlformats-officedocument.wordprocessingml.template','ext':'.dotx'},
                {'id':'application/x-msbinder','ext':'.obd'},
                {'id':'application/vnd.ms-officetheme','ext':'.thmx'},
                {'id':'application/onenote','ext':'.onetoc'},
                {'id':'audio/vnd.ms-playready.media.pya','ext':'.pya'},
                {'id':'video/vnd.ms-playready.media.pyv','ext':'.pyv'},
                {'id':'application/vnd.ms-powerpoint','ext':'.ppt'},
                {'id':'application/vnd.ms-powerpoint.addin.macroenabled.12','ext':'.ppam'},
                {'id':'application/vnd.ms-powerpoint.slide.macroenabled.12','ext':'.sldm'},
                {'id':'application/vnd.ms-powerpoint.presentation.macroenabled.12','ext':'.pptm'},
                {'id':'application/vnd.ms-powerpoint.slideshow.macroenabled.12','ext':'.ppsm'},
                {'id':'application/vnd.ms-project','ext':'.mpp'},
                {'id':'application/x-mspublisher','ext':'.pub'},
                {'id':'application/x-msschedule','ext':'.scd'},
                {'id':'application/x-silverlight-app','ext':'.xap'},
                {'id':'application/vnd.ms-pki.stl','ext':'.stl'},
                {'id':'application/vnd.ms-pki.seccat','ext':'.cat'},
                {'id':'application/vnd.visio','ext':'.vsd'},
                {'id':'video/x-ms-wm','ext':'.wm'},
                {'id':'audio/x-ms-wma','ext':'.wma'},
                {'id':'audio/x-ms-wax','ext':'.wax'},
                {'id':'video/x-ms-wmx','ext':'.wmx'},
                {'id':'application/x-ms-wmd','ext':'.wmd'},
                {'id':'application/vnd.ms-wpl','ext':'.wpl'},
                {'id':'application/x-ms-wmz','ext':'.wmz'},
                {'id':'video/x-ms-wmv','ext':'.wmv'},
                {'id':'video/x-ms-wvx','ext':'.wvx'},
                {'id':'application/x-msmetafile','ext':'.wmf'},
                {'id':'application/x-msterminal','ext':'.trm'},
                {'id':'application/msword','ext':'.doc'},
                {'id':'application/x-mswrite','ext':'.wri'},
                {'id':'application/vnd.ms-works','ext':'.wps'},
                {'id':'application/x-ms-xbap','ext':'.xbap'},
                {'id':'application/vnd.ms-xpsdocument','ext':'.xps'},
                {'id':'audio/midi','ext':'.mid'},
                {'id':'application/vnd.ibm.minipay','ext':'.mpy'},
                {'id':'application/vnd.ibm.modcap','ext':'.afp'},
                {'id':'application/vnd.jcp.javame.midlet-rms','ext':'.rms'},
                {'id':'application/vnd.tmobile-livetv','ext':'.tmo'},
                {'id':'application/x-mobipocket-ebook','ext':'.prc'},
                {'id':'application/vnd.mobius.mbk','ext':'.mbk'},
                {'id':'application/vnd.mobius.dis','ext':'.dis'},
                {'id':'application/vnd.mobius.plc','ext':'.plc'},
                {'id':'application/vnd.mobius.mqy','ext':'.mqy'},
                {'id':'application/vnd.mobius.msl','ext':'.msl'},
                {'id':'application/vnd.mobius.txf','ext':'.txf'},
                {'id':'application/vnd.mobius.daf','ext':'.daf'},
                {'id':'text/vnd.fly','ext':'.fly'},
                {'id':'application/vnd.mophun.certificate','ext':'.mpc'},
                {'id':'application/vnd.mophun.application','ext':'.mpn'},
                {'id':'video/mj2','ext':'.mj2'},
                {'id':'audio/mpeg','ext':'.mpga'},
                {'id':'video/vnd.mpegurl','ext':'.mxu'},
                {'id':'video/mpeg','ext':'.mpeg'},
                {'id':'application/mp21','ext':'.m21'},
                {'id':'audio/mp4','ext':'.mp4a'},
                {'id':'video/mp4','ext':'.mp4'},
                {'id':'application/mp4','ext':'.mp4'},
                {'id':'application/vnd.apple.mpegurl','ext':'.m3u8'},
                {'id':'application/vnd.musician','ext':'.mus'},
                {'id':'application/vnd.muvee.style','ext':'.msty'},
                {'id':'application/xv+xml','ext':'.mxml'},
                {'id':'application/vnd.nokia.n-gage.data','ext':'.ngdat'},
                {'id':'application/vnd.nokia.n-gage.symbian.install','ext':'.n-gage'},
                {'id':'application/x-dtbncx+xml','ext':'.ncx'},
                {'id':'application/x-netcdf','ext':'.nc'},
                {'id':'application/vnd.neurolanguage.nlu','ext':'.nlu'},
                {'id':'application/vnd.dna','ext':'.dna'},
                {'id':'application/vnd.noblenet-directory','ext':'.nnd'},
                {'id':'application/vnd.noblenet-sealer','ext':'.nns'},
                {'id':'application/vnd.noblenet-web','ext':'.nnw'},
                {'id':'application/vnd.nokia.radio-preset','ext':'.rpst'},
                {'id':'application/vnd.nokia.radio-presets','ext':'.rpss'},
                {'id':'text/n3','ext':'.n3'},
                {'id':'application/vnd.novadigm.edm','ext':'.edm'},
                {'id':'application/vnd.novadigm.edx','ext':'.edx'},
                {'id':'application/vnd.novadigm.ext','ext':'.ext'},
                {'id':'application/vnd.flographit','ext':'.gph'},
                {'id':'audio/vnd.nuera.ecelp4800','ext':'.ecelp4800'},
                {'id':'audio/vnd.nuera.ecelp7470','ext':'.ecelp7470'},
                {'id':'audio/vnd.nuera.ecelp9600','ext':'.ecelp9600'},
                {'id':'application/oda','ext':'.oda'},
                {'id':'application/ogg','ext':'.ogx'},
                {'id':'audio/ogg','ext':'.oga'},
                {'id':'video/ogg','ext':'.ogv'},
                {'id':'application/vnd.oma.dd2+xml','ext':'.dd2'},
                {'id':'application/vnd.oasis.opendocument.text-web','ext':'.oth'},
                {'id':'application/oebps-package+xml','ext':'.opf'},
                {'id':'application/vnd.intu.qbo','ext':'.qbo'},
                {'id':'application/vnd.openofficeorg.extension','ext':'.oxt'},
                {'id':'application/vnd.yamaha.openscoreformat','ext':'.osf'},
                {'id':'audio/webm','ext':'.weba'},
                {'id':'video/webm','ext':'.webm'},
                {'id':'application/vnd.oasis.opendocument.chart','ext':'.odc'},
                {'id':'application/vnd.oasis.opendocument.chart-template','ext':'.otc'},
                {'id':'application/vnd.oasis.opendocument.database','ext':'.odb'},
                {'id':'application/vnd.oasis.opendocument.formula','ext':'.odf'},
                {'id':'application/vnd.oasis.opendocument.formula-template','ext':'.odft'},
                {'id':'application/vnd.oasis.opendocument.graphics','ext':'.odg'},
                {'id':'application/vnd.oasis.opendocument.graphics-template','ext':'.otg'},
                {'id':'application/vnd.oasis.opendocument.image','ext':'.odi'},
                {'id':'application/vnd.oasis.opendocument.image-template','ext':'.oti'},
                {'id':'application/vnd.oasis.opendocument.presentation','ext':'.odp'},
                {'id':'application/vnd.oasis.opendocument.presentation-template','ext':'.otp'},
                {'id':'application/vnd.oasis.opendocument.spreadsheet','ext':'.ods'},
                {'id':'application/vnd.oasis.opendocument.spreadsheet-template','ext':'.ots'},
                {'id':'application/vnd.oasis.opendocument.text','ext':'.odt'},
                {'id':'application/vnd.oasis.opendocument.text-master','ext':'.odm'},
                {'id':'application/vnd.oasis.opendocument.text-template','ext':'.ott'},
                {'id':'image/ktx','ext':'.ktx'},
                {'id':'application/vnd.sun.xml.calc','ext':'.sxc'},
                {'id':'application/vnd.sun.xml.calc.template','ext':'.stc'},
                {'id':'application/vnd.sun.xml.draw','ext':'.sxd'},
                {'id':'application/vnd.sun.xml.draw.template','ext':'.std'},
                {'id':'application/vnd.sun.xml.impress','ext':'.sxi'},
                {'id':'application/vnd.sun.xml.impress.template','ext':'.sti'},
                {'id':'application/vnd.sun.xml.math','ext':'.sxm'},
                {'id':'application/vnd.sun.xml.writer','ext':'.sxw'},
                {'id':'application/vnd.sun.xml.writer.global','ext':'.sxg'},
                {'id':'application/vnd.sun.xml.writer.template','ext':'.stw'},
                {'id':'application/x-font-otf','ext':'.otf'},
                {'id':'application/vnd.yamaha.openscoreformat.osfpvg+xml','ext':'.osfpvg'},
                {'id':'application/vnd.osgi.dp','ext':'.dp'},
                {'id':'application/vnd.palm','ext':'.pdb'},
                {'id':'text/x-pascal','ext':'.p'},
                {'id':'application/vnd.pawaafile','ext':'.paw'},
                {'id':'application/vnd.hp-pclxl','ext':'.pclxl'},
                {'id':'application/vnd.picsel','ext':'.efif'},
                {'id':'image/x-pcx','ext':'.pcx'},
                {'id':'image/vnd.adobe.photoshop','ext':'.psd'},
                {'id':'application/pics-rules','ext':'.prf'},
                {'id':'image/x-pict','ext':'.pic'},
                {'id':'application/x-chat','ext':'.chat'},
                {'id':'application/pkcs10','ext':'.p10'},
                {'id':'application/x-pkcs12','ext':'.p12'},
                {'id':'application/pkcs7-mime','ext':'.p7m'},
                {'id':'application/pkcs7-signature','ext':'.p7s'},
                {'id':'application/x-pkcs7-certreqresp','ext':'.p7r'},
                {'id':'application/x-pkcs7-certificates','ext':'.p7b'},
                {'id':'application/pkcs8','ext':'.p8'},
                {'id':'application/vnd.pocketlearn','ext':'.plf'},
                {'id':'image/x-portable-anymap','ext':'.pnm'},
                {'id':'image/x-portable-bitmap','ext':'.pbm'},
                {'id':'application/x-font-pcf','ext':'.pcf'},
                {'id':'application/font-tdpfr','ext':'.pfr'},
                {'id':'application/x-chess-pgn','ext':'.pgn'},
                {'id':'image/x-portable-graymap','ext':'.pgm'},
                {'id':'image/png','ext':'.png'},
                {'id':'image/x-portable-pixmap','ext':'.ppm'},
                {'id':'application/pskc+xml','ext':'.pskcxml'},
                {'id':'application/vnd.ctc-posml','ext':'.pml'},
                {'id':'application/postscript','ext':'.ai'},
                {'id':'application/x-font-type1','ext':'.pfa'},
                {'id':'application/vnd.powerbuilder6','ext':'.pbd'},
                {'id':'application/pgp-encrypted','ext':''},
                {'id':'application/pgp-signature','ext':'.pgp'},
                {'id':'application/vnd.previewsystems.box','ext':'.box'},
                {'id':'application/vnd.pvi.ptid1','ext':'.ptid'},
                {'id':'application/pls+xml','ext':'.pls'},
                {'id':'application/vnd.pg.format','ext':'.str'},
                {'id':'application/vnd.pg.osasli','ext':'.ei6'},
                {'id':'text/prs.lines.tag','ext':'.dsc'},
                {'id':'application/x-font-linux-psf','ext':'.psf'},
                {'id':'application/vnd.publishare-delta-tree','ext':'.qps'},
                {'id':'application/vnd.pmi.widget','ext':'.wg'},
                {'id':'application/vnd.quark.quarkxpress','ext':'.qxd'},
                {'id':'application/vnd.epson.esf','ext':'.esf'},
                {'id':'application/vnd.epson.msf','ext':'.msf'},
                {'id':'application/vnd.epson.ssf','ext':'.ssf'},
                {'id':'application/vnd.epson.quickanime','ext':'.qam'},
                {'id':'application/vnd.intu.qfx','ext':'.qfx'},
                {'id':'video/quicktime','ext':'.qt'},
                {'id':'application/x-rar-compressed','ext':'.rar'},
                {'id':'audio/x-pn-realaudio','ext':'.ram'},
                {'id':'audio/x-pn-realaudio-plugin','ext':'.rmp'},
                {'id':'application/rsd+xml','ext':'.rsd'},
                {'id':'application/vnd.rn-realmedia','ext':'.rm'},
                {'id':'application/vnd.realvnc.bed','ext':'.bed'},
                {'id':'application/vnd.recordare.musicxml','ext':'.mxl'},
                {'id':'application/vnd.recordare.musicxml+xml','ext':'.musicxml'},
                {'id':'application/relax-ng-compact-syntax','ext':'.rnc'},
                {'id':'application/vnd.data-vision.rdz','ext':'.rdz'},
                {'id':'application/rdf+xml','ext':'.rdf'},
                {'id':'application/vnd.cloanto.rp9','ext':'.rp9'},
                {'id':'application/vnd.jisp','ext':'.jisp'},
                {'id':'application/rtf','ext':'.rtf'},
                {'id':'text/richtext','ext':'.rtx'},
                {'id':'application/vnd.route66.link66+xml','ext':'.link66'},
                {'id':'application/rss+xml','ext':'.rss, .xml'},
                {'id':'application/shf+xml','ext':'.shf'},
                {'id':'application/vnd.sailingtracker.track','ext':'.st'},
                {'id':'image/svg+xml','ext':'.svg'},
                {'id':'application/vnd.sus-calendar','ext':'.sus'},
                {'id':'application/sru+xml','ext':'.sru'},
                {'id':'application/set-payment-initiation','ext':'.setpay'},
                {'id':'application/set-registration-initiation','ext':'.setreg'},
                {'id':'application/vnd.sema','ext':'.sema'},
                {'id':'application/vnd.semd','ext':'.semd'},
                {'id':'application/vnd.semf','ext':'.semf'},
                {'id':'application/vnd.seemail','ext':'.see'},
                {'id':'application/x-font-snf','ext':'.snf'},
                {'id':'application/scvp-vp-request','ext':'.spq'},
                {'id':'application/scvp-vp-response','ext':'.spp'},
                {'id':'application/scvp-cv-request','ext':'.scq'},
                {'id':'application/scvp-cv-response','ext':'.scs'},
                {'id':'application/sdp','ext':'.sdp'},
                {'id':'text/x-setext','ext':'.etx'},
                {'id':'video/x-sgi-movie','ext':'.movie'},
                {'id':'application/vnd.shana.informed.formdata','ext':'.ifm'},
                {'id':'application/vnd.shana.informed.formtemplate','ext':'.itp'},
                {'id':'application/vnd.shana.informed.interchange','ext':'.iif'},
                {'id':'application/vnd.shana.informed.package','ext':'.ipk'},
                {'id':'application/thraud+xml','ext':'.tfi'},
                {'id':'application/x-shar','ext':'.shar'},
                {'id':'image/x-rgb','ext':'.rgb'},
                {'id':'application/vnd.epson.salt','ext':'.slt'},
                {'id':'application/vnd.accpac.simply.aso','ext':'.aso'},
                {'id':'application/vnd.accpac.simply.imp','ext':'.imp'},
                {'id':'application/vnd.simtech-mindmapper','ext':'.twd'},
                {'id':'application/vnd.commonspace','ext':'.csp'},
                {'id':'application/vnd.yamaha.smaf-audio','ext':'.saf'},
                {'id':'application/vnd.smaf','ext':'.mmf'},
                {'id':'application/vnd.yamaha.smaf-phrase','ext':'.spf'},
                {'id':'application/vnd.smart.teacher','ext':'.teacher'},
                {'id':'application/vnd.svd','ext':'.svd'},
                {'id':'application/sparql-query','ext':'.rq'},
                {'id':'application/sparql-results+xml','ext':'.srx'},
                {'id':'application/srgs','ext':'.gram'},
                {'id':'application/srgs+xml','ext':'.grxml'},
                {'id':'application/ssml+xml','ext':'.ssml'},
                {'id':'application/vnd.koan','ext':'.skp'},
                {'id':'text/sgml','ext':'.sgml'},
                {'id':'application/vnd.stardivision.calc','ext':'.sdc'},
                {'id':'application/vnd.stardivision.draw','ext':'.sda'},
                {'id':'application/vnd.stardivision.impress','ext':'.sdd'},
                {'id':'application/vnd.stardivision.math','ext':'.smf'},
                {'id':'application/vnd.stardivision.writer','ext':'.sdw'},
                {'id':'application/vnd.stardivision.writer-global','ext':'.sgl'},
                {'id':'application/vnd.stepmania.stepchart','ext':'.sm'},
                {'id':'application/x-stuffit','ext':'.sit'},
                {'id':'application/x-stuffitx','ext':'.sitx'},
                {'id':'application/vnd.solent.sdkm+xml','ext':'.sdkm'},
                {'id':'application/vnd.olpc-sugar','ext':'.xo'},
                {'id':'audio/basic','ext':'.au'},
                {'id':'application/vnd.wqd','ext':'.wqd'},
                {'id':'application/vnd.symbian.install','ext':'.sis'},
                {'id':'application/smil+xml','ext':'.smi'},
                {'id':'application/vnd.syncml+xml','ext':'.xsm'},
                {'id':'application/vnd.syncml.dm+wbxml','ext':'.bdm'},
                {'id':'application/vnd.syncml.dm+xml','ext':'.xdm'},
                {'id':'application/x-sv4cpio','ext':'.sv4cpio'},
                {'id':'application/x-sv4crc','ext':'.sv4crc'},
                {'id':'application/sbml+xml','ext':'.sbml'},
                {'id':'text/tab-separated-values','ext':'.tsv'},
                {'id':'image/tiff','ext':'.tiff'},
                {'id':'application/vnd.tao.intent-module-archive','ext':'.tao'},
                {'id':'application/x-tar','ext':'.tar'},
                {'id':'application/x-tcl','ext':'.tcl'},
                {'id':'application/x-tex','ext':'.tex'},
                {'id':'application/x-tex-tfm','ext':'.tfm'},
                {'id':'application/tei+xml','ext':'.tei'},
                {'id':'text/plain','ext':'.txt'},
                {'id':'application/vnd.spotfire.dxp','ext':'.dxp'},
                {'id':'application/vnd.spotfire.sfs','ext':'.sfs'},
                {'id':'application/timestamped-data','ext':'.tsd'},
                {'id':'application/vnd.trid.tpt','ext':'.tpt'},
                {'id':'application/vnd.triscape.mxs','ext':'.mxs'},
                {'id':'text/troff','ext':'.t'},
                {'id':'application/vnd.trueapp','ext':'.tra'},
                {'id':'application/x-font-ttf','ext':'.ttf'},
                {'id':'text/turtle','ext':'.ttl'},
                {'id':'application/vnd.umajin','ext':'.umj'},
                {'id':'application/vnd.uoml+xml','ext':'.uoml'},
                {'id':'application/vnd.unity','ext':'.unityweb'},
                {'id':'application/vnd.ufdl','ext':'.ufd'},
                {'id':'text/uri-list','ext':'.uri'},
                {'id':'application/vnd.uiq.theme','ext':'.utz'},
                {'id':'application/x-ustar','ext':'.ustar'},
                {'id':'text/x-uuencode','ext':'.uu'},
                {'id':'text/x-vcalendar','ext':'.vcs'},
                {'id':'text/x-vcard','ext':'.vcf'},
                {'id':'application/x-cdlink','ext':'.vcd'},
                {'id':'application/vnd.vsf','ext':'.vsf'},
                {'id':'model/vrml','ext':'.wrl'},
                {'id':'application/vnd.vcx','ext':'.vcx'},
                {'id':'model/vnd.mts','ext':'.mts'},
                {'id':'model/vnd.vtu','ext':'.vtu'},
                {'id':'application/vnd.visionary','ext':'.vis'},
                {'id':'video/vnd.vivo','ext':'.viv'},
                {'id':'application/ccxml+xml,','ext':'.ccxml'},
                {'id':'application/voicexml+xml','ext':'.vxml'},
                {'id':'application/x-wais-source','ext':'.src'},
                {'id':'application/vnd.wap.wbxml','ext':'.wbxml'},
                {'id':'image/vnd.wap.wbmp','ext':'.wbmp'},
                {'id':'audio/x-wav','ext':'.wav'},
                {'id':'application/davmount+xml','ext':'.davmount'},
                {'id':'application/x-font-woff','ext':'.woff'},
                {'id':'application/wspolicy+xml','ext':'.wspolicy'},
                {'id':'image/webp','ext':'.webp'},
                {'id':'application/vnd.webturbo','ext':'.wtb'},
                {'id':'application/widget','ext':'.wgt'},
                {'id':'application/winhlp','ext':'.hlp'},
                {'id':'text/vnd.wap.wml','ext':'.wml'},
                {'id':'text/vnd.wap.wmlscript','ext':'.wmls'},
                {'id':'application/vnd.wap.wmlscriptc','ext':'.wmlsc'},
                {'id':'application/vnd.wordperfect','ext':'.wpd'},
                {'id':'application/vnd.wt.stf','ext':'.stf'},
                {'id':'application/wsdl+xml','ext':'.wsdl'},
                {'id':'image/x-xbitmap','ext':'.xbm'},
                {'id':'image/x-xpixmap','ext':'.xpm'},
                {'id':'image/x-xwindowdump','ext':'.xwd'},
                {'id':'application/x-x509-ca-cert','ext':'.der'},
                {'id':'application/x-xfig','ext':'.fig'},
                {'id':'application/xhtml+xml','ext':'.xhtml'},
                {'id':'application/xml','ext':'.xml'},
                {'id':'application/xcap-diff+xml','ext':'.xdf'},
                {'id':'application/xenc+xml','ext':'.xenc'},
                {'id':'application/patch-ops-error+xml','ext':'.xer'},
                {'id':'application/resource-lists+xml','ext':'.rl'},
                {'id':'application/rls-services+xml','ext':'.rs'},
                {'id':'application/resource-lists-diff+xml','ext':'.rld'},
                {'id':'application/xslt+xml','ext':'.xslt'},
                {'id':'application/xop+xml','ext':'.xop'},
                {'id':'application/x-xpinstall','ext':'.xpi'},
                {'id':'application/xspf+xml','ext':'.xspf'},
                {'id':'application/vnd.mozilla.xul+xml','ext':'.xul'},
                {'id':'chemical/x-xyz','ext':'.xyz'},
                {'id':'text/yaml','ext':'.yaml'},
                {'id':'application/yang','ext':'.yang'},
                {'id':'application/yin+xml','ext':'.yin'},
                {'id':'application/vnd.zul','ext':'.zir'},
                {'id':'application/zip','ext':'.zip'},
                {'id':'application/vnd.handheld-entertainment+xml','ext':'.zmm'},
                {'id':'application/vnd.zzazz.deck+xml','ext':'.zaz'}]
    
};