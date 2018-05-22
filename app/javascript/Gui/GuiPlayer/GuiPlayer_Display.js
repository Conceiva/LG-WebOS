var GuiPlayer_Display = {	
		PlayerData : null,
		playingMediaSource : null,
		playingMediaSourceIndex : null,
		playingTranscodeStatus : null,
		playingVideoIndex : null,
		playingAudioIndex : null,
		playingSubtitleIndex : null,
		offsetSeconds : 0,
		
		ItemData : null,
		
		videoToolsOptions : [],
		videoToolsSelectedItem : 0,
		subtitleIndexes : [], 
		
		audioIndexes : [],
		chapterIndexes : [], 
		
		topLeftItem : 0,
		videoToolsSelectedItemSub : 0,
		maxDisplay : 5,
		videoToolsSubOptions : [],
		videoToolsaudioOptions : [],
		
		sliderCurrentTime : 0,
		mode : 'feature'
};

GuiPlayer_Display.setDisplay = function(playerdata,playingmediasource,playingtranscodestatus,offsetSeconds,playingVideoIndex,playingAudioIndex,playingSubtitleIndex,playingmediasourceindex,playmode) {
	this.PlayerData = playerdata;
	this.playingMediaSource = playingmediasource;
	this.playingMediaSourceIndex = playingmediasourceindex;
	this.playingTranscodeStatus = playingtranscodestatus;
	this.offsetSeconds = offsetSeconds;
	this.playingVideoIndex = playingVideoIndex;
	this.playingAudioIndex = playingAudioIndex;
	this.playingSubtitleIndex = playingSubtitleIndex;
	this.mode = playmode;
	
	//Reset Vars
	this.videoToolsOptions = [];
	this.videoToolsSelectedItem = 0;
	this.subtitleIndexes = [];
	this.audioIndexes = [];
	this.chapterIndexes = [];
	this.topLeftItme = 0;
	this.videoToolsSelectedItemSub = 0;
	
	//Reset Page Elements
	document.getElementById("guiPlayer_Info_Details").style.backgroundImage="";
	document.getElementById("guiPlayer_ItemDetails_Overview").innerHTML = "";
	document.getElementById("guiPlayer_ItemDetails_Title").innerHTML = "";
    document.getElementById("guiPlayer_ItemDetails_SubData").innerHTML = "";
	
	//Hide page!
    document.getElementById("pageContent").innerHTML = "";
    document.getElementById("page").style.visibility="hidden";
    document.getElementById("pageBackgroundFade").style.visibility="hidden";
    document.getElementById("pageBackgroundHolder").style.visibility="hidden";
    document.getElementById("pageBackground").style.visibility="hidden";
    document.getElementById("guiPlayer_Loading").style.visibility = ""; 
    document.getElementById("guiPlayer_Ratings").innerHTML="";

    //Set PageContent
    var fileInfo = "";
    if (this.PlayerData.type == "Episode") {
    	fileInfo = this.PlayerData.title;
    	fileInfo = fileInfo.replace("<br>", " ");
    	
    	
        //Add the TV series DVD cover art to the GUI display.
        var diskImgsrc = this.PlayerData.poster;
		if (this.mode == 'Trailer') {
			fileInfo = this.PlayerData.trailerTitle;
			diskImgsrc = this.PlayerData.trailerPoster;
		}
    	document.getElementById("guiPlayer_DvdArt").style.backgroundImage="url('" + diskImgsrc + "')";
    	
    	//Get ratings info.
    	var toms = this.PlayerData.CriticRating;
    	var stars = this.PlayerData.CommunityRating;
    	var tomsImage = "";
    	var starsImage = "";
    	if (toms){
    		if (toms > 59){
    			tomsImage = "images/fresh-40x40.png";
    		} else {
    			tomsImage = "images/rotten-40x40.png";
    		}
    		document.getElementById("guiPlayer_Ratings").innerHTML += "<div class='videoItemRatingsTomatoIcon' style=background-image:url("+tomsImage+")></div>";
    		document.getElementById("guiPlayer_Ratings").innerHTML += "<div class='videoItemRatingsTomato'>"+toms+"%</div>";
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
        	document.getElementById("guiPlayer_Ratings").innerHTML += "<div class='videoItemRatingsStarIcon' style=background-image:url("+starsImage+")></div>";
       		//document.getElementById("guiPlayer_Ratings").innerHTML += "<div class='videoItemRatingsStar'>"+stars+"</div>";
    	}
    } else {
    	fileInfo = this.PlayerData.title;
    	
        //Add the movie DVD cover art to the GUI display.
        var diskImgsrc = this.PlayerData.poster;
		if (this.mode == 'Trailer') {
			fileInfo = this.PlayerData.trailerTitle;
			diskImgsrc = this.PlayerData.trailerPoster;
		}
    	document.getElementById("guiPlayer_DvdArt").style.backgroundImage="url('" + diskImgsrc + "')";
    	
    	//Get ratings info.
    	var toms = this.PlayerData.CriticRating;
    	var stars = this.PlayerData.CommunityRating;
    	var tomsImage = "";
    	var starsImage = "";
    	if (toms){
    		if (toms > 59){
    			tomsImage = "images/fresh-40x40.png";
    		} else {
    			tomsImage = "images/rotten-40x40.png";
    		}
    		document.getElementById("guiPlayer_Ratings").innerHTML += "<div class='videoItemRatingsTomatoIcon' style=background-image:url("+tomsImage+")></div>";
    		document.getElementById("guiPlayer_Ratings").innerHTML += "<div class='videoItemRatingsTomato'>"+toms+"%</div>";
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
        	document.getElementById("guiPlayer_Ratings").innerHTML += "<div class='videoItemRatingsStarIcon' style=background-image:url("+starsImage+")></div>";
    	}
    }
    
   	var videoName = "";
    document.getElementById("guiPlayer_ItemDetails_Title").innerHTML = fileInfo;
    document.getElementById("guiPlayer_ItemDetails_Title2").innerHTML = fileInfo;
    document.getElementById("guiPlayer_ItemDetails_SubData").innerHTML = videoName; 
    document.getElementById("guiPlayer_ItemDetails_SubData2").innerHTML = videoName; 
    
    if (this.PlayerData.Overview !== undefined) {
    	document.getElementById("guiPlayer_ItemDetails_Overview").innerHTML = this.PlayerData.Overview;
    }
};

GuiPlayer_Display.restorePreviousMenu = function() {
	//Hide Player GUI Elements
	if (document.getElementById("guiPlayer_Tools").style.opacity != 0) {
		$('#guiPlayer_Osd').css('opacity',1).animate({opacity:0}, 500);
	}
	if (document.getElementById("guiPlayer_Tools").style.opacity != 0) {
		$('#guiPlayer_Tools').css('opacity',1).animate({opacity:0}, 500);
	}
	document.getElementById("guiPlayer_ItemDetails").style.visibility="hidden";
	document.getElementById("guiPlayer_ItemDetails2").style.visibility="";
    document.getElementById("guiPlayer_Loading").style.visibility = "hidden";
    document.getElementById("guiPlayer_Tools_Slider").style.visibility = "hidden";
    document.getElementById("guiPlayer_Tools_SubOptions").style.visibility = "hidden";  
    
    document.getElementById("pageBackgroundFade").style.visibility="";
    document.getElementById("pageBackgroundHolder").style.visibility="";
    document.getElementById("pageBackground").style.visibility="";
    document.getElementById("page").style.visibility="";
    
    //Reset Volume & Mute Keys
	//Reset NAVI - Works
	/*NNaviPlugin = document.getElementById("pluginObjectNNavi");
    NNaviPlugin.SetBannerState(PL_NNAVI_STATE_BANNER_NONE);
    pluginAPI.registKey(Common.API.KEY_VOL_UP);
    pluginAPI.registKey(Common.API.KEY_VOL_DOWN);
    pluginAPI.registKey(Common.API.KEY_MUTE);*/

    //Turn On Screensaver
    Support.screensaverOn();
	Support.screensaver();

	//Return to correct Page
	if (GuiPlayer_Display.PlayerData != null) {
		Support.processReturnURLHistory(GuiPlayer_Display.PlayerData.bookmark);
	}
};

//-----------------------------------------------------------------------------------------------------------------------------------------
//GUIPLAYER TOOLS MENU FUNCTIONS
//-----------------------------------------------------------------------------------------------------------------------------------------

GuiPlayer_Display.createToolsMenu = function() {
    //Create Tools Menu Subtitle
    //Must reset tools menu here on each playback!
    document.getElementById("guiPlayer_Tools").innerHTML = "";
    this.videoToolsOptions = [];
	for (var index = 0;index < this.PlayerData.AudioStreams.length;index++) {

		this.audioIndexes.push(index);
	}
	
	for (var index = 0;index < this.PlayerData.Subtitles.length;index++) {

		this.subtitleIndexes.push(index); //
		
	}
	
	if (this.PlayerData.Chapters !== undefined) {
		for (var index = 0; index < this.PlayerData.Chapters.length; index++) {
			this.chapterIndexes.push(index);
		}
		if (this.chapterIndexes.length > 0) {
			this.videoToolsOptions.push("videoOptionChapters");
		    document.getElementById("guiPlayer_Tools").innerHTML += '<div id="videoOptionChapters" class="videoToolsItem";">Chapters</div>';
		}
	}
	    
	if (this.subtitleIndexes.length > 0) {
		this.subtitleIndexes.unshift(-1);
	    this.videoToolsOptions.push("videoOptionSubtitles");
	    document.getElementById("guiPlayer_Tools").innerHTML += '<div id="videoOptionSubtitles" class="videoToolsItem";">Subtitles</div>';
		}
	    
	//Hide if only 1 audio stream given thats the one playing!
	if (this.audioIndexes.length > 1) {
	    this.videoToolsOptions.push("videoOptionAudio");
	   	document.getElementById("guiPlayer_Tools").innerHTML += '<div id="videoOptionAudio" class="videoToolsItem";">Audio</div>';
	}
	
	//Add Slider Bar
	this.videoToolsOptions.push("videoOptionSlider");
	document.getElementById("guiPlayer_Tools").innerHTML += '<div id="videoOptionSlider" class="videoToolsItem";">Position</div>';
};


GuiPlayer_Display.keyDownTools = function() {
	var keyCode = event.keyCode;
	console.log("Key pressed: " + keyCode);
	this.videoToolsSelectedItemSub = 0;
	document.getElementById("guiPlayer_Tools_SubOptions").innerHTML = "";

	switch(keyCode) {
		case Common.API.KEY_RETURN:
		case Common.API.KEY_TOOLS:
		case 169:
			event.preventDefault();
			this.videoToolsSelectedItem = 0;
			if (document.getElementById("guiPlayer_Tools").style.opacity != 0) {
    			$('#guiPlayer_Tools').css('opacity',1).animate({opacity:0}, 500);
    		}
			setTimeout(function(){
				document.getElementById("guiPlayer_Subtitles").style.top="none";
				document.getElementById("guiPlayer_Subtitles").style.bottom="60px";
			}, 500);
			document.getElementById("body").onkeydown = document.getElementById("GuiPlayer").onkeydown;
			break;	
		case Common.API.KEY_UP:
			event.preventDefault();
			this.videoToolsSelectedItem = 0;
			if (document.getElementById("guiPlayer_Tools").style.opacity != 0) {
    			$('#guiPlayer_Tools').css('opacity',1).animate({opacity:0}, 500);
    		}
			setTimeout(function(){
				document.getElementById("guiPlayer_Subtitles").style.top="none";
				document.getElementById("guiPlayer_Subtitles").style.bottom="60px";
			}, 500);
			GuiPlayer.handlePlayKey();
			document.getElementById("body").onkeydown = document.getElementById("GuiPlayer").onkeydown;
			break;	
		case Common.API.KEY_LEFT:
			event.preventDefault();
			if (this.videoToolsSelectedItem > 0) {
				this.videoToolsSelectedItem--;
				this.updateSelectedItems();
			}
			break;
		case Common.API.KEY_RIGHT:
			event.preventDefault();
			if (this.videoToolsSelectedItem < this.videoToolsOptions.length-1) {
				this.videoToolsSelectedItem++;
				this.updateSelectedItems();
			}
			break;	
		case Common.API.KEY_ENTER:
		case Common.API.KEY_PANEL_ENTER:
			console.log("ENTER");	
			this.topLeftItem = 0;
			switch (this.videoToolsOptions[this.videoToolsSelectedItem]) {
			case "videoOptionChapters":
				this.videoToolsSubOptions = this.chapterIndexes;
				this.updateDisplayedItemsSub();
				this.updateSelectedItemsSub();
				document.getElementById("body").onkeydown = document.getElementById("GuiPlayer_ToolsSub").onkeydown;
				break;
			case "videoOptionSubtitles":
				this.videoToolsSubOptions = this.subtitleIndexes;
				this.updateDisplayedItemsSub();
				this.updateSelectedItemsSub();
				document.getElementById("body").onkeydown = document.getElementById("GuiPlayer_ToolsSub").onkeydown;
				break;
			case "videoOptionAudio":
				this.videoToolsSubOptions = this.audioIndexes;
				this.updateDisplayedItemsSub();
				this.updateSelectedItemsSub();
				document.getElementById("body").onkeydown = document.getElementById("GuiPlayer_ToolsSub").onkeydown;
				break;	
			case "videoOptionSlider":
				this.sliderCurrentTime = GuiPlayer.currentTime + this.offsetSeconds;
				var totalseconds = 0;
				if (this.mode != 'Trailer') {
					var hms = this.PlayerData.duration;   // your input string
					var a = hms.split(':'); // split it at the colons

					// minutes are worth 60 seconds. Hours are worth 60 minutes.
					totalseconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 
				}
				else {
					totalseconds = this.PlayerData.trailerDuration;
				}
				
				var leftPos = (1800 *  this.sliderCurrentTime/ (totalseconds * 1000))-20+60;
				document.getElementById("guiPlayer_Tools_SliderBarCurrent").style.left = leftPos+"px";	
				document.getElementById("guiPlayer_Tools_SliderBarCurrentTime").innerHTML = Support.convertTicksToTimeSingle(this.sliderCurrentTime);
				document.getElementById("guiPlayer_Tools_SliderBarCurrentTime").style.left = leftPos-40+"px";
				document.getElementById("guiPlayer_Tools_Slider").style.visibility = "";
				document.getElementById("body").onkeydown = document.getElementById("GuiPlayer_ToolsSlider").onkeydown;
				break;
			}
			break;		
		case Common.API.KEY_PLAY:
			if (document.getElementById("guiPlayer_Tools").style.opacity != 0) {
    			$('#guiPlayer_Tools').css('opacity',1).animate({opacity:0}, 500);
    		}
			setTimeout(function(){
				document.getElementById("guiPlayer_Subtitles").style.top="none";
				document.getElementById("guiPlayer_Subtitles").style.bottom="60px";
			}, 500);
			document.getElementById("body").onkeydown = document.getElementById("GuiPlayer").onkeydown;
			GuiPlayer.handlePlayKey();
			break;
		case Common.API.KEY_STOP:
			GuiPlayer.handleStopKey();
            break;
		case Common.API.KEY_PAUSE:
			if (document.getElementById("guiPlayer_Tools").style.opacity != 0) {
    			$('#guiPlayer_Tools').css('opacity',1).animate({opacity:0}, 500);
    		}
			document.getElementById("body").onkeydown = document.getElementById("GuiPlayer").onkeydown;
			GuiPlayer.handlePauseKey();
			break;
        case Common.API.KEY_FF:
			if (document.getElementById("guiPlayer_Tools").style.opacity != 0) {
    			$('#guiPlayer_Tools').css('opacity',1).animate({opacity:0}, 500);
    		}
			document.getElementById("body").onkeydown = document.getElementById("GuiPlayer").onkeydown;
        	GuiPlayer.handleFFKey();      
            break;       
        case Common.API.KEY_RW:
			if (document.getElementById("guiPlayer_Tools").style.opacity != 0) {
    			$('#guiPlayer_Tools').css('opacity',1).animate({opacity:0}, 500);
    		}
			document.getElementById("body").onkeydown = document.getElementById("GuiPlayer").onkeydown;
        	GuiPlayer.handleRWKey();
            break;
        case Common.API.KEY_INFO:	
			if (document.getElementById("guiPlayer_Tools").style.opacity != 0) {
    			$('#guiPlayer_Tools').css('opacity',1).animate({opacity:0}, 500);
    		}
			document.getElementById("body").onkeydown = document.getElementById("GuiPlayer").onkeydown;
			GuiPlayer.handleInfoKey();
			break;
        case Common.API.KEY_EXIT:
            console.log("EXIT");
            event.preventDefault();
            GuiPlayer.stopPlayback();
            GuiPlayer_Display.restorePreviousMenu();
            break;	
	}
};


GuiPlayer_Display.keyDownToolsSlider = function() {
	var keyCode = event.keyCode;
	console.log("Key pressed: " + keyCode);

	switch(keyCode) {
		case Common.API.KEY_RETURN:
		case 169:
			console.log("RETURN");
			event.preventDefault();
			document.getElementById("guiPlayer_Tools_Slider").style.visibility = "hidden";
			document.getElementById("body").onkeydown = document.getElementById("GuiPlayer_Tools").onkeydown;
			break;	
		case Common.API.KEY_LEFT:
			event.preventDefault();
			this.sliderCurrentTime = this.sliderCurrentTime - 30000; //30 seconds
			this.sliderCurrentTime = (this.sliderCurrentTime < 0) ? 0 : this.sliderCurrentTime;
			var totalseconds = 0;
			if (this.mode != 'Trailer') {
				var hms = this.PlayerData.duration;   // your input string
				var a = hms.split(':'); // split it at the colons

				// minutes are worth 60 seconds. Hours are worth 60 minutes.
				totalseconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 
			}
			else {
				totalseconds = this.PlayerData.trailerDuration;
			}
				
			var leftPos = (1800 * this.sliderCurrentTime / (totalseconds * 1000))-20+60; //-20 half width of selector, +60 as left as progress bar is 30 from left
			document.getElementById("guiPlayer_Tools_SliderBarCurrentTime").innerHTML = Support.convertTicksToTimeSingle(this.sliderCurrentTime);
			document.getElementById("guiPlayer_Tools_SliderBarCurrentTime").style.left = leftPos-40+"px";
			document.getElementById("guiPlayer_Tools_SliderBarCurrent").style.left = leftPos+"px";	
			break;
		case Common.API.KEY_RIGHT:
			event.preventDefault();
			this.sliderCurrentTime = this.sliderCurrentTime + 30000; //30 seconds
			var totalseconds = 0;
			if (this.mode != 'Trailer') {
				var hms = this.PlayerData.duration;   // your input string
				var a = hms.split(':'); // split it at the colons

				// minutes are worth 60 seconds. Hours are worth 60 minutes.
				totalseconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 
			}
			else {
				totalseconds = this.PlayerData.trailerDuration;
			}
			
			this.sliderCurrentTime = (this.sliderCurrentTime > totalseconds * 1000) ? totalseconds * 1000 : this.sliderCurrentTime;
			var leftPos = (1800 * this.sliderCurrentTime / (totalseconds * 1000))-20+60;
			document.getElementById("guiPlayer_Tools_SliderBarCurrentTime").innerHTML = Support.convertTicksToTimeSingle(this.sliderCurrentTime);
			document.getElementById("guiPlayer_Tools_SliderBarCurrentTime").style.left = leftPos-40+"px";
			document.getElementById("guiPlayer_Tools_SliderBarCurrent").style.left = leftPos+"px";	
			break;
		case Common.API.KEY_ENTER:
		case Common.API.KEY_PANEL_ENTER:
			document.getElementById("guiPlayer_Tools_Slider").style.visibility = "hidden";
			if (document.getElementById("guiPlayer_Tools").style.opacity != 0) {
    			$('#guiPlayer_Tools').css('opacity',1).animate({opacity:0}, 500);
    		}
			setTimeout(function(){
				document.getElementById("guiPlayer_Subtitles").style.top="none";
				document.getElementById("guiPlayer_Subtitles").style.bottom="60px";
			}, 500);
			GuiPlayer.newPlaybackPosition(this.sliderCurrentTime / 1000);
			document.getElementById("body").onkeydown = document.getElementById("GuiPlayer").onkeydown;
			break;
		case Common.API.KEY_PLAY:
			document.getElementById("guiPlayer_Tools_Slider").style.visibility = "hidden";
			if (document.getElementById("guiPlayer_Tools").style.opacity != 0) {
    			$('#guiPlayer_Tools').css('opacity',1).animate({opacity:0}, 500);
    		}
			document.getElementById("body").onkeydown = document.getElementById("GuiPlayer").onkeydown;
			GuiPlayer.handlePlayKey();
			break;
		case Common.API.KEY_STOP:
			GuiPlayer.handleStopKey();
            break;
		case Common.API.KEY_PAUSE:
			document.getElementById("guiPlayer_Tools_Slider").style.visibility = "hidden";
			if (document.getElementById("guiPlayer_Tools").style.opacity != 0) {
    			$('#guiPlayer_Tools').css('opacity',1).animate({opacity:0}, 500);
    		}
			document.getElementById("body").onkeydown = document.getElementById("GuiPlayer").onkeydown;
			GuiPlayer.handlePauseKey();
			break;
        case Common.API.KEY_FF:
			document.getElementById("guiPlayer_Tools_Slider").style.visibility = "hidden";
			if (document.getElementById("guiPlayer_Tools").style.opacity != 0) {
    			$('#guiPlayer_Tools').css('opacity',1).animate({opacity:0}, 500);
    		}
			document.getElementById("body").onkeydown = document.getElementById("GuiPlayer").onkeydown;
        	GuiPlayer.handleFFKey();      
            break;       
        case Common.API.KEY_RW:
			document.getElementById("guiPlayer_Tools_Slider").style.visibility = "hidden";
			if (document.getElementById("guiPlayer_Tools").style.opacity != 0) {
    			$('#guiPlayer_Tools').css('opacity',1).animate({opacity:0}, 500);
    		}
			document.getElementById("body").onkeydown = document.getElementById("GuiPlayer").onkeydown;
        	GuiPlayer.handleRWKey();
            break;
        case Common.API.KEY_INFO:	
			document.getElementById("guiPlayer_Tools_Slider").style.visibility = "hidden";
			if (document.getElementById("guiPlayer_Tools").style.opacity != 0) {
    			$('#guiPlayer_Tools').css('opacity',1).animate({opacity:0}, 500);
    		}
			document.getElementById("body").onkeydown = document.getElementById("GuiPlayer").onkeydown;
			GuiPlayer.handleInfoKey();
			break;
        case Common.API.KEY_EXIT:
            console.log("EXIT");
            event.preventDefault();
            GuiPlayer.stopPlayback();
            GuiPlayer_Display.restorePreviousMenu();
            break;	
	}
};

GuiPlayer_Display.updateSelectedItems = function() {
	for (var index = 0; index < this.videoToolsOptions.length; index++){	
		if (index == this.videoToolsSelectedItem) {
			document.getElementById(this.videoToolsOptions[index]).className = "videoToolsItem videoToolsItemSelected";	
		} else {	
			document.getElementById(this.videoToolsOptions[index]).className = "videoToolsItem";		
		}		
	} 
};

GuiPlayer_Display.keyDownToolsSub = function() {
	var keyCode = event.keyCode;
	console.log("Key pressed keyDownToolsSub: " + keyCode);

	switch(keyCode) {
		case Common.API.KEY_RETURN:
		case 169:
			console.log("RETURN");
			event.preventDefault();
			document.getElementById("guiPlayer_Tools_SubOptions").style.visibility = "hidden";
			this.updateSelectedItems();
			document.getElementById("body").onkeydown = document.getElementById("GuiPlayer_Tools").onkeydown;
			break;	
		case Common.API.KEY_UP:
			this.videoToolsSelectedItemSub--;
			if (this.videoToolsSelectedItemSub < 0) {
				this.videoToolsSelectedItemSub++;
			}
			if (this.videoToolsSelectedItemSub < this.topLeftItem) {
				this.topLeftItem--;
				this.updateDisplayedItemsSub();
			}
			this.updateSelectedItemsSub();
		break;
		case Common.API.KEY_DOWN:
			event.preventDefault();
			this.videoToolsSelectedItemSub++;
			if (this.videoToolsSelectedItemSub > this.videoToolsSubOptions.length-1) {
				this.videoToolsSelectedItemSub--;
			}
			if (this.videoToolsSelectedItemSub >= this.topLeftItem + this.maxDisplay) {
				this.topLeftItem++;
				this.updateDisplayedItemsSub();
			}
			this.updateSelectedItemsSub();
			break;	
		case Common.API.KEY_ENTER:
		case Common.API.KEY_PANEL_ENTER:
			console.log("ENTER");	
			document.getElementById("guiPlayer_Tools_SubOptions").style.visibility = "hidden";
			if (document.getElementById("guiPlayer_Tools").style.opacity != 0) {
    			$('#guiPlayer_Tools').css('opacity',1).animate({opacity:0}, 500);
    		}
			setTimeout(function(){
				document.getElementById("guiPlayer_Subtitles").style.top="none";
				document.getElementById("guiPlayer_Subtitles").style.bottom="60px";
			}, 500);
			switch (this.videoToolsOptions[this.videoToolsSelectedItem]) {
			case "videoOptionChapters":
				GuiPlayer.newPlaybackPosition(this.PlayerData.Chapters[this.videoToolsSelectedItemSub].StartPositionTicks);
				break;	
			case "videoOptionSubtitles":
				GuiPlayer.newSubtitleIndex(this.videoToolsSubOptions[this.videoToolsSelectedItemSub]);
				break;
			case "videoOptionAudio":
				if (this.videoToolsSubOptions[this.videoToolsSelectedItemSub] != this.playingAudioIndex) {
					GuiPlayer.stopPlayback();
					document.getElementById("body").onkeydown = document.getElementById("GuiPlayer").onkeydown;
					
					//Check if first index - If it is need to stream copy audio track
					var isFirstAudioIndex = (this.videoToolsSubOptions[this.videoToolsSelectedItemSub] == this.audioIndexes[0]) ? true : false;
					var transcodeResult = GuiPlayer_Transcoding.start(this.PlayerData.id,this.playingMediaSource,this.playingMediaSourceIndex,this.playingVideoIndex,this.videoToolsSubOptions[this.videoToolsSelectedItemSub],isFirstAudioIndex,this.playingSubtitleIndex);
					GuiPlayer.startPlayback(transcodeResult, GuiPlayer.currentTime);
				} else {
					//Do Nothing!
					document.getElementById("body").onkeydown = document.getElementById("GuiPlayer").onkeydown;
				}
				break;	
			}	
			break;	
		case Common.API.KEY_PLAY:
			document.getElementById("guiPlayer_Tools_SubOptions").style.visibility = "hidden";
			if (document.getElementById("guiPlayer_Tools").style.opacity != 0) {
    			$('#guiPlayer_Tools').css('opacity',1).animate({opacity:0}, 500);
    		}
			document.getElementById("body").onkeydown = document.getElementById("GuiPlayer").onkeydown;
			GuiPlayer.handlePlayKey();
			break;
		case Common.API.KEY_STOP:
			GuiPlayer.handleStopKey();
            break;
		case Common.API.KEY_PAUSE:
			document.getElementById("guiPlayer_Tools_SubOptions").style.visibility = "hidden";
			if (document.getElementById("guiPlayer_Tools").style.opacity != 0) {
    			$('#guiPlayer_Tools').css('opacity',1).animate({opacity:0}, 500);
    		}
			document.getElementById("body").onkeydown = document.getElementById("GuiPlayer").onkeydown;
			GuiPlayer.handlePauseKey();
			break;
        case Common.API.KEY_FF:
			document.getElementById("guiPlayer_Tools_SubOptions").style.visibility = "hidden";
			if (document.getElementById("guiPlayer_Tools").style.opacity != 0) {
    			$('#guiPlayer_Tools').css('opacity',1).animate({opacity:0}, 500);
    		}
			document.getElementById("body").onkeydown = document.getElementById("GuiPlayer").onkeydown;
        	GuiPlayer.handleFFKey();      
            break;       
        case Common.API.KEY_RW:
			document.getElementById("guiPlayer_Tools_SubOptions").style.visibility = "hidden";
			if (document.getElementById("guiPlayer_Tools").style.opacity != 0) {
    			$('#guiPlayer_Tools').css('opacity',1).animate({opacity:0}, 500);
    		}
			document.getElementById("body").onkeydown = document.getElementById("GuiPlayer").onkeydown;
        	GuiPlayer.handleRWKey();
            break;
        case Common.API.KEY_INFO:	
			document.getElementById("guiPlayer_Tools_SubOptions").style.visibility = "hidden";
			if (document.getElementById("guiPlayer_Tools").style.opacity != 0) {
    			$('#guiPlayer_Tools').css('opacity',1).animate({opacity:0}, 500);
    		}
			document.getElementById("body").onkeydown = document.getElementById("GuiPlayer").onkeydown;
			GuiPlayer.handleInfoKey();
			break;
        case Common.API.KEY_EXIT:
            console.log("EXIT");
            event.preventDefault();
            GuiPlayer.stopPlayback();
            GuiPlayer_Display.restorePreviousMenu();
            break;	
	}
};

GuiPlayer_Display.updateSelectedItemsSub = function() {	
	document.getElementById(this.videoToolsOptions[this.videoToolsSelectedItem]).className = "videoToolsItem";
	for (var index = this.topLeftItem; index < Math.min(this.videoToolsSubOptions.length,this.topLeftItem + this.maxDisplay);index++){
		var classes = "videoToolsOption";
		if (index == this.videoToolsSelectedItemSub) {
			classes += " videoToolsOptionSelected";	
		}
		if (index == this.topLeftItem && this.topLeftItem != 0){
			classes += " arrowUp";
		}
		if (index == this.topLeftItem + this.maxDisplay -1 && this.topLeftItem + this.maxDisplay -1 != this.videoToolsSubOptions.length -1){
			classes += " arrowDown";
		}
		document.getElementById("videoToolsSubOptions"+index).className = classes;
	} 
};

GuiPlayer_Display.updateDisplayedItemsSub = function() {
	document.getElementById("guiPlayer_Tools_SubOptions").innerHTML = "";
	console.log ("VideoToolsSubOptions Length: " + this.videoToolsSubOptions.length);
	for (var index = this.topLeftItem; index < Math.min(this.videoToolsSubOptions.length,this.topLeftItem + this.maxDisplay);index++) {
		switch (this.videoToolsOptions[this.videoToolsSelectedItem]) {
		case "videoOptionSubtitles":
			console.log ("Subtitle Option Index in DisplayItems: " + this.videoToolsSubOptions[index]);
			if (this.videoToolsSubOptions[index] == -1) {
				document.getElementById("guiPlayer_Tools_SubOptions").innerHTML += "<div id=videoToolsSubOptions"+index+" class=videoToolsOption>None</div>";	
			} else {
				var Name = "";
				if (this.PlayerData.Subtitles[this.videoToolsSubOptions[index]].Language !== undefined) {
					Name = this.PlayerData.Subtitles[this.videoToolsSubOptions[index]].Language;
				} else {
					Name = "Unknown Language";
				}
				if (this.playingSubtitleIndex == this.videoToolsSubOptions[index]) {
					Name += " - Showing";
				}
				document.getElementById("guiPlayer_Tools_SubOptions").innerHTML += "<div id=videoToolsSubOptions"+index+" class=videoToolsOption>"+Name+"</div>";	
			}	
			break;
		case "videoOptionAudio":
			//Run option through transcoding algorithm - see if it plays natively
			var transcodeResult = GuiPlayer_Transcoding.start(this.PlayerData.id, this.playingMediaSource,this.playingMediaSourceIndex, this.playingVideoIndex, this.videoToolsSubOptions[index]);
					
			var Name = this.playingMediaSource.MediaStreams[this.videoToolsSubOptions[index]].Codec + " - ";
			if (this.playingMediaSource.MediaStreams[this.videoToolsSubOptions[index]].Language !== undefined) {
				Name += this.playingMediaSource.MediaStreams[this.videoToolsSubOptions[index]].Language;
			} else {
				Name += "Unknown Language";
			}
			
			var requireTranscode = (transcodeResult[2] == "Direct Stream") ? "Direct Play" : "Transcode";
			Name += "<br>" + requireTranscode;
			if (this.playingAudioIndex == this.videoToolsSubOptions[index]) {
				Name += " - Currently Playing";
			}
			
			document.getElementById("guiPlayer_Tools_SubOptions").innerHTML += "<div id=videoToolsSubOptions"+index+" class=videoToolsOption>"+Name+"</div>";
			break;	
		case "videoOptionChapters":
			document.getElementById("guiPlayer_Tools_SubOptions").innerHTML += "<div id=videoToolsSubOptions"+index+" class=videoToolsOption>"+this.PlayerData.Chapters[index].Name+"</div>";
			break;	
		}	
	}
	document.getElementById("guiPlayer_Tools_SubOptions").style.visibility = "";
};