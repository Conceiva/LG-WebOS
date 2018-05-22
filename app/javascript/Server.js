var Server = {
	serverAddr : "",
	UserID : "",
	UserName : "",
	Device : "Samsung Smart TV",
	DeviceID : "00000000000000000000000000000000",
	AuthenticationToken : null,
}

//------------------------------------------------------------
//      Getter & Setter Functions
//------------------------------------------------------------

Server.getAuthToken = function() {
	return this.AuthenticationToken;
}

Server.getServerAddr = function() {
	return this.serverAddr;
}

Server.setServerAddr = function(serverAddr) {
	this.serverAddr = serverAddr;
}

Server.getUserID = function() {
	return this.UserID;
}

Server.setUserID = function(UserID) {
	this.UserID = UserID;
}

Server.getUserName = function() {
	return this.UserName;
}

Server.setUserName = function(UserName) {
	this.UserName = UserName;
}

Server.setUserFavourites = function(UserFavourites) {
	this.UserFavourites = UserFavourites;
}

Server.getUserFavourites = function(UserFavourites) {
	return this.UserFavourites;
}

Server.setDevice = function(Device) {
	this.Device = Device;
}

//Used in Settings 
Server.getDevice = function() {
	return this.Device;
}

Server.setDeviceID = function(DeviceID) {
	this.DeviceID = DeviceID;
}

//Required in Transcoding functions + guiPlayer
Server.getDeviceID = function() {
	return this.DeviceID;
}
//------------------------------------------------------------
//      Generic Functions
//------------------------------------------------------------
Server.getCustomURL = function(SortParams) {
	if (SortParams != null){
		return  Server.getServerAddr() + SortParams;
	} else {
		return  Server.getServerAddr();
	}	
}

Server.getItemTypeURL = function(SortParams) {
	if (SortParams != null){
		return  Server.getServerAddr() + "/Users/" + Server.getUserID() + "/Items?format=json" + SortParams;
	} else {
		return  Server.getServerAddr() + "/Users/" + Server.getUserID() + "/Items?format=json";
	}	
}

Server.getThemeMedia = function(ItemID) {
	return  Server.getServerAddr() + "/Items/" + ItemID + "/ThemeMedia?UserId=" + Server.getUserID() + "&InheritFromParent=true&format=json"	
}

Server.getChildItemsURL = function(ParentID, SortParams) {
	if (SortParams != null){
		return  Server.getServerAddr() + "/Users/" + Server.getUserID() + "/Items?ParentId="+ParentID+"&format=json" + SortParams;
	} else {
		return  Server.getServerAddr() + "/Users/" + Server.getUserID() + "/Items?ParentId="+ParentID+"&format=json";
	}	
}

Server.getItemInfoURL = function(ParentID, SortParams) {
	if (SortParams != null){
		return  Server.getServerAddr() + "/Users/" + Server.getUserID() + "/Items/"+ParentID+"?format=json" + SortParams;
	} else {
		return  Server.getServerAddr() + "/Users/" + Server.getUserID() + "/Items/"+ParentID+"?format=json";
	}		
}

Server.getItemIntrosUrl = function(itemId, SortParams) {
	return  Server.getServerAddr() + "/Users/" + Server.getUserID() + "/Items/"+itemId+"/Intros"; //?format=json";
}

Server.getAdditionalPartsURL = function(ShowID) {
	return  Server.getServerAddr() + "/Videos/" + ShowID +  "/AdditionalParts?format=json&userId="+Server.getUserID();
}

Server.getAdjacentEpisodesURL = function(ShowID,SeasonID,EpisodeID) {
	return  Server.getServerAddr() + "/Shows/" + ShowID +  "/Episodes?format=json&ImageTypeLimit=1&seasonId="+SeasonID+"&userId="+Server.getUserID() +"&AdjacentTo=" + EpisodeID;
}

Server.getSeasonEpisodesURL = function(ShowID,SeasonID) {
	return  Server.getServerAddr() + "/Shows/" + ShowID +  "/Episodes?format=json&ImageTypeLimit=1&seasonId="+SeasonID+"&userId="+Server.getUserID();
}

Server.getImageURL = function(itemId,imagetype,maxwidth,maxheight,unplayedcount,played,playedpercentage,chapter) {
	var query = "";
	switch (imagetype) {
	case "Primary":
		query = "/Items/"+ itemId +"/Images/Primary/0?maxwidth="+maxwidth+"&maxheight="+maxheight + "&quality=90";
		break;
	case "Banner":
		query = "/Items/"+ itemId +"/Images/Banner/0?maxwidth="+maxwidth+"&maxheight="+maxheight + "&quality=90";
		break;
	case "Backdrop":
		query = "/Items/"+ itemId +"/Images/Backdrop/0?maxwidth="+maxwidth+"&maxheight="+maxheight + "&quality=90";
		break;
	case "Thumb":
		query = "/Items/"+ itemId +"/Images/Thumb/0?maxwidth="+maxwidth+"&maxheight="+maxheight + "&quality=90";
		break;	
	case "Logo":
		query = "/Items/"+ itemId +"/Images/Logo/0?maxwidth="+maxwidth+"&maxheight="+maxheight + "&quality=90";
		break;
	case "Disc":
		query = "/Items/"+ itemId +"/Images/Disc/0?maxwidth="+maxwidth+"&maxheight="+maxheight + "&quality=90";
		break;
	case "UsersPrimary":
		query = "/Users/" + itemId + "/Images/Primary?maxwidth="+maxwidth+"&maxheight="+maxheight + "&quality=90";
		break;
	case "Chapter":
		query = "/Items/" + itemId + "/Images/Chapter/" + chapter + "?maxwidth="+maxwidth+"&maxheight="+maxheight + "&quality=90";
		break;
	}
	
	if (Main.isImageCaching()) {
			var found = false;
			
			for (var i = 0; i <Support.imageCachejson.Images.length; i++) {
				//Is image in cache - If so use it
				if (Support.imageCachejson.Images[i].URL == query) {
					found = true;
					break;
				}
			}

			if (found == true) {
				//Use data URI from file			
				return Support.imageCachejson.Images[i].DataURI;
			} else {			
				//Use URL & Add to Cache
				var full = Server.getServerAddr() +  query;

				var xhr = new XMLHttpRequest();
				xhr.open('GET', full, true);
				xhr.responseType = 'blob';

				xhr.onload = function(e) {
				  if (this.status == 200) {
				    var blob = this.response;
			    	Support.imageCachejson.Images[Support.imageCachejson.Images.length] = {"URL":query,"DataURI":window.URL.createObjectURL(blob)};
				  }
				};
				xhr.send();
				
				
				return full;
			}
	} else {
		return Server.getServerAddr() +  query;
	}
}

Server.getScreenSaverImageURL = function(itemId,imagetype,maxwidth,maxheight) {
	var query = "";
	switch (imagetype) {
		case "Backdrop":
			query =   Server.getServerAddr() + "/Items/"+ itemId +"/Images/Backdrop/0?quality=90&maxwidth="+maxwidth+"&maxheight="+maxheight;
			break;
		case "Primary":
			query =   Server.getServerAddr() + "/Items/"+ itemId +"/Images/Primary/0?quality=90&maxwidth="+maxwidth+"&maxheight="+maxheight;
			break;	
	}	
	return query;
}

Server.getBackgroundImageURL = function(itemId,imagetype,maxwidth,maxheight,unplayedcount,played,playedpercentage,totalbackdrops) {
	var query = "";
	var index =  Math.floor((Math.random()*totalbackdrops)+0);
	
	switch (imagetype) {
	
	case "Backdrop":
		query =   Server.getServerAddr() + "/Items/"+ itemId +"/Images/Backdrop/"+index+"?maxwidth="+maxwidth+"&maxheight="+maxheight;
		break;
	}
	
	query = query + "&Quality=90";
	
	return query;
}

Server.getStreamUrl = function(itemId,mediaSourceId){
	var streamparams = '/Stream.ts?VideoCodec=h264&Profile=high&Level=41&MaxVideoBitDepth=8&MaxWidth=1280&VideoBitrate=10000000&AudioCodec=aac&audioBitrate=360000&MaxAudioChannels=6&MediaSourceId='+mediaSourceId + '&api_key=' + Server.getAuthToken();	
	var streamUrl = Server.getServerAddr() + '/Videos/' + itemId + streamparams + '&DeviceId='+Server.getDeviceID();
	return streamUrl;
}


Server.setRequestHeaders = function (xmlHttp) {
	
	xmlHttp.setRequestHeader("Accept", 'application/json');	
	return xmlHttp;
}

Server.getMoviesViewQueryPart = function() {
	var ParentId = Server.getUserViewId("movies", "UserView");
	
	if (ParentId == null) { 
		return "";
	} else {
		return "&ParentId="+ParentId;
	}
}

Server.getTvViewQueryPart = function() {
	var ParentId = Server.getUserViewId("tvshows", "UserView");
	
	if (ParentId == null) { 
		return "";
	} else {
		return "&ParentId="+ParentId;
	}
}

Server.getUserViewId = function (collectionType, Type) {
	var folderId = null;
	/*var userViews = Server.getUserViews();
	for (var i = 0; i < userViews.length; i++){
		if ((Type === undefined || userViews[i].Type == Type)){
			folderId = userViews[i].Id;
		}
	}*/
	return folderId;
}

Server.getUserViews = function () {
	var url = this.serverAddr;
	var itemList = [];
	console.log("Server.getUserViews: ");
	itemList = Server.Browse(url, "Browse", "0", "BrowseDirectChildren", 0, 100, "", itemList);
	console.log("itemList size: " + itemList.length);
	return itemList;
}

//------------------------------------------------------------
//      Settings Functions
//------------------------------------------------------------
Server.updateUserConfiguration = function(contentToPost) {
	var url = this.serverAddr + "/Users/" + Server.getUserID() + "/Configuration";
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		xmlHttp.open("POST", url , true); //must be true!
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(contentToPost);
	}	
}

//------------------------------------------------------------
//      Player Functions
//------------------------------------------------------------
Server.getSubtitles = function(url) {
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		xmlHttp.open("GET", url , false); //must be false
		//xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(null);
		    
		if (xmlHttp.status != 200) {
			console.log (xmlHttp.status);
			return null;
		} else {
			return xmlHttp.responseText;
		}
	} else {
		console.log ("Bad xmlHTTP Request");
		Server.Logout();
		GuiNotifications.setNotification("Bad xmlHTTP Request<br>Token: " + Server.getAuthToken(),"Server Error",false);
		GuiUsers.start(true);
		return null;
	}
}


Server.videoStarted = function(showId,MediaSourceID,PlayMethod) {
	/*var url = this.serverAddr + "/Sessions/Playing";
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		var contentToPost = '{"QueueableMediaTypes":["Video"],"CanSeek":false,"ItemId":'+showId+',"MediaSourceId":'+MediaSourceID+',"IsPaused":false,"IsMuted":false,"PositionTicks":0,"PlayMethod":'+PlayMethod+'}';
		xmlHttp.open("POST", url , true); //must be true!
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(contentToPost);
	}*/
}

Server.videoStopped = function(objectID,posSecond) {
	posSecond = Math.round(posSecond);
	var url = this.serverAddr;
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		var  body = '<?xml version="1.0"?>';
		body += '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">';
		body += '<s:Body>';
		body += '<u:X_SetBookmark xmlns:u="urn:schemas-upnp-org:service:ContentDirectory:1">';
		body += '<ObjectID>';
		body += objectID;
		body += '</ObjectID>';
		body += '<PosSecond>';
		body += posSecond;
		body += '</PosSecond>';
		body += '</u:X_SetBookmark>';
		body += '</s:Body>';
		body += '</s:Envelope>';
		
		xmlHttp.open("POST", url , true); //must be true!
		xmlHttp.setRequestHeader("Content-Type", "text/xml");
		xmlHttp.setRequestHeader("Accept", "*/*");
		xmlHttp.setRequestHeader("SOAPACTION", '"urn:schemas-upnp-org:service:ContentDirectory:1#X_SetBookmark"');
		xmlHttp.send(body);
	}	

}

Server.videoPaused = function(showId,MediaSourceID,ticks,PlayMethod) {
	/*var url = this.serverAddr + "/Sessions/Playing/Progress";
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		var contentToPost = '{"QueueableMediaTypes":["Video"],"CanSeek":false,"ItemId":'+showId+',"MediaSourceId":'+MediaSourceID+',"IsPaused":true,"IsMuted":false,"PositionTicks":'+(ticks*10000)+',"PlayMethod":'+PlayMethod+'}';
		xmlHttp.open("POST", url , true); //must be true!
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(contentToPost);
	}	*/
}

Server.videoTime = function(showId,MediaSourceID,ticks,PlayMethod) {
	/*var url = this.serverAddr + "/Sessions/Playing/Progress";
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		var contentToPost = '{"QueueableMediaTypes":["Video"],"CanSeek":false,"ItemId":'+showId+',"MediaSourceId":'+MediaSourceID+',"IsPaused":false,"IsMuted":false,"PositionTicks":'+(ticks*10000)+',"PlayMethod":'+PlayMethod+'}';
		xmlHttp.open("POST", url , true); //must be true!
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(contentToPost);
	}	*/
}

Server.stopHLSTranscode = function() {
	var url = this.serverAddr + "/Videos/ActiveEncodings?DeviceId="+this.DeviceID;
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		xmlHttp.open("POST", url , true); //must be true!
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(null);
	}	
}

//------------------------------------------------------------
//      Item Watched Status Functions
//------------------------------------------------------------

Server.setWatchedStatus = function(id) {
	var url = this.serverAddr + "/Users/" + this.UserID + "/PlayedItems/" + id;
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		xmlHttp.open("POST", url , true); //must be true!
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(null);
	}
}

Server.deleteWatchedStatus = function(id) {
	var url = this.serverAddr + "/Users/" + this.UserID + "/PlayedItems/" + id;
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		xmlHttp.open("DELETE", url , true); //must be true!
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(null);
	}
}


//------------------------------------------------------------
//       Item Favourite Status Functions
//------------------------------------------------------------

Server.setFavourite = function(id) {
	var url = this.serverAddr + "/Users/" + this.UserID + "/FavoriteItems/" + id;
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		xmlHttp.open("POST", url , true); //must be true!
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(null);
	}
}

Server.deleteFavourite = function(id) {
	var url = this.serverAddr + "/Users/" + this.UserID + "/FavoriteItems/" + id;
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		xmlHttp.open("DELETE", url , true); //must be true!
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(null);
	}
}

//------------------------------------------------------------
//       GuiIP Functions
//------------------------------------------------------------
Server.createPlaylist = function(name, ids, mediaType) {
	var url = this.serverAddr + "/Playlists?Name=" + name + "&Ids=" + ids + "&userId="+Server.getUserID() + "&MediaType=" + mediaType;
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		xmlHttp.open("POST", url , true); //must be true!
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(null);
	}
}

Server.deletePlaylist = function(playlistId) {
	var url = this.serverAddr + "/Items/"+playlistId;
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		xmlHttp.open("DELETE", url , true); //must be true!
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(null);
	}
}

Server.addToPlaylist = function(playlistId, ids) {
	var url = this.serverAddr + "/Playlists/"+ playlistId + "/Items?Ids=" + ids + "&userId="+Server.getUserID();
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		xmlHttp.open("POST", url , true); //must be true!
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(null);
	}
}

Server.removeFromPlaylist = function(playlistId, ids) {
	var url = this.serverAddr + "/Playlists/"+ playlistId + "/Items?EntryIds=" + ids + "&userId="+Server.getUserID();
	console.log(url)
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		xmlHttp.open("DELETE", url , true); //must be true!
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(null);
	}
}

Server.POST = function(url, item) {
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		xmlHttp.open("POST", url , true); //must be true!
		xmlHttp = this.setRequestHeaders(xmlHttp);
		if (item){
			xmlHttp.send(JSON.stringify(item));
		} else {
			xmlHttp.send(null);
		}
	}
}

Server.DELETE = function(url, item) {
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		xmlHttp.open("DELETE", url , true); //must be true!
		xmlHttp = this.setRequestHeaders(xmlHttp);
		if (item){
			xmlHttp.send(JSON.stringify(item));
		} else {
			xmlHttp.send(null);
		}
	}
}
//------------------------------------------------------------
//      GuiIP Functions
//------------------------------------------------------------
Server.testConnectionSettings = function (server,fromFile) {	
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		if (server.indexOf("http://") != 0) {
			var url = "http://" + server + "/";
			xmlHttp.open("GET", "http://" + server + "/desc",false);
			xmlHttp.setRequestHeader("Content-Type", 'text/xml');
			xmlHttp.onreadystatechange = function () {
				GuiNotifications.setNotification(server + " result: " + xmlHttp.status,"Network Status",true);
				if (xmlHttp.readyState == 4) {
					if(xmlHttp.status === 200) {
						if (fromFile == false) {
							// do something with response
							var error = 0;
							try {
								var xml = xmlHttp.responseText;
								var iconURL = "";
								var iconSize = 0;
								var controlURL = "";
								var parser, xmlDoc;
								parser = new DOMParser();
								xmlDoc = parser.parseFromString(xml,"text/xml");
								var friendlyName = xmlDoc.getElementsByTagName("friendlyName")[0].childNodes[0].nodeValue;
								var service = xmlDoc.getElementsByTagName("service");
								for (i = 0; i < service.length; i++) {
									var found = false;
									for (j = 0; j < service[i].childNodes.length; j++) {
										if (service[i].childNodes[j].nodeName == "serviceType") {
											if (service[i].childNodes[j].textContent == "urn:schemas-upnp-org:service:ContentDirectory:1") {
												found = true;
												break;
											}
										}
									}
									
									for (j = 0; j < service[i].childNodes.length; j++) {
										if (service[i].childNodes[j].nodeName == "controlURL") {
											controlURL = service[i].childNodes[j].textContent;
											break;
										}
									}
									
									if (found == true) {
										break;
									}
								}
								  
								var icon = xmlDoc.getElementsByTagName("icon");
								for (i = 0; i < icon.length; i++) {
									var size = 0;
									for (j = 0; j < icon[i].childNodes.length; j++) {
										if (icon[i].childNodes[j].nodeName == "width") {
											size = parseInt(icon[i].childNodes[j].textContent);
											break;
										}
									}
									if (size > iconSize) {
										for (j = 0; j < icon[i].childNodes.length; j++) {
											if (icon[i].childNodes[j].nodeName == "url") {
												iconURL = icon[i].childNodes[j].textContent;
												break;
											}
										}
										iconSize = size;
									}
								  }
								  
	
								if (iconURL.indexOf("/") === 0) {
									iconURL = /(http:\/\/.+?)\//.exec(url)[1] + iconURL;
								}
								else {
									iconURL = /(http:\/\/.+)\//.exec(url)[1] + "/" + iconURL;
								}
	
	
								var browseURL = "";
								if (controlURL.indexOf("/") === 0) {
									browseURL = /(http:\/\/.+?)\//.exec(url)[1] + controlURL;
								}
								else {
									browseURL = /(http:\/\/.+)\//.exec(url)[1] + "/" + controlURL;
								}
								console.log("Url: " + url + " browseURL: " + browseURL + " iconURL: " + iconURL + " friendlyName: " + friendlyName);
								File.saveServerToFile(url, browseURL, iconURL, friendlyName); 
							}
							catch (err) {
								GuiNotifications.setNotification("Error : " + err.message,"Error",true);
								error = 1;
							}
						
						}

						if (error == 0) {   
							//Set Server.serverAddr!
							Server.setServerAddr(browseURL);
							//Check Server Version
							//if (ServerVersion.checkServerVersion()) {
								
							//Set File User Entry
							File.setUserEntry(0);
							//Change Focus and call function in GuiMain to initiate the page!
							GuiMainMenu.start();
							//} else {
							//	ServerVersion.start();
						}
						//}
					} else if (xmlHttp.status === 0) {
						GuiNotifications.setNotification("Your Mezzmo server is not responding.","Network Error "+xmlHttp.status,true);
						Support.removeSplashScreen();
						if (fromFile == true) {
							setTimeout(function(){
								GuiPage_Servers.start();
							}, 3000);
		
						} else {
							setTimeout(function(){
								GuiPage_NewServer.start();
							}, 3000);
						}
					} else {
						GuiNotifications.setNotification("Mezzmo server connection error.","Network Error "+xmlHttp.status,true);
						Support.removeSplashScreen();
						if (fromFile == true) {
							setTimeout(function(){
								GuiPage_Servers.start();
							}, 3000);
		
						} else {
							setTimeout(function(){
								GuiPage_NewServer.start();
							}, 3000);
						}
					}
				}
			};
			xmlHttp.send(null);
		}
		else {
			Server.setServerAddr(server);
			GuiUsers.start(true);
		}
	} else {
	    console.log("Failed to create XHR");
	}
}

//------------------------------------------------------------
//      GuiUsers Functions
//------------------------------------------------------------

Server.Authenticate = function(UserId, UserName, Password) {
	var url = Server.getServerAddr() + "/Users/AuthenticateByName?format=json";
    var params =  JSON.stringify({"Username":UserName,"Password":Password});
    
    var xmlHttp = new XMLHttpRequest();	
    xmlHttp.open( "POST", url , false ); //Authenticate must be false - need response before continuing!
    xmlHttp = this.setRequestHeaders(xmlHttp);
        
    xmlHttp.send(params);
    
    if (xmlHttp.status != 200) {
    	return false;
    } else {
    	var session = JSON.parse(xmlHttp.responseText);
    	this.AuthenticationToken = session.AccessToken;
    	this.setUserID(session.User.Id);
    	this.setUserName(UserName);
		FileLog.write("User "+ UserName +" authenticated. ");
    	return true;
    }
}

Server.Logout = function() {
	var url = this.serverAddr + "/Sessions/Logout";
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		xmlHttp.open("POST", url , true); //must be true!
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(null);
	}	
	
	//Close down any running items
	GuiImagePlayer_Screensaver.kill();
	GuiImagePlayer.kill();
	GuiMusicPlayer.stopOnAppExit();
	GuiPlayer.stopOnAppExit();
	FileLog.write("---------------------------------------------------------------------");
}

Server.getNodeText = function(parent, name) {
	var text = "";
	for (j = 0; j < parent.childNodes.length; j++) {
		if (parent.childNodes[j].nodeName == name) {
			text = parent.childNodes[j].textContent;
			break;
		}
	}
	
	return text;
}

Server.getNodeAttribute = function(parent, name, attr) {
	var text = "";
	for (k = 0; k < parent.childNodes.length; k++) {
		if (parent.childNodes[k].nodeName == name) {
			text = parent.childNodes[k].getAttribute(attr);
			break;
		}
	}
	
	return text;
}

Server.getChildNodes = function(parent, name) {
	var nodes = null;
	for (k = 0; k < parent.childNodes.length; k++) {
		if (parent.childNodes[k].nodeName == name) {
			nodes = parent.childNodes[k].childNodes;
			break;
		}
	}
	
	return nodes;
}

Server.toHHMMSS = function (val) {
    var sec_num = parseInt(val, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}

Server.replaceCommonText = function(str) {
	str = str.split("&apos;").join("'");
	str = str.split("&quot;").join("\"");
	str = str.split("&amp;").join("&");
	return str;
}

Server.unescapeXML = function (text) {  
    text.split("&apos;").join("'");
    text.split("&quot;").join("\"");
    text.split("&gt;").join(">");
    text.split("&lt;").join("<");
    text.split("&amp;").join("&");
	return text;
}

Server.parsexml = function(xml, listItems)
{
	try {
		var parser, xmlDoc, xmlResultDoc;
		parser = new DOMParser();
		xmlDoc = parser.parseFromString(xml,"text/xml");
		var result = Server.unescapeXML(xmlDoc.getElementsByTagName("Result")[0].childNodes[0].nodeValue);

		var NumberReturned = xmlDoc.getElementsByTagName("NumberReturned")[0].childNodes[0].nodeValue;
		var TotalMatches = xmlDoc.getElementsByTagName("TotalMatches")[0].childNodes[0].nodeValue;

		xmlResultDoc = parser.parseFromString(result,"text/xml");

		var containers = xmlResultDoc.getElementsByTagName("container");

		for (i = 0; i < containers.length; i++) {
			var id = containers[i].getAttribute("id");
			var parentID = containers[i].getAttribute("parentID");
			var childCount = containers[i].getAttribute("childCount");
			var unplayedChildCount = containers[i].getAttribute("unplayedChildCount");
			var title = Server.getNodeText(containers[i], "dc:title");
			title = Server.replaceCommonText(title);
			var albumart = Server.getNodeText(containers[i], "upnp:albumArtURI");
			var desc = Server.getNodeText(containers[i], "dc:description");
			desc = Server.replaceCommonText(desc);
			var backdrop = Server.getNodeText(containers[i], "cvabackdrop");
			var backdropUrl = '';
			if (backdrop != "") {
				backdropUrl = backdrop;
			}
			
			
			if (albumart == '') {
				albumart = 'images/h_web_as_folder.png';
			}
			
			listItems.push({'id':id, 'title':title, 'poster':albumart, 'Overview':desc, 'backdrop':backdropUrl, 'type':'container', 'parentId':parentID, 'childCount':childCount, 'unplayedChildCount':unplayedChildCount});		
		}
		
		var items = xmlResultDoc.getElementsByTagName("item");
		for (i = 0; i < items.length; i++) {
			var id = items[i].getAttribute("id");
			var parentID = items[i].getAttribute("parentID");
			var title = Server.getNodeText(items[i], "dc:title");
			
			title = Server.replaceCommonText(title);
			var albumart = Server.getNodeText(items[i], "upnp:albumArtURI");
			var desc = Server.getNodeText(items[i], "dc:description");
			desc = Server.replaceCommonText(desc);
			var episode = Server.getNodeText(items[i], "episode");
			var season = Server.getNodeText(items[i], "season");
			var bookmark = Server.getNodeText(items[i], "sec:dcmInfo");
			var backdrop = Server.getNodeText(items[i], "cvabackdrop");
			var lastPlayed = Server.getNodeText(items[i], "last_played");
			var unplayedCount = Server.getNodeText(items[i], "unplayedChildCount");
			var rating = Server.getNodeText(items[i], "rating");
			var releaseDate = Server.getNodeText(items[i], "release_date");
			var people = Server.getNodeText(items[i], "upnp:artist");
			people = Server.replaceCommonText(people);
			var tagline = Server.getNodeText(items[i], "tagline");
			tagline = Server.replaceCommonText(tagline);
			var album = Server.getNodeText(items[i], "upnp:album");
			var genre = Server.getNodeText(items[i], "upnp:genre");
			var year = Server.getNodeText(items[i], "release_year");
			var creator = Server.getNodeText(items[i], "creator");
			var contentRating = Server.getNodeText(items[i], "content_rating");
			var audioCodec = Server.getNodeText(items[i], "audio_codec");
			var url = Server.getNodeText(items[i], "res");
			var Video3DFormat = Server.getNodeText(items[i], "Video3DFormat");
			var imageSearchUrl = Server.getNodeText(items[i], "imageSearchUrl");
			var backdropUrl = '';
			if (backdrop != "") {
				backdropUrl = backdrop;
			}
			
			if (album == "Unknown Album") {
				album = "";
			}
			
			if (people == "Unknown Artist") {
				people = "";
			}
			
			if (genre == "Unknown Genre") {
				genre = "";
			}
			
			var captions = Server.getChildNodes(items[i], "captions");
			var captionStreams = [];
			if (captions != null) {
				for (index = 0; index < captions.length; index++) {
					if (captions[index].nodeName == "stream") {
						captionStreams.push({"Language":captions[index].getAttribute("language"), "Url":captions[index].getAttribute("url")});
					}
				}
			}
			
			var trailers = Server.getChildNodes(items[i], "trailers");
			var trailerStreams = [];
			if (trailers != null) {
				for (index = 0; index < trailers.length; index++) {
					if (trailers[index].nodeName == "trailer") {
						trailerStreams.push({"Url":trailers[index].textContent});
					}
				}
			}
			
			if (bookmark != "") {
				if (bookmark.indexOf("BM=") != -1) {
					bookmark = parseInt(bookmark.substring(bookmark.indexOf("BM=") + 3));
					//bookmark = Server.toHHMMSS(bookmark);
				}
				else {
					bookmark = 0;
				}
			}
			
			var resolution = Server.getNodeAttribute(items[i], "res", "resolution");
			var type = Server.getNodeAttribute(items[i], "res", "protocolInfo");
			if (type != "") {
				type = /http-get:\*:(.+?):.+?/.exec(type)[1];
			}

			var duration = Server.getNodeAttribute(items[i], "res", "duration");

			var mediaType = "none";
			
			if (type.indexOf("video") == 0 ||
                type.indexOf("application") == 0) {
				if (albumart == '') {
					albumart = 'images/movie.png';
				}
				mediaType = "Video";
				if (season == 0 && episode == 0) {
					type = "Movie";
				}
				else {
					type = "Episode";
				}
			} else if (type.indexOf("audio") == 0) {
				if (albumart == '') {
					albumart = 'images/music.png';
				}
				mediaType = "Audio";
			}
			else if (type.indexOf("image") == 0) {
				if (albumart == '') {
					albumart = 'images/photo.png';
				}
				mediaType = "Photo";
			}
			
			var contentWidth = 0;
			var contentHeight = 0;
			if (resolution != null && resolution != "") {
				contentWidth = /(.+?)x.+?/.exec(resolution)[1];
				contentHeight = /.+?x(.+?$)/.exec(resolution)[1];
			}
			
			var audioStreams = [];
			var audioCount = Server.getNodeAttribute(items[i], "audio", "count");
			for (a = 0; a < audioCount; a++) {
				audioStreams.push(a);
			}
			
			
			listItems.push({'id':id, 'parentId':parentID, 'title':title, 'poster':albumart, 'Overview':desc, 'backdrop':backdropUrl, 'type':type, 'contentUrl':url, 'episode':episode, 'season':season, 'bookmark':bookmark, 'duration':duration, 'lastPlayed':lastPlayed, 'UnplayedItemCount': unplayedCount, 'MediaType':mediaType, 'CommunityRating':rating, 'CriticRating':null, 'PremiereDate':releaseDate, 'Year':year, 'People':people, 'Album':album, 'Genre':genre, 'contentWidth':contentWidth,'contentHeight':contentHeight, 'AudioStreams':audioStreams, 'AudioCodec':audioCodec, 'Subtitles':captionStreams, 'Creator':creator, 'ContentRating':contentRating, 'Video3DFormat':Video3DFormat, 'trailerStreams':trailerStreams, 'imageSearchUrl':imageSearchUrl});
		}
    }
	catch (err) {
		GuiNotifications.setNotification("Error : " + err.message,"Error",true);
	}
  return listItems;
}

Server.createBrowseBody = function (objectID, flag, startingIndex, requestedCount, pin)
{
	var body = '<?xml version="1.0"?> \
		<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">\
	  <s:Body>\
		<u:Browse xmlns:u="urn:schemas-upnp-org:service:ContentDirectory:1">\
		 <ObjectID>';
		body += objectID;
		body += '</ObjectID>\
		  <BrowseFlag>';
		body += flag;
		body += '</BrowseFlag>\
		  <Filter>dc:creator, @childCount, upnp:genre, res, upnp:album, res@resolution, res@duration, res@importUri, dc:date, upnp:artist, upnp:originalTrackNumber, upnp:albumArtURI, upnp:class, av:mediaClass, av:dateTime, dc:description, cva_richmetadata, cva_bookmark</Filter>\
		  <StartingIndex>';
		body += '' + startingIndex;
		body += '</StartingIndex>\
		  <RequestedCount>';
		body += '' + requestedCount;
		body += '</RequestedCount><CVA_PIN>';
		body += pin;
		body += '</CVA_PIN><SortCriteria></SortCriteria>\
		</u:Browse>\
	  </s:Body>\
	</s:Envelope>';
	
	return body;
}


Server.getSearchCriteria = function(term) {

    var searchCriteria = ""
    
    //'if addon.getSetting('search_title') == 'true':
        searchCriteria += "dc:title=&quot;" + term + "&quot;"

    //'if addon.getSetting('search_album') == 'true':
        if (searchCriteria.length != 0) {
            searchCriteria += " or ";
        }
        searchCriteria += "upnp:album=&quot;" + term + "&quot;";

    //'if addon.getSetting('search_artist') == 'true':
        if (searchCriteria.length != 0) {
            searchCriteria += " or ";
        }

        searchCriteria += "upnp:artist=&quot;" + term + "&quot;";

    //'if addon.getSetting('search_tagline') == 'true':
        if (searchCriteria.length != 0) {
            searchCriteria += " or ";
        }

    searchCriteria += "dc:description=&quot;" + term + "&quot;";

    //'if addon.getSetting('search_description') == 'true':
         if (searchCriteria.length != 0) {
            searchCriteria += " or ";
        }

        searchCriteria += "upnp:longDescription=&quot;" + term + "&quot;";

    //'if addon.getSetting('search_keywords') == 'true':
        if (searchCriteria.length != 0) {
            searchCriteria += " or ";
        }

        searchCriteria += "keywords=&quot;" + term + "&quot;";

    //'if addon.getSetting('search_creator') == 'true':
        if (searchCriteria.length != 0) {
            searchCriteria += " or ";
        }

        searchCriteria += "creator=&quot;" + term + "&quot;";

    return searchCriteria;
}

Server.createSearchBody = function (objectID, searchCriteria, startingIndex, requestedCount, pin)
{
	var body = '<?xml version="1.0"?> \
		<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">\
	  <s:Body>\
		<u:Search xmlns:u="urn:schemas-upnp-org:service:ContentDirectory:1">\
		 <ContainerID>';
		body += objectID;
		body += '</ContainerID>\
		  <SearchCriteria>';
		body += Server.getSearchCriteria(searchCriteria);
		body += '</SearchCriteria>\
		  <Filter>dc:creator, upnp:genre, res, upnp:album, res@resolution, res@duration, res@importUri, dc:date, upnp:artist, upnp:originalTrackNumber, upnp:albumArtURI, upnp:class, av:mediaClass, av:dateTime, dc:description, cva_richmetadata, cva_bookmark</Filter>\
		  <StartingIndex>';
		body += '' + startingIndex;
		body += '</StartingIndex>\
		  <RequestedCount>';
		body += '' + requestedCount;
		body += '</RequestedCount><CVA_PIN>';
		body += pin;
		body += '</CVA_PIN><SortCriteria></SortCriteria>\
		</u:Search>\
	  </s:Body>\
	</s:Envelope>';
	
	return body;
}

Server.Browse = function (url, action, objectID, flag, startingIndex, requestedCount, pin, itemList, callback)
{
	var itemsReturned = 0;
	var totalItems = 0;
	
	//do {
		var body = "";
		if (action == "Browse") {
			body = Server.createBrowseBody(objectID, flag, startingIndex, requestedCount, pin);
		}
		else {
			body = Server.createSearchBody(objectID, flag, startingIndex, requestedCount, pin);
		}
		
		 var xhr = new XMLHttpRequest();
		 xhr.open("POST", url, true);
		 xhr.setRequestHeader('content-type', 'text/plain'); 
		 xhr.setRequestHeader('accept', '*/*');
		 xhr.setRequestHeader('SOAPACTION', '"urn:schemas-upnp-org:service:ContentDirectory:1#' + action + '"');
		 xhr.setRequestHeader('User-Agent', 'Mezzmo JS');
		 xhr.onreadystatechange = function () {
			var NumberReturned = 0;
			var TotalMatches = 0;
			
			 if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					 // do something with response
					 var result = '';
					 result = xhr.responseText;
					 
					 if (result.length != 0) {		
						var parser, xmlDoc, xmlResultDoc;
						parser = new DOMParser();
						xmlDoc = parser.parseFromString(result,"text/xml");

						if (xmlDoc.getElementsByTagName("NumberReturned").length != 0) {
							NumberReturned = xmlDoc.getElementsByTagName("NumberReturned")[0].childNodes[0].nodeValue;
						}
						
						if (xmlDoc.getElementsByTagName("TotalMatches").length != 0) {
							TotalMatches = xmlDoc.getElementsByTagName("TotalMatches")[0].childNodes[0].nodeValue;
						}

						itemList = Server.parsexml(result, itemList);
						itemsReturned = itemList.length - totalItems;
						if (itemsReturned != 0)
						{
							var index = parseInt(startingIndex) + parseInt(itemsReturned);
							startingIndex = index;
						}
						totalItems = itemList.length;
						callback(itemList, NumberReturned, TotalMatches);
					}
				}
				else if (xhr.status == 0) {
					//hide Loading Div
					document.getElementById("loading").style.visibility = "hidden";
					
					// error
					GuiNotifications.setNotification("Error: No response from server","Error",true);
					//GuiPage_Servers.start();
				}
			 }
			 
		};
		
		try {
			xhr.send(body); 
		}
		catch (err) {
			GuiNotifications.setNotification("Error : " + err.message,"Error",true);
			//GuiPage_Servers.start();
		}
	//} while (itemsReturned != 0);
	
	return itemList;
}

//------------------------------------------------------------
//      Get Content - XML REQUESTS
//------------------------------------------------------------
Server.getContent = function(url) {
	var xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		xmlHttp.open("GET", url , false); //must be false
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(null);
		    
		if (xmlHttp.status != 200) {
			FileLog.write("Server Error: The HTTP status returned by the server was "+xmlHttp.status);
			FileLog.write(url);
			GuiNotifications.setNotification("The HTTP status code returned by the server was "+xmlHttp.status+".", "Server Error:");
			return null;
		} else {
			//console.log(xmlHttp.responseText);
			return JSON.parse(xmlHttp.responseText);
		}
	} else {
		console.log ("Bad xmlHTTP Request");
		Server.Logout();
		GuiNotifications.setNotification("Bad xmlHTTP Request<br>Token: " + Server.getAuthToken(),"Server Error",false);
		GuiUsers.start(true);
		return null;
	}
}


//------------------------------------------------------------
//      Get Content - XML REQUESTS
//------------------------------------------------------------
Server.getContentAsync = function(url, index, itemId, callback) {
	var xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		xmlHttp.open("GET", url , true); //must be false
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.onreadystatechange = function () {
			if (xmlHttp.readyState == 4) {
				if (xmlHttp.status != 200) {
					FileLog.write("Server Error: The HTTP status returned by the server was "+xmlHttp.status);
					FileLog.write(url);
					GuiNotifications.setNotification("The HTTP status code returned by the server was "+xmlHttp.status+".", "Server Error:");
				} else {
					if (xmlHttp.responseText != "") {
						callback(JSON.parse(xmlHttp.responseText), index, itemId);
					}
				}
			}
		};
		xmlHttp.send(null);
	} else {
		console.log ("Bad xmlHTTP Request");
		Server.Logout();
		GuiNotifications.setNotification("Bad xmlHTTP Request<br>Token: " + Server.getAuthToken(),"Server Error",false);
		GuiUsers.start(true);
	}
}
