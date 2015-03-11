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
 *  Contains all map related functions for loading and controlling the
 *  map page.
 *
 *  @class KUMobile.Map
 ******************************************************************************/
KUMobile.Map = {
	
	
    /******************************************************************************
     *  The leaflet map object
     *
     *  @attribute map
     *  @type {Object}
     *  @for KUMobile.Map
     *  @default null
     ******************************************************************************/
	map: null,


    /******************************************************************************
     *  The latest user location (if any). 
     *
     *  @attribute userLocation
     *  @type {Object}
     *  @for KUMobile.Map
     *  @default null
     ******************************************************************************/
	userLocation: null,
	
	
	/******************************************************************************
     *  Tells whether or not map is currently attempting to download
	 *  or parse article lists. Essentially used to tell whether map is
	 *  considered to be busy. 
     *
     *  @attribute loading
     *  @type {boolean}
     *  @for KUMobile.Map
     *  @default false
     ******************************************************************************/
	loading: false,
	
	
	/******************************************************************************
     *  Starting center of the map as a coordinate array. 
     *
     *  @attribute START_CENTER
     *  @type {Array}
     *  @for KUMobile.Map
     *  @default [43.013070, -83.713853]
     ******************************************************************************/
	START_CENTER: [43.013070, -83.713853],
    

    /******************************************************************************
     *  List of POI categories (order that they will be downloaded in) containing the
	 *  corresponding foursquare ID's. 
     *
     *  @attribute CATEGORIES_LIST 
     *  @type {Array}
     *  @for KUMobile.Map
     ******************************************************************************/
	CATEGORIES_LIST: [{"name":"Food","id":"4d4b7105d754a06374d81259","icon":"fastfood.png"},
					 {"name":"Entertainment","id":"4d4b7104d754a06370d81259","icon":"theater.png"},
					 {"name":"Shop/Services","id":"5267e446e4b0ec79466e48c4,4bf58dd8d48988d116951735,4bf58dd8d48988d127951735,52f2ab2ebcbc57f1066b8b43,52f2ab2ebcbc57f1066b8b32,52f2ab2ebcbc57f1066b8b40,52f2ab2ebcbc57f1066b8b42,4bf58dd8d48988d115951735,4bf58dd8d48988d1f1941735,4bf58dd8d48988d114951735,4bf58dd8d48988d11a951735,4eb1bdf03b7b55596b4a7491,4bf58dd8d48988d117951735,4eb1c1623b7b52c0e1adc2ec,4f04ae1f2fb6e1c99f3db0ba,52f2ab2ebcbc57f1066b8b2a,52f2ab2ebcbc57f1066b8b31,52f2ab2ebcbc57f1066b8b3b,4bf58dd8d48988d103951735,52f2ab2ebcbc57f1066b8b18,4d954b0ea243a5684a65b473,4bf58dd8d48988d10c951735,52f2ab2ebcbc57f1066b8b17,4f4532974b9074f6e4fb0104,4bf58dd8d48988d1f6941735,4bf58dd8d48988d1f4941735,52dea92d3cf9994f4e043dbb,52f2ab2ebcbc57f1066b8b1a,4bf58dd8d48988d10f951735,52f2ab2ebcbc57f1066b8b1d,5032872391d4c4b30a586d64,4bf58dd8d48988d122951735,52f2ab2ebcbc57f1066b8b26,503287a291d4c4b30a586d65,52f2ab2ebcbc57f1066b8b3a,52f2ab2ebcbc57f1066b8b16,4bf58dd8d48988d1f7941735,4bf58dd8d48988d11b951735,4bf58dd8d48988d1f9941735,52f2ab2ebcbc57f1066b8b24,52f2ab2ebcbc57f1066b8b1c,4bf58dd8d48988d1f8941735,4bf58dd8d48988d18d941735,4eb1c0253b7b52c0e1adc2e9,4bf58dd8d48988d128951735,52f2ab2ebcbc57f1066b8b19,4bf58dd8d48988d112951735,52f2ab2ebcbc57f1066b8b2c,4bf58dd8d48988d1fb941735,50aaa5234b90af0d42d5de12,52f2ab2ebcbc57f1066b8b36,4bf58dd8d48988d1f0941735,4bf58dd8d48988d111951735,52f2ab2ebcbc57f1066b8b25,52f2ab2ebcbc57f1066b8b33,4bf58dd8d48988d1fc941735,52f2ab2ebcbc57f1066b8b3f,52f2ab2ebcbc57f1066b8b2b,52f2ab2ebcbc57f1066b8b1e,52f2ab2ebcbc57f1066b8b38,52f2ab2ebcbc57f1066b8b29,4bf58dd8d48988d1fd941735,52c71aaf3cf9994f4e043d17,50be8ee891d4fa8dcc7199a7,52f2ab2ebcbc57f1066b8b3c,52f2ab2ebcbc57f1066b8b27,4bf58dd8d48988d1ff941735,4f04afc02fb6e1c99f3db0bc,5032833091d4c4b30a586d60,4bf58dd8d48988d1fe941735,4f04aa0c2fb6e1c99f3db0b8,4f04ad622fb6e1c99f3db0b9,4d954afda243a5684865b473,52f2ab2ebcbc57f1066b8b2f,52f2ab2ebcbc57f1066b8b22,52f2ab2ebcbc57f1066b8b35,4bf58dd8d48988d121951735,52f2ab2ebcbc57f1066b8b34,52f2ab2ebcbc57f1066b8b23,5032897c91d4c4b30a586d69,4bf58dd8d48988d100951735,4eb1bdde3b7b55596b4a7490,52f2ab2ebcbc57f1066b8b20,52f2ab2ebcbc57f1066b8b3d,52f2ab2ebcbc57f1066b8b28,5032885091d4c4b30a586d66,4bf58dd8d48988d10d951735,52f2ab2ebcbc57f1066b8b37,4f4531084b9074f6e4fb0101,4bf58dd8d48988d110951735,52f2ab2ebcbc57f1066b8b1f,52f2ab2ebcbc57f1066b8b39,4bf58dd8d48988d123951735,52f2ab2ebcbc57f1066b8b41,52f2ab2ebcbc57f1066b8b1b,4bf58dd8d48988d1ed941735,4bf58dd8d48988d1f2941735,52f2ab2ebcbc57f1066b8b21,4f04b1572fb6e1c99f3db0bf,5032781d91d4c4b30a586d5b,4d1cf8421a97d635ce361c31,4bf58dd8d48988d1de931735,4bf58dd8d48988d101951735,4bf58dd8d48988d1f3941735,4f04b08c2fb6e1c99f3db0bd,52f2ab2ebcbc57f1066b8b30,4bf58dd8d48988d10b951735,4bf58dd8d48988d126951735,52e816a6bcbc57f1066b7a54,52f2ab2ebcbc57f1066b8b2e","icon":"mall.png"},
					 {"name":"Bank","id":"4bf58dd8d48988d10a951735,52f2ab2ebcbc57f1066b8b56,52f2ab2ebcbc57f1066b8b2d,5032850891d4c4b30a586d62","icon":"bank.png"},
					 {"name":"Gas Station","id":"4bf58dd8d48988d113951735","icon":"fillingstation.png"},
					 {"name":"Automotive Repair","id":"4bf58dd8d48988d124951735,52f2ab2ebcbc57f1066b8b44","icon":"carrepair.png"},
					 {"name":"Fitness","id":"4bf58dd8d48988d175941735","icon":"weights.png"},
					 {"name":"Bar","id":"4d4b7105d754a06376d81259","icon":"bar_coktail.png"},
					 {"name":"Travel","id":"4bf58dd8d48988d1ed931735,4bf58dd8d48988d12d951735,4bf58dd8d48988d1fe931735,4bf58dd8d48988d130951735,4bf58dd8d48988d129951735","icon":"busstop.png"},
					 {"name":"Emergency","id":"4bf58dd8d48988d12e941735,4bf58dd8d48988d104941735,4bf58dd8d48988d12c941735","icon":"ambulance.png"},
					 {"name":"Fast Food","id":"4bf58dd8d48988d16e941735","icon":"fastfood.png"}],
	
    
	/******************************************************************************
     *  Stores the data for each POI category.
     *
     *  @attribute categoryData 
     *  @type {Array}
     *  @for KUMobile.Map
     ******************************************************************************/
	categoryData: [],
	
	
	/******************************************************************************
     *  All current POI markers that are currently added to the map. 
     *
     *  @attribute markers
     *  @type {Array}
     *  @for KUMobile.Map
     ******************************************************************************/	
	markers: [],
	
	
    /******************************************************************************
     *  Contains the last timeout call sent. This allows us to restart the timeout if
	 *  the user re-searches in any way (dropdown, or searchbar). The major benefit
	 *  of this is that it gives us the feeling of incremental searching, e.g we send
	 *  a timeout of some milliseconds whenever the KEY_UP event triggers, as well
	 *  as cancelling out the last timeout we sent. 
     *
     *  @attribute sentTimeout
     *  @type {Object}
     *  @for KUMobile.Directory
     *  @private
     ******************************************************************************/
	sentTimeout: null,
	
	
	/******************************************************************************
     *  Southwest latitude for map's bounding box. Essentially most southwest
	 *  latitude for POI's we are concerned with to show the user.
     *
     *  @attribute BB_SWLAT
     *  @type {float}
     *  @for KUMobile.Map
     *  @default 42.97513915795521
     ******************************************************************************/
	BB_SWLAT: 42.97513915795521,
	
	
	/******************************************************************************
     *  Southwest longitude for map's bounding box. Essentially most southwest
	 *  longitude for POI's we are concerned with to show the user.
     *
     *  @attribute BB_SWLNG
     *  @type {float}
     *  @for KUMobile.Map
     *  @default -83.77864837646484
     ******************************************************************************/
	BB_SWLNG: -83.77864837646484,
	
	
	/******************************************************************************
     *  Northeast latitude for map's bounding box. Essentially most northeast
	 *  latitude for POI's we are concerned with to show the user. 
     *
     *  @attribute BB_NELAT
     *  @type {float}
     *  @for KUMobile.Map
     *  @default 43.05107777204538
     ******************************************************************************/
	BB_NELAT: 43.05107777204538,
	
	
	/******************************************************************************
     *  Northeast longitude for map's bounding box. Essentially most northeast
	 *  longitude for POI's we are concerned with to show the user.
     *
     *  @attribute BB_NELNG
     *  @type {float}
     *  @for KUMobile.Map
     *  @default -83.64904403686523
     ******************************************************************************/
	BB_NELNG: -83.64904403686523,
	
	
    /******************************************************************************
     *  The index related to categories for which we are currently downloading or
	 *  importing from a cached session.
     *
     *  @attribute downloadIndex
     *  @type {int}
     *  @for KUMobile.Map
     *  @private
     ******************************************************************************/
	downloadIndex: 0,
	
    
	/******************************************************************************
     *  The 'version' of how we save map data to local filesystem. Whenever the
	 *  structure of this changes, we must change the serialized ID. When we notice
     *  the ID change a new download will be triggered!
     *
     *  @attribute SERIALIZE_ID
     *  @type {int}
     *  @for KUMobile.Map
     *  @default 3
     ******************************************************************************/
	SERIALIZE_ID: 3,
	
	
	/******************************************************************************
     *  Represents the last value the user has searched for from the free text field
     *  search bar located on the map page. 
     *
     *  @attribute lastValue
     *  @type {string}
     *  @for KUMobile.Map
     *  @default ""
     ******************************************************************************/
	lastValue: "",
	
	
	/******************************************************************************
     *  Wait time for incremental searching. This distinguishes how long to wait 
	 *  after the user has searched something, before we assume they are done typing.
     *
     *  @attribute INCR_WAIT_TIME
     *  @type {int}
     *  @for KUMobile.Map
     *  @default 850
     ******************************************************************************/
	INCR_WAIT_TIME: 850,
	

	/******************************************************************************
     *  This is the minimum time that needs to have passed in order to allow for 
	 *  another foursquare update to both the map and local filesystem.
     *
     *  @attribute MIN_UPDATE_MS
     *  @type {int}
     *  @for KUMobile.Map
     *  @default 86400000
     ******************************************************************************/
	MIN_UPDATE_MS: 86400000,
	
	
	/******************************************************************************
     *  File template for local storage of foursquare map data for each category.
	 *  E.g for saving food it would be MAP_DATA_Food filename.
     *
     *  @attribute MAP_FILE_TEMPLATE
     *  @type {string}
     *  @for KUMobile.Map
     *  @default "MAP_DATA_"
     ******************************************************************************/
	MAP_FILE_TEMPLATE: "MAP_DATA_",
	
	
	/******************************************************************************
     *  Enables debug messages via alert messages. Do NOT enable this unless there
	 *  are legitimate problems with plugins (not available to debug via browser).
     *
     *  @attribute debug
     *  @type {boolean}
     *  @for KUMobile.Map
     *  @private
     ******************************************************************************/
	debug: false,
	
	
	/******************************************************************************
     *  Is the footer showing? The footer contains the POI details and starts off
	 *  hidden. It is only shown when the user clicks on the POI or searches.
     *
     *  @attribute footerVisible
     *  @type {boolean}
     *  @for KUMobile.Map
     *  @default false
     ******************************************************************************/
	footerVisible: false,
	
	
    /******************************************************************************
     *  Contains the selected marker. This is useful to store so we can easily
	 *  disable the markers selection. 
     *
     *  @attribute selectedMarker
     *  @type {Object}
     *  @for KUMobile.Map
     *  @default null
     ******************************************************************************/
	selectedMarker: null,
	
    
    /******************************************************************************
     *  Full POI data for a category. 
     *
     *  @class KUMobile.Map.POICategory
     ******************************************************************************/
    POICategory: function(name, serializeID, date, pois, icon){

        
        /******************************************************************************
         *  Name of the POI category 
         *
         *  @attribute name
         *  @type {string}
         *  @for KUMobile.Map.POICategory
         ******************************************************************************/
        this.name = name;

        
        /******************************************************************************
         *  Serialized ID of the app when the data was downloaded. 
         *
         *  @attribute serializeID
         *  @type {int}
         *  @for KUMobile.Map.POICategory
         ******************************************************************************/
        this.serializeID = serializeID;

        
        /******************************************************************************
         *  Date integer in milliseconds.
         *
         *  @attribute date
         *  @type {int}
         *  @for KUMobile.Map.POICategory
         ******************************************************************************/
        this.date = date;

        
        /******************************************************************************
         *  List of all POIs for the category. The array type is a foursquare POI item
         *  based on their venue search API. 
         *
         *  @attribute pois
         *  @type {Array}
         *  @for KUMobile.Map.POICategory
         ******************************************************************************/
        this.pois = pois;

        
        /******************************************************************************
         *  Icon name to be used as the map marker 
         *
         *  @attribute icon
         *  @type {string}
         *  @for KUMobile.Map.POICategory
         ******************************************************************************/
        this.icon = icon;
        
    },
    
	
    /******************************************************************************
     *  Triggered when the map page is first initialized based on jQuery Mobile
     *  pageinit event. 
     *
     *  @event pageInit
     *  @for KUMobile.Map
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
			KUMobile.Map.initializeMap();
			KUMobile.Map.readPOIData();
		},0);
		
	},
    
    
	/******************************************************************************
     *  Triggered when the map page is first created based on jQuery Mobile
     *  pagecreate event. This is called after the page itself is created but 
     *  before any jQuery Mobile styling is applied.
	 *
     *  @event pageCreate
     *  @for KUMobile.Map
     ******************************************************************************/
	pageCreate: function(event){
	
		// Trigger for direct change in search box
		$("#map-search").bind("change", KUMobile.Map.directChange);
		
		// Trigger for incremental change in search box
		$("#map-search").keyup(KUMobile.Map.incrementalChange);
		
		// Resize and get first page for overflow
		$(window).trigger("resize");
		
	},
	
	
    /******************************************************************************
     *  Triggered when the user does a key up event in order to simulate incremental
	 *  searching for the attached search bar. 
	 *
     *  @event incrementalSearch
     *  @for KUMobile.Map
     ******************************************************************************/
	incrementalChange: function() {

		// Definitely a change?
		if(this.value != KUMobile.Map.lastValue){
		
			// Store value
			KUMobile.Map.lastValue = this.value;
		
			// Clear timeout
			if(KUMobile.Map.sentTimeout) clearTimeout(KUMobile.Map.sentTimeout);
			
			KUMobile.Map.sentTimeout = setTimeout(function(latestValue){
				
				// Definitely not a change?
				if(latestValue == KUMobile.Map.lastValue){
					
					// Save new value, reinit, download
					KUMobile.Map.filterMap();
				}
				
				
			}, KUMobile.Map.INCR_WAIT_TIME, this.value);
		}
	},
	
	
    /******************************************************************************
     *  Triggered when the user does a direct change. The direct change includes 
	 *  typing then changing focus or pressing the clear button. This is redundant
	 *  to the incremental search event, *except for the clear button!!*
	 *
     *  @event directSearch
     *  @for KUMobile.Map
     ******************************************************************************/
	directChange: function(e,u){
			
		// Definitely a change?
		if(this.value != KUMobile.Map.lastValue){
		
			// Clear timeout
			if(KUMobile.Map.sentTimeout) clearTimeout(KUMobile.Map.sentTimeout);
			
			// Change last value and filter
			KUMobile.Map.lastValue = this.value;
			KUMobile.Map.filterMap();
			
		}
	},
	
	
    /******************************************************************************
     *  Removes all markers from the map and then clears them from the array.
	 *
     *  @method clearMarkers
     *  @for KUMobile.Map
     *  @example
     *      KUMobile.Map.clearMarkers();
     ******************************************************************************/
	clearMarkers: function(){
		
        // Delete each marker from map
        for(var index = 0; index < this.markers.length; index++){
            
            this.map.removeLayer(this.markers[index]);
        }
		
		// Setup new array!
		this.markers = [];
	},
	
    
    /******************************************************************************
     *  User has clicked the map. We can use this as a way to exit the footer! Then
	 *  also deselect the marker
	 *
     *  @event mapClick
     *  @for KUMobile.Map
     ******************************************************************************/	
	mapClick: function(e){
			
        // Is the footer showing?
		if(KUMobile.Map.footerVisible){
		
            // Deslect marker
			if(KUMobile.Map.selectedMarker != null) KUMobile.Map.deselectMarker();
			
            // Hide footer
            KUMobile.Map.footerVisible = false;
			$('#poi-info').hide();
		}
		
	},
	
	
	/******************************************************************************
     *  User's location was found! Add it to the map as a blue circle including
	 *  an accuracy circle.
	 *
     *  @event locationfound
     *  @for KUMobile.Map
     ******************************************************************************/
	locationFound: function(e){
		
		// Remove user location if it exists there
		if(KUMobile.Map.userLocation) KUMobile.Map.map.removeLayer(KUMobile.Map.userLocation);
		if(KUMobile.Map.userAccuracy) KUMobile.Map.map.removeLayer(KUMobile.Map.userAccuracy);
		
		// Add Accuracy
		KUMobile.Map.userAccuracy = L.circle([e.latitude, e.longitude],e.accuracy/2,{
			stroke:true,
			weight:1,
			opacity:.2,
			fillColor: '#519ad1',
			fillOpacity: .1,
		}).addTo(KUMobile.Map.map);
		
		
		// Make custom icon
		var customIcon = L.icon({
			iconUrl: 'img/map-icons/blue_ball.png',
			iconSize:     [22, 22], // size
			iconAnchor:   [11, 11]  // anchor 
		});
	
	
		// Add location the map
		KUMobile.Map.userLocation = L.marker([e.latitude, e.longitude], {icon: customIcon})
            .addTo(KUMobile.Map.map).bindPopup('<b>You are here</b>!');
	
	},
	
	
	/******************************************************************************
     *  Updates POI data for every category in the category list. 
	 *
     *  @method updatePOIData
     *  @for KUMobile.Map
     *  @example
     *      // Update POIs
     *      KUMobile.Map.updatePOIData();
     ******************************************************************************/
	 updatePOIData: function(){
		
		// Current category
		var category = this.CATEGORIES_LIST[this.downloadIndex].id;
		
		// Box for URL calls
		var box = "&sw=" + this.BB_SWLAT + "," + this.BB_SWLNG 
			+ "&ne=" + this.BB_NELAT + "," + this.BB_NELNG;
		
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
				var category = KUMobile.Map.categoryData[KUMobile.Map.downloadIndex];
		
				// Is result valid?
				if(result != null && result.response != null && result.response.venues != null){
					
					// Make new object then save date!
					category = new KUMobile.Map.POICategory(
                        KUMobile.Map.CATEGORIES_LIST[KUMobile.Map.downloadIndex].name, 
                        KUMobile.Map.SERIALIZE_ID, (new Date()).getTime(), [], 
                        KUMobile.Map.CATEGORIES_LIST[KUMobile.Map.downloadIndex].icon
                    );
					
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

					// Only save data if you are on iOS or Android device
					if(KUMobile.Config.isAndroid || KUMobile.Config.isIOS){
						
						var categoryStr = JSON.stringify(category);
						
						// Successful write?
						var success = function(){
							
							if(KUMobile.Map.debug) alert("Saved successfully");
							
							// Get next POI category
							KUMobile.Map.downloadIndex++;
							KUMobile.Map.readPOIData();
						};
						
						// Failure write?
						var fail = function(errorcode){
						
							if(KUMobile.Map.debug) alert(KUMobile.Map.downloadIndex + " Save failed");
							
							// Get next POI category
							KUMobile.Map.downloadIndex++;
							KUMobile.Map.readPOIData();
						};
						
						// Save category to memory and file
						fileName = KUMobile.Map.MAP_FILE_TEMPLATE + category.name;
                        fileName = fileName.replace(/[^a-z0-9_-]/gi, '_');
						KUMobile.Map.categoryData[KUMobile.Map.downloadIndex] = category;
						KUMobile.FileIO.writeToFile(fileName, categoryStr, success, fail);
						
					}
					
					// Not a device
					else{
						
						// Save category to memory
						KUMobile.Map.categoryData[KUMobile.Map.downloadIndex] = category;
						
						// Get next POI category
						KUMobile.Map.downloadIndex++;
						KUMobile.Map.readPOIData();
					
					}
				}
				
				// Failed to download AND there is no fallback data to use.. 
                // Nothing left to do but error and alert user
				else if(category == null){
				
					// Tell user about error loading from file AND downloading
					/* alert("There was an issue loading " 
                        + KUMobile.Map.CATEGORIES_LIST[KUMobile.Map.downloadIndex].name 
						+ ".\nPlease try again later.");
                        
                    */
					
					// Get next POI category
					KUMobile.Map.downloadIndex++;
					KUMobile.Map.readPOIData();
				}
				
				// Fallback data is already in place for this category
				// move on to next one and try to update next time we load.
				else{
				
					// Get next POI category
					KUMobile.Map.downloadIndex++;
					KUMobile.Map.readPOIData();
				}
                
			},
			
			error: function(data){
				
                // Error downloading AND no fallback data to use
				if(KUMobile.Map.categoryData[KUMobile.Map.downloadIndex] == null){
				
					// Tell user about error loading from file AND downloading
					/* alert("There was an issue loading " 
                        + KUMobile.Map.CATEGORIES_LIST[KUMobile.Map.downloadIndex].name 
						+ ".\nPlease try again later.");
					*/
				}
				
				// Move on anyways
				KUMobile.Map.downloadIndex++;
				KUMobile.Map.readPOIData();    
			}
            
		});
	
	},
 
 
	/******************************************************************************
     *  Reads POI's from local file system. Note that if this fails, we will 
     *  attempt to download the failed category!
	 *
     *  @method readPOIData
     *  @for KUMobile.Map
     *  @example
     *      // Update POIs
     *      KUMobile.Map.readPOIData();
     ******************************************************************************/
	readPOIData: function(){
		
        
		// Started?
		if(this.downloadIndex == 0){
		
			// Disable searching
			$("#map-search").addClass("ui-disabled");
			KUMobile.showLoading("map-header");
		}
		
		// All done?
		else if(this.downloadIndex < 0 || this.downloadIndex >= this.CATEGORIES_LIST.length){
			
            
			// All done with categories!
			$("#map-search").removeClass("ui-disabled");
            KUMobile.hideLoading("map-header");
			KUMobile.Map.loading = false;
			KUMobile.Map.filterMap();
			return;
            
		}
		
		//  Device? Then check for cached data
		if(KUMobile.Config.isDevice){
            
            // File name
			var fileName = KUMobile.Map.MAP_FILE_TEMPLATE 
                + KUMobile.Map.CATEGORIES_LIST[KUMobile.Map.downloadIndex].name;
            fileName = fileName.replace(/[^a-z0-9_-]/gi, '_')
            
            // Check the file system
            KUMobile.FileIO.readFromFile(fileName, 
                KUMobile.Map.readPOI_Success, KUMobile.Map.readPOI_Fail);
		}
		
		// Simply update the next POI
		else{
		
			KUMobile.Map.updatePOIData();
		}
		
	},
	
	
	/******************************************************************************
     *  Triggered after a successful read of POI file. 
	 *
     *  @event readPOI_Success
     *  @for KUMobile.Map
     ******************************************************************************/	
	readPOI_Success: function(result){
		
		// Parse result
		try{ category = JSON.parse(result); }
		catch(e){ category = null; }
		
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
				&& serial == KUMobile.Map.SERIALIZE_ID){

				// Date is not due, pois are reasonable length
				if((date + KUMobile.Map.MIN_UPDATE_MS) > currentDate && pois.length > 5){
				
					if(KUMobile.Map.debug) alert("Read Category " + KUMobile.Map.downloadIndex);
					
					// Store category!
					KUMobile.Map.categoryData[KUMobile.Map.downloadIndex] = category;
					KUMobile.Map.downloadIndex++;
					KUMobile.Map.readPOIData();
				
				}
				
				// New date needs to be saved
				else{
					
					if(KUMobile.Map.debug) alert("Need a new update! " + KUMobile.Map.downloadIndex);
					
					// Fallback is old data!
					KUMobile.Map.categoryData[KUMobile.Map.downloadIndex] = category;
					KUMobile.Map.updatePOIData();
					
				}
			}		
			
			// Invalid or out of date category
			else{
				
				// Debug
				if(KUMobile.Map.debug) {
					alert("Date " + (date != null)
                        + " serial " + (serial != null)
                        + " pois " +  (pois != null)
                        + " same serial " +  (serial == KUMobile.Map.SERIALIZE_ID)
                        + " kuserial " + (KUMobile.Map.SERIALIZE_ID));
					alert("Couldn't read " + KUMobile.Map.downloadIndex);
				}
				
				// Update!
				KUMobile.Map.updatePOIData();
			}
		}
		
		// Invalid
		else{
			
			if(KUMobile.Map.debug) alert("Couldn't read " + KUMobile.Map.downloadIndex);
			
			// Update!
			KUMobile.Map.updatePOIData();
		}
		
	},
	
	
	/******************************************************************************
     *  Triggered after a failed read of POI file.  
	 *
     *  @event readPOI_Fail
     *  @for KUMobile.Map
     ******************************************************************************/
	readPOI_Fail: function(errorcode){
		
        // Debug
		if(KUMobile.Map.debug) alert("Failed to read " + KUMobile.Map.downloadIndex);
		
		// Download needed
		KUMobile.Map.updatePOIData();
	},
	
	
    /******************************************************************************
     *  Filters the map POI's to only add markers that the user searched for!
	 *
     *  @method filterMap
     *  @for KUMobile.Map
     *  @example
     *      // Filter!
     *      KUMobile.Map.filterMap();
     ******************************************************************************/
	filterMap: function(){

		
		// Hide poi info footer
		$('#poi-info').hide();
		KUMobile.Map.footerVisible = false;
        
        // Clear
		this.clearMarkers();
	
		// Don't bother showing everything
        // this is too many points
		if(this.lastValue == "") return;
		
		// All  POI categories
		for(var index = 0; index < this.categoryData.length - 1; index++){
		
            // Add POIs for the category data
			this.addPOIs(this.categoryData[index]);
            
            // Add the last index whenever the first is added
            // this is done because the categories food and fast food
            // are related but their data must be kept separate because of 
            // foursquare limits per call.
			if(index == 0) this.addPOIs(this.categoryData[this.categoryData.length - 1]);
		}

		
        // No markers? Then no need to zoom
		if(this.markers.length <= 0) return;
		
		// Get starting point 
		var user = (KUMobile.Map.userLocation)
            ? KUMobile.Map.userLocation.getLatLng() 
            : L.latLng(KUMobile.Map.START_CENTER[0], KUMobile.Map.START_CENTER[1]);
		
		// Is user location outside of range?
		if(user.lat > KUMobile.Map.BB_NELAT || user.lat < KUMobile.Map.BB_SWLAT 
            || user.lng > KUMobile.Map.BB_NELAT || user.lng < KUMobile.Map.BB_SWLNG){
			
			// Force kettering's location
			user = L.latLng(KUMobile.Map.START_CENTER[0], KUMobile.Map.START_CENTER[1]);
		}
		
        // Initialize the nearest POI, distance and marker!
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
			KUMobile.Map.map.setView(L.latLng(nearestPOI.lat - .0014, nearestPOI.lng), 16);
			KUMobile.Map.deselectMarker();
			
			
            // Create icon 
			var selectedIcon = L.icon({
				iconUrl: 'img/map-icons/' + nearestMarker.icon.replace('.png','-selected.png'),
				iconSize:     [25, 29], // size of the icon
				iconAnchor:   [12, 29]  // point of the icon which will correspond to marker's location
			});
			
            // Open the POI info box and store selected marker
			KUMobile.Map.showPOIDetails(nearestMarker.poi);			
			KUMobile.Map.selectedMarker = {'marker': nearestMarker, 'icon': nearestMarker.icon};
			nearestMarker.setIcon(selectedIcon);
		}
	},
	
	
    /******************************************************************************
     *  Add POI's of a certain category to the map if it is a match with the 
	 *  user's input through the search bar.
	 *
     *  @method addPOIs
     *  @param {KUMobile.Map.POICategory} category - the category data containing 
     *          the POIs to be searched through and added upon match
     *  @for KUMobile.Map
     *  @example
     *      // Add matching POIs
     *      KUMobile.Map.addPOIs(categoryData);
     ******************************************************************************/
	addPOIs: function(category){
		
		// Don't bother if the category is null...
		if(category == null) return;
		
		// All POI's in category
		for(var index = 0; index < category.pois.length; index++){
		
			var current = category.pois[index];
			var icon = category.icon;
			
			// Create a custom leaflet icon
			var customIcon = L.icon({
				iconUrl: 'img/map-icons/' + icon,
				iconSize:     [25, 29], // size of the icon
				iconAnchor:   [12, 29], // point of the icon which will correspond to marker's location
			});
			
			
			var categorylist = "";
		
			// Compile categories from array to a string
            // this list is needed to display POI info
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
				var tempMarker = L.marker(
                    [current.location.lat, current.location.lng],
                    {icon: customIcon}
                )
                
                // Setup click handler
                tempMarker.on('click', KUMobile.Map.markerClick);
				
				// Store its icon and poi info
				tempMarker.icon = icon;
				tempMarker.poi = current;
				
				// Start off assuming that the icon is not redundant 
				// (not already on the map from a different category)
				var nonRedundent = true;
				
				// Check to see if marker already exists in this location					
				for(var i = 0; i < KUMobile.Map.markers.length; i++){
				
                    // Check redundancy 
					nonRedundent = !(KUMobile.Map.markers[i].getLatLng().equals(tempMarker.getLatLng()) 
                        && KUMobile.Map.markers[0].poi.name == tempMarker.poi.name); 
                        
                    // Already exist?
                    // No need to keep going
					if(!nonRedundent) break;
				}
				
				
				// POI does not already exist in the list?
				if(nonRedundent){
					
                    // Add !
					tempMarker.addTo(KUMobile.Map.map);
					KUMobile.Map.markers[KUMobile.Map.markers.length] = tempMarker;
				}
			}
		}
	
	},
 

    /******************************************************************************
     *  Triggered when the user clicks on a POI marker. 
	 *
     *  @event markerClick
     *  @for KUMobile.Map
     ******************************************************************************/
    markerClick: function(e) {
						
        // Deselect if another POI is selected
        if(KUMobile.Map.selectedMarker != null){
            
            KUMobile.Map.deselectMarker();
        }
        
        // Find correct marker
        for(var i = 0; i < KUMobile.Map.markers.length; i++){
            if(KUMobile.Map.markers[i].getLatLng() === e.latlng){
                
                var selectedIcon = L.icon({
                    iconUrl: 'img/map-icons/' + KUMobile.Map.markers[i].icon.replace('.png','-selected.png'),
                    iconSize:     [25, 29], // size of the icon
                    iconAnchor:   [12, 29], // point of the icon which will correspond to marker's location
                });
                
                // Open POI!
                KUMobile.Map.showPOIDetails(KUMobile.Map.markers[i].poi);
                KUMobile.Map.markers[i].setIcon(selectedIcon);
                KUMobile.Map.selectedMarker = {'marker': KUMobile.Map.markers[i], 'icon': KUMobile.Map.markers[i].icon};
                
                // No need to keep searching
                break;
            }
        }
    },
 
 
    /******************************************************************************
     *  Deselects the currently selected marker from the map. Basically it only
	 *  switches the icon back to the 'non-selected' icon. 
	 *
     *  @event markerClick
     *  @for KUMobile.Map
     ******************************************************************************/
    deselectMarker: function(){
	
        // Nothing to deselect?
		if(KUMobile.Map.selectedMarker == null) return;
	
		var deselectedIcon = L.icon({
			iconUrl: 'img/map-icons/' + KUMobile.Map.selectedMarker.icon,
			iconSize:     [25, 29], 	// size of the icon
			iconAnchor:   [12, 29], 	// point of the icon which will correspond to marker's location
		});
	
		// Revert latest marker
		KUMobile.Map.selectedMarker.marker.setIcon(deselectedIcon);
		KUMobile.Map.selectedMarker = null;
	},
 
 
    /******************************************************************************
     *  Shows the footer with POI detail information at the bottom of the map.
	 *  
     *  @method showPOIDetails
     *  @param {Object} poi - the point of interest as returned through foursquare
     *          venue search API
     *  @for KUMobile.Map
     *  @example
     *      // Show POI details
     *      KUMobile.Map.showPOIDetails(poi)
     ******************************************************************************/
	showPOIDetails: function(poi){
	
		// Redo the sizing information since the page is technically changing size
		// and structure with the new footer being shown (only really needed if user
		// is switching between perspectives often).
		$(window).trigger("throttleresize");
		
		// Show footer if needed
		if(!KUMobile.Map.footerVisible){
			KUMobile.Map.footerVisible = true;
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
				
			$("#poi-info-address").text(
                poi.location.address + ", " 
                +  poi.location.city + " " 
                + poi.location.state
            );
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
		if(KUMobile.Config.isAndroid){
			
			
			// Setup click to use android navigator
			$("#poi-button-directions").click(function(){
			
				navigator.google_navigate.navigate(poi.location.lat + "," 
						+ poi.location.lng, function() {}, function(errMsg) {});
			});
			
			// Blank link (not needed thanks to android navigator)
			$("#poi-button-directions").attr('href', " ");
		}
		
		// If iOS then use maps protocol!
		else if (KUMobile.Config.isIOS){
		
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
 
 
    /******************************************************************************
     *  Initialize the leaflet map with category data, list and basic settings.
	 *  
     *  @method initializeMap
     *  @for KUMobile.Map
     *  @example
     *      // Initialize leaflet map
     *      KUMobile.Map.initializeMap();
     ******************************************************************************/ 
	initializeMap: function(){

    
		// Make map
		KUMobile.Map.map = L.map('map_view');
		 
		// Setup layer and zoom
		L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			maxZoom: 18,
			minZoom: 6,
			attribution: 'Map data &copy; <a href="http://openstreetmap.org/">OpenStreetMap</a> | ' 
                + 'Places powered by <a href="http://foursquare.com/">Foursquare</a>'
		}).addTo(KUMobile.Map.map);
		
		// Setup center and default zoom
		KUMobile.Map.map.setView(KUMobile.Map.START_CENTER, 16, {reset:true});

		// Resize the map!
		// Note: this seems to need to be in a timeout function
		// most likely so it is called by a ~anonymous caller.
		setTimeout(function(){
			KUMobile.Map.map.invalidateSize();
		},0);
		
		
		// Bind location events
		KUMobile.Map.map.locate({watch: true})
			.on('locationfound', KUMobile.Map.locationFound)
			.on('locationerror', function(e){
                
                /* Do nothing! */
		});
	
		// Bind map click event
		KUMobile.Map.map.on('click', KUMobile.Map.mapClick);
	
		// Clear markers
		this.clearMarkers();
	}	
	
};
