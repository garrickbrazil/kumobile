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
 *  Local file control used to make saving and reading files MUCH easier then the
 *  plugin allows for.
 *
 *  @class KUMobile.FileIO
 ******************************************************************************/
KUMobile.FileIO = {
	
    
    /******************************************************************************
     *  Enables debug messages via alert messages. Do NOT enable this unless there
	 *  are legitimate problems with plugins (not available to debug via browser).
     *
     *  @attribute debug
     *  @type {boolean}
     *  @default false
     ******************************************************************************/	
	 debug: false,
    
	
    /******************************************************************************
     *  Name of the current file.
     *
     *  @attribute fileName
     *  @type {string}
     *  @private
     ******************************************************************************/
	fileName: null,
		

    /******************************************************************************
     *  Contents of current file (the entire point of reading)
     *
     *  @attribute fileContents
     *  @type {string}
     *  @private
     ******************************************************************************/
	fileContents: null,


	/******************************************************************************
     *  Method to callback on any failure
     *
     *  @attribute failCallback
     *  @type {Function}
     *  @private
     ******************************************************************************/
	failCallback: null,
	

	/******************************************************************************
     *  Method to callback on complete success. 
     *
     *  @attribute successCallback
     *  @type {Function}
     *  @private
     ******************************************************************************/
	successCallback: null,
	
    
	/******************************************************************************
     *  Writes contents to file with proper callbacks. 
     *
     *  @param {string} name - file name to save to
	 *  @param {string} content - what we want to save (usually JSON string)
	 *  @param {Function} success - callback for successful writing
	 *  @param {Function} failure - callback for failure of writing
     *  @method writeToFile
     *  @for KUMobile.FileIO
     *  @example
     *      var success = function(){
     *           ...
     *      };
     *      var fail = function(error){
     *           ...
     *      };
     *  
     *      // Save to file
     *      KUMobile.FileIO.writeToFile("TestAppKUMobile.txt", "Secret Message!", success, fail);
     ******************************************************************************/
	 writeToFile: function(name, content, success, failure){
		
		// Configure
		this.fileName = name;
		this.fileContents = content;
		this.successCallback = success;
		this.failCallback = failure;
		
        
		if(KUMobile.FileIO.debug) alert("Received write info!");
		
        // Start the request!
        window.requestFileSystem(
            LocalFileSystem.PERSISTENT, 0, 
            KUMobile.FileIO.write_GotFS, 
            KUMobile.FileIO.fail
        );
        
	},
	
	
	/******************************************************************************
     *  Reads contents from file with proper callbacks. 
     *	 
     *  @param {string} name - file name to read from 
	 *  @param {Function} success - callback for successful writing
	 *  @param {Function} failure - callback for failure of writing
     *  @method readFromFile
     *  @for KUMobile.FileIO
     *  @example
     *      var success = function(result){
     *          ...
     *      };
     *      var fail = function(errorcode){
     *          ...
     *      };
     *  
     *      // Read from file
     *      KUMobile.FileIO.readFromFile("TestAppKUMobile.txt", success, fail);
     ******************************************************************************/	
	readFromFile: function(name, success, failure){
        
        
		// Configure
		this.fileName = name;
		this.fileContents = "";
		this.successCallback = success;
		this.failCallback = failure;
		
		if(KUMobile.FileIO.debug) alert("Received read info! name=" + KUMobile.FileIO.fileName);
		
        // Set off the read request
        window.requestFileSystem(
            LocalFileSystem.PERSISTENT, 0, 
            KUMobile.FileIO.read_GotFS, 
            KUMobile.FileIO.fail
        );
        
	},
	
    
	/******************************************************************************
     *  Triggered after file system is retrieved 
     *
     *  @method read_GotFS
     *  @private
     ******************************************************************************/
	 read_GotFS: function(fileSystem) {
	
		if(KUMobile.FileIO.debug) {
            alert("Got FS name=" + KUMobile.FileIO.fileName);
		}
        
        
		// Get specified file
		fileSystem.root.getFile(
            KUMobile.FileIO.fileName, null, 
            KUMobile.FileIO.read_GotFileEntry, 
            KUMobile.FileIO.fail
        );
        
	},
	
	
    /******************************************************************************
     *  Triggered after file entry is retrieved  
     *
     *  @method read_GotFileEntry
     *  @private
     ******************************************************************************/
	read_GotFileEntry: function(fileEntry) {
		
		if(KUMobile.FileIO.debug) alert("Got file entry");
		
		// Create a writer
		fileEntry.file(KUMobile.FileIO.read_GotFile, KUMobile.FileIO.fail);
	},
	
	
    /******************************************************************************
     *  Triggered after file is retrieved 
     *
     *  @method read_GotFile
     *  @private
     ******************************************************************************/
	 read_GotFile: function(file){
		
		if(KUMobile.FileIO.debug) alert("Got file");
		
        // Read message !
		KUMobile.FileIO.read_ReadAsText(file);
	},
	
	
    /******************************************************************************
     *  Triggered after file is ready to be read from
     *
     *  @method read_ReadAsText
     *  @private
     ******************************************************************************/
	read_ReadAsText: function(file) {

		if(KUMobile.FileIO.debug) alert("Reading as text");
		
		// Configure reader
		var reader = new FileReader();
		
        // Call success after loading
		reader.onloadend = function(evt) {
			KUMobile.FileIO.successCallback(evt.target.result);
            // KUMobile.FileIO.clear();
		};
		
		// Read!
		reader.readAsText(file);
	},
	
	
	/******************************************************************************
     *  Triggered after file system is ready
     *
     *  @method write_GotFS
     *  @private
     ******************************************************************************/
	write_GotFS: function(fileSystem) {
	
		if(KUMobile.FileIO.debug) alert(
            "Got FS " + KUMobile.FileIO.fileName + " "  
            + KUMobile.FileIO.fail + " " 
            + KUMobile.FileIO.write_GotFileEntry
        );
		
		// Get specified file
		fileSystem.root.getFile(
            KUMobile.FileIO.fileName, 
            {create: true, exclusive: false}, 
            KUMobile.FileIO.write_GotFileEntry, 
            KUMobile.FileIO.fail
        );
        
	},

	
	/******************************************************************************
     *  Triggered after file entry is ready
     *
     *  @method write_GotFileEntry
     *  @private
     ******************************************************************************/
	write_GotFileEntry: function(fileEntry) {
		
		if(KUMobile.FileIO.debug) alert("Got file entry");
		
		// Create a writer
		fileEntry.createWriter(KUMobile.FileIO.write_GotFileWriter, KUMobile.FileIO.fail);
	},

	
	/******************************************************************************
     *  Triggered after file writer is ready
     *
     *  @method write_GotFileWriter
     *  @private
     ******************************************************************************/
	write_GotFileWriter: function(writer) {

		if(KUMobile.FileIO.debug) alert("Writing");
		
		// Callback for write finish
		writer.onwriteend = function(evt) {
			
			if(KUMobile.FileIO.debug) alert("Done writing");
			
			// Call success function
			KUMobile.FileIO.successCallback();
            //KUMobile.FileIO.clear();
		};
		
		// Write content!
		writer.write(KUMobile.FileIO.fileContents);
	},

	
	/******************************************************************************
     *  Triggered any time a failure occurs
     *
     *  @method fail
     *  @private
     ******************************************************************************/	
	fail: function(error) {
		
		if(KUMobile.FileIO.debug) alert("Error :(");
        
		// Callback for error
		KUMobile.FileIO.failCallback(error.code);
        //KUMobile.FileIO.clear();
	},
    
    
    /******************************************************************************
     *  Triggered any time a failure occurs
     *
     *  @method clear
     *  @private
     *  @example
     *      // Clear file data
     *      KUMobile.FileIO.clear();
     ******************************************************************************/	
	clear: function(error) {
		
        // Clear all settings
		KUMobile.FileIO.fileName = null;
        KUMobile.FileIO.fileContents = null;
        KUMobile.FileIO.successCallback = null;
        KUMobile.FileIO.failCallback = null;
	}
    

};