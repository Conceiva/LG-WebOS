var GuiPage_ItemDetails = {	
		ItemId : "",
		ItemData : null,
		itemName : "",
		SimilarFilms : null,
		AdjacentData : null,
		EpisodeData : null,
		
		menuItems : [],
		selectedItem : 0,
		
		trailerItems : [],
		trailerUrl : "",
		trailerState : null,
		trailersEnabled : false,
		
		selectedItem2 : 0,
		topLeftItem2 : 0,
		MAXCOLUMNCOUNT2 : 1,
		MAXROWCOUNT2 : 4,
		backdropTimeout : null,
		
		selectedExtra : -1,
		topLeftExtra : 0,
		MAXCOLUMNCOUNT_EXTRA : 4,
		MAXROWCOUNT_EXTRA : 1,
		TrailersData : [],
		
		selectedActor : -1,
		topLeftActor : 0,
		MAXCOLUMNCOUNT_ACTOR : 7,
		MAXROWCOUNT_ACTOR : 1,
		ActorsData : []
};

GuiPage_ItemDetails.onFocus = function() {

}

GuiPage_ItemDetails.getMaxDisplay2 = function() {
	return this.MAXCOLUMNCOUNT2 * this.MAXROWCOUNT2;
};

GuiPage_ItemDetails.getMaxDisplayActor = function() {
	return GuiPage_ItemDetails.MAXCOLUMNCOUNT_ACTOR * GuiPage_ItemDetails.MAXROWCOUNT_ACTOR;
};

GuiPage_ItemDetails.getMaxDisplayExtra = function() {
	return GuiPage_ItemDetails.MAXCOLUMNCOUNT_EXTRA * GuiPage_ItemDetails.MAXROWCOUNT_EXTRA;
};

GuiPage_ItemDetails.updateDisplayedActors = function() {
Support.updateDisplayedItems(GuiPage_ItemDetails.ActorsData,GuiPage_ItemDetails.selectedActor,GuiPage_ItemDetails.topLeftActor,
		Math.min(GuiPage_ItemDetails.topLeftActor + GuiPage_ItemDetails.getMaxDisplayActor(),GuiPage_ItemDetails.ActorsData.length),"guiTV_Show_Cast","",false,"");
}

//Function sets CSS Properties so show which user is selected
GuiPage_ItemDetails.updateSelectedActors = function () {
	Support.updateSelectedNEW(GuiPage_ItemDetails.ActorsData,GuiPage_ItemDetails.selectedActor,GuiPage_ItemDetails.topLeftActor,
			Math.min(GuiPage_ItemDetails.topLeftActor + GuiPage_ItemDetails.getMaxDisplayActor(),GuiPage_ItemDetails.ActorsData.length),"ActorItem seriesSelected highlightMezzmoBoarder","ActorItem","",true,GuiPage_ItemDetails.ActorsData.length);
}

GuiPage_ItemDetails.updateDisplayedExtras = function() {
Support.updateDisplayedItems(GuiPage_ItemDetails.TrailersData,GuiPage_ItemDetails.selectedExtra,GuiPage_ItemDetails.topLeftExtra,
		Math.min(GuiPage_ItemDetails.topLeftExtra + GuiPage_ItemDetails.getMaxDisplayExtra(),GuiPage_ItemDetails.TrailersData.length),"ExtraContent","",false,"");
}

//Function sets CSS Properties so show which user is selected
GuiPage_ItemDetails.updateSelectedExtras = function () {
	Support.updateSelectedNEW(GuiPage_ItemDetails.TrailersData,GuiPage_ItemDetails.selectedExtra,GuiPage_ItemDetails.topLeftExtra,
			Math.min(GuiPage_ItemDetails.topLeftExtra + GuiPage_ItemDetails.getMaxDisplayExtra(),GuiPage_ItemDetails.TrailersData.length),"ExtraLandscape highlightMezzmoBoarder","ExtraLandscape","",false,GuiPage_ItemDetails.ItemData.trailerStreams.length);
}

GuiPage_ItemDetails.processTrailers = function(trailerData, index, itemId) {
	if (GuiPage_ItemDetails.ItemId != itemId) {
		//wrong item
		return;
	}
	
	trailerData.type = "Trailer";
	trailerData.id = index;
	if (trailerData.poster == "") {
		trailerData.poster = "images/movietrailer.png";
	}
	GuiPage_ItemDetails.TrailersData[index] = trailerData;

	GuiPage_ItemDetails.updateDisplayedExtras();
	GuiPage_ItemDetails.updateSelectedExtras();
	
	var trailerTimeout = setTimeout(function() {
		if (GuiPage_ItemDetails.ItemData.trailerStreams.length > index + 1) {
			Server.getContentAsync(GuiPage_ItemDetails.ItemData.trailerStreams[index + 1].Url, index + 1, GuiPage_ItemDetails.ItemId, GuiPage_ItemDetails.processTrailers);
		}
	}, 10);
}

 GuiPage_ItemDetails.getStyle = function(oElm, strCssRule){
	var strValue = "";
	if(document.defaultView && document.defaultView.getComputedStyle){
		strValue = document.defaultView.getComputedStyle(oElm, "").getPropertyValue(strCssRule);
	}
	else if(oElm.currentStyle){
		strCssRule = strCssRule.replace(/\-(\w)/g, function (strMatch, p1){
			return p1.toUpperCase();
		});
		strValue = oElm.currentStyle[strCssRule];
	}
	return strValue;
}

GuiPage_ItemDetails.start = function(itemData, trailersData) {
	console.log("Page Enter : GuiPage_ItemDetails");
	var idChanged = false;
	
	GuiMainMenu.changeVisibility("");
	
	//Clear previous trailer
	if (Main.getModelYear() != "D") {
		this.trailersEnabled = true;
	}
	
	//Save Start Params
	this.startParams = [itemData];
	
	this.ItemData = itemData;
	if (trailersData !== undefined) {
		this.TrailersData = trailersData;
	}
	
	//Set PageContent
	document.getElementById("pageContent").className = "";

    document.getElementById("pageContent").innerHTML = "<div id='InfoContainer' class='infoContainer'> \
					<div id='guiTV_Show_Title' style='font-size:1.7em;'></div> \
					<div id='guiTV_Show_Metadata' class='MetaDataSeasonTable'></div> \
					<br> \
					<div id='overviewHeading' class='subheadingText'>Overview</div> \
					<div id='guiTV_Show_Overview' class='guiFilm_Overview'></div> \
					<br> \
					<div id='castHeading' class='subheadingText'>Cast</div> \
					<div id='guiTV_Show_Cast' class='guiFilm_Cast'></div> \
					<div id='trailersHeading' class='subheadingText'>Trailers</div> \
					<div id='ExtraContent' class='ExtraContent'></div> \
			</div> \
			<div id='guiTV_Show_Metadata2' class='guiTV_Show_Metadata2'></div> \
			<div id='guiTV_Episode_Options' class='guiTV_Episode_Options'></div> \
			<div id='guiTV_Episode_SubOptions' class='guiTV_Episode_SubOptions'></div> \
			<div id='guiTV_Episode_SubOptionImages' class='guiTV_Episode_SubOptionImages'></div> \
			<div id='guiTV_Show_MediaAlternative' class='guiTV_Show_MediaAlternative'></div> \
			<div id='trailerContainer' class='videoTrailerContainer'></div> \
			<div id='imageDisk' class='imageDisk'></div> \
			<div id='guiTV_Show_Poster' class='guiFilm_Poster'></div>";

	var w = window.innerWidth;
	var left = 140;//GuiPage_ItemDetails.getStyle(document.getElementById("guiTV_Show_Overview"), "left");
	var contentWidth = (w - left) - 10;
	document.getElementById("guiTV_Show_Overview").style.width = contentWidth + "px";
	
	document.getElementById("InfoContainer").style.overflowY = "auto";

	var h = window.innerHeight;
	var top = document.getElementById("InfoContainer").style.top;
	var contentHeight = (h - top) - 80;
	document.getElementById("InfoContainer").style.height = contentHeight + "px";
	
	if (this.ItemId != itemData.id) {
		this.ItemId = itemData.id;
		
		//Reset Vars
		this.ActorsData = [];
		this.TrailersData = [];
		this.selectedExtra = -1;
		this.topLeftExtra = 0;
		this.trailerUrl = "";
		this.trailerItems = [];
		this.menuItems.length = 0;
		this.selectedItem = 0;
		
		document.getElementById("Counter").innerHTML = "";
		idChanged = true;
	}
	
	//Get Page Items
	if (this.ItemData.bookmark > 0) {
		if (idChanged) {
			this.menuItems.push("guiTV_Episode_Resume");
		}
		this.resumeTicksSamsung = this.ItemData.bookmark * 1000;     					
		document.getElementById("guiTV_Episode_Options").innerHTML += "<div id='guiTV_Episode_Resume' class='FilmListSingle' onclick='GuiPage_ItemDetails.playFeature(GuiPage_ItemDetails.ItemData.bookmark);'><div class='FilmListSingleImage' style=background-image:url(images/menu/Resume-46x37.png)></div><div class='ShowListSingleTitle'><span class='ShowListTextOneLineFilm'>RESUME "+Support.convertTicksToTimeSingle(this.resumeTicksSamsung)+"</span></div></div>";
	}
	
	//If the item is a trailer from the trailers channel, make the main play button into a Play Trailer button instead.
	if (this.ItemData.type == "Trailer" && this.trailersEnabled){
		if (idChanged) {
			this.menuItems.push("guiTV_Episode_Play");
		}
		document.getElementById("guiTV_Episode_Options").innerHTML += "<div id='guiTV_Episode_Play' class='FilmListSingle'><div class='FilmListSingleImage' style=background-image:url(images/menu/Play-46x37.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>PLAY TRAILER</div></div></div>";
	} else if (this.ItemData.LocationType != "Virtual") {
		if (idChanged) {
			this.menuItems.push("guiTV_Episode_Play");
		}
		document.getElementById("guiTV_Episode_Options").innerHTML += "<div id='guiTV_Episode_Play' class='FilmListSingle' onclick='GuiPage_ItemDetails.playFeature(0);'><div class='FilmListSingleImage' style=background-image:url(images/menu/Play-46x37.png)></div><div class='ShowListSingleTitle'><span class='ShowListTextOneLineFilm'>PLAY</span></div></div>";
	}

	//Get trailerItems
	if (this.ItemData.trailerStreams.length > 0) {
		document.getElementById("trailerContainer").style.visibility="hidden";

		if (this.TrailersData == null) {
			this.TrailersData = [];
		}
		
		if (this.TrailersData.length == 0) {
			for (index = 0; index < this.ItemData.trailerStreams.length; index++) {
				this.TrailersData.push({"type":"Trailer", "id":index, "title":"Loading...", "poster":"images/ic_hourglass_empty_white.png"});
			}
				
			GuiPage_ItemDetails.updateDisplayedExtras();
			GuiPage_ItemDetails.updateSelectedExtras();
			
			Server.getContentAsync(this.ItemData.trailerStreams[0].Url, 0, GuiPage_ItemDetails.ItemId, GuiPage_ItemDetails.processTrailers);
		}
		else {
			for (index = 0; index < this.TrailersData.length; index++) {
				if (this.TrailersData[index].title == "Loading...") {
					// not loaded yet, load the data
					Server.getContentAsync(this.ItemData.trailerStreams[index].Url, index, GuiPage_ItemDetails.ItemId, GuiPage_ItemDetails.processTrailers);
					break;
				}
			}
			GuiPage_ItemDetails.updateDisplayedExtras();
			GuiPage_ItemDetails.updateSelectedExtras();
		}
	} else if (this.ItemData.type == "Trailer"){
		document.getElementById("trailerContainer").style.visibility="";
		this.trailerUrl = Server.getStreamUrl(this.ItemData.id,this.ItemData.MediaSources[0].Id);
	} else if (this.ItemData.trailerStreams.length == 0) {
		document.getElementById("trailerContainer").style.visibility="hidden";
		document.getElementById("trailersHeading").style.visibility="hidden";
	}
	
	
	//Set Title 
	this.itemName = this.ItemData.title;
	if (this.itemName.length > 42){
		this.itemName = this.itemName.substring(0,42) + "...";
	}
	document.getElementById("guiTV_Show_Title").innerHTML = this.itemName;
	
	//Set Film Poster
	if (this.ItemData.poster) {
		var imgsrc = this.ItemData.poster;
		document.getElementById("guiTV_Show_Poster").style.backgroundImage="url('" + imgsrc + "')";
	}
	
	
	//Set Film Backdrop
	//this.backdropTimeout = setTimeout(function(){
		if (GuiPage_ItemDetails.ItemData.backdrop) {
			var imgsrc = GuiPage_ItemDetails.ItemData.backdrop;
			Support.fadeImage(imgsrc);
		}
	//}, 10);
	
	
	
	
	//Set watched and favourite status
	GuiPage_ItemDetails.updateItemUserStatus(this.ItemData);
	
	//Update Overview
	if (this.ItemData.Overview != null && this.ItemData.Overview != "") {
		document.getElementById("guiTV_Show_Overview").innerHTML = this.ItemData.Overview;
	}
	else {
		document.getElementById("overviewHeading").style.visibility="hidden";
	}
	
	//Update Cast
	if (this.ItemData.People != null && this.ActorsData.length == 0) {
		if (this.ItemData.People != "") {
			var people = this.ItemData.People.split(", ");
			for (index = 0; index < people.length; index++) {
				this.ActorsData.push({'id':'actor_' + index, 'title':people[index],'poster':this.ItemData.imageSearchUrl + "?imagesearch=" + encodeURI(people[index]), 'type':'actor'});
			}
			this.updateDisplayedActors();
			this.updateSelectedActors();
		}		
		else {
			document.getElementById("castHeading").style.visibility="hidden";
		}
	}
	else {
		this.updateDisplayedActors();
		this.updateSelectedActors();
	}
	
	//Get ratings info.
	var htmlForMetaData = "";
	var toms = this.ItemData.CriticRating;
	var stars = this.ItemData.CommunityRating;
	var tomsImage = "";
	var starsImage = "";

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
		htmlForMetaData += "<div class=MetadataItemIcon style=background-image:url("+starsImage+")></div>";
		//htmlForMetaData += "<td class=MetadataItemVSmall>" + stars + "</td>";
	}
	
	if (this.ItemData.type != "Episode") {
		if (this.ItemData.Year !== undefined) {
			htmlForMetaData += "<div class='MetadataItemSmall'>&nbsp;" + this.ItemData.Year + "</div>";
		}
	} else {
		if (this.ItemData.PremiereDate !== undefined) {
			htmlForMetaData += "<div class='MetadataItemSmallLong'>    " + this.ItemData.PremiereDate + "</div>";
			}
	}

	if (this.ItemData.ContentRating !== undefined) {
		htmlForMetaData += "<div class='MetadataItemSmall'>" + this.ItemData.ContentRating + "</div>";
	}

	if (this.ItemData.duration !== undefined) {
		var hms = this.ItemData.duration;   // your input string
		var a = hms.split(':'); // split it at the colons

		// minutes are worth 60 seconds. Hours are worth 60 minutes.
		var totalseconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 
		htmlForMetaData += "<div class='MetadataItemSmall'>" + Support.convertTicksToMinutes(totalseconds* 1000) + "</div>";
	}
	
	if (this.ItemData.Subtitles.length != 0) {
		htmlForMetaData += "<div class=MetadataItemIcon style=background-image:url(images/ic_closed_caption_white.png)></div>";
	}
	
	if (this.ItemData.Album != "") {
		htmlForMetaData += "<div class='subheadingText' style='vertical-align:middle'>Series</div>";
		htmlForMetaData += "<div style='padding:10px'>" + this.ItemData.Album + "</div>";
		
	}
	
	if (this.ItemData.episode != 0) {
		if (this.ItemData.season != "") {
			htmlForMetaData += "<div class='subheadingText' style='vertical-align:middle;padding-left:5px;'>Season</div>";
			htmlForMetaData += "<div style='padding:10px'>" + this.ItemData.season + "</div>";
			
		}
		
		if (this.ItemData.episode != "") {
			htmlForMetaData += "<div class='subheadingText' style='vertical-align:middle;padding-left:5px;'>Episode</div>";
			htmlForMetaData += "<div style='padding:10px'>" + this.ItemData.episode + "</div>";
			
		}
	}
	
	document.getElementById("guiTV_Show_Metadata").innerHTML = htmlForMetaData;
	
	
	var htmlForMetaData2 = "";
	
	if (this.ItemData.Creator != "") {
		htmlForMetaData2 += "<div class='subheadingText'>Director</div>";
		htmlForMetaData2 += "<div style='padding:5px'>" + this.ItemData.Creator + "</div>";
		
	}
		
	if (this.ItemData.Genre != "") {
		htmlForMetaData2 += "<div class='subheadingText'>Genre</div>";
		htmlForMetaData2 += "<div style='padding:5px'>" + this.ItemData.Genre + "</div>";
		
	}
	
	document.getElementById("guiTV_Show_Metadata2").innerHTML = htmlForMetaData2;
	
	//Set Overview Scroller
	Support.scrollingText("guiTV_Show_Overview");
	
	//Process Media Info
	if (this.menuItems.length < 7) {
		//this.getMediaInfo();
	} else{
		//Need to add text version here!
	}
	
	//Set MediaInfo Height (default is 25px)
	if (this.menuItems.length == 5) {
		document.getElementById("guiTV_Show_MediaAlternative").style.bottom = "45px";
	} else if (this.menuItems.length == 4) {
		document.getElementById("guiTV_Show_MediaAlternative").style.bottom = "70px";
	} else if (this.menuItems.length < 4) {
		document.getElementById("guiTV_Show_MediaAlternative").style.bottom = "90px";
	}
	
	//Update Selected Item
	this.updateSelectedItems();
	
	//Set Focus for Key Events
	document.getElementById("body").onkeydown = document.getElementById("GuiPage_ItemDetails").onkeydown;
	
	
};

//Function sets CSS Properties so show which user is selected
GuiPage_ItemDetails.updateSelectedItems = function () {
	for (var index = 0; index < this.menuItems.length; index++){	
		if (document.getElementById(this.menuItems[index]) != null) {
			if (index == this.selectedItem) {
				document.getElementById(this.menuItems[index]).className = "FilmListSingle highlightMezzmoBackground";	
			} else {	
				document.getElementById(this.menuItems[index]).className = "FilmListSingle highlightMezzmoBackground";		
			}		
		}
	} 

	document.getElementById("guiTV_Episode_SubOptions").style.display="none";
	document.getElementById("guiTV_Episode_SubOptionImages").style.display="none";
	
	if (this.menuItems[this.selectedItem] == "guiTV_Episode_Play" && this.trailerItems.length > 0) {
		document.getElementById("guiTV_Episode_SubOptions").style.display="";
		document.getElementById("guiTV_Episode_SubOptionImages").style.display="";
		this.subMenuItems = ["1"];
		this.selectedItem2 = 0;
		this.topLeftItem2 = 0;
		this.updateDisplayedItems2();
	} else if (this.menuItems[this.selectedItem] == "guiTV_Episode_Chapters") {
		document.getElementById("guiTV_Episode_SubOptions").style.display="";
		document.getElementById("guiTV_Episode_SubOptionImages").style.display="";
		this.subMenuItems = this.ItemData.Chapters;
		this.selectedItem2 = 0;
		this.topLeftItem2 = 0;
		this.updateDisplayedItems2();
	} else if (this.menuItems[this.selectedItem] == "guiTV_Episode_Episodes") {
			document.getElementById("guiTV_Episode_SubOptions").style.display="";
			document.getElementById("guiTV_Episode_SubOptionImages").style.display="";
			this.subMenuItems = this.EpisodeData.Items;
			//Set the previous episode at the top of the More Episodes list.
			if (this.ItemData.IndexNumber) {
				this.selectedItem2 = this.ItemData.IndexNumber -1;
			} else {
				this.selectedItem2 = 0;
			}
			if (this.EpisodeData.Items){
				this.topLeftItem2 = Math.min(Math.max(this.ItemData.IndexNumber -2,0), this.EpisodeData.Items.length -4);
				if (this.topLeftItem2 < 0){
					this.topLeftItem2 = 0;
				}
			} else {
				this.topLeftItem2 = 0;
			}
				
			
			this.updateDisplayedItems2();
	} else if (this.menuItems[this.selectedItem] == "guiTV_Episode_Cast") {
		document.getElementById("guiTV_Episode_SubOptions").style.display="";
		document.getElementById("guiTV_Episode_SubOptionImages").style.display="";
		if (this.ItemData.type == "Episode") {
			this.subMenuItems = this.SeriesData.People;
			if (this.ItemData.People !== undefined){
				this.subMenuItems.push.apply(this.subMenuItems, this.ItemData.People);
			}
			
		} else {
			this.subMenuItems = this.ItemData.People;
		}
		this.selectedItem2 = 0;
		this.topLeftItem2 = 0;
		this.updateDisplayedItems2();
	} else if (this.menuItems[this.selectedItem] == "guiTV_Episode_Suggested") {
		document.getElementById("guiTV_Episode_SubOptions").style.display="";
		document.getElementById("guiTV_Episode_SubOptionImages").style.display="";
		this.subMenuItems = this.SimilarFilms.Items;
		this.selectedItem2 = 0;
		this.topLeftItem2 = 0;
		this.updateDisplayedItems2();
	}
};

GuiPage_ItemDetails.keyDown = function()
{
	var keyCode = event.keyCode;
	console.log("Key pressed: " + keyCode);

	if (document.getElementById("Notifications").style.visibility == "") {
		document.getElementById("Notifications").style.visibility = "hidden";
		document.getElementById("NotificationText").innerHTML = "";
		event.preventDefault();
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}
	
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
		case Common.API.KEY_UP:
			event.preventDefault();
			if (this.selectedExtra == -1) {
				if (this.selectedItem > 0) {
					this.selectedItem--;
					this.updateSelectedItems();
				}
			}
			else {
				this.selectedExtra = this.selectedExtra - this.MAXCOLUMNCOUNT_EXTRA;
				if (this.selectedExtra < this.topLeftExtra) {
					if (this.topLeftExtra - this.MAXCOLUMNCOUNT_EXTRA < 0) {
						this.topLeftExtra = 0;
					} else {
						this.topLeftExtra = this.topLeftExtra - this.MAXCOLUMNCOUNT_EXTRA;
					}
					this.updateDisplayedExtras();
				}
				this.updateSelectedExtras();
			}
		break;
		case Common.API.KEY_DOWN:
			event.preventDefault();
			if (this.selectedExtra == -1) {
				this.selectedItem++;
				if (this.selectedItem > this.menuItems.length-1) {
					this.selectedItem--;
				} else {
					this.updateSelectedItems();
				}
			}
			else {
				this.selectedExtra = this.selectedExtra + this.MAXCOLUMNCOUNT_EXTRA;
				if (this.selectedExtra >= this.TrailersData.length) {
					if (this.ItemData.trailerStreams.length > this.TrailersData.length) {
						//this.loadMoreItems();
						
						if (this.selectedExtra >= (this.topLeftExtra + this.getMaxDisplayExtra())) {
							this.topLeftExtra = this.topLeftExtra + this.MAXCOLUMNCOUNT_EXTRA;
							this.updateDisplayedExtras();
						}
						
					} else {
						this.selectedExtra = (this.TrailersData.length-1);
						if (this.selectedExtra >= (this.topLeftExtra  + this.getMaxDisplayExtra())) {
							this.topLeftExtra = this.topLeftExtra + this.getMaxDisplayExtra();
							this.updateDisplayedExtras();
						}
					}	
				} else {
					if (this.selectedExtra >= (this.topLeftExtra + this.getMaxDisplayExtra())) {
						this.topLeftExtra = this.topLeftExtra + this.MAXCOLUMNCOUNT_EXTRA;
						this.updateDisplayedExtras();
					}
				}
				this.updateSelectedExtras();
			}
		break;
		case Common.API.KEY_LEFT:
			console.log ("LEFT");
			event.preventDefault();
			this.processLeftKey();
			break;
		case Common.API.KEY_RIGHT:
			console.log ("RIGHT");
			event.preventDefault();
			this.processRightKey();
			break;
		case Common.API.KEY_RETURN:
		case 169:
			console.log("RETURN");
			event.preventDefault();
			if (this.trailersEnabled){
			    
			}
			Support.processReturnURLHistory();
			break;	
		case Common.API.KEY_STOP:
			if (this.trailersEnabled){
			    if (this.trailerState == sf.service.VideoPlayer.STATE_PLAYING || 
			    		this.trailerState == sf.service.VideoPlayer.STATE_BUFFERING || 
					    this.trailerState == sf.service.VideoPlayer.STATE_PAUSED) {
					sf.service.VideoPlayer.stop();
					sf.service.VideoPlayer.hide();
				}
				//Set the trailer button back to Play
				if (this.ItemData.type == "Trailer"){
					document.getElementById("guiTV_Episode_Play").innerHTML = "<div class='FilmListSingleImage' style=background-image:url(images/menu/Play-46x37.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>PLAY TRAILER</div></div>";
				} else if (this.selectedItem == 0) {
					document.getElementById("guiTV_Episode_SubOptions").innerHTML = "<div id=0 class='FilmListSingle'><div class='FilmListSingleImage' style=background-image:url(images/menu/Play-46x37.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>PLAY TRAILER</div></div></div>";
				}
			}
			break;
		case Common.API.KEY_PLAY:
			if (this.trailersEnabled){
				if (this.trailerState == sf.service.VideoPlayer.STATE_PAUSED) {
					sf.service.VideoPlayer.resume();
				}
			}
			break;
		case Common.API.KEY_PAUSE:
			if (this.trailersEnabled){
				if (this.trailerState == sf.service.VideoPlayer.STATE_PAUSED) {
					sf.service.VideoPlayer.resume();
				} else {
					sf.service.VideoPlayer.pause();
				}
			}
			break;
		case Common.API.KEY_ENTER:
		case Common.API.KEY_PANEL_ENTER:
			console.log("ENTER");
			this.processSelectedItem();
			break;	
		case Common.API.KEY_TOOLS:
			event.preventDefault();
			this.openMenu();
			break;		
		case Common.API.KEY_RED:	
			if (this.ItemData.UserData.IsFavorite == true) {
				Server.deleteFavourite(this.ItemData.id);
				this.ItemData.UserData.IsFavorite = false;
			} else {
				Server.setFavourite(this.ItemData.id);
				this.ItemData.UserData.IsFavorite = true;
			}
			GuiPage_ItemDetails.updateItemUserStatus(this.ItemData);
			break;
		case Common.API.KEY_GREEN:
			if (this.ItemData.MediaType == "Video") {
				if (this.ItemData.UserData.Played == true) {
					Server.deleteWatchedStatus(this.ItemData.id);
					this.ItemData.UserData.Played = false;
				} else {
					Server.setWatchedStatus(this.ItemData.id);
					this.ItemData.UserData.Played = true;
				}
				GuiPage_ItemDetails.updateItemUserStatus(this.ItemData);
			}
			break;
		case Common.API.KEY_YELLOW:
			if (this.trailersEnabled){
				if (this.trailerState == sf.service.VideoPlayer.STATE_PLAYING ||
						this.trailerState == sf.service.VideoPlayer.STATE_PAUSED ||
						this.trailerState == sf.service.VideoPlayer.STATE_BUFFERING) {
					sf.service.VideoPlayer.setFullScreen(true);
					document.getElementById('sf-service-videoplayer-full-infobar').style.display= 'none';
					document.getElementById('sf-service-videoplayer-full-helpbar').style.display= 'none';
				}
			}
			break;
		case Common.API.KEY_BLUE:
			GuiMusicPlayer.showMusicPlayer("GuiPage_ItemDetails",this.menuItems[this.selectedItem],document.getElementById(this.menuItems[this.selectedItem]).className);
			break;	
		case Common.API.KEY_EXIT:
			console.log ("EXIT KEY");
			widgetAPI.sendExitEvent();
			break;
	}
};

GuiPage_ItemDetails.updateItemUserStatus = function(item) { //Watched and Favourite status
	var addSpan = "";
	if (item.lastPlayed == true) {
		addSpan = "<span class='itemPageWatched highlightMezzmoBackground'>&#10003</span>";
	}
	var title = this.ItemData.title;
	document.getElementById("guiTV_Show_Title").innerHTML = (this.ItemData.type == "Episode") ? title : this.itemName;
	document.getElementById("guiTV_Show_Title").innerHTML += addSpan;
}

GuiPage_ItemDetails.openMenu = function() {
	Support.updateURLHistory("GuiPage_ItemDetails",this.startParams[0],this.startParams[1],null,null,this.selectedItem,null,true);
	document.getElementById(this.menuItems[this.selectedItem]).className = "FilmListSingle"; 
	GuiMainMenu.requested("GuiPage_ItemDetails",this.menuItems[this.selectedItem],"FilmListSingle highlightMezzmoBackground");
}

GuiPage_ItemDetails.processLeftKey = function() {
	if (this.selectedExtra > -1) {
		this.selectedExtra--;
		if (this.selectedExtra == -1) {
			this.selectedItem = 0;
			this.updateSelectedItems();
		}
		GuiPage_ItemDetails.updateDisplayedExtras();
		GuiPage_ItemDetails.updateSelectedExtras();
		return;
	}
	
    if (this.trailerState == sf.service.VideoPlayer.STATE_PLAYING || 
    		this.trailerState == sf.service.VideoPlayer.STATE_BUFFERING) {
		sf.service.VideoPlayer.pause();
	}
	if (this.trailerState != null) {
		sf.service.VideoPlayer.hide();
	}
	this.openMenu();
};

GuiPage_ItemDetails.processRightKey = function() {
	if (this.selectedExtra < this.ItemData.trailerStreams.length) {
		if (this.selectedItem != -1) {
			this.selectedItem = -1;
			this.updateSelectedItems();
		}
		this.selectedExtra++;
		GuiPage_ItemDetails.updateDisplayedExtras();
		GuiPage_ItemDetails.updateSelectedExtras();
		return;
	}
	
	if (this.menuItems[this.selectedItem] == "guiTV_Episode_Play" ||
			   	this.menuItems[this.selectedItem] == "guiTV_Episode_Resume" || 
			   	this.menuItems[this.selectedItem] == "guiTV_Episode_Playlist" ) {
		return;
	} else {
		//this.processSelectedItem();
	}
};

GuiPage_ItemDetails.processSelectedItem = function() {	
	if (this.selectedExtra != -1) {
		var url = this.ItemData.trailerStreams[this.selectedExtra].Url;
		
		var trailerData = this.TrailersData[this.selectedExtra];
		this.ItemData.trailerDuration = trailerData.duration;
		this.ItemData.trailerPoster = trailerData.poster;
		this.ItemData.trailerDescription = trailerData.description;
		this.ItemData.trailerTitle = trailerData.title;
		
		this.playTrailer(url);
		return;
	}
	
	switch (this.menuItems[this.selectedItem]) {
	case "guiTV_Episode_PlayTrailer":
		this.playTrailer(this.trailerUrl);
		//document.getElementById("guiTV_Episode_PlayTrailer").innerHTML = "<div class='FilmListSingleImage' style=background-image:url(images/menu/Stop-46x37.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>STOP TRAILER</div></div>";
			
		break;
	case "guiTV_Episode_Play":
	case "guiTV_Episode_Resume":
		if (this.ItemData.type == "Trailer" && this.trailersEnabled){
			//Trailer playback
			var htmlToAdd = "";
		    if (this.trailerState == sf.service.VideoPlayer.STATE_PLAYING || 
		    		this.trailerState == sf.service.VideoPlayer.STATE_BUFFERING ||
		    		this.trailerState == sf.service.VideoPlayer.STATE_PAUSED) {
				sf.service.VideoPlayer.stop();
				sf.service.VideoPlayer.hide();
				//Turn on Screensaver
				Support.screensaverOn();
				Support.screensaver();
				document.getElementById("guiTV_Episode_Play").innerHTML = "<div class='FilmListSingleImage' style=background-image:url(images/menu/Play-46x37.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>PLAY TRAILER</div></div>";
			} else {
		    	this.playTrailer(this.trailerUrl);
				document.getElementById("guiTV_Episode_Play").innerHTML = "<div class='FilmListSingleImage' style=background-image:url(images/menu/Stop-46x37.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>STOP TRAILER</div></div>";
			}
		} else {
			//Feature playback

			Support.updateURLHistory("GuiPage_ItemDetails",this.startParams[0],this.startParams[1],null,null,this.selectedItem,null,true);
			var url = this.ItemData.contentUrl;

			var playbackPos = this.ItemData.bookmark;
			if (this.menuItems[this.selectedItem] == "guiTV_Episode_Play") {
				playbackPos = 0;
			}
			console.log (url);
			GuiPlayer.start("PLAY",url,this.ItemData,playbackPos,"GuiPage_ItemDetails");
		}
		break;
	case "guiTV_Episode_Chapters":
	case "guiTV_Episode_Episodes":
	case "guiTV_Episode_Cast":
	case "guiTV_Episode_Suggested":
		document.getElementById(this.menuItems[this.selectedItem]).className = "FilmListSingle";
		this.updateSelectedItems2();
		document.getElementById("body").onkeydown = document.getElementById("GuiPage_ItemDetailsSub").onkeydown;
		break;	
	case "guiTV_Episode_Playlist":

		GuiPage_AddToPlaylist.start(this.ItemData.id,"GuiPage_ItemDetails",this.ItemData.MediaType);
		break;		
	default:
		break;	
	}
};

GuiPage_ItemDetails.playFeature = function(playbackPos) {
	Support.updateURLHistory("GuiPage_ItemDetails",this.startParams[0],this.startParams[1],null,null,this.selectedItem,null,true);
	var url = this.ItemData.contentUrl;

	console.log (url);
	GuiPlayer.start("PLAY",url,this.ItemData,playbackPos,"GuiPage_ItemDetails");
};

//----------------------------------------------------------------------------------------------------------------------------------

GuiPage_ItemDetails.updateDisplayedItems2 = function() {
	var htmlToAdd = "";
	var htmlToAdd2 = "";
	for (var index = this.topLeftItem2; index < Math.min(this.topLeftItem2 + this.getMaxDisplay2(),this.subMenuItems.length);index++) {
		switch (this.menuItems[this.selectedItem]) {
		case "guiTV_Episode_Play":
		    if (this.trailerState == sf.service.VideoPlayer.STATE_PLAYING || 
		    		this.trailerState == sf.service.VideoPlayer.STATE_BUFFERING || 
				    this.trailerState == sf.service.VideoPlayer.STATE_PAUSED) {
				htmlToAdd += "<div id="+index+" class='FilmListSingle'><div class='FilmListSingleImage' style=background-image:url(images/menu/Stop-46x37.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>STOP TRAILER</div></div></div>";
		    } else {
		    	htmlToAdd += "<div id="+index+" class='FilmListSingle'><div class='FilmListSingleImage' style=background-image:url(images/menu/Play-46x37.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>PLAY TRAILER</div></div></div>";
		    }
			break;
		case "guiTV_Episode_Chapters":
			var resumeTicksSamsung = this.subMenuItems[index].StartPositionTicks / 10000;
			htmlToAdd += "<div id="+index+" class='FilmListSubSingle'><div style='width:340px;'>"+this.subMenuItems[index].Name+"<br>"+Support.convertTicksToTimeSingle(resumeTicksSamsung)+"</div></div>";			
			var imgsrc = Server.getImageURL(this.ItemData.id,"Chapter",210,116,null,null,null,index);
			htmlToAdd2 += "<div class='EpisodeSubListSingleImage' style=background-image:url(" +imgsrc+ ")></div>";
			break;
		case "guiTV_Episode_Episodes":
			var title = "";
			if (this.subMenuItems[index].IndexNumber === undefined) {
				title = this.subMenuItems[index].Name;
			} else {
				title = this.subMenuItems[index].IndexNumber + " - " + this.subMenuItems[index].Name;
			}
			htmlToAdd += "<div id="+index+" class='FilmListSubSingle'><div style='width:340px;'>"+ title;
			
			var hms = this.ItemData.duration;   // your input string
			var a = hms.split(':'); // split it at the colons

			// minutes are worth 60 seconds. Hours are worth 60 minutes.
			var totalseconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 
			hms = Items[index].bookmark;   // your input string
			a = hms.split(':'); // split it at the colons

			// minutes are worth 60 seconds. Hours are worth 60 minutes.
			var bookmarkseconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 
			var playedPercentage = (bookmarkseconds / totalseconds) * 100;
			
			var progress = Math.round((340 / 100) * Math.round(playedPercentage));
			if (progress > 1){
				htmlToAdd += "<div class=menuProgressBar></div><div class=menuProgressBar_Current style='width:"+progress+"px;'></div>";
			}
			htmlToAdd +=  "</div></div>";
			if (this.subMenuItems[index].ImageTags.Primary) {			
				var imgsrc = Server.getImageURL(this.subMenuItems[index].Id,"Primary",210,116,0,false,0);
				htmlToAdd2 += "<div class='EpisodeSubListSingleImage' style=background-image:url(" +imgsrc+ ")>";
			} else {
				htmlToAdd2 += "<div class='EpisodeSubListSingleImage'>";
			}
			//Add watched and favourite overlays.
			if (this.subMenuItems[index].lastPlayed) {
				htmlToAdd2 += "<div class='moreEpisodesWatchedItem highlightMezzmoBackground' style=align:right>&#10003</div>";	
			}
			htmlToAdd2 += "</div>";
			
			break;
		case "guiTV_Episode_Cast":
			if (this.subMenuItems[index].Type == "Actor" && this.subMenuItems[index].Role !== undefined){
				htmlToAdd += "<div id="+index+" class='FilmListSubSingle'><div style='width:460px;'>"+this.subMenuItems[index].Name+"<br>as "+this.subMenuItems[index].Role+"</div></div>";
			} else {
				htmlToAdd += "<div id="+index+" class='FilmListSubSingle'><div style='width:460px;'>"+this.subMenuItems[index].Name+"</div></div>";
			}
			var imgsrc = Server.getImageURL(this.subMenuItems[index].Id,"Primary",210,116,0,false,0);
			htmlToAdd2 += "<div class='EpisodeSubListSingleImage' style=background-image:url(" +imgsrc+ ")></div>";
			break;
		case "guiTV_Episode_Suggested":
			htmlToAdd += "<div id="+index+" class='FilmListSubSingle'><div style='width:480px;'>"+this.subMenuItems[index].Name+"</div></div>";
			var imgsrc = Server.getImageURL(this.subMenuItems[index].Id,"Primary",210,116,0,false,0);
			htmlToAdd2 += "<div class='EpisodeSubListSingleImage' style=background-image:url(" +imgsrc+ ")></div>";
			break;
		}
	}
	document.getElementById("guiTV_Episode_SubOptions").innerHTML = htmlToAdd;
	document.getElementById("guiTV_Episode_SubOptionImages").innerHTML = htmlToAdd2;
};

GuiPage_ItemDetails.updateSelectedItems2 = function() {
	for (var index = this.topLeftItem2; index < Math.min(this.topLeftItem2 + this.getMaxDisplay2(),this.subMenuItems.length);index++) {	
		if (this.menuItems[this.selectedItem] == "guiTV_Episode_Play") {
			if (index == this.selectedItem2) {
					document.getElementById(index).className = "FilmListSingle highlightMezzmoBackground";
			} else {
					document.getElementById(index).className = "FilmListSingle";
			}
		} else {
			if (index == this.selectedItem2) {
				document.getElementById(index).className = "FilmListSubSingle highlightMezzmoBackground";
			} else {
				document.getElementById(index).className = "FilmListSubSingle";
			}
		}
	} 
};

GuiPage_ItemDetails.subKeyDown = function() {
	var keyCode = event.keyCode;
	console.log("Key pressed: " + keyCode);

	if (document.getElementById("Notifications").style.visibility == "") {
		document.getElementById("Notifications").style.visibility = "hidden";
		document.getElementById("NotificationText").innerHTML = "";
		event.preventDefault();
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}
	
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
	
	switch(keyCode)
	{	
		case Common.API.KEY_UP:
			this.selectedItem2--;
			if (this.selectedItem2 < 0) {
				this.selectedItem2++;
			}
			if (this.selectedItem2 < this.topLeftItem2) {
				this.topLeftItem2--;
				this.updateDisplayedItems2();
			}
			this.updateSelectedItems2();
		break;
		case Common.API.KEY_DOWN:
			this.selectedItem2++;
			if (this.selectedItem2 > this.subMenuItems.length-1) {
				this.selectedItem2--;
			}
			if (this.selectedItem2 >= this.topLeftItem2 + this.getMaxDisplay2()) {
				this.topLeftItem2++;
				this.updateDisplayedItems2();
			}
			this.updateSelectedItems2();
			break;
		case Common.API.KEY_RETURN:
			console.log("RETURN");
			event.preventDefault();
		    if (this.trailerState == sf.service.VideoPlayer.STATE_PLAYING || 
		    		this.trailerState == sf.service.VideoPlayer.STATE_BUFFERING || 
				    this.trailerState == sf.service.VideoPlayer.STATE_PAUSED) {
				sf.service.VideoPlayer.stop();
				//Turn On Screensaver
				Support.screensaverOn();
				Support.screensaver();
			}
			Support.processReturnURLHistory();
			break;
		case Common.API.KEY_LEFT:
			console.log("RETURN Sub");
			event.preventDefault();
			if (this.menuItems[this.selectedItem] == "guiTV_Episode_Play") {
				document.getElementById(this.menuItems[this.selectedItem]).className = "FilmListSingle highlightMezzmoBackground";
				document.getElementById(this.selectedItem2).className = "FilmListSingle";
			} else {
				document.getElementById(this.menuItems[this.selectedItem]).className = "FilmListSingle highlightMezzmoBackground";
				document.getElementById(this.selectedItem2).className = "FilmListSubSingle";
			}
			document.getElementById("body").onkeydown = document.getElementById("GuiPage_ItemDetails").onkeydown;
			break;	
		case Common.API.KEY_ENTER:
		case Common.API.KEY_PANEL_ENTER:
			console.log("ENTER");
			this.processSelectedItem2();
			break;
		case Common.API.KEY_PLAY:
			console.log("PLAY");
			this.playSelectedItem2();
			break;
		case Common.API.KEY_STOP:
			if (this.trailersEnabled){

				//If the trailer button is visible when a trailer ends, update it.
				if (this.selectedItem == 0) { 
					var htmlToAdd = "<div id=0 class='FilmListSingle highlightMezzmoBackground'><div class='FilmListSingleImage' style=background-image:url(images/menu/Play-46x37.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>PLAY TRAILER</div></div></div>";
					document.getElementById("guiTV_Episode_SubOptions").innerHTML = htmlToAdd;
				}
				//Turn On Screensaver
				Support.screensaverOn();
				Support.screensaver();
			}
			break;
		case Common.API.KEY_PAUSE:
			if (this.trailersEnabled){

			}
			break;
		case Common.API.KEY_RED:	
			
			GuiPage_ItemDetails.updateItemUserStatus(this.ItemData);
			break;
		case Common.API.KEY_GREEN:
			if (this.ItemData.MediaType == "Video") {
				if (this.ItemData.lastPlayed == true) {
					Server.deleteWatchedStatus(this.ItemData.id);
					this.ItemData.lastPlayed = "0";
				} else {
					Server.setWatchedStatus(this.ItemData.id);
					this.ItemData.lastPlayed = Support.getCurrentDate();
				}
				GuiPage_ItemDetails.updateItemUserStatus(this.ItemData);
			}
			break;
		case Common.API.KEY_YELLOW:
			if (this.trailersEnabled){
				
			}
			break;
		case Common.API.KEY_BLUE:	
			GuiMusicPlayer.showMusicPlayer("GuiPage_ItemDetailsSub",this.selectedItem2,document.getElementById(this.selectedItem2).className);
			break;	
		case Common.API.KEY_TOOLS:
			event.preventDefault();
			Support.updateURLHistory("GuiPage_ItemDetails",this.startParams[0],this.startParams[1],null,null,this.selectedItem,null,true);
			document.getElementById(this.selectedItem2).className = "FilmListSubSingle";
			GuiMainMenu.requested("GuiPage_ItemDetailsSub",this.selectedItem2,"FilmListSubSingle highlightMezzmoBackground");
			break;	
		case Common.API.KEY_INFO:
			console.log ("INFO KEY");
			GuiHelper.toggleHelp("GuiPage_ItemDetails");
			break;	
		case Common.API.KEY_EXIT:
			console.log ("EXIT KEY");
			widgetAPI.sendExitEvent();
			break;
	}
};

GuiPage_ItemDetails.processSelectedItem2 = function() {

	switch (this.menuItems[this.selectedItem]) {
	case "guiTV_Episode_Play":
		//Trailer playback
		var htmlToAdd = "";
	    if (this.trailerState == sf.service.VideoPlayer.STATE_PLAYING || 
	    		this.trailerState == sf.service.VideoPlayer.STATE_BUFFERING ||
	    		this.trailerState == sf.service.VideoPlayer.STATE_PAUSED) {

			//Turn on Screensaver
			Support.screensaverOn();
			Support.screensaver();
			//Update buttons
			htmlToAdd += "<div id=0 class='FilmListSingle highlightMezzmoBackground'><div class='FilmListSingleImage' style=background-image:url(images/menu/Play-46x37.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>PLAY TRAILER</div></div></div>";
	    } else {
	    	this.playTrailer(this.trailerUrl);
			//Update buttons
			htmlToAdd += "<div id=0 class='FilmListSingle highlightMezzmoBackground'><div class='FilmListSingleImage' style=background-image:url(images/menu/Stop-46x37.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>STOP TRAILER</div></div></div>";
		}
	    document.getElementById("guiTV_Episode_SubOptions").innerHTML = htmlToAdd;
		break;
	case "guiTV_Episode_Chapters":
		Support.updateURLHistory("GuiPage_ItemDetails",this.startParams[0],this.startParams[1],null,null,0,null,true);
		var url = Server.getItemInfoURL(this.ItemData.id,"&ExcludeLocationTypes=Virtual");
		GuiPlayer.start("PLAY",url,this.subMenuItems[this.selectedItem2].StartPositionTicks / 10000,"GuiPage_ItemDetails");
		break;
	case "guiTV_Episode_Episodes":
		var url = Server.getItemInfoURL(this.subMenuItems[this.selectedItem2].Id);
		GuiPage_ItemDetails.start(this.subMenuItems[this.selectedItem2].Name,url,0);
		break;
	case "guiTV_Episode_Suggested":
		Support.updateURLHistory("GuiPage_ItemDetails",this.startParams[0],this.startParams[1],null,null,this.selectedItem,null,true);
		var url = Server.getItemInfoURL(this.subMenuItems[this.selectedItem2].Id);
		GuiPage_ItemDetails.start(this.subMenuItems[this.selectedItem2].Name,url,0);
		break;
	case "guiTV_Episode_Trailer":
		Support.updateURLHistory("GuiPage_ItemDetails",this.startParams[0],this.startParams[1],null,null,this.selectedItem,null,true);
		var url = Server.getItemInfoURL(this.subMenuItems[this.selectedItem2].Id,"&ExcludeLocationTypes=Virtual");
		GuiPlayer.start("PLAY",url,0,"GuiPage_ItemDetails");
		break;
	case "guiTV_Episode_Cast":
		if (this.trailersEnabled){

		}
		//Support.updateURLHistory("GuiPage_ItemDetails",this.startParams[0],this.startParams[1],null,null,this.selectedItem,null,true);
		//var url = Server.getItemInfoURL(this.subMenuItems[this.selectedItem2].Id);
		//GuiPage_CastMember.start(this.subMenuItems[this.selectedItem2].Name,url,0,0);
		break;
	}
};

GuiPage_ItemDetails.playSelectedItem2 = function() {
	if (this.menuItems[this.selectedItem] == "guiTV_Episode_Play" && this.trailersEnabled){

	} else if (this.menuItems[this.selectedItem] == "guiTV_Episode_Chapters") {
		Support.updateURLHistory("GuiPage_ItemDetails",this.startParams[0],this.startParams[1],null,null,0,null,true);
		var url = Server.getItemInfoURL(this.ItemData.id,"&ExcludeLocationTypes=Virtual");
		GuiPlayer.start("PLAY",url,this.subMenuItems[this.selectedItem2].StartPositionTicks / 10000,"GuiPage_ItemDetails");
	} else if (this.menuItems[this.selectedItem] == "guiTV_Episode_Episodes") {
		Support.updateURLHistory("GuiPage_ItemDetails",this.startParams[0],this.startParams[1],null,null,0,null,true);
		var url = Server.getItemInfoURL(this.subMenuItems[this.selectedItem2].Id,"&ExcludeLocationTypes=Virtual");
		GuiPlayer.start("PLAY",url,null,"GuiPage_ItemDetails");
	} else {
		return;
	}
}

GuiPage_ItemDetails.setTrailerPosition = function() {
	// Sets the mini-player position.
	sf.service.VideoPlayer.setPosition({
		left: 1080,
	    top: 35,
	    width: 800,
	    height: 600
	});
}

GuiPage_ItemDetails.getTrailerEvents = function() {
	var opt = {};
	var _THIS_ = this;
	opt.onerror = function(error, info){
		FileLog.write('Trailor: ERROR : ' + (_THIS_.error2String[error]||error) + (info ? ' (' + info + ')' : ''));
	};
	opt.onend = function(){
		
		//If the trailer button is visible when a trailer ends, update it.
		if (GuiPage_ItemDetails.selectedItem == 0) { 
			var htmlToAdd = "";
			htmlToAdd += "<div id=0 class='FilmListSingle highlightMezzmoBackground'><div class='FilmListSingleImage' style=background-image:url(images/menu/Play-46x37.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>PLAY TRAILER</div></div></div>";
			document.getElementById("guiTV_Episode_SubOptions").innerHTML = htmlToAdd;
		}
		
		//Reset the Play Trailer button for channel trailers
		if (GuiPage_ItemDetails.ItemData.Type == "Trailer" && GuiPage_ItemDetails.trailersEnabled){
			document.getElementById("guiTV_Episode_Play").innerHTML = "<div class='FilmListSingleImage' style=background-image:url(images/menu/Play-46x37.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>PLAY TRAILER</div></div>";
		}
		
		//Turn On Screensaver
		Support.screensaverOn();
		Support.screensaver();
		
		FileLog.write('Trailor: END');
		document.getElementById("body").onkeydown = document.getElementById("GuiPage_ItemDetails").onkeydown;
		GuiPage_ItemDetails.updateSelectedItems();
	};
	opt.onstatechange = function(state, info){
		FileLog.write('Trailor: StateChange : ' + (_THIS_.state2String[state]||state) + (info ? ' (' + info + ')' : ''));
		_THIS_.trailerState = state;
	};
	return (opt);
}

GuiPage_ItemDetails.setTrailerStateHandlers = function() {
	//Set miniplayer vars.
	this.trailerState = sf.service.VideoPlayer.STATE_STOPPED;
	this.error2String = {};
	this.error2String[sf.service.VideoPlayer.ERR_NOERROR] = 'NoError';
	this.error2String[sf.service.VideoPlayer.ERR_NETWORK] = 'Network';
	this.error2String[sf.service.VideoPlayer.ERR_NOT_SUPPORTED] = 'Not Supported';
	this.state2String = {};
	this.state2String[sf.service.VideoPlayer.STATE_PLAYING] = 'Playing';
	this.state2String[sf.service.VideoPlayer.STATE_STOPPED] = 'Stopped';
	this.state2String[sf.service.VideoPlayer.STATE_PAUSED] = 'Paused';
	this.state2String[sf.service.VideoPlayer.STATE_BUFFERING] = 'Buffering';
	this.state2String[sf.service.VideoPlayer.STATE_SCANNING] = 'Scanning';
}

GuiPage_ItemDetails.setTrailerKeyHandlers = function() {
	//Key handlers for fullscreen mode.
	sf.service.VideoPlayer.setKeyHandler(sf.key.YELLOW, function () {
		sf.service.VideoPlayer.setFullScreen(false);
		GuiPage_ItemDetails.updateSelectedItems();
		if (GuiPage_ItemDetails.ItemData.Type != "Trailer"){
			GuiPage_ItemDetails.updateSelectedItems2();
		}
		GuiPage_ItemDetails.updateDisplayedItems2();
		document.getElementById("body").onkeydown = document.getElementById("GuiPage_ItemDetails").onkeydown;
	});
	sf.service.VideoPlayer.setKeyHandler(sf.key.RETURN, function () {
		sf.service.VideoPlayer.setFullScreen(false);
		GuiPage_ItemDetails.updateSelectedItems();
		if (GuiPage_ItemDetails.ItemData.Type != "Trailer"){
			GuiPage_ItemDetails.updateSelectedItems2();
		}
		GuiPage_ItemDetails.updateDisplayedItems2();
		document.getElementById("body").onkeydown = document.getElementById("GuiPage_ItemDetails").onkeydown;
	});
	sf.service.VideoPlayer.setKeyHandler(sf.key.PLAY, function () {
		if (GuiPage_ItemDetails.trailerState == sf.service.VideoPlayer.STATE_PAUSED) {
			sf.service.VideoPlayer.resume();
		}
	});
	sf.service.VideoPlayer.setKeyHandler(sf.key.STOP, function () {
		sf.service.VideoPlayer.setFullScreen(false);
		sf.service.VideoPlayer.stop();
		sf.service.VideoPlayer.hide();
		//Turn On Screensaver
		Support.screensaverOn();
		Support.screensaver();
		GuiPage_ItemDetails.updateSelectedItems();
		if (GuiPage_ItemDetails.ItemData.Type != "Trailer"){
			GuiPage_ItemDetails.updateSelectedItems2();
		}
		GuiPage_ItemDetails.updateDisplayedItems2();
		//Reset the Play Trailer button for channel trailers
		if (GuiPage_ItemDetails.ItemData.Type == "Trailer" && GuiPage_ItemDetails.trailersEnabled){
			document.getElementById("guiTV_Episode_Play").innerHTML = "<div class='FilmListSingleImage' style=background-image:url(images/menu/Play-46x37.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>PLAY TRAILER</div></div>";
		}
		document.getElementById("body").onkeydown = document.getElementById("GuiPage_ItemDetails").onkeydown;
	});
	sf.service.VideoPlayer.setKeyHandler(sf.key.PAUSE, function () {
		if (GuiPage_ItemDetails.trailerState == sf.service.VideoPlayer.STATE_PAUSED) {
			sf.service.VideoPlayer.resume();
		} else {
			sf.service.VideoPlayer.pause();
		}
	});
	//These button are disabled during full screen trailers. 
	sf.service.VideoPlayer.setKeyHandler(sf.key.TOOLS, function () {
	});
	sf.service.VideoPlayer.setKeyHandler(sf.key.ENTER, function () {
	});
	sf.service.VideoPlayer.setKeyHandler(sf.key.FF, function () {
	});
	sf.service.VideoPlayer.setKeyHandler(sf.key.REW, function () {
	});
}

GuiPage_ItemDetails.playTrailer = function(trailerUrl) {
	//Handle Music player
	if (GuiMusicPlayer.Status == "PLAYING" || GuiMusicPlayer.Status == "PAUSED") {
		GuiMusicPlayer.stopPlayback();
	}
	
	//Show Loading Div
	document.getElementById("loading").style.visibility = "";
	
	//Show Loading Div
	document.getElementById("loading").style.visibility = "hidden";
	
	//Turn off Screensaver
    Support.screensaverOff();
	Support.updateURLHistory("GuiPage_ItemDetails",this.startParams[0],this.startParams[1],this.TrailersData,null,this.selectedItem,null,true);
	GuiPlayer.start("Trailer",trailerUrl,this.ItemData,0,"GuiPage_ItemDetails");
	//Set the miniplayer
	/*document.getElementById('sf-service-videoplayer-mini-infobar').style.display= 'none';
	this.setTrailerStateHandlers();
	this.setTrailerKeyHandlers();
	var opt = this.getTrailerEvents();
	sf.service.VideoPlayer.init(opt);
	this.setTrailerPosition();
	
	//Begin trailer playback
	sf.service.VideoPlayer.show();
	sf.service.VideoPlayer.play({
		//url: 'http://dskhzskakdl.samsungcloudsolution.com/UwBWAEMAMAAwADAAMgAxAA%3D%3D/NgAxAEYAYQBtAGkAbAB5AE0AYQBuAGEAZwBlAHIA/%5BEng%5DFamily_01_20120712.mp4?AWSAccessKeyId=AKIAJFR4V46LB32XRHJQ&Expires=1660266865&Signature=d23NN7uS59k%2Be6bpTHPt3f2%2BXus%3D',
		url: trailerUrl,
	    fullScreen: false
	});*/
}

GuiPage_ItemDetails.getMediaInfo = function() {
	//this.ItemData.MediaSources[0].Video3DFormat is reported as either HalfSideBySide or HalfTopAndBottom.
	//this.ItemData.MediaSources[0].Name is in the format 3D/Resolution/videoCodec/audioCodec. 3D/ is omitted for 2D.
	var container = this.ItemData.MediaSources[0].Container;
	var res = this.ItemData.MediaSources[0].Name.split("/");
	var videoCodec = null; var videoRatio = null; var audioCodec = null; var audioChannels = null;
	
	var MEDIASTREAMS = this.ItemData.MediaSources[0].MediaStreams;
	
	var videoCount = 0; audioCount = 0;
	for (var mediaStream = 0; mediaStream < MEDIASTREAMS.length; mediaStream++) {
		if (MEDIASTREAMS[mediaStream].Type == "Video") {
			videoCount++;
		}
		if (MEDIASTREAMS[mediaStream].Type == "Audio") {
			audioCount++;
		}
	}
	
	for (var mediaStream = 0; mediaStream < MEDIASTREAMS.length; mediaStream++) {
		if (MEDIASTREAMS[mediaStream].Type == "Video" && (videoCount == 1 || MEDIASTREAMS[mediaStream].IsDefault == true)) {
			videoCodec = MEDIASTREAMS[mediaStream].Codec;
			videoRatio  = MEDIASTREAMS[mediaStream].AspectRatio;	
		}
		if (MEDIASTREAMS[mediaStream].Type == "Audio" && (audioCount == 1 || MEDIASTREAMS[mediaStream].IsDefault == true)) {
			audioCodec = MEDIASTREAMS[mediaStream].Codec;
			audioChannels  = MEDIASTREAMS[mediaStream].Channels;
		}
	}

	var items = [container,videoRatio,audioCodec,res[0],audioChannels,videoCodec];
	document.getElementById("guiTV_Show_MediaAlternative").innerHTML = this.processMediaInfo(items);			
};

GuiPage_ItemDetails.processMediaInfo = function(itemsArray) {
	var htmlToAdd = "";
	for (var index = 0; index < itemsArray.length; index++) {
		switch (itemsArray[index]) {
		//Container
		case "mkv":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/media_mkv-2.png)></div>";
			break;
		case "avi":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/media_avi-2.png)></div>";
			break;
		case "mp4":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/media_mp4.png)></div>";
			break;	
		//VideoCodec	
		case "h264":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/codec_h264.png)></div>";
			break;
		case "hevc":
		case "h265":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/codec_h265.png)></div>";
			break;
		case "mpeg4":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/codec_mpeg4visual.png)></div>";
			break;	
		//AspectRatios	
		case "16:9":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/widescreen.png)></div>";
			break;
		case "2.35:1":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/aspect_235.png)></div>";
			break;
		case "2.40:1":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/aspect_240.png)></div>";
			break;	
		//AudioCodec	
		case "aac":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/codec_aac-2.png)></div>";
			break;	
		case "ac3":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/codec_ac3.png)></div>";
			break;
		case "pcm":
		case "pcm_s16le":	
		case "pcm_s24le":
		case "pcm_s32le":	
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/codec_pcm.png)></div>";
			break;	
		case "truehd":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/codec_ddtruehd.png)></div>";
			break;
		case "mp3":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/codec_mp3.png)></div>";
			break;
		case "dts":
		case "dca":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/codec_dts.png)></div>";
			break;	
		case "flac":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/codec_flac.png)></div>";
			break;
		case "vorbis":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/codec_vorbis.png)></div>";
			break;	
		//AudioChannels	
		case 1:
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/channels_1.png)></div>";
			break;	
		case 2:
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/channels_2.png)></div>";
			break;
		case 3:
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/channels_3.png)></div>";
			break;	
		case 4:
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/channels_4.png)></div>";
			break;
		case 5:
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/channels_5.png)></div>";
			break;	
		case 6:	
		case 5.1:
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/channels_6.png)></div>";
			break;
		case 7:	
		case 6.1:
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/channels_7.png)></div>";
			break;
		case 8:	
		case 7.1:
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/channels_8.png)></div>";
			break;
		//Specials
		case "3D":
			if (this.ItemData.MediaSources[0].Video3DFormat == "HalfSideBySide") {
				htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/media_SBS.png)></div>";
			} else if (this.ItemData.MediaSources[0].Video3DFormat == "HalfTopAndBottom") {
				htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/media_TAB.png)></div>";
			} else {
				htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/media_3d.png)></div>";
			}
			break;
		//Resolution
		case "SD":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/res_SD.png)></div>";
			break;
		case "480P":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/res_480.png)></div>";
			break;
		case "720P":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/res_720.png)></div>";
			break;
		case "1080P":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/res_1080.png)></div>";
			break;
		default:
			break;
		}
	}
	return htmlToAdd;
};
