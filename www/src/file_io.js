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
	=== Read Example ===
	
	var success = function(result){
		alert(result);
	 };
	 var fail = function(errorcode){
		alert("Fail call back :( " + errorcode);
	 };
	 
	 KU_FileIO.readFromFile("TestAppKUMobile.txt", success, fail);
	 
 *********************************************************/

 
/**********************************************************
 * KU Mobile File input/output
 *********************************************************/
KU_FileIO = {
	
	fileName: null,			// name of current file
	fileContents: null,		// contents of current file
	failCallback: null,		// callback when fail occurs
	successCallback: null,	// callback on success
	debug: false,			// debug alerts?
	
	/**********************************************************
	 * Write to file
	 *********************************************************/
	writeToFile: function(name, content, success, failure){
		
		// Configure
		this.fileName = name;
		this.fileContents = content;
		this.successCallback = success;
		this.failCallback = failure;
		
		if(KU_FileIO.debug) alert("Received write info!");
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, KU_FileIO.write_GotFS, KU_FileIO.fail);
	},
	
	/**********************************************************
	 * Read from file
	 *********************************************************/
	readFromFile: function(name, success, failure){
		
		// Configure
		this.fileName = name;
		this.fileContents = "";
		this.successCallback = success;
		this.failCallback = failure;
		
		if(KU_FileIO.debug) alert("Received read info!");
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, KU_FileIO.read_GotFS, KU_FileIO.fail);
	},
	
	/**********************************************************
	 * Read - Got FS
	 *********************************************************/
	read_GotFS: function(fileSystem) {
	
		if(KU_FileIO.debug) alert("Got FS");
		
		// Get specified file
		fileSystem.root.getFile(KU_FileIO.fileName, null, KU_FileIO.read_GotFileEntry, KU_FileIO.fail);
	},
	
	/**********************************************************
	 * Read - Got File Entry
	 *********************************************************/
	read_GotFileEntry: function(fileEntry) {
		
		if(KU_FileIO.debug) alert("Got file entry");
		
		// Create a writer
		fileEntry.file(KU_FileIO.read_GotFile, KU_FileIO.fail);
	},
	
	/**********************************************************
	 * Read - File
	 *********************************************************/
	read_GotFile: function(file){
		
		if(KU_FileIO.debug) alert("Got file");
		
		KU_FileIO.read_ReadAsText(file);
	},
	
	/**********************************************************
	 * Read - Read as text
	 *********************************************************/
	read_ReadAsText: function(file) {

		if(KU_FileIO.debug) alert("Reading as text");
		
		// Configure reader
		var reader = new FileReader();
		
		reader.onloadend = function(evt) {
			KU_FileIO.successCallback(evt.target.result);
		};
		
		// Read!
		reader.readAsText(file);
	},
	
	/**********************************************************
	 * Write - Got FS
	 *********************************************************/
	write_GotFS: function(fileSystem) {
	
		if(KU_FileIO.debug) alert("Got FS " + KU_FileIO.fileName + " "  + KU_FileIO.fail + " " + KU_FileIO.write_GotFileEntry);
		
		// Get specified file
		fileSystem.root.getFile(KU_FileIO.fileName, {create: true, exclusive: false}, KU_FileIO.write_GotFileEntry, KU_FileIO.fail);
	},

	/**********************************************************
	 * Write - Got File Entry
	 *********************************************************/
	write_GotFileEntry: function(fileEntry) {
		
		if(KU_FileIO.debug) alert("Got file entry");
		
		// Create a writer
		fileEntry.createWriter(KU_FileIO.write_GotFileWriter, KU_FileIO.fail);
	},

	/**********************************************************
	 * Write - Got Writer
	 *********************************************************/
	write_GotFileWriter: function(writer) {

		if(KU_FileIO.debug) alert("Writing");
		
		// Callback for write finish
		writer.onwriteend = function(evt) {
			
			if(KU_FileIO.debug) alert("Done writing");
			
			// Call success function
			KU_FileIO.successCallback();
		};
		
		// Write content!
		writer.write(KU_FileIO.fileContents);
	},

	/**********************************************************
	 * Failure General
	 *********************************************************/
	fail: function(error) {
		
		if(KU_FileIO.debug) alert("Error :(");
		
		// Callback for error
		KU_FileIO.failCallback(error.code);
	}

};


