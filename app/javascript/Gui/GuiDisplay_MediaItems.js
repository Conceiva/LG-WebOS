var GuiDisplay_MediaItems = {
		ItemData : null,
		ItemIndexData : null,
		ParentData : null,
		PlaylistId : "",
		Url : "",
		
		totalRecordCount : null,
		
		currentView : "",
		currentMediaType : "",
		
		selectedItem : 0,
		prevSelectedItem : 0,
		selectedBannerItem : 0,
		topLeftItem : 0,
		MAXCOLUMNCOUNT : 6, //Default TV
		MAXROWCOUNT : 3,
		
		bannerItems : [],
		tvBannerItems : ["Series","Latest","Upcoming","Genre", "A-Z"],
		movieBannerItems : ["All","Unwatched","Latest","Genre", "A-Z"],
		musicBannerItems : ["Recent","Frequent","Album","Album Artist", "Artist"],
		liveTvBannerItems : ["Guide","Channels","Recordings"],
		
		indexSeekPos : -1,
		indexTimeout : null,
		isResume : false,
		genreType : "",
		
		isAllorFolder : 0,
		isTvOrMovies : 0,
		
		startParams : [],
		isLatest : false,
		loadingMore : false
}

GuiDisplay_MediaItems.restoreSelectedItem = function() {
	this.selectedItem = this.prevSelectedItem;
	this.updateSelectedItems();
}

GuiDisplay_MediaItems.onFocus = function() {
	
	if (this.ItemData != null && this.ItemData.length != 0) {	
		//GuiDisplay_MediaItems.updateDisplayedItems();
		GuiDisplay_MediaItems.updateSelectedItems();
	}
	
	GuiMainMenu.toggleMusic(GuiMusicPlayer.Status == "PLAYING" || GuiMusicPlayer.Status == "PAUSED");
}

GuiDisplay_MediaItems.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
}

GuiDisplay_MediaItems.start = function(title,url,selectedItem,topLeftItem,items, playlistId, parentData) {	
	console.log("Page Enter : GuiDisplay_MediaItems");
	try {
		this.onFocus();
		
		GuiMainMenu.changeVisibility("");
		
		//Save Start Params	
		Support.pageLoadTimes("GuiDisplay_MediaItems","Start",true);
		this.startParams = [title,url,parentData];
		
		if (playlistId === undefined ||
			playlistId == null) {
			playlistId = "0";
		}
		
		//Reset Values
		this.indexSeekPos = -1;
		this.selectedItem = selectedItem;
		this.topLeftItem = topLeftItem;
		this.genreType = null;
		this.isLatest = false;
		this.bannerItems = [];
		this.totalRecordCount = 0;
		this.ItemData = items;
		this.ParentData = parentData;
		this.PlaylistId = playlistId;
		this.Url = url;
		
		if (GuiDisplay_MediaItems.ParentData != null) {
			GuiDisplay_MediaItems.MAXROWCOUNT = 2;
						//A movie.
			if (GuiDisplay_MediaItems.ParentData.backdrop) { 
				var imgsrc = GuiDisplay_MediaItems.ParentData.backdrop; 
				Support.fadeImage(imgsrc);
			//A music album.
			} else if (GuiDisplay_MediaItems.ParentData.poster) { 
				var imgsrc = GuiDisplay_MediaItems.ParentData.poster; 
				Support.fadeImage(imgsrc); 
			} 
			
			//Update Padding on pageContent
			document.getElementById("pageContent").innerHTML = "<div id=bannerSelection class='bannerMenu'></div>" +
					"<div id=SeriesContent class='SeriesContent'>" +
						"<div id='ParentPoster' class='FilmInfoLogo'></div>" +
						"<div id='SeriesTitle' class='SeriesTitle'></div>" +
						"<div id='SeriesSubData' class='SeriesSubData'></div>" +
						"<div id='SeriesOverview' class='SeriesOverview'></div>" +
					"</div>" +
					"<div id=Center class='SeriesCenterLower'>" +
						"<div id=Content></div>" +
					"</div>";
		
			document.getElementById("SeriesTitle").innerHTML = GuiDisplay_MediaItems.ParentData.title;;
			document.getElementById("SeriesOverview").innerHTML = GuiDisplay_MediaItems.ParentData.Overview;
			document.getElementById("ParentPoster").style.backgroundImage="url('"+GuiDisplay_MediaItems.ParentData.poster+"')";
		}
		else {
			//Update Padding on pageContent
			document.getElementById("pageContent").innerHTML = "<div id=bannerSelection class='bannerMenu'></div>" +
					"<div id=Center class='SeriesCenter'>" +
						"<div id=Content></div>" +
					"</div>";
		}
		
		//If items are passed in use those, otherwise process the url.
		if (!this.ItemData) {
			//Load Data
			var itemList = [];
			
			//Show Loading Div
			document.getElementById("loading").style.visibility = "";
			
			if (playlistId.indexOf("cvasearch:") == 0) {
				var term = playlistId.substr(10, playlistId.length);
				Server.Browse(url, "Search", "0", term, 0, 100, "", itemList, GuiDisplay_MediaItems.loadData);
			}
			else {
				Server.Browse(url, "Browse", playlistId, "BrowseDirectChildren", 0, 100, "", itemList, GuiDisplay_MediaItems.loadData);
			}
			
			
		}
	}	
	catch (err) {
		GuiNotifications.setNotification("Error : " + err.message,"Error",true);
	}
}
		
GuiDisplay_MediaItems.loadData = function(itemData, NumberReturned, TotalMatches) {
	console.log("GuiDisplay_MediaItems.loadData: " + NumberReturned + ":" + TotalMatches);
	try {
		GuiDisplay_MediaItems.totalRecordCount = TotalMatches;
		
		setTimeout(function(){	
			//hide Loading Div
			document.getElementById("loading").style.visibility = "hidden";
		}, 200);
		
		GuiDisplay_MediaItems.ItemData = itemData;
	
		if (GuiDisplay_MediaItems.ItemData == null) { Support.processReturnURLHistory(); }
		GuiDisplay_MediaItems.totalRecordCount = (GuiDisplay_MediaItems.totalRecordCount == 0) ? TotalMatches : GuiDisplay_MediaItems.totalRecordCount;
		Support.pageLoadTimes("GuiDisplay_MediaItems","RetrievedServerData",false);
		
		//Split Name - 1st Element = View, 2nd = Type
		
		switch (GuiDisplay_MediaItems.currentMediaType) {
		case "TV":
			GuiDisplay_MediaItems.isTvOrMovies = 0;
			GuiDisplay_MediaItems.bannerItems = GuiDisplay_MediaItems.tvBannerItems;
			if (File.getUserProperty("LargerView") == true) {
				document.getElementById("SeriesContent").style.top="830px";
				document.getElementById("SeriesOverview").style.height="250px";
			}
			break;
		case "Movies":
			GuiDisplay_MediaItems.isTvOrMovies = 1;
			GuiDisplay_MediaItems.bannerItems = GuiDisplay_MediaItems.movieBannerItems;
			if (File.getUserProperty("LargerView") == true) {
				document.getElementById("SeriesContent").style.top="830px";
				document.getElementById("SeriesOverview").style.height="250px";
			}
			break;
		case "Collections":
			GuiDisplay_MediaItems.isTvOrMovies = -1;
			if (File.getUserProperty("LargerView") == true) {
				document.getElementById("SeriesContent").style.top="830px";
				document.getElementById("SeriesOverview").style.height="250px";
			}
			break;
		case "Music":
			GuiDisplay_MediaItems.MAXCOLUMNCOUNT = 7;
			GuiDisplay_MediaItems.MAXROWCOUNT = 3;
			GuiDisplay_MediaItems.isTvOrMovies = 2;
			GuiDisplay_MediaItems.bannerItems = GuiDisplay_MediaItems.musicBannerItems;
			document.getElementById("SeriesContent").style.top="880px";
			document.getElementById("SeriesOverview").style.height="0px";
			break;
		case "AudioPodcast":
			GuiDisplay_MediaItems.MAXCOLUMNCOUNT = 7;
			GuiDisplay_MediaItems.MAXROWCOUNT = 3;
			GuiDisplay_MediaItems.isTvOrMovies = 2;
			document.getElementById("SeriesContent").style.top="880px";
			document.getElementById("SeriesOverview").style.height="0px";
			break;
		case "LiveTV":
			GuiDisplay_MediaItems.MAXCOLUMNCOUNT = 7;
			GuiDisplay_MediaItems.MAXROWCOUNT = 3;
			GuiDisplay_MediaItems.isTvOrMovies = 2;
			GuiDisplay_MediaItems.bannerItems = GuiDisplay_MediaItems.liveTvBannerItems;
			document.getElementById("SeriesContent").style.top="880px";
			document.getElementById("SeriesOverview").style.height="250px";
			break;
		default:
			GuiDisplay_MediaItems.isTvOrMovies = 1;
			GuiDisplay_MediaItems.bannerItems = [];
			if (File.getUserProperty("LargerView") == true) {
				document.getElementById("SeriesContent").style.top="830px";
				document.getElementById("SeriesOverview").style.height="250px";
			}
			break;
		}

		//Determine if display is for tv / movies or just a folder
		if (!(GuiDisplay_MediaItems.currentMediaType=="Movies" || GuiDisplay_MediaItems.currentMediaType=="TV" || GuiDisplay_MediaItems.currentMediaType=="LiveTV" || GuiDisplay_MediaItems.currentMediaType=="Music")) {
			console.log ("Media Folder");
			GuiDisplay_MediaItems.isAllorFolder = 1;
			GuiDisplay_MediaItems.bannerItems = []; //NEEDED HERE! 
			document.getElementById("bannerSelection").style.paddingTop="25px";
			document.getElementById("bannerSelection").style.paddingBottom="10px";
		} else {
			console.log ("TV or Movies");
			GuiDisplay_MediaItems.isAllorFolder = 0;
			document.getElementById("bannerSelection").style.paddingTop="25px";
			document.getElementById("bannerSelection").style.paddingBottom="5px";
		}
		
		if (GuiDisplay_MediaItems.ItemData.length > 0) {		
			//Determine if extra top padding is needed for items <= MaxRow
			/*if (GuiDisplay_MediaItems.MAXROWCOUNT > 2) {
				if (GuiDisplay_MediaItems.ItemData.length <= GuiDisplay_MediaItems.MAXCOLUMNCOUNT * 2) {
					if (GuiDisplay_MediaItems.ItemData.length <= GuiDisplay_MediaItems.MAXCOLUMNCOUNT) {
						document.getElementById("Center").style.top = "200px";
					} else {
						document.getElementById("Center").style.top = "120px";
					}		
				}
			} else {
				if (GuiDisplay_MediaItems.ItemData.length <= GuiDisplay_MediaItems.MAXCOLUMNCOUNT) {
					document.getElementById("Center").style.top = "320px";
				}
			}*/
			if (2 == GuiDisplay_MediaItems.MAXROWCOUNT) {
				document.getElementById("Center").style.top = "340px";
			}
			
			//Create banner headers only if all tv or all movies is selected
			if (GuiDisplay_MediaItems.isAllorFolder == 0) {
				for (var index = 0; index < GuiDisplay_MediaItems.bannerItems.length; index++) {
					if (index != GuiDisplay_MediaItems.bannerItems.length-1) {
						document.getElementById("bannerSelection").innerHTML += "<div id='bannerItem" + index + "' class='bannerItem bannerItemPadding'>"+GuiDisplay_MediaItems.bannerItems[index].replace(/_/g, ' ')+"</div>";			
					} else {
						document.getElementById("bannerSelection").innerHTML += "<div id='bannerItem" + index + "' class='bannerItem'>"+GuiDisplay_MediaItems.bannerItems[index].replace(/_/g, ' ')+"</div>";					
					}
				}
			}
		
			//Indexing Algorithm
			GuiDisplay_MediaItems.ItemIndexData = Support.processIndexing(GuiDisplay_MediaItems.ItemData); 

		
			//Display first XX series
			GuiDisplay_MediaItems.updateDisplayedItems();
			GuiDisplay_MediaItems.updateSelectedItems();
			
			GuiDisplay_MediaItems.selectedBannerItem = -1;
			GuiDisplay_MediaItems.updateSelectedBannerItems();
			GuiDisplay_MediaItems.selectedBannerItem = 0;

			//Set Focus for Key Events
			document.getElementById("body").onkeydown = document.getElementById("GuiDisplay_MediaItems").onkeydown;
			Support.pageLoadTimes("GuiDisplay_MediaItems","UserControl",false);
			
		} else {
			//Set message to user
			document.getElementById("Counter").innerHTML = "";
			document.getElementById("Content").style.fontSize="40px";
			document.getElementById("Content").innerHTML = "Empty Folder/Playlist<br>Press return to go to parent Folder/Playlist";
			
			document.getElementById("body").onkeydown = document.getElementById("NoItems").onkeydown;
		}	
	}	
	catch (err) {
		GuiNotifications.setNotification("Error : " + err.message,"Error",true);
		console.log(err.message);
	}
}

GuiDisplay_MediaItems.updateDisplayedItems = function() {
	if (this.topLeftItem + this.getMaxDisplay() > this.ItemData.length) {
		if (this.totalRecordCount > this.ItemData.length) {
			this.loadMoreItems();
		}
	}
	
Support.updateDisplayedItems(this.ItemData,this.selectedItem,this.topLeftItem,
		Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.length),"Content","",this.isResume,this.genreType);
}

//Function sets CSS Properties so show which user is selected
GuiDisplay_MediaItems.updateSelectedItems = function () {
	if (this.isTvOrMovies == 2 || this.ItemData[0].type == "ChannelAudioItem") {
		//Music - Use different styles
		Support.updateSelectedNEW(this.ItemData,this.selectedItem,this.topLeftItem,
				Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.length),"Music seriesSelected","Music","",false,this.totalRecordCount);
	} else {
		if (window.innerWidth == 1280) {
			Support.updateSelectedNEW(this.ItemData,this.selectedItem,this.topLeftItem,
					Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.length),"SeriesPortrait1280 Selected highlightMezzmoBoarder","SeriesPortrait1280","",false,this.totalRecordCount);
		} else {
			Support.updateSelectedNEW(this.ItemData,this.selectedItem,this.topLeftItem,
					Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.length),"SeriesPortrait seriesSelected highlightMezzmoBoarder","SeriesPortrait","",false,this.totalRecordCount);
		}
		
	}
	
	if (this.ItemData[this.selectedItem] === undefined) {
		return;
	}
	var htmlForTitle = this.ItemData[this.selectedItem].title + "<div style='display:inline-block; position:absolute;'><table style='padding-left:20px;'><tr>";
	
	var toms = this.ItemData[this.selectedItem].CriticRating;
	var stars = this.ItemData[this.selectedItem].CommunityRating;
	var tomsImage = "";
	var starsImage = "";
	if (toms){
		if (toms > 59){
			tomsImage = "images/fresh-40x40.png";
		} else {
			tomsImage = "images/rotten-40x40.png";
		}
		htmlForTitle += "<td class=MetadataItemIcon style=background-image:url("+tomsImage+")></td>";
		htmlForTitle += "<td class=MetadataItemVSmall>" + toms + "%</td>";
	}
	if (stars){
    	if (stars == 0) {
	    		starsImage = "images/stars-0.png";
	    	} else if (stars == 1) {
	    		starsImage = "images/stars-1.png";
	    	} else if (stars == 2) {
	    		starsImage = "images/stars-2.png";
	    	} else if (stars == 3) {
	    		starsImage = "images/stars-3.png";
	    	} else if (stars == 4) {
	    		starsImage = "images/stars-4.png";
	    	} else if (stars == 5) {
	    		starsImage = "images/stars-5.png";
	    	}
    	htmlForTitle += "<td class=MetadataItemIcon style=background-image:url("+starsImage+")></td>";
    	//htmlForTitle += "<td class=MetadataItemVSmall>" + stars + "</td>";
	}
	
	if (this.ItemData[this.selectedItem].type !== undefined
			&& this.ItemData[this.selectedItem].ProductionYear !== undefined) {
		//"" is required to ensure type string is stored!
		text =  "" + Support.SeriesRun(this.ItemData[this.selectedItem].type, this.ItemData[this.selectedItem].ProductionYear, this.ItemData[this.selectedItem].Status, this.ItemData[this.selectedItem].EndDate);

		if (text.indexOf("Present") > -1) {
			htmlForTitle += "<td class='MetadataItemSmallLong'>" + text + "</td>";
		} else {
			htmlForTitle += "<td class='MetadataItemSmall'>" + text + "</td>";
		}
	}
	
	if (this.ItemData[this.selectedItem].OfficialRating !== undefined) {
		htmlForTitle +="<td class='MetadataItemSmall'>" + this.ItemData[this.selectedItem].OfficialRating + "</td>";
	}
	if (this.ItemData[this.selectedItem].RecursiveItemCount !== undefined) {
		if (this.isAllorFolder == 1) {
			htmlForTitle += "<td class='MetadataItemSmall'>" + this.ItemData[this.selectedItem].RecursiveItemCount + " Items</td>";	
			if (this.ItemData[this.selectedItem].RecursiveItemCount == 1){
				htmlForTitle += "<td class='MetadataItemSmall'>" + this.ItemData[this.selectedItem].RecursiveItemCount + " Item</td>";	
			}
		}
		if (this.isTvOrMovies == 2) {
			htmlForTitle += "<td class='MetadataItemSmall'>" + this.ItemData[this.selectedItem].RecursiveItemCount + " Songs</td>";	
			if (this.ItemData[this.selectedItem].RecursiveItemCount == 1){
				htmlForTitle += "<td class='MetadataItemSmall'>" + this.ItemData[this.selectedItem].RecursiveItemCount + " Song</td>";	
			}
		} else {
			if (this.ItemData[this.selectedItem].SeasonCount !== undefined) {
				if (this.ItemData[this.selectedItem].SeasonCount == 1){
					htmlForTitle += "<td class='MetadataItemSmall'>" + this.ItemData[this.selectedItem].SeasonCount + " Season</td>";					
				} else {
					htmlForTitle += "<td class='MetadataItemSmall'>" + this.ItemData[this.selectedItem].SeasonCount + " Seasons</td>";
				}
			}		
		}	
	}
	
	if (this.ItemData[this.selectedItem].RunTimeTicks !== undefined) {
		htmlForTitle += "<td class='MetadataItemSmall'>" + Support.convertTicksToMinutes(this.ItemData[this.selectedItem].RunTimeTicks/10000) + "</td>";
	}
	
	if (this.ItemData[this.selectedItem].Subtitles !== undefined && this.ItemData[this.selectedItem].Subtitles.length != 0) {
		htmlForTitle += "<td class=MetadataItemIcon style=background-image:url(images/ic_closed_caption_white.png)></td>";
	}

	htmlForTitle += "</tr></table></div>";
			
	htmlForSubData = "";
	if (this.ItemData[this.selectedItem].Genres !== undefined) {
		htmlForSubData = this.ItemData[this.selectedItem].Genres.join(" / ");
	}
				
	htmlForOverview = "";
	if (this.ItemData[this.selectedItem].Overview !== undefined) {
		htmlForOverview = this.ItemData[this.selectedItem].Overview;
	}
	if (this.isTvOrMovies == 2) {
		if (this.ItemData[this.selectedItem].CurrentProgram !== undefined) {
			var programmeURL = Server.getItemInfoURL(this.ItemData[this.selectedItem].CurrentProgram.Id,"");
			var ProgrammeData = Server.getContent(programmeURL);
			document.getElementById("SeriesTitle").innerHTML = this.ItemData[this.selectedItem].title;
			document.getElementById("SeriesSubData").innerHTML = "<font color='red'>On Now: </font>"+this.ItemData[this.selectedItem].CurrentProgram.title;
			document.getElementById("SeriesOverview").innerHTML = ProgrammeData.Overview;
			Support.scrollingText("SeriesOverview");
		} else {
			document.getElementById("SeriesTitle").innerHTML = htmlForTitle;
			document.getElementById("SeriesSubData").innerHTML = htmlForSubData;
			document.getElementById("SeriesOverview").innerHTML = htmlForOverview;
			Support.scrollingText("SeriesOverview");
		}
	} else {
		if (File.getUserProperty("LargerView") == true){
			document.getElementById("SeriesTitle").innerHTML = htmlForTitle;
			document.getElementById("SeriesOverview").innerHTML = htmlForOverview;
			Support.scrollingText("SeriesOverview");
		} else {
			//document.getElementById("SeriesContent").style.top = "960px";
			//document.getElementById("SeriesTitle").innerHTML = htmlForTitle;
		}
	}
}

GuiDisplay_MediaItems.updateSelectedBannerItems = function() {
	for (var index = 0; index < this.bannerItems.length; index++) {	
		if (index == this.selectedBannerItem) {
			if (index != this.bannerItems.length-1) {
				document.getElementById("bannerItem"+index).className = "bannerItem bannerItemPadding highlightMezzmoText";
			} else {
				document.getElementById("bannerItem"+index).className = "bannerItem highlightMezzmoText";
			}		
		} else {
			if (index != this.bannerItems.length-1) {
				if (this.bannerItems[index] == this.currentView) {
					document.getElementById("bannerItem"+index).className = "bannerItem bannerItemPadding offWhite";
				} else {
					document.getElementById("bannerItem"+index).className = "bannerItem bannerItemPadding";
				}
			} else {
				if (this.bannerItems[index] == this.currentView) {
					document.getElementById("bannerItem"+index).className = "bannerItem offWhite";
				} else {
					document.getElementById("bannerItem"+index).className = "bannerItem";
				}
			}
		}
	}
	if (this.selectedItem == -1) {
		document.getElementById("Counter").innerHTML = (this.selectedBannerItem+1) + "/" + this.bannerItems.length;
	}
}

GuiDisplay_MediaItems.keyDown = function() {
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);

	if (document.getElementById("Notifications").style.visibility == "") {
		document.getElementById("Notifications").style.visibility = "hidden";
		document.getElementById("NotificationText").innerHTML = "";
		event.preventDefault();
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}
	
	//Clear Indexing Letter Display timeout & Hide
	//clearTimeout(this.indexTimeout);
	document.getElementById("GuiDisplay_MediaItemsIndexing").style.opacity = 0;
	
	//Update Screensaver Timer
	Support.screensaver();
	
	//If screensaver is running 
	if (Main.getIsScreensaverRunning()) {
		//Update Main.js isScreensaverRunning - Sets to True
		Main.setIsScreensaverRunning();
		
		//End Screensaver
		GuiImagePlayer_Screensaver.stopScreensaver();
		
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}
	
	switch(keyCode) {
		//Need Logout Key
		case Common.API.KEY_LEFT:
			console.log("LEFT");	
			event.preventDefault();
			this.processLeftKey();
			break;
		case Common.API.KEY_RIGHT:
			console.log("RIGHT");	
			event.preventDefault();
			this.processRightKey();
			break;		
		case Common.API.KEY_UP:
			console.log("UP");
			event.preventDefault();
			this.processUpKey();
			break;	
		case Common.API.KEY_DOWN:
			console.log("DOWN");
			event.preventDefault();
			this.processDownKey();
			break;	
		case Common.API.KEY_PANEL_CH_UP: 
		case Common.API.KEY_CH_UP: 
			this.processChannelUpKey();
			break;			
		case Common.API.KEY_PANEL_CH_DOWN: 
		case Common.API.KEY_CH_DOWN: 
			this.processChannelDownKey();
			break;	
		case Common.API.KEY_RETURN:
		case 169:
			console.log("RETURN");
			event.preventDefault();
			Support.processReturnURLHistory();
			break;	
		case Common.API.KEY_ENTER:
		case Common.API.KEY_PANEL_ENTER:
			console.log("ENTER");
			this.processSelectedItem();
			break;
		case Common.API.KEY_PLAY:
			this.playSelectedItem();
			break;	
		case Common.API.KEY_GREEN:
			this.toggleWatchedStatus();
			break;
		case Common.API.KEY_RED:	
			if (this.selectedItem > -1) {
				if (this.ItemData[this.selectedItem].UserData.IsFavorite == true) {
					Server.deleteFavourite(this.ItemData[this.selectedItem].Id);
					this.ItemData[this.selectedItem].UserData.IsFavorite = false;
				} else {
					Server.setFavourite(this.ItemData[this.selectedItem].Id);
					this.ItemData[this.selectedItem].UserData.IsFavorite = true;
				}
				GuiDisplay_MediaItems.updateDisplayedItems();
				GuiDisplay_MediaItems.updateSelectedItems();
			}
			break;
		case Common.API.KEY_YELLOW:
			if (!this.isLatest){
				GuiDisplay_MediaItems.processIndexing();
			}
			break;
		case Common.API.KEY_BLUE:
			//Focus the music player
			if (this.selectedItem == -1) {		
				if (this.selectedBannerItem == this.bannerItems.length-1) {
					GuiMusicPlayer.showMusicPlayer("GuiDisplay_MediaItems","bannerItem"+this.selectedBannerItem,"bannerItem highlightMezzmoText");
				} else {
					GuiMusicPlayer.showMusicPlayer("GuiDisplay_MediaItems","bannerItem"+this.selectedBannerItem,"bannerItem bannerItemPadding highlightMezzmoText");
				}
			} else {
				GuiMusicPlayer.showMusicPlayer("GuiDisplay_MediaItems",this.ItemData[this.selectedItem].id,document.getElementById(this.ItemData[this.selectedItem].id).className);
			}
			break;	
		case Common.API.KEY_TOOLS:
			event.preventDefault();
			this.openMenu();
			break;	
		case Common.API.KEY_EXIT:
			console.log ("EXIT KEY");
			tizen.application.getCurrentApplication().exit();
			break;
	}
}

GuiDisplay_MediaItems.onClickItem = function(position) {
	this.selectedItem = position;
	this.processSelectedItem();
}

GuiDisplay_MediaItems.processSelectedItem = function() {
	if (this.selectedItem == -1) {
		switch (this.bannerItems[this.selectedBannerItem]) {
		case "All":	
			var url = Server.getItemTypeURL("&IncludeItemTypes=Movie"+Server.getMoviesViewQueryPart()+"&SortBy=SortName&SortOrder=Ascending&fields=ParentId,SortName,Overview,Genres,RunTimeTicks&recursive=true");
			GuiDisplay_MediaItems.start("All Movies",url,0,0);
			break;
		case "Series":
			var url = Server.getItemTypeURL("&IncludeItemTypes=Series"+Server.getTvViewQueryPart()+"&SortBy=SortName&SortOrder=Ascending&fields=ParentId,SortName,Overview,Genres,RunTimeTicks&recursive=true");
			GuiDisplay_MediaItems.start("All TV",url,0,0);
			break;
		case "Unwatched":
			if (this.isTvOrMovies == 1) {	
				var url = Server.getItemTypeURL("&IncludeItemTypes=Movie"+Server.getMoviesViewQueryPart()+"&SortBy=SortName&SortOrder=Ascending&fields=ParentId,SortName,Overview,Genres,RunTimeTicks&recursive=true&Filters=IsUnPlayed");
				GuiDisplay_MediaItems.start("Unwatched Movies",url,0,0);
			}
			break;
		case "Upcoming":
			GuiTV_Upcoming.start();
			break;
		case "Latest":		
			if (this.isTvOrMovies == 1) {
				var url = Server.getCustomURL("/Users/" + Server.getUserID() + "/Items/Latest?format=json&IncludeItemTypes=Movie"+Server.getMoviesViewQueryPart()+"&IsFolder=false&fields=ParentId,SortName,Overview,Genres,RunTimeTicks");
				GuiDisplay_MediaItems.start("Latest Movies",url,0,0);
			} else if (this.isTvOrMovies == 0){
				var url = Server.getCustomURL("/Users/" + Server.getUserID() + "/Items/Latest?format=json&IncludeItemTypes=Episode&IsFolder=false&fields=ParentId,SortName,Overview,Genres,RunTimeTicks");
				GuiDisplay_MediaItems.start("Latest TV",url,0,0);
			} else {
				var url = Server.getCustomURL("/Users/" + Server.getUserID() + "/Items/Latest?format=json&IncludeItemTypes=Audio&Limit=21&fields=SortName,Genres");
				GuiDisplay_MediaItems.start("Latest Music",url,0,0);
			}			
			break;
		case "Genre":
			if (this.isTvOrMovies == 1) {	
				var url1 = Server.getCustomURL("/Genres?format=json&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Movie"+Server.getMoviesViewQueryPart()+"&Recursive=true&ExcludeLocationTypes=Virtual&Fields=ParentId,SortName,ItemCounts&userId=" + Server.getUserID());
				GuiDisplay_MediaItems.start("Genre Movies",url1,0,0);
			} else {
				var url1 = Server.getCustomURL("/Genres?format=json&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Series"+Server.getTvViewQueryPart()+"&Recursive=true&ExcludeLocationTypes=Virtual&Fields=ParentId,SortName,ItemCounts&userId=" + Server.getUserID());
				GuiDisplay_MediaItems.start("Genre TV",url1,0,0);
			}		
			break;
		case "Channels":
			Support.updateURLHistory("GuiDisplay_MediaItems",this.startParams[0],this.startParams[1],null,null,0,0,false);
			var url = Server.getCustomURL("/LiveTV/Channels?StartIndex=0&EnableFavoriteSorting=true&userId=" + Server.getUserID());
			GuiDisplay_MediaItems.start("Channels LiveTV",url,0,0);
			break;
		case "Recordings":
			Support.updateURLHistory("GuiDisplay_MediaItems",this.startParams[0],this.startParams[1],null,null,0,0,false);
			var url = Server.getCustomURL("/LiveTV/Recordings?IsInProgress=false&SortBy=StartDate&SortOrder=Descending&StartIndex=0&fields=SortName&UserId=" + Server.getUserID());
			GuiDisplay_MediaItems.start("Recordings LiveTV",url,0,0);
			break;
		case "Guide":
			Support.updateURLHistory("GuiDisplay_MediaItems",this.startParams[0],this.startParams[1],null,null,0,0,false);
			var url = Server.getCustomURL("/LiveTV/Channels?StartIndex=0&Limit=100&EnableFavoriteSorting=true&UserId=" + Server.getUserID());
			var guideTime = new Date();
			var timeMsec = guideTime.getTime();
			var startTime = timeMsec - 900000; //rewind the clock fifteen minutes.
			guideTime.setTime(startTime);
			GuiPage_TvGuide.start("Guide",url,0,0,0,guideTime);
			break;
		case "Recent":
		case "Frequent":
		case "Album":	
		case "Album Artist":	
		case "Artist":
			Support.enterMusicPage(this.bannerItems[this.selectedBannerItem]);	
			break;
		case"A-Z":
			if (this.isTvOrMovies == 1) {
				GuiPage_MusicAZ.start("Movies",0);
			} else {
				GuiPage_MusicAZ.start("TV",0);
			}
			break;
		}
	} else {
		if (this.PlaylistId.indexOf("cvasearch:") == 0) {
			this.ItemData[this.selectedItem].parentId = this.PlaylistId;
		}
		Support.processSelectedItem("GuiDisplay_MediaItems",this.ItemData,this.startParams,this.selectedItem,this.topLeftItem,null,this.genreType,this.isLatest); 	

		if (this.ItemData != null && this.ItemData[this.selectedItem].MediaType == "Audio") {
			this.prevSelectedItem = this.selectedItem;
			this.selectedItem = -1;
			GuiDisplay_MediaItems.updateSelectedItems();
		}
	}
}

GuiDisplay_MediaItems.toggleWatchedStatus = function () {
	if (this.selectedItem > -1) {
		var titleArray = this.startParams[0].split(" ");
		switch (titleArray[1]) {
		case "Movies":
		case "Trailer":
			if (this.ItemData[this.selectedItem].UserData.Played == true) {
				Server.deleteWatchedStatus(this.ItemData[this.selectedItem].Id);
				this.ItemData[this.selectedItem].UserData.Played = false;
			} else {
				Server.setWatchedStatus(this.ItemData[this.selectedItem].Id);
				this.ItemData[this.selectedItem].UserData.Played = true;
			}
			GuiDisplay_MediaItems.updateDisplayedItems();
			GuiDisplay_MediaItems.updateSelectedItems();
			break;
		case "TV": //Mark all episodes of all seasons as watched
			if (this.ItemData[this.selectedItem].UserData.Played == true) {
				Server.deleteWatchedStatus(this.ItemData[this.selectedItem].Id);
				var urlSeasons = Server.getChildItemsURL(this.ItemData[this.selectedItem].Id,"&IncludeItemTypes=Season&fields=SortName");
				var seasons = Server.getContent(urlSeasons);
				for (var s = 0; s < seasons.Items.length; s++){
					Server.deleteWatchedStatus(seasons.Items[s].Id);
				}
				this.ItemData[this.selectedItem].UserData.Played = false;
			} else {
				Server.setWatchedStatus(this.ItemData[this.selectedItem].Id);
				var urlSeasons = Server.getChildItemsURL(this.ItemData[this.selectedItem].Id,"&IncludeItemTypes=Season&fields=SortName");
				var seasons = Server.getContent(urlSeasons);
				for (var s = 0; s < seasons.Items.length; s++){
					Server.setWatchedStatus(seasons.Items[s].Id);
				}
				this.ItemData[this.selectedItem].UserData.Played = true;
			}
			GuiDisplay_MediaItems.updateDisplayedItems();
			GuiDisplay_MediaItems.updateSelectedItems();
			break;
		}
	}	
}

GuiDisplay_MediaItems.playSelectedItem = function () {
	Support.playSelectedItem("GuiDisplay_MediaItems",this.ItemData,this.startParams,this.selectedItem,this.topLeftItem,null);
}

GuiDisplay_MediaItems.openMenu = function() {
	if (this.selectedItem == -1) { //Banner menu
		if (this.currentView == "All" || this.currentView == "Series") {
			document.getElementById("bannerItem0").class = "bannerItem bannerItemPadding offWhite";
			GuiMainMenu.requested("GuiDisplay_MediaItems","bannerItem0","bannerItem bannerItemPadding highlightMezzmoText");
		} else {
			document.getElementById("bannerItem0").class = "bannerItem bannerItemPadding";
			GuiMainMenu.requested("GuiDisplay_MediaItems","bannerItem0","bannerItem bannerItemPadding highlightMezzmoText");
		}
	} else if (this.isTvOrMovies == 2) { //Music
		Support.updateURLHistory("GuiDisplay_MediaItems",this.startParams[0],this.startParams[1],null,null,this.selectedItem,this.topLeftItem,null);
		GuiMainMenu.requested("GuiDisplay_MediaItems",this.ItemData[this.selectedItem].Id,"Music Selected");
	} else { //TV or Movies
		Support.updateURLHistory("GuiDisplay_MediaItems",this.startParams[0],this.startParams[1],null,null,this.selectedItem,this.topLeftItem,null,this.PlaylistId,this.ParentData);
		GuiMainMenu.requested("GuiDisplay_MediaItems",this.ItemData[this.selectedItem].Id,(window.innerWidth == 1280) ? "SeriesPortrait1280 Selected" : "SeriesPortrait Selected");
	}
}

GuiDisplay_MediaItems.processLeftKey = function() {
	if (this.selectedItem == -1) {
		this.selectedBannerItem--;
		this.updateSelectedBannerItems();
		if (this.selectedBannerItem == -1) { //Going left from the end of the top menu.
			this.selectedBannerItem = 0;
			this.openMenu();
		}
	} else if (this.selectedItem % this.MAXCOLUMNCOUNT == 0){ //Going left from the first column.
		this.openMenu();
		this.prevSelectedItem = this.selectedItem;
		this.selectedItem = -1;
		this.updateSelectedItems();
	} else {
		this.selectedItem--;
		if (this.selectedItem < 0) {
			this.selectedItem = 0;
		} else {
			if (this.selectedItem < this.topLeftItem) {
				this.topLeftItem = this.selectedItem - (this.getMaxDisplay() - 1);
				if (this.topLeftItem < 0) {
					this.topLeftItem = 0;
				}
				this.updateDisplayedItems();
			}
		}
		this.updateSelectedItems();
	}
}

GuiDisplay_MediaItems.processRightKey = function() {
	if (this.selectedItem == -1) {
		this.selectedBannerItem++;
		if (this.selectedBannerItem >= this.bannerItems.length) {
			this.selectedBannerItem--;
		}
		this.updateSelectedBannerItems();	
	} else {
		this.selectedItem++;
		if (this.selectedItem >= this.ItemData.length) {
			if (this.totalRecordCount > this.ItemData.length) {
				this.loadMoreItems();		
				if (this.selectedItem >= (this.topLeftItem + this.getMaxDisplay())) {
					this.topLeftItem = this.topLeftItem + this.MAXCOLUMNCOUNT;
				}	
				this.updateDisplayedItems();
			} else {
				this.selectedItem = this.selectedItem - 1;
			}					
		} else {
			if (this.selectedItem >= this.topLeftItem+this.getMaxDisplay() ) {
				this.topLeftItem = this.selectedItem;
				this.updateDisplayedItems();
			}
		}
		this.updateSelectedItems();
	}
}

GuiDisplay_MediaItems.processUpKey = function() {
	this.selectedItem = this.selectedItem - this.MAXCOLUMNCOUNT;
	if (this.selectedItem < 0) {
		if (this.isAllorFolder == 0 && this.startParams[0] != "All Collections" && this.bannerItems.length > 0 ) {
			this.selectedBannerItem = 0;
			this.selectedItem = -1;
			//Hide red - If Music use different styles
			if (this.isTvOrMovies == 2) {
				//Music - Use different styles
				Support.updateSelectedNEW(this.ItemData,this.selectedItem,this.topLeftItem,
						Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.length),"Music Selected","Music","");
			} else {
				if (window.innerWidth == 1280) {
					Support.updateSelectedNEW(this.ItemData,this.selectedItem,this.topLeftItem,
							Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.length),"SeriesPortrait1280 Selected","SeriesPortrait1280","");
				} else {
					Support.updateSelectedNEW(this.ItemData,this.selectedItem,this.topLeftItem,
							Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.length),"SeriesPortrait Selected","SeriesPortrait","");
				}
				
			}
			//update selected banner item
			this.updateSelectedBannerItems();
		} else {
			this.selectedItem = 0;
			//update selected item
			this.updateSelectedItems();
		}	
	} else {
		if (this.selectedItem < this.topLeftItem) {
			if (this.topLeftItem - this.MAXCOLUMNCOUNT < 0) {
				this.topLeftItem = 0;
			} else {
				this.topLeftItem = this.topLeftItem - this.MAXCOLUMNCOUNT;
			}
			this.updateDisplayedItems();
		}
		this.updateSelectedItems();
	}	
}

GuiDisplay_MediaItems.processDownKey = function() {
	if (this.selectedItem == -1) {
		this.selectedItem = 0;
		this.selectedBannerItem = -1;
		this.updateSelectedBannerItems();
	} else {
		this.selectedItem = this.selectedItem + this.MAXCOLUMNCOUNT;
		if (this.selectedItem >= this.ItemData.length) {
			if (this.totalRecordCount > this.ItemData.length) {
				this.loadMoreItems();
				
				if (this.selectedItem >= (this.topLeftItem + this.getMaxDisplay())) {
					this.topLeftItem = this.topLeftItem + this.MAXCOLUMNCOUNT;
					this.updateDisplayedItems();
				}
				
			} else {
				this.selectedItem = (this.ItemData.length-1);
				if (this.selectedItem >= (this.topLeftItem  + this.getMaxDisplay())) {
					this.topLeftItem = this.topLeftItem + this.getMaxDisplay();
					this.updateDisplayedItems();
				}
			}	
		} else {
			if (this.selectedItem >= (this.topLeftItem + this.getMaxDisplay())) {
				this.topLeftItem = this.topLeftItem + this.MAXCOLUMNCOUNT;
				this.updateDisplayedItems();
			}
		}
	}
	this.updateSelectedItems();
}

GuiDisplay_MediaItems.processChannelUpKey = function() {
	if (this.selectedItem > -1) {
		this.selectedItem = this.selectedItem - this.getMaxDisplay();
		if (this.selectedItem < 0) {
			this.selectedItem = 0;
			this.topLeftItem = 0;
			this.updateDisplayedItems();
		} else {
			if (this.topLeftItem - this.getMaxDisplay() < 0) {
				this.topLeftItem = 0;
			} else {
				this.topLeftItem = this.topLeftItem - this.getMaxDisplay();
			}
			this.updateDisplayedItems();
		}
		this.updateSelectedItems();
	}
}

GuiDisplay_MediaItems.processChannelDownKey = function() {
	if (this.selectedItem > -1) {
		this.selectedItem = this.selectedItem + this.getMaxDisplay();
		if (this.selectedItem >= this.ItemData.length) {	
			
			if (this.totalRecordCount > this.ItemData.length) {
				this.loadMoreItems();
				
				if (this.selectedItem >= (this.topLeftItem + this.getMaxDisplay())) {
					this.topLeftItem = this.topLeftItem + this.MAXCOLUMNCOUNT;
					this.updateDisplayedItems();
				}		
			} else {
				this.selectedItem = (this.ItemData.length-1);
				if (this.selectedItem >= (this.topLeftItem  + this.getMaxDisplay())) {
					this.topLeftItem = this.topLeftItem + this.getMaxDisplay();
					this.updateDisplayedItems();
				}
			}	
		} else {
			this.topLeftItem = this.topLeftItem + this.getMaxDisplay();
			this.updateDisplayedItems();
		}
		this.updateSelectedItems();
	}
}

GuiDisplay_MediaItems.processIndexing = function() {
	if (this.currentMediaType == "LiveTV") {
		return;
	}
	if (this.selectedItem > -1) {
		var indexLetter = this.ItemIndexData[0];
		var indexPos = this.ItemIndexData[1];
		
		var letterSelected = this.ItemData[this.selectedItem].SortName.charAt(0).toLowerCase();
		if(new RegExp("^([^a-z])").test(letterSelected)){
			letterSelected = "#";
		}
		
		var indexSeekPos = 0; //Safety
		for (var i = 0; i < indexLetter.length; i++) {
			if (letterSelected == indexLetter[i]) {
				indexSeekPos = i+1;
				break;
			}
		}
		
		if (indexSeekPos >= indexPos.length) {
			//Check if more items, if so load next batch
			if (this.totalRecordCount > this.ItemData.length) {
				this.loadMoreItems();
				//If we were skipping through the alphabet we need to bail here.
				if (this.indexTimeout){
					return;
				}
			} else {
				indexSeekPos = 0;
				this.topLeftItem = 0;
			}
		}
		
		this.selectedItem = indexPos[indexSeekPos];
		this.topLeftItem = this.selectedItem; //safety net
		
		for (var i = this.selectedItem; i > this.selectedItem-this.MAXCOLUMNCOUNT; i--) {		
			if (i % this.MAXCOLUMNCOUNT == 0) {
				this.topLeftItem = i;
				break;
			}
		}
		
		document.getElementById("GuiDisplay_MediaItemsIndexing").innerHTML = indexLetter[indexSeekPos].toUpperCase();
		document.getElementById("GuiDisplay_MediaItemsIndexing").style.opacity = 1;
		
		clearTimeout(this.indexTimeout);
		this.indexTimeout = setTimeout(function(){
			document.getElementById("GuiDisplay_MediaItemsIndexing").style.opacity = 0;
			GuiDisplay_MediaItems.updateDisplayedItems();
			GuiDisplay_MediaItems.updateSelectedItems();
		}, 500);
		
		
	}
}

GuiDisplay_MediaItems.loadMoreItems = function() {
	if (this.totalRecordCount > this.ItemData.length && !this.loadingMore) {
		this.loadingMore = true;
		Support.pageLoadTimes("GuiDisplay_MediaItems","GetRemainingItems",true);
		
		//Remove User Control
		document.getElementById("body").onkeydown = document.getElementById("NoKeyInput").onkeydown;
		
		//Load Data
		var originalLength = this.ItemData.length
		
		//Show Loading Div
		document.getElementById("loading").style.visibility = "";
		
		if (this.PlaylistId.indexOf("cvasearch:") == 0) {
			var term = this.PlaylistId.substr(10, this.PlaylistId.length);
			Server.Browse(this.Url, "Search", "0", term, originalLength, 100, "", this.ItemData, GuiDisplay_MediaItems.loadMoreData);
		}
		else {
			Server.Browse(this.Url, "Browse", this.PlaylistId, "BrowseDirectChildren", originalLength, 100, "", this.ItemData, GuiDisplay_MediaItems.loadMoreData);
		}
	}
}

GuiDisplay_MediaItems.loadMoreData = function(itemData, NumberReturned, TotalMatches) {	
	GuiDisplay_MediaItems.loadingMore = false;
	Support.pageLoadTimes("GuiDisplay_MediaItems","GotRemainingItems",false);
	
	GuiDisplay_MediaItems.ItemData = itemData;
	
	document.getElementById("Counter").innerHTML = (this.selectedItem + 1) + "/" + TotalMatches;
	
	//Reprocess Indexing Algorithm
	GuiDisplay_MediaItems.ItemIndexData = Support.processIndexing(GuiDisplay_MediaItems.ItemData); 
	

	setTimeout(function(){	
		//hide Loading Div
		document.getElementById("loading").style.visibility = "hidden";
	}, 200);
	
	//Pass back Control
	document.getElementById("body").onkeydown = document.getElementById("GuiDisplay_MediaItems").onkeydown;

	//Display first XX series
	GuiDisplay_MediaItems.updateDisplayedItems();
	GuiDisplay_MediaItems.updateSelectedItems();
	
	Support.pageLoadTimes("GuiDisplay_MediaItems","AddedRemainingItems",false);

}

GuiDisplay_MediaItems.returnFromMusicPlayer = function() {
	this.selectedItem = 0;
	this.updateDisplayedItems();
	this.updateSelectedItems();
}