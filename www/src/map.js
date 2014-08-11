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
 * KU Map
 *********************************************************/
 var KU_Map = {
	
	map: null,							// leaflet map object
	loading: false,						// loading?
	markers: null,						// existing markers
	timeoutSent: null,					// sent timeout for search
	swLat: 42.97513915795521,			// boundng box sw lat
	swLng: -83.77864837646484,			// bounding box sw lng
	neLat: 43.05107777204538,			// bounding box ne lat	
	neLng: -83.64904403686523,			// bounding box ne lng
	bTolerance: .011,					// tolerance for map lock
	downloadIndex: 0,					// still downloading?
	serializeID: 0,						// version for serialization
	lastValue: "",						// search value for filter
	KEY_WAIT: 300,						// timeout when typing
	MAX_UPDATE_MS: 86400000,			// ms value as max places update
	MAP_FILE_TEMPLATE: "MAP_DATA_",		// map data template
	debug: false,						// debug verbose messages?
	GREY_MAP: false,					// grey map around background
				
	/**********************************************************
	 * Clear markers
	 *********************************************************/
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
	
	/**********************************************************
	 * Update POI
	 *********************************************************/
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
				var category = KU_Map.categoryData[KU_Map.downloadIndex];
		
				// Is result valid?
				if(result != null && result.response != null && result.response.venues != null){
					
					// Make new object then save date!
					category = {"name":KU_Map.categoriesList[KU_Map.downloadIndex].name, "serializeID": KU_Map.serializeID, "date": 0, "pois":[]};
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
					console.log(category.pois.length);

					// Save new category here!
					if(KU_Config.isDevice){
						
						var categoryStr = JSON.stringify(category);
						
						// Successful write?
						var success = function(){
							
							if(KU_Map.debug) alert("Saved successfully");
							
							// Get next POI category
							KU_Map.downloadIndex++;
							KU_Map.readPOIs();

						};
						
						// Failure write?
						var fail = function(errorcode){
						
							if(KU_Map.debug) alert("Save failed");
							
							// Get next POI category
							KU_Map.downloadIndex++;
							KU_Map.readPOIs();
						};
						
						// Save category to sd and memory
						fileName = KU_Map.MAP_FILE_TEMPLATE + category.name;
						KU_Map.categoryData[KU_Map.downloadIndex] = category;
						KU_FileIO.writeToFile(fileName, categoryStr, success, fail);
						
					}
					
					// Not a device
					else{
						
						// Save category to memory
						KU_Map.categoryData[KU_Map.downloadIndex] = category;
						
						// Get next POI category
						KU_Map.downloadIndex++;
						KU_Map.readPOIs();
					
					}
				}
				
				// No fallback? alert error then move on
				else if(category == null){
				
					// Tell user about error loading from file AND downloading
					alert("There was an issue loading " + KU_Map.categoriesList[KU_Map.downloadIndex].name 
						+ ".\nPlease try again later.");
					
					// Get next POI category
					KU_Map.downloadIndex++;
					KU_Map.readPOIs();
				}
				
				// Fallback data is already in place for this category
				// move on to next one and try to update next time we load.
				else{
				
					// Get next POI category
					KU_Map.downloadIndex++;
					KU_Map.readPOIs();
				}
			},
			
			error: function(data){
				
				if(KU_Map.categoryData[KU_Map.downloadIndex] == null){
				
					// Tell user about error loading from file AND downloading
					alert("There was an issue loading " + KU_Map.categoriesList[KU_Map.downloadIndex].name 
						+ ".\nPlease try again later.");
					
				}
				
				// Error downloading POI info?
				KU_Map.downloadIndex++;
				KU_Map.readPOIs();
			}
		});
	
	},
 
	/**********************************************************
	 * Read POI files
	 *********************************************************/
	readPOIs: function(){
		
		// Started?
		if(this.downloadIndex == 0){
		
			// Disable searching
			$("#map-search").addClass("ui-disabled");
			$("#map-select").addClass("ui-disabled");
			KU_Mods.showLoading("map-header");
		}
		
		// All done?
		else if(this.downloadIndex < 0 || this.downloadIndex >= this.categoriesList.length){
			
			// All done with categories!
			$("#map-search").removeClass("ui-disabled");
			$("#map-select").removeClass("ui-disabled");
			KU_Mods.hideLoading("map-header");
			KU_Map.loading = false;
			KU_Map.filterMap();
			return;
		}
		
		//  Save file?
		if(KU_Config.isDevice){
			
			var fileName = KU_Map.MAP_FILE_TEMPLATE + KU_Map.categoryData[KU_Map.downloadIndex].name;
			KU_FileIO.readFromFile(fileName, KU_Map.readPOI_Success, KU_Map.readPOI_Fail);
		}
		
		// Simply update the next POI
		else{
		
			KU_Map.updatePOIs();
		}
		
	},
	
	
	/**********************************************************
	 * Read POI files  - Success
	 *********************************************************/
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
				&& serial == KU_Map.serializeID){

				// Date is not due, pois are reasonable length
				if((date + KU_Map.MAX_UPDATE_MS) > currentDate && pois.length > 5){
				
					if(KU_Map.debug) alert("Read Category " + KU_Map.downloadIndex);
					
					// Store category!
					KU_Map.categoryData[KU_Map.downloadIndex] = category;
					KU_Map.downloadIndex++;
					KU_Map.readPOIs();
				
				}
				
				// New date needs to be saved
				else{
					
					if(KU_Map.debug) alert("Need a new update! " + KU_Map.downloadIndex);
					
					// Fallback is old data!
					KU_Map.categoryData[KU_Map.downloadIndex] = category;
					KU_Map.updatePOIs();
					
				}
			}		
			
			// Invalid or out of date category
			else{
				
				alert("Date " + (date != null)
				+ " serial " + (serial != null)
				+ " pois " +  (pois != null)
				+ " same serial " +  (serial == KU_Map.serializeID)
				+ " kuserial " + (KU_Map.serializeID));
				if(KU_Map.debug) alert("Couldn't read " + KU_Map.downloadIndex);
				
				// Update!
				//KU_Map.categoryData[KU_Map.downloadIndex] = null;
				KU_Map.updatePOIs();
			}
		}
		
		// Invalid
		else{
			
			alert("I'm here 2");
			if(KU_Map.debug) alert("Couldn't read " + KU_Map.downloadIndex);
			
			// Update!
			//KU_Map.categoryData[KU_Map.downloadIndex] = null;
			KU_Map.updatePOIs();
		}
		
	},
	
	/**********************************************************
	 * Read POI files - Fail
	 *********************************************************/
	readPOI_Fail: function(errorcode){
		
		if(KU_Map.debug) alert("Failed to read " + KU_Map.downloadIndex);
		
		// Download needed?
		KU_Map.updatePOIs();
	},
	
	/**********************************************************
	 * Filters the map markers
	 *********************************************************/
	filterMap: function(){
		
		switch($("#map-select option:selected").val()){
			
			// All selected
			case "-1":
			
				this.clearMarkers();
			
				// Don't bother showing EVERYTHING
				if(this.lastValue == "") return;
				
				// All all POI categories
				for(var index = 0; index < this.categoryData.length; index++){
					
					this.addPOIs(this.categoryData[index]);
				}
				
				break;
			
			default: 
			
				// Clear then add
				this.clearMarkers();
				this.addPOIs(this.categoryData[$("#map-select option:selected").val()]);
		}
		
		if(this.markers.length < 1) return;
		
		// Get starting point
		
		var user = (KU_Map.userLoc)? KU_Map.userLoc.getLatLng(): L.latLng(43.013070, -83.713853);
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
		
		// Having the smallest distance
		// we now need to fit the map to
		// the users position and that point!
		var sw_Lat = (user.lat < nearestPOI.lat)? user.lat:nearestPOI.lat;
		var sw_Lng = (user.lng < nearestPOI.lng)? user.lng:nearestPOI.lng;
		var ne_Lat = (user.lat > nearestPOI.lat)? user.lat:nearestPOI.lat;
		var ne_Lng = (user.lng > nearestPOI.lng)? user.lng:nearestPOI.lng;
		
		// Pad the zoom level
		var padding = (this.lastValue == "")? .0028:.00165;
		sw_Lat -= padding;
		sw_Lng -= padding;
		ne_Lat += padding;
		ne_Lng += padding;
		
		var bounds = L.latLngBounds(L.latLng(sw_Lat, sw_Lng),
						L.latLng(ne_Lat, ne_Lng));
		console.log(sw_Lat + " " + sw_Lng + " " + ne_Lat + " " + ne_Lng);
		// Fit bounds then open!
		KU_Map.map.fitBounds(bounds);
		nearestMarker.openPopup();
	},
	
	/**********************************************************
	 * Add POIs
	 *********************************************************/
	addPOIs: function(category){
		
		// All POI's in category
		for(var index = 0; index < category.pois.length; index++){
		
			var current = category.pois[index];
			
			// Valid POI?
			if(current.name != null 
				&& current.location != null
				&& current.location.lat != null
				&& current.location.lng != null
				&& (current.name.toLowerCase().indexOf(this.lastValue.toLowerCase()) > -1)){
				
				// Add to map
				KU_Map.markers[KU_Map.markers.length] = 
					L.marker([current.location.lat, current.location.lng])
					 .addTo(KU_Map.map)
					 .bindPopup("<span style=\"height:50px\"><b>" + current.name + "</b></span>");
			}	/*<div><div><br></div>" + "<button style=\"width:100%!important;float:left;\" onclick=\"alert('" + current.location.lat + "');\">Navigate</button><br><button style=\"width:100%!important;float:left;\" onclick=\"alert('" + current.location.lat + "');\">Venue Info</button><br><br></div> */
		}
	
	},
 
	/**********************************************************
	 * Initialize Map
	 *********************************************************/
	initializeMap: function(){

		this.categoryData = [{"name":"Restaurant", "serializeID": KU_Map.serializeID, "date": 0, "pois":[]},
				 {"name":"Entertainment", "serializeID": KU_Map.serializeID,"date": 0, "pois":[]},
				 {"name":"Shopping","date": 0, "pois":[]},
				 {"name":"Bank", "serializeID": KU_Map.serializeID,"date": 0, "pois":[]},
				 {"name":"Gas Station", "serializeID": KU_Map.serializeID,"date": 0, "pois":[]},
				 {"name":"Automotive Repair", "serializeID": KU_Map.serializeID,"date": 0, "pois":[]},
				 {"name":"Fitness", "serializeID": KU_Map.serializeID,"date": 0, "pois":[]},
				 {"name":"Bar", "serializeID": KU_Map.serializeID,"date": 0, "pois":[]},
				 {"name":"Travel", "serializeID": KU_Map.serializeID,"date": 0, "pois":[]}];
				
		// List of supported categories
		this.categoriesList = [{"name":"Restaurant","id":"4d4b7105d754a06374d81259"},
					 {"name":"Entertainment","id":"4d4b7104d754a06370d81259"},
					 {"name":"Shopping","id":"4d4b7105d754a06378d81259"},
					 {"name":"Bank","id":"4bf58dd8d48988d10a951735"},
					 {"name":"Gas Station","id":"4bf58dd8d48988d113951735"},
					 {"name":"Automotive Repair","id":"4bf58dd8d48988d124951735"},
					 {"name":"Fitness","id":"4bf58dd8d48988d175941735"},
					 {"name":"Bar","id":"4d4b7105d754a06376d81259"},
					 {"name":"Travel","id":"4bf58dd8d48988d1ed931735,4bf58dd8d48988d12d951735,4bf58dd8d48988d1fe931735,4bf58dd8d48988d130951735,4bf58dd8d48988d129951735"}];
		
	
		// Make map
		KU_Map.map = L.map('map_view');
		 
		// Setup layer and zoom
		L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			maxZoom: 18,
			minZoom: 6,
			attribution: 'Map data &copy; <a href="http://openstreetmap.org/">OpenStreetMap</a> | ' +'Places powered by <a href="http://foursquare.com/">Foursquare</a>'
		}).addTo(KU_Map.map);
		
		// Setup center and default zoom
		KU_Map.map.setView([43.013070, -83.713853], 16, {reset:true});	
		
		// Make bounding box
		var bounds = L.latLngBounds(L.latLng(this.swLat, this.swLng),
						L.latLng(this.neLat, this.neLng));
		
		// Full grey box!
		var bigBounds = L.latLngBounds(L.latLng(-42.0329743324414,-191.25),
						L.latLng(81.14748070499664,11.25));
		
		// Bottom
		var bigBoundsBottom = L.latLngBounds(L.latLng(bigBounds._southWest.lat, bigBounds._southWest.lng),
						L.latLng(this.swLat, bigBounds._northEast.lng));
		
		// Top
		var bigBoundsTop = L.latLngBounds(L.latLng(this.neLat, bigBounds._southWest.lng),
						L.latLng(bigBounds._northEast.lat,bigBounds._northEast.lng));
		
		// Left middle
		var bigBoundsLeft = L.latLngBounds(L.latLng(this.swLat, bigBounds._southWest.lng),
						L.latLng(this.neLat,this.swLng));
		
		// Right middle
		var bigBoundsRight = L.latLngBounds(L.latLng(this.swLat,this.neLng),
						L.latLng(this.neLat, bigBounds._northEast.lng));
		
		var michiganBox = L.latLngBounds(L.latLng(40.9964840143779,-88.65966796875),
						L.latLng(45.84410779560204,-81.36474609375));
		
		var color = "A0A0A0";
		var opa = .5;
		
		if(KU_Map.GREY_MAP) L.rectangle(bounds, {color: "#" + color, stroke: true, fillOpacity: 0, weight:1}).addTo(KU_Map.map);
		if(KU_Map.GREY_MAP) L.rectangle(bigBoundsBottom, {color: "#" + color, stroke: false, fillOpacity: opa}).addTo(KU_Map.map);
		if(KU_Map.GREY_MAP) L.rectangle(bigBoundsTop, {color: "#" + color, stroke: false, fillOpacity: opa}).addTo(KU_Map.map);
		if(KU_Map.GREY_MAP) L.rectangle(bigBoundsLeft, {color: "#" + color, stroke: false, fillOpacity: opa}).addTo(KU_Map.map);
		if(KU_Map.GREY_MAP) L.rectangle(bigBoundsRight, {color: "#" + color, stroke: false, fillOpacity: opa}).addTo(KU_Map.map);
		
		// Restrict panning to Michigan
		if(KU_Map.GREY_MAP) KU_Map.map.setMaxBounds(michiganBox);
		
		// Resize the map!
		// Note: this seems to need to be in a timeout function
		// most likely so it is called by a ~anonymous caller.
		setTimeout(function(){
			KU_Map.map.invalidateSize();
		},0);
		
		KU_Map.map.locate({watch: true}).on('locationfound', function(e){
			
			if(KU_Map.userLoc) KU_Map.map.removeLayer(KU_Map.userLoc);
			if(KU_Map.userAccuracy) KU_Map.map.removeLayer(KU_Map.userAccuracy);
			
			/*
			var greenIcon = L.icon({
				iconUrl: 'images/blue_dot.png',
				iconSize:     [38, 41], // size of the icon
				iconAnchor:   [19, 20], // point of the icon which will correspond to marker's location
				popupAnchor:  [0, -22] // point from which the popup should open relative to the iconAnchor
			});
			*/
			
			KU_Map.userAccuracy = L.circle([e.latitude, e.longitude],e.accuracy/2,{
				stroke:true,
				weight:1,
				opacity:.2,
				fillColor: '#519ad1',
				fillOpacity: .1,
			}).addTo(KU_Map.map);
			
			KU_Map.userLoc = L.circleMarker([e.latitude, e.longitude],{
				stroke:true,
				weight: 1,
				color: '#000',
				fillColor: '#519ad1',
				fillOpacity: .90,
				radius: 9
			}).addTo(KU_Map.map);
			
			/*
			L.marker([e.latitude, e.longitude],{icon: greenIcon}).addTo(KU_Map.map).bindPopup('You are here!');
			
			*/
			
		}).on('locationerror', function(e){
	   
			alert("Location access failed.");
		});
	
		// Clear markers
		this.clearMarkers();
	}
};
 
/**********************************************************
 * Map page init
 *********************************************************/
$(document).on("pageinit","#map",function(event){
	
	// Bug in JQM? Clear button flashes when loading page?
	// This line will fix it.
	$("#map .ui-input-clear").addClass("ui-input-clear-hidden");
	
	// Initialize map
	// Note: recommended to initialize map from anonymous. 
	// This seems to potentially allow the rest of the 
	// layouts to size correctly without waiting for the map. 
	setTimeout(function(){
		KU_Map.initializeMap();
		KU_Map.readPOIs();
	},0);
	 
});


/**********************************************************
 * Map page create
 *********************************************************/
$(document).on("pagecreate","#map",function(event){
	
	// Trigger for direct change in select box
	$("#map-select").bind("change", function(e,u){
		
		// Clear timeout and filter
		if(KU_Map.timeoutSent) clearTimeout(KU_Map.timeoutSent);
		KU_Map.filterMap();
		
	});
	
	// Trigger for direct change in search box
	$("#map-search").bind("change", function(e,u){
		
		// Definitely a change?
		if(this.value != KU_Map.lastValue){
		
			// Clear timeout
			if(KU_Map.timeoutSent) clearTimeout(KU_Map.timeoutSent);
			
			// Change last value and filter
			KU_Map.lastValue = this.value;
			KU_Map.filterMap();
			
		}
	});
	
	// Trigger for incremental change in search box
	$("#map-search").keyup( function() {
		
		// Definitely a change?
		if(this.value != KU_Map.lastValue){
		
			// Store value
			KU_Map.lastValue = this.value;
		
			// Clear timeout
			if(KU_Map.timeoutSent) clearTimeout(KU_Map.timeoutSent);
			
			KU_Map.timeoutSent = setTimeout(function(latestValue){
				
				// Definitely not a change?
				if(latestValue == KU_Map.lastValue){
					
					// Save new value, reinit, download
					KU_Map.filterMap();
				}
				
				
			}, KU_Map.KEY_WAIT, this.value);
		}
	});
	
	// Fix iScroll?
	if(KU_Config.ISCROLL) KU_Mods.fixIscroll("#map"); 
	
	// Resize and get first page for overflow
	$(window).trigger("resize");
});
