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
/** Local file control used to make saving and reading files MUCH easier then the
 *  plugin allows for. 
 * 	@example 
 *  // Read Example
 *  var success = function(result){
 *       alert(result);
 *  };
 *  var fail = function(errorcode){
 *       alert("Fail call back :( " + errorcode);
 *  };
 *  
 *  KU.FileIO.readFromFile("TestAppKUMobile.txt", success, fail);
 *  @example
 *  // Write Example
 *  var success = function(){
 *       alert("Success!");
 *  };
 *  var fail = function(errorcode){
 *       alert("Fail call back :( " + errorcode);
 *  };
 *  
 *  KU.FileIO.writeToFile("TestAppKUMobile.txt", "Secret Message!", success, fail);
 *  @namespace
 ******************************************************************************/
KU.FileIO = {
	
	
	
	/******************************************************************************/
	/** Name of the current file.
	 *  @type {string}
	 *  @ignore
	 ******************************************************************************/
	fileName: null,
	
	
	
	/******************************************************************************/
	/** Contents of current file (the entire point of reading)
	 *  @type {string}
	 *  @ignore
	 ******************************************************************************/
	fileContents: null,



	/******************************************************************************/
	/** Method to callback on ANY failure
	 *  @type {Function}
	 *  @ignore
	 ******************************************************************************/
	failCallback: null,
	
	
	
	/******************************************************************************/
	/** Method to callback on complete success. 
	 *  @type {Function}
	 *  @ignore
	 ******************************************************************************/
	successCallback: null,
	
	
	
	/******************************************************************************/
	/**  Enables debug messages via alert messages. Do NOT enable this unless there
	 *   are legitimate problems with plugins (not available to debug via browser).
	 *   @type {boolean}
	 *   @constant
	 ******************************************************************************/
	 debug: false,
	
	
	
	/******************************************************************************/
	/** Writes contents to file with proper callbacks. 
	 *  @param {string} name - filename to save to
	 *  @param {string} content - what we want to save (usually JSON string)
	 *  @param {Function} success - callback for successful writing
	 *  @param {Function} failure - callback for failure of writing
	 ******************************************************************************/
	 writeToFile: function(name, content, success, failure){
		
		// Configure
		this.fileName = name;
		this.fileContents = content;
		this.successCallback = success;
		this.failCallback = failure;
		
		if(KU.FileIO.debug) alert("Received write info!");
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, KU.FileIO.write_GotFS, KU.FileIO.fail);
	},
	
	
	
	/******************************************************************************/
	/** Reads contents from file with proper callbacks. 
	 *  @param {string} name - filename to read from 
	 *  @param {Function} success - callback for successful writing
	 *  @param {Function} failure - callback for failure of writing
	 ******************************************************************************/
	readFromFile: function(name, success, failure){
		
		// Configure
		this.fileName = name;
		this.fileContents = "";
		this.successCallback = success;
		this.failCallback = failure;
		
		if(KU.FileIO.debug) alert("Received read info!");
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, KU.FileIO.read_GotFS, KU.FileIO.fail);
	},
	
	
	
	/******************************************************************************/
	/** Triggered after filesystem is retrieved 
	 *  @param {FileSystem} fileSystem - file system to read from
	 *  @ignore
	 ******************************************************************************/
	 read_GotFS: function(fileSystem) {
	
		if(KU.FileIO.debug) alert("Got FS");
		
		// Get specified file
		fileSystem.root.getFile(KU.FileIO.fileName, null, KU.FileIO.read_GotFileEntry, KU.FileIO.fail);
	},
	
	
	
	/******************************************************************************/
	/** Triggered after fileentry is retrieved 
	 *  @param {FileEntry} fileSystem - file entry to read from
	 *  @ignore
	 ******************************************************************************/
	read_GotFileEntry: function(fileEntry) {
		
		if(KU.FileIO.debug) alert("Got file entry");
		
		// Create a writer
		fileEntry.file(KU.FileIO.read_GotFile, KU.FileIO.fail);
	},
	
	
	
	/******************************************************************************/
	/** Triggered after file is retrieved 
	 *  @param {File} file - file that we want to read from
	 *  @ignore
	 ******************************************************************************/
	 read_GotFile: function(file){
		
		if(KU.FileIO.debug) alert("Got file");
		
		KU.FileIO.read_ReadAsText(file);
	},
	
	
	
	/******************************************************************************/
	/** Triggered after file is ready to be read from
	 *  @param {File} file - file used to read from
	 *  @ignore
	 ******************************************************************************/
	read_ReadAsText: function(file) {

		if(KU.FileIO.debug) alert("Reading as text");
		
		// Configure reader
		var reader = new FileReader();
		
		reader.onloadend = function(evt) {
			KU.FileIO.successCallback(evt.target.result);
		};
		
		// Read!
		reader.readAsText(file);
	},
	
	
	
	/******************************************************************************/
	/** Triggered after file system is ready
	 *  @param {FileSystem} fileSystem - file system used
	 *  @ignore
	 ******************************************************************************/
	write_GotFS: function(fileSystem) {
	
		if(KU.FileIO.debug) alert("Got FS " + KU.FileIO.fileName + " "  + KU.FileIO.fail + " " + KU.FileIO.write_GotFileEntry);
		
		// Get specified file
		fileSystem.root.getFile(KU.FileIO.fileName, {create: true, exclusive: false}, KU.FileIO.write_GotFileEntry, KU.FileIO.fail);
	},

	
	
	/******************************************************************************/
	/** Triggered after file entry is ready
	 *  @param {FileEntry} fileEntry - file entry used
	 *  @ignore
	 ******************************************************************************/
	write_GotFileEntry: function(fileEntry) {
		
		if(KU.FileIO.debug) alert("Got file entry");
		
		// Create a writer
		fileEntry.createWriter(KU.FileIO.write_GotFileWriter, KU.FileIO.fail);
	},

	
	
	/******************************************************************************/
	/** Triggered after file writer is ready
	 *  @param {FileWriter} writer - writer we will write with
	 *  @ignore
	 ******************************************************************************/
	write_GotFileWriter: function(writer) {

		if(KU.FileIO.debug) alert("Writing");
		
		// Callback for write finish
		writer.onwriteend = function(evt) {
			
			if(KU.FileIO.debug) alert("Done writing");
			
			// Call success function
			KU.FileIO.successCallback();
		};
		
		// Write content!
		writer.write(KU.FileIO.fileContents);
	},

	
	
	/******************************************************************************/
	/** Triggered anytime a failure occurs
	 *  @param {FileError} error - error message containing relevant information
	 *  @ignore
	 ******************************************************************************/
	fail: function(error) {
		
		if(KU.FileIO.debug) alert("Error :(");
		
		// Callback for error
		KU.FileIO.failCallback(error.code);
	}

};