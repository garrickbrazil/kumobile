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
/**  Contains all map related functions for loading and controlling the
 *   map page.
 *   @namespace
 ******************************************************************************/
KU.Map = {
	
	
	
	/******************************************************************************/
	/**  The leaflet map object
	 *   @type {Object}
	 ******************************************************************************/
	map: null,
	
	
	
	/******************************************************************************/
	/**  Tells whether or not map is currently attempting to download
	 *   or parse article lists. Essentially used to tell whether map is
	 *   considered to be busy. 
	 *   @type {boolean}
	 ******************************************************************************/
	loading: false,
	
	
	
	/******************************************************************************/
	/**  Center of the map during {@link KU.Map.initializeMap}
	 *   @type {double[]}
	 ******************************************************************************/
	center: [43.013070, -83.713853],
	
	
	
	/******************************************************************************/
	/**  List of categories (order that they will be downloaded in) containing the
	 *   corresponding foursquare ID's.
	 *   @type {Object[]}
	 ******************************************************************************/
	categoriesList: [{"name":"Food","id":"4d4b7105d754a06374d81259"},
					 {"name":"Entertainment","id":"4d4b7104d754a06370d81259"},
					 {"name":"Shop/Services","id":"5267e446e4b0ec79466e48c4,4bf58dd8d48988d116951735,4bf58dd8d48988d127951735,52f2ab2ebcbc57f1066b8b43,52f2ab2ebcbc57f1066b8b32,52f2ab2ebcbc57f1066b8b40,52f2ab2ebcbc57f1066b8b42,4bf58dd8d48988d115951735,4bf58dd8d48988d1f1941735,4bf58dd8d48988d114951735,4bf58dd8d48988d11a951735,4eb1bdf03b7b55596b4a7491,4bf58dd8d48988d117951735,4eb1c1623b7b52c0e1adc2ec,4f04ae1f2fb6e1c99f3db0ba,52f2ab2ebcbc57f1066b8b2a,52f2ab2ebcbc57f1066b8b31,52f2ab2ebcbc57f1066b8b3b,4bf58dd8d48988d103951735,52f2ab2ebcbc57f1066b8b18,4d954b0ea243a5684a65b473,4bf58dd8d48988d10c951735,52f2ab2ebcbc57f1066b8b17,4f4532974b9074f6e4fb0104,4bf58dd8d48988d1f6941735,4bf58dd8d48988d1f4941735,52dea92d3cf9994f4e043dbb,52f2ab2ebcbc57f1066b8b1a,4bf58dd8d48988d10f951735,52f2ab2ebcbc57f1066b8b1d,5032872391d4c4b30a586d64,4bf58dd8d48988d122951735,52f2ab2ebcbc57f1066b8b26,503287a291d4c4b30a586d65,52f2ab2ebcbc57f1066b8b3a,52f2ab2ebcbc57f1066b8b16,4bf58dd8d48988d1f7941735,4bf58dd8d48988d11b951735,4bf58dd8d48988d1f9941735,52f2ab2ebcbc57f1066b8b24,52f2ab2ebcbc57f1066b8b1c,4bf58dd8d48988d1f8941735,4bf58dd8d48988d18d941735,4eb1c0253b7b52c0e1adc2e9,4bf58dd8d48988d128951735,52f2ab2ebcbc57f1066b8b19,4bf58dd8d48988d112951735,52f2ab2ebcbc57f1066b8b2c,4bf58dd8d48988d1fb941735,50aaa5234b90af0d42d5de12,52f2ab2ebcbc57f1066b8b36,4bf58dd8d48988d1f0941735,4bf58dd8d48988d111951735,52f2ab2ebcbc57f1066b8b25,52f2ab2ebcbc57f1066b8b33,4bf58dd8d48988d1fc941735,52f2ab2ebcbc57f1066b8b3f,52f2ab2ebcbc57f1066b8b2b,52f2ab2ebcbc57f1066b8b1e,52f2ab2ebcbc57f1066b8b38,52f2ab2ebcbc57f1066b8b29,4bf58dd8d48988d1fd941735,52c71aaf3cf9994f4e043d17,50be8ee891d4fa8dcc7199a7,52f2ab2ebcbc57f1066b8b3c,52f2ab2ebcbc57f1066b8b27,4bf58dd8d48988d1ff941735,4f04afc02fb6e1c99f3db0bc,5032833091d4c4b30a586d60,4bf58dd8d48988d1fe941735,4f04aa0c2fb6e1c99f3db0b8,4f04ad622fb6e1c99f3db0b9,4d954afda243a5684865b473,52f2ab2ebcbc57f1066b8b2f,52f2ab2ebcbc57f1066b8b22,52f2ab2ebcbc57f1066b8b35,4bf58dd8d48988d121951735,52f2ab2ebcbc57f1066b8b34,52f2ab2ebcbc57f1066b8b23,5032897c91d4c4b30a586d69,4bf58dd8d48988d100951735,4eb1bdde3b7b55596b4a7490,52f2ab2ebcbc57f1066b8b20,52f2ab2ebcbc57f1066b8b3d,52f2ab2ebcbc57f1066b8b28,5032885091d4c4b30a586d66,4bf58dd8d48988d10d951735,52f2ab2ebcbc57f1066b8b37,4f4531084b9074f6e4fb0101,4bf58dd8d48988d110951735,52f2ab2ebcbc57f1066b8b1f,52f2ab2ebcbc57f1066b8b39,4bf58dd8d48988d123951735,52f2ab2ebcbc57f1066b8b41,52f2ab2ebcbc57f1066b8b1b,4bf58dd8d48988d1ed941735,4bf58dd8d48988d1f2941735,52f2ab2ebcbc57f1066b8b21,4f04b1572fb6e1c99f3db0bf,5032781d91d4c4b30a586d5b,4d1cf8421a97d635ce361c31,4bf58dd8d48988d1de931735,4bf58dd8d48988d101951735,4bf58dd8d48988d1f3941735,4f04b08c2fb6e1c99f3db0bd,52f2ab2ebcbc57f1066b8b30,4bf58dd8d48988d10b951735,4bf58dd8d48988d126951735,52e816a6bcbc57f1066b7a54,52f2ab2ebcbc57f1066b8b2e"},
					 {"name":"Bank","id":"4bf58dd8d48988d10a951735,52f2ab2ebcbc57f1066b8b56,52f2ab2ebcbc57f1066b8b2d,5032850891d4c4b30a586d62"},
					 {"name":"Gas Station","id":"4bf58dd8d48988d113951735"},
					 {"name":"Automotive Repair","id":"4bf58dd8d48988d124951735,52f2ab2ebcbc57f1066b8b44"},
					 {"name":"Fitness","id":"4bf58dd8d48988d175941735"},
					 {"name":"Bar","id":"4d4b7105d754a06376d81259"},
					 {"name":"Travel","id":"4bf58dd8d48988d1ed931735,4bf58dd8d48988d12d951735,4bf58dd8d48988d1fe931735,4bf58dd8d48988d130951735,4bf58dd8d48988d129951735"},
					 {"name":"Emergency","id":"4bf58dd8d48988d12e941735,4bf58dd8d48988d104941735,4bf58dd8d48988d12c941735"},
					 {"name":"Fast Food","id":"4bf58dd8d48988d16e941735"}],
	
	
	
	/******************************************************************************/
	/**  Actual poi data for each category as determined by the categoriesList.
	 *   This must be handled dynamically in {@link KU.Map.initializeMap} in order
	 *   to properly determine the serializeID.
	 *   @type {Object[]}
	 ******************************************************************************/
	categoryData: [],
	
	
	
	/******************************************************************************/
	/**  Contains all markers/POI's that are added to the map through the latest
	 *   search results (excluding the current user's location which is not 
	 *   dependent on searching).
	 *   @type {Marker[]}
	 ******************************************************************************/
	markers: null,
	
	
	
	/******************************************************************************/
	/**  Contains the last timeout call sent! This allows us to restart the timeout if
	 *   the user re-searches in any way. The major benefit of this is that it gives
	 *   us the feeling of incremental searching, e.g we send a timeout of some 
	 *   milliseconds whenever the KEY_UP event triggers, as well as cancelling out
     *   the last timeout we sent. 
	 *   @type {Timeout}
	 ******************************************************************************/
	sentTimeout: null,
	
	
	
	/******************************************************************************/
	/**  Southwest latitude for map's bounding box. Essentially most southwest
	 *   latitude for POI's we are concerned with to show the user. 
	 *   @type {double}
	 ******************************************************************************/
	swLat: 42.97513915795521,
	
	
	
	/******************************************************************************/
	/**  Southwest longitude for map's bounding box. Essentially most southwest
	 *   longitude for POI's we are concerned with to show the user. 
	 *   @type {double}
	 ******************************************************************************/
	swLng: -83.77864837646484,
	
	
	
	/******************************************************************************/
	/**  Northeast latitude for map's bounding box. Essentially most northeast
	 *   latitude for POI's we are concerned with to show the user. 
	 *   @type {double}
	 ******************************************************************************/
	neLat: 43.05107777204538,	
	
	
	
	/******************************************************************************/
	/**  Northeast longitude for map's bounding box. Essentially most northeast
	 *   longitude for POI's we are concerned with to show the user. 
	 *   @type {double}
	 ******************************************************************************/
	neLng: -83.64904403686523,
	
	
	
	/******************************************************************************/
	/**  The index related to categories for which we are currently downloading or
	 *   importing from a cached session.
	 *   @type {int}
	 ******************************************************************************/
	downloadIndex: 0,
	
	
	
	/******************************************************************************/
	/**  The 'version' of how we save map data to local filesystem. Whenever the
	 *   structure of this changes, we must change the serialized ID so that we can
	 *   programmatically know that the old serialized data is not compatible with
	 *   this new version, and thereby force redownload the new data. 
	 *   @type {int}
	 ******************************************************************************/
	serializeID: 2,
	
	
	
	/******************************************************************************/
	/**  Represents the last/current value the user has searched for from the free
	 *   text field / search bar located on the map page. 
	 *   @type {string}
	 ******************************************************************************/
	lastValue: "",
	
	
	
	/******************************************************************************/
	/**  Wait time for incremental searching. This is essentially how long we wait
	 *   after the user has searched something, before we assume they are done searching.
	 *   @type {int}
	 ******************************************************************************/
	KEY_WAIT: 850,
	
	
	
	/******************************************************************************/
	/**  This is the minimum time that needs to have passed in order to allow for 
	 *   another foursquare update to both the map and local filesystem.
	 *   @type {int}
	 *   @constant
	 ******************************************************************************/
	MIN_UPDATE_MS: 86400000,
	
	
	
	/******************************************************************************/
	/**  File template for local storage of foursquare map data for each category.
	 *   E.g for saving food it would be MAP_DATA_Food filename.
	 *   @type {int}
	 *   @constant
	 ******************************************************************************/
	MAP_FILE_TEMPLATE: "MAP_DATA_",
	
	
	
	/******************************************************************************/
	/**  Enables debug messages via alert messages. Do NOT enable this unless there
	 *   are legitimate problems with plugins (not available to debug via browser).
	 *   @type {boolean}
	 *   @constant
	 ******************************************************************************/
	debug: false,
	
	
	
	/******************************************************************************/
	/**  Is the footer showing? The footer contains the POI details and starts off
	 *   hidden. It is only shown when the user clicks on the POI or searches.
	 *   @type {boolean}
	 ******************************************************************************/
	footer: false,
	
	
	
	/******************************************************************************/
	/**  Contains the selected marker. This is useful to store so we can easily
	 *   disable the markers selection. 
	 *   @type {Object}
	 ******************************************************************************/
	selectedMarker: null,
	
	
	
	/******************************************************************************/
	/**  Triggered when the map page is first initialized based on 
	 *   jQM page init event. 
	 *
	 *   @param {Event} event - jQM event, not actually being
	 *          used by us at the moment. 
	 *   @event
	 ******************************************************************************/
	pageInit: function(event){
		
		// Bug in JQM? Clear button flashes when loading page?
		// This line will fix it.
		$("#map .ui-input-clear").addClass("ui-input-clear-hidden");
		
		// Initialize map
		// Note: recommended to initialize map from anonymous. 
		// This seems to potentially allow the rest of the 
		// layouts to size correctly without waiting for the map. 
		setTimeout(function(){
			KU.Map.initializeMap();
			KU.Map.readPOIs();
		},0);
		
	},
	
	
	
	/******************************************************************************/
	/**  Triggered when the map page is first created based on 
	 *   jQM page create event. 
	 *
	 *   @param {Event} event - jQM event, not actually being
	 *          used by us at the moment. 
	 *   @event
	 ******************************************************************************/
	pageCreate: function(event){
	
		// Trigger for direct change in search box
		$("#map-search").bind("change", KU.Map.searchDirectChangeEvent);
		
		// Trigger for incremental change in search box
		$("#map-search").keyup(KU.Map.searchIncrementalChangeEvent);
		
		// Fix iScroll?
		if(KU.ISCROLL) KU.fixIscroll("#map"); 
		
		// Resize and get first page for overflow
		$(window).trigger("resize");
		
	},
	
	
	
	/******************************************************************************/
	/**  Triggered when the user does a key up event in order to simulate incremental
	 *   searching for the attached search bar. 
	 *   @event
	 ******************************************************************************/
	searchIncrementalChangeEvent: function() {

		// Definitely a change?
		if(this.value != KU.Map.lastValue){
		
			// Store value
			KU.Map.lastValue = this.value;
		
			// Clear timeout
			if(KU.Map.sentTimeout) clearTimeout(KU.Map.sentTimeout);
			
			KU.Map.sentTimeout = setTimeout(function(latestValue){
				
				// Definitely not a change?
				if(latestValue == KU.Map.lastValue){
					
					// Save new value, reinit, download
					KU.Map.filterMap();
				}
				
				
			}, KU.Map.KEY_WAIT, this.value);
		}
	},
	
	
	
	/******************************************************************************/
	/**  Triggered when the user does a direct change. The direct change includes 
	 *   typing then changing focus or pressing the clear button. This is redundant
	 *   to the incremental search event, except for the clear button!
	 *   @event
	 ******************************************************************************/
	searchDirectChangeEvent: function(e,u){
			
		// Definitely a change?
		if(this.value != KU.Map.lastValue){
		
			// Clear timeout
			if(KU.Map.sentTimeout) clearTimeout(KU.Map.sentTimeout);
			
			// Change last value and filter
			KU.Map.lastValue = this.value;
			KU.Map.filterMap();
			
		}
	},
	
	
	
	/******************************************************************************/
	/**  Removes all markers from the map and then clears them from the array.
	 ******************************************************************************/
	clearMarkers: function(){
		
		// Nothing to delete?
		if(this.markers != null){
		
			// Delete each marker from map
			for(var index = 0; index < this.markers.length; index++){
				
				this.map.removeLayer(this.markers[index]);
			}
		}
		
		// Setup new array!
		this.markers = new Array();
	},
	
	
	
	/******************************************************************************/
	/**  User has clicked the map. We can use this as a way to exit the footer! Then
	 *   also deselect the marker
	 *   @param {event} e - unused for now
	 *   @event
	 ******************************************************************************/
	mapClickEvent: function(e){
			
		if(KU.Map.footer){
		
			if(KU.Map.selectedMarker != null) KU.Map.deselectMarker();
			KU.Map.footer = false;
			$('#poi-info').hide();
		}
		
	},
	
	
	
	/******************************************************************************/
	/**  User's location was found! Add it to the map as a blue circle including
	 *   an accuracy circle. 
	 *   @param {event} e - location event containing position and accuracy
	 *   @event
	 ******************************************************************************/
	locationFound: function(e){
		
		// Remove user locatin if it exists there
		if(KU.Map.userLoc) KU.Map.map.removeLayer(KU.Map.userLoc);
		if(KU.Map.userAccuracy) KU.Map.map.removeLayer(KU.Map.userAccuracy);
		
		// Add Accuracy
		KU.Map.userAccuracy = L.circle([e.latitude, e.longitude],e.accuracy/2,{
			stroke:true,
			weight:1,
			opacity:.2,
			fillColor: '#519ad1',
			fillOpacity: .1,
		}).addTo(KU.Map.map);
		
		
		// Make custom icon
		var customIcon = L.icon({
			iconUrl: 'images/map-icons/blue_ball.png',
			iconSize:     [22, 22], // size of the icon
			iconAnchor:   [11, 11]
		});
	
	
		// Add location the map
		KU.Map.userLoc = L.marker([e.latitude, e.longitude], {icon: customIcon})
				.addTo(KU.Map.map).bindPopup('<b>You are here</b>!');
	
	},
	
	
	
	/******************************************************************************/
	/**  Updates POI's by first checking the caches map data files, and if needed
	 *   re-downloads the POI data from Foursquare and then re-serializes the data
	 *   to local file system. 
	 ******************************************************************************/
	 updatePOIs: function(){
		
		// Current category
		var category = this.categoriesList[this.downloadIndex].id;
		
		// Box for URL calls
		var box = "&sw=" + this.swLat + "," + this.swLng 
			+ "&ne=" + this.neLat + "," + this.neLng;
		
		// Gather URL
		// also pretty pyramid
		var url = "https://api.foursquare.com/v2/venues/search?"
					+ "&client_id=IUQ5QBLLKXQFIK4VYCFKHMX1ABZBXKMCQCLE4H3B4AUIK1D5"
					+ "&client_secret=YAHWXV2G53YG531G1LVMOAXRZMMY20W2GM5VNPPEBOPU2505"
					+ "&categoryId=" + category
					+ "&intent=browse"
					+ "&v=20140709"
					+ "&limit=50"
					+ box;
		
		// Download new information!
		$.ajax({
			url: url,
			type: 'GET',
			dataType: 'html',
			success: function(data) {
			
				// Parse result
				var result = JSON.parse(data);
				var category = KU.Map.categoryData[KU.Map.downloadIndex];
		
				// Is result valid?
				if(result != null && result.response != null && result.response.venues != null){
					
					// Make new object then save date!
					category = {"name":KU.Map.categoriesList[KU.Map.downloadIndex].name, "serializeID": KU.Map.serializeID, "date": 0, "pois":[]};
					category.date = (new Date()).getTime();
					
					// All POI's
					for(var index = 0; index < result.response.venues.length; index++){
					
						var current = result.response.venues[index];
						
						// Valid POI?
						if(current.name != null 
							&& current.location != null
							&& current.location.lat != null
							&& current.location.lng != null){
							
							category.pois[category.pois.length] = current;
						}
					}

					// Save new category here!
					if(KU.isDevice){
						
						var categoryStr = JSON.stringify(category);
						
						// Successful write?
						var success = function(){
							
							if(KU.Map.debug) alert("Saved successfully");
							
							// Get next POI category
							KU.Map.downloadIndex++;
							KU.Map.readPOIs();
						};
						
						// Failure write?
						var fail = function(errorcode){
						
							if(KU.Map.debug) alert("Save failed");
							
							// Get next POI category
							KU.Map.downloadIndex++;
							KU.Map.readPOIs();
						};
						
						// Save category to sd and memory
						fileName = KU.Map.MAP_FILE_TEMPLATE + category.name;
						KU.Map.categoryData[KU.Map.downloadIndex] = category;
						KU.FileIO.writeToFile(fileName, categoryStr, success, fail);
						
					}
					
					// Not a device
					else{
						
						// Save category to memory
						KU.Map.categoryData[KU.Map.downloadIndex] = category;
						
						// Get next POI category
						KU.Map.downloadIndex++;
						KU.Map.readPOIs();
					
					}
				}
				
				// No fallback? alert error then move on
				else if(category == null){
				
					// Tell user about error loading from file AND downloading
					alert("There was an issue loading " + KU.Map.categoriesList[KU.Map.downloadIndex].name 
						+ ".\nPlease try again later.");
					
					// Get next POI category
					KU.Map.downloadIndex++;
					KU.Map.readPOIs();
				}
				
				// Fallback data is already in place for this category
				// move on to next one and try to update next time we load.
				else{
				
					// Get next POI category
					KU.Map.downloadIndex++;
					KU.Map.readPOIs();
				}
			},
			
			error: function(data){
				
				if(KU.Map.categoryData[KU.Map.downloadIndex] == null){
				
					// Tell user about error loading from file AND downloading
					alert("There was an issue loading " + KU.Map.categoriesList[KU.Map.downloadIndex].name 
						+ ".\nPlease try again later.");
					
				}
				
				// Error downloading POI info?
				KU.Map.downloadIndex++;
				KU.Map.readPOIs();
			}
		});
	
	},
 
 
 
	/******************************************************************************/
	/**  Reads POI's from local file system, starting with the current downloadIndex.
	 *   Note that if this fails, we will attempt to download the failed category.
	 ******************************************************************************/
	readPOIs: function(){
		
		// Started?
		if(this.downloadIndex == 0){
		
			// Disable searching
			$("#map-search").addClass("ui-disabled");
			KU.showLoading("map-header");
		}
		
		// All done?
		else if(this.downloadIndex < 0 || this.downloadIndex >= this.categoriesList.length){
			
			// All done with categories!
			$("#map-search").removeClass("ui-disabled");
			KU.hideLoading("map-header");
			KU.Map.loading = false;
			KU.Map.filterMap();
			return;
		}
		
		//  Read from file?
		if(KU.isDevice){
			
			var fileName = KU.Map.MAP_FILE_TEMPLATE + KU.Map.categoryData[KU.Map.downloadIndex].name;
			KU.FileIO.readFromFile(fileName, KU.Map.readPOI_Success, KU.Map.readPOI_Fail);
		}
		
		// Simply update the next POI
		else{
		
			KU.Map.updatePOIs();
		}
		
	},
	
	
	
	/******************************************************************************/
	/**  Triggered after a successful read of POI file. 
	 *   @event
	 ******************************************************************************/
	readPOI_Success: function(result){
		
		// Parse result
		try{
			category = JSON.parse(result);
		}
		
		catch(e){
			category = null;
		}
		
		if(category != null){
			
			var currentDate = (new Date()).getTime();
			var date = category.date;
			var serial = category.serializeID;
			var pois = category.pois;
			
			// Completely valid category?
			if(currentDate != null
				&& date != null
				&& serial != null
				&& pois != null
				&& serial == KU.Map.serializeID){

				// Date is not due, pois are reasonable length
				if((date + KU.Map.MIN_UPDATE_MS) > currentDate && pois.length > 5){
				
					if(KU.Map.debug) alert("Read Category " + KU.Map.downloadIndex);
					
					// Store category!
					KU.Map.categoryData[KU.Map.downloadIndex] = category;
					KU.Map.downloadIndex++;
					KU.Map.readPOIs();
				
				}
				
				// New date needs to be saved
				else{
					
					if(KU.Map.debug) alert("Need a new update! " + KU.Map.downloadIndex);
					
					// Fallback is old data!
					KU.Map.categoryData[KU.Map.downloadIndex] = category;
					KU.Map.updatePOIs();
					
				}
			}		
			
			// Invalid or out of date category
			else{
				
				
				if(KU.Map.debug) {
					alert("Date " + (date != null)
					+ " serial " + (serial != null)
					+ " pois " +  (pois != null)
					+ " same serial " +  (serial == KU.Map.serializeID)
					+ " kuserial " + (KU.Map.serializeID));
					alert("Couldn't read " + KU.Map.downloadIndex);
				}
				
				// Update!
				KU.Map.updatePOIs();
			}
		}
		
		// Invalid
		else{
			
			alert("I'm here 2");
			if(KU.Map.debug) alert("Couldn't read " + KU.Map.downloadIndex);
			
			// Update!
			KU.Map.updatePOIs();
		}
		
	},
	
	
	
	/******************************************************************************/
	/**  Triggered after a failed read of POI file. 
	 *   @event
	 ******************************************************************************/
	readPOI_Fail: function(errorcode){
		
		if(KU.Map.debug) alert("Failed to read " + KU.Map.downloadIndex);
		
		// Download needed
		KU.Map.updatePOIs();
	},
	
	
	
	/******************************************************************************/
	/**  Filters the map POI's to only add markers that the user searched for. 
	 ******************************************************************************/
	filterMap: function(){

		
		// Hide poi info footer
		$('#poi-info').hide();
		KU.Map.footer = false;

			
		this.clearMarkers();
	
		// Don't bother showing EVERYTHING
		if(this.lastValue == "") return;
		
		// All  POI categories
		for(var index = 0; index < this.categoryData.length - 1; index++){
		
			this.addPOIs(this.categoryData[index]);
			if(index == 0) this.addPOIs(this.categoryData[this.categoryData.length - 1]);
		}

		
		if(this.markers.length < 1) return;
		
		// Get starting point
		var user = (KU.Map.userLoc)? KU.Map.userLoc.getLatLng(): L.latLng(43.013070, -83.713853);
		
		
		// Is user location outside of range?
		if(user.lat > KU.Map.neLat || user.lat < KU.Map.swLat || user.lng > KU.Map.nwLat || user.lng < KU.Map.swLng){
			
			// Force kettering's location
			user = L.latLng(43.013070, -83.713853);
		}
		
		var nearestPOI = this.markers[0].getLatLng();
		var smallestDistance = user.distanceTo(nearestPOI);
		var nearestMarker = this.markers[0];
		
		// Bring user to nearest point!
		for(var index = 1; index < this.markers.length; index++){
			
			// Compute distance
			var current = this.markers[index].getLatLng();
			var distance = user.distanceTo(current);
			
			// Closer point
			if(distance < smallestDistance){
			
				smallestDistance = distance;
				nearestPOI = current;
				nearestMarker = this.markers[index];
			}
		}

		// Reset center and zoom
		if(this.lastValue != ""){

		
			// Move point up slightly north
			KU.Map.map.setView(L.latLng(nearestPOI.lat - .0014, nearestPOI.lng), 16);
			KU.Map.deselectMarker();
			
			
			var selectedIcon = L.icon({
				iconUrl: 'images/map-icons/' + nearestMarker.icon.replace('.png','-selected.png'),
				iconSize:     [25, 29], // size of the icon
				iconAnchor:   [12, 29]  // point of the icon which will correspond to marker's location
			});
			
			KU.Map.showMapDetails(nearestMarker.poi);			
			KU.Map.selectedMarker = {'marker': nearestMarker, 'iconName': nearestMarker.icon};
			nearestMarker.setIcon(selectedIcon);
		}
	},
	
	
	
	/******************************************************************************/
	/**  Add POI's of a certain category to the map if it is a match with the 
	 *   user's input through the search bar.
	 *   @param {Object} category - contains category name and poi array
	 ******************************************************************************/
	addPOIs: function(category){
		
		
		// Don't bother if the category is null...
		if(category == null) return;
		
		// All POI's in category
		for(var index = 0; index < category.pois.length; index++){
		
		
			var current = category.pois[index];
			var icon = "";
			
			// Choose correct icon
			if(category.name == "Food" || category.name == "Fast Food") icon = "fastfood.png";
			else if(category.name == "Entertainment") icon = "theater.png";
			else if(category.name == "Shop/Services") icon = "mall.png";
			else if(category.name == "Bank") icon = "bank.png";
			else if(category.name == "Gas Station") icon = "fillingstation.png";
			else if(category.name == "Automotive Repair") icon = "carrepair.png";
			else if(category.name == "Fitness") icon = "weights.png";
			else if(category.name == "Bar") icon = "bar_coktail.png";
			else if(category.name == "Travel") icon = "busstop.png";
			else if(category.name == "Emergency") icon = "ambulance.png";
			
			
			// Create a custom leaflet icon
			var customIcon = L.icon({
				iconUrl: 'images/map-icons/' + icon,
				iconSize:     [25, 29], // size of the icon
				iconAnchor:   [12, 29], // point of the icon which will correspond to marker's location
			});
			
			
			var categorylist = "";
		
			// Compile categories from array to a string
			for(var i = 0; i < current.categories.length; i++){
			
				if(i == (current.categories.length -1)) categorylist += current.categories[i].name;
				else categorylist += current.categories[i].name + ", ";
			}
			
			// Valid POI?
			if(current.name != null 
				&& current.location != null
				&& current.location.lat != null
				&& current.location.lng != null
				&& ((current.name.toLowerCase().indexOf(this.lastValue.toLowerCase()) > -1)  
				     || (categorylist.toLowerCase().indexOf(this.lastValue.toLowerCase()) > -1))){
				
				// Create marker
				var tempMarker = 
					L.marker([current.location.lat, current.location.lng], {icon: customIcon})
					 .on('click', function(e) {
						
						if(KU.Map.selectedMarker != null){
							
							KU.Map.deselectMarker();
						}
						
						// Find correct marker
						for(var i = 0; i < KU.Map.markers.length; i++){
							if(KU.Map.markers[i].getLatLng() === e.latlng){
								
								var selectedIcon = L.icon({
									iconUrl: 'images/map-icons/' + icon.replace('.png','-selected.png'),
									iconSize:     [25, 29], // size of the icon
									iconAnchor:   [12, 29], // point of the icon which will correspond to marker's location
								});
								
								KU.Map.showMapDetails(KU.Map.markers[i].poi);
								KU.Map.markers[i].setIcon(selectedIcon);
								KU.Map.selectedMarker = {'marker': KU.Map.markers[i], 'iconName': icon};
							}
						}
				});
				
				// Store its icon and poi info
				tempMarker.icon = icon;
				tempMarker.poi = current;
				
				// Start off assuming that the icon is not redundant 
				// (not already on the map from a different category)
				var nonRedundent = true;
				
				
				// Check to see if marker already exists in this location					
				for(var i = 0; i < KU.Map.markers.length; i++){
				
					nonRedundent = !(KU.Map.markers[i].getLatLng().equals(tempMarker.getLatLng()) &&
									KU.Map.markers[0].poi.name == tempMarker.poi.name); 
					if(!nonRedundent) break;
				}
				
				
				// POI does not already exist in the list?
				if(nonRedundent){
					
					tempMarker.addTo(KU.Map.map);
					KU.Map.markers[KU.Map.markers.length] = tempMarker;
				}
			}
		}
	
	},
 
 
 
	/******************************************************************************/
	/**  Deselects the currently selected marker from the map. Basically it only
	 *   switches the icon back to the 'non-selected' icon. 
	 ******************************************************************************/
	deselectMarker: function(){
	
		if(KU.Map.selectedMarker == null) return;
	
		var deselectedIcon = L.icon({
			iconUrl: 'images/map-icons/' + KU.Map.selectedMarker.iconName,
			iconSize:     [25, 29], 	// size of the icon
			iconAnchor:   [12, 29], 	// point of the icon which will correspond to marker's location
		});
	
		// Revert latest marker
		KU.Map.selectedMarker.marker.setIcon(deselectedIcon);
		KU.Map.selectedMarker = null;
	},
 
 
 
 	/******************************************************************************/
	/**  Shows the footer with POI detail information at the bottom of the map.
	 *   @param {Object} poi - the informtaion needed to show (name, address, phone etc)
	 ******************************************************************************/
	showMapDetails: function(poi){
	
	
		// Redo the sizing information since the page is technically changing size
		// and structure with the new footer being shown (only really needed if user
		// is switching between perspectives often.
		$(window).trigger("throttleresize");
		
		
		// Show footer if needed
		if(!KU.Map.footer){
			KU.Map.footer = true;
			$('#poi-info').show();	
		}
		
		// Put in real info
		$("#poi-info-name").text(poi.name);
		
		var categorylist = "";
		
		// Compile categories
		for(var i = 0; i < poi.categories.length; i++){
		
			if(i == (poi.categories.length -1)) categorylist += poi.categories[i].name;
			else categorylist += poi.categories[i].name + ", ";
		}
		
		
		// Add category list if valid
		if(categorylist != "") $("#poi-info-categories").text(categorylist);
		else $("#poi-info-categories").text(String.fromCharCode(160));
		
		
		// Add address in format as such 12345 Street St, Warren MI
		if(poi.location.address && poi.location.city && poi.location.state){
				
			$("#poi-info-address").text(poi.location.address + ", " +  poi.location.city + " " + poi.location.state);
		}
		
		// Add coordinate data instead
		else if (poi.location.lat && poi.location.lng){
		
			$("#poi-info-address").text(poi.location.lat + ", " + poi.location.lng);
		}
		
		// Add default break character (need to have proper size in the div)
		else $("#poi-info-address").text(String.fromCharCode(160));
		
		
		// Add formatted phone
		if(poi.contact.formattedPhone){
			$("#poi-button-phone").removeClass("ui-disabled");
			$("#poi-info-phone").text(poi.contact.formattedPhone);
		}
		
		// Add unformatted phone
		else if (poi.contact.phone){
			$("#poi-button-phone").removeClass("ui-disabled");
			$("#poi-info-phone").text(poi.contact.phone);
		}
		
		// Add break character and disable button
		else{
			$("#poi-button-phone").addClass("ui-disabled");
			$("#poi-info-phone").text(String.fromCharCode(160));
		}
		
		
		// If android then use default plugin to launch native navi!
		if(KU.isAndroid){
			
			
			// Setup click to use android navigator
			$("#poi-button-directions").click(function(){
			
				navigator.google_navigate.navigate(poi.location.lat + "," 
						+ poi.location.lng, function() {}, function(errMsg) {});
			});
			
			// Blank link (not needed thanks to android navigator)
			$("#poi-button-directions").attr('href', " ");
		}
		
		// If iOS then use maps protocol!
		else if (KU.isIOS){
		
			$("#poi-button-directions").attr('href', "maps:daddr=" 
						+ poi.location.lat + "," + poi.location.lng);
		}
		
		// Windows phone and other default!
		else{
		
			
			$("#poi-button-directions").attr('href', "geo:" 
						+ poi.location.lat + "," + poi.location.lng);
		}
		
		// Setup tel protocol link for phone
		if(poi.contact.phone){
			
			$("#poi-button-phone").attr('href', "tel:" + poi.contact.phone);
		}
		
		// Remove characters from formatted phone if needed
		else if (poi.contact.formattedPhone){
		
			$("#poi-button-phone").attr('href', "tel:" + poi.contact.formattedPhone.replace(/[^0-9]+/g, ""));
		}
		
		// Clear link if needed
		else{
			$("#poi-button-phone").attr('href', "");
		}
		
		
	},
 
 
 
 	/******************************************************************************/
	/**  Initialize the leaflet map with category data and list
	 ******************************************************************************/
	initializeMap: function(){

	
		// Setup category data as an empty array of empty objects
		for(var i = 0; i < this.categoriesList.length; i++){
		
			this.categoryData[i] = {"name":this.categoriesList[i].name, 
								"serializeID": KU.Map.serializeID, "date": 0, "pois":[]};
		
		}

					 
		// Make map
		KU.Map.map = L.map('map_view');
		 
		// Setup layer and zoom
		L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			maxZoom: 18,
			minZoom: 6,
			attribution: 'Map data &copy; <a href="http://openstreetmap.org/">OpenStreetMap</a> | ' +'Places powered by <a href="http://foursquare.com/">Foursquare</a>'
		}).addTo(KU.Map.map);
		
		// Setup center and default zoom
		KU.Map.map.setView(KU.Map.center, 16, {reset:true});

		// Resize the map!
		// Note: this seems to need to be in a timeout function
		// most likely so it is called by a ~anonymous caller.
		setTimeout(function(){
			KU.Map.map.invalidateSize();
		},0);
		
		
		// Bind location events
		KU.Map.map.locate({watch: true})
			.on('locationfound', KU.Map.locationFound)
			.on('locationerror', function(e){
		
				// Do nothing!
		});
	
		// Bind map click event
		KU.Map.map.on('click', KU.Map.mapClickEvent);
	
		// Clear markers
		this.clearMarkers();
	}
	
	
	
};
