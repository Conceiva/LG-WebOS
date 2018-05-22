//NOTE
//
//Samsung Player accepts seconds
//Samsung Current time works in seconds * 1000

var GuiPlayer = {	
		videoElem : null,
		bBuffering : false,
		
		Status : "STOPPED",
		currentTime : 0,
		updateTimeCount : 0,
		setThreeD : false,
		PlayMethod : "",
		videoStartTime : null,
		offsetSeconds : 0, //For transcode, this holds the position the transcode started in the file
		
		playingMediaSource : null,
		playingMediaSourceIndex : null,
		playingURL : null,
		playingTranscodeStatus : null,
		playingVideoIndex : null,
		playingAudioIndex : null,
		playingSubtitleIndex : null,
			
		VideoData : null,
		PlayerData : null,
		PlayerDataSubtitle : null,
		PlayerIndex : null,
		
		subtitleInterval : null,
		subtitleShowingIndex : 0,
		subtitleSeeking : false,
		startParams : [],
		infoTimer : null
};


GuiPlayer.init = function() {
	GuiMusicPlayer.stopOnAppExit();
	
	this.videoElem = document.getElementById("videoContent");
	this.videoElem.style.backgroundColor = "#000";
	document.getElementById("videoPlayer").style.visibility = "";
	
	//Set up Player
	this.videoElem.addEventListener("error", GuiPlayer.handleError);
	this.videoElem.addEventListener('ended', GuiPlayer.handleOnRenderingComplete, false);
	this.videoElem.addEventListener('timeupdate', GuiPlayer.setCurrentTime, false);
    this.videoElem.addEventListener('loadedmetadata', GuiPlayer.OnStreamInfoReady, false); 
    
    this.videoElem.addEventListener("stalled", function(e) {
      console.log("stalled");
      !GuiPlayer.bBuffering && GuiPlayer.onBufferingStart();
      GuiPlayer.bBuffering = true;
    }, false);

    this.videoElem.addEventListener("waiting", function(e) {
      console.log("waiting");
      !GuiPlayer.bBuffering && GuiPlayer.onBufferingStart();
      GuiPlayer.bBuffering = true;
    }, false);

    this.videoElem.addEventListener("timeupdate", function(e) {
    	GuiPlayer.bBuffering && GuiPlayer.onBufferingComplete();
    	GuiPlayer.bBuffering = false;
    });
    
    this.videoElem.addEventListener("webkitendfullscreen", function() {
                                    GuiPlayer.back();
                                    });
    
};

GuiPlayer.start = function(title,url,itemData,startingPlaybackTick,playedFromPage,isCinemaMode,featureUrl) { 
	if (GuiMusicPlayer.Status == "PLAYING" || GuiMusicPlayer.Status == "PAUSED") {
		GuiMusicPlayer.stopPlayback();
	}
	
	GuiMainMenu.changeVisibility("hidden");
	
	//Run only once in loading initial request - subsequent vids should go thru the startPlayback
	this.startParams = [title,url,startingPlaybackTick,playedFromPage,isCinemaMode,featureUrl];
	
	//Display Loading 
	document.getElementById("guiPlayer_Loading").style.visibility = "";

	document.getElementById("videoPlayer").onclick = GuiPlayer.handlePlayKey;
	document.getElementById("guiPlayer_Info_ProgressBar").onclick = GuiPlayer.handleSeek;
	document.getElementById("guiPlayer_PlayPause").onclick = GuiPlayer.togglePause;
	
    //Get Item Data (Media Streams)
    this.VideoData = itemData;
    if (this.VideoData == null) { return; }
    
    this.PlayerIndex = 0; // Play All  - Default
    if (title == "PlayAll") {
    	if (this.VideoData.TotalRecordCount == 0) {
    		return;
    	}
    	if (this.startParams[4] === true && this.startParams[5] != null) {
    		//We are in Cinema Mode. Add the main feature to the end of the intros playlist.
    		this.featureData = Server.getContent(this.startParams[5]);
    		this.VideoData.push(this.featureData);
    	}
    	this.PlayerData = this.VideoData[this.PlayerIndex];
    } else {
    	
    	this.PlayerData = this.VideoData;
    	
    }

    //Take focus to no input
	document.getElementById("body").onkeydown = document.getElementById("NoKeyInput").onkeydown;
    
	//Load Versions
    GuiPlayer_Versions.start(this.PlayerData,startingPlaybackTick,playedFromPage);
};

GuiPlayer.togglePause = function() {
	if (GuiPlayer.Status != "PLAYING") {
		GuiPlayer.videoElem.play();
		GuiPlayer.Status = "PLAYING";
		document.getElementById("guiPlayer_PlayPause").style.background = "url('images/ic_play_arrow_white_48dp_1x.png')";
	}
	else {
		GuiPlayer.videoElem.pause();
		GuiPlayer.Status = "PAUSED";
		document.getElementById("guiPlayer_PlayPause").style.background = "url('images/ic_pause_white_48dp_1x.png')";
	}
	
}
	
GuiPlayer.handleSeek = function(e) {
	var elem = document.getElementById("guiPlayer_Info_ProgressBar");
	var left = elem.offsetLeft;
	var width = elem.offsetWidth;
	var seek = (e.pageX - left) / width;
	var hms = GuiPlayer.PlayerData.duration;   // your input string
	var a = hms.split(':'); // split it at the colons

	// minutes are worth 60 seconds. Hours are worth 60 minutes.
	var totalseconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
	GuiPlayer.videoElem.currentTime = seek * totalseconds;
}

GuiPlayer.startPlayback = function(TranscodeAlg, resumeTicksSamsung) {
	//Initiate Player for Video
	this.init();
	FileLog.write("Playback : Player Initialised");
	
	//Turn off Screensaver
    Support.screensaverOff(); 

	//Reset Vars
	this.Status = "STOPPED";
	this.currentTime = 0;
    this.updateTimeCount = 0;
    this.setThreeD = false;
	this.offsetSeconds = 0;
	this.PlayerDataSubtitle = null;
	this.subtitleShowingIndex = 0;
	this.subtitleSeeking = false;
	this.videoStartTime = resumeTicksSamsung;
	
	//Expand TranscodeAlg to useful variables!!!
	this.playingMediaSourceIndex = TranscodeAlg[0];
	if (this.startParams[0] == 'Trailer') {
		this.playingMediaSource = this.startParams[1];
		this.playingURL = this.startParams[1];
	}
	else {
		this.playingMediaSource = this.PlayerData.contentUrl;
		this.playingURL = TranscodeAlg[1];
	}
	this.playingTranscodeStatus = TranscodeAlg[2];
	this.playingVideoIndex = TranscodeAlg[3];
	this.playingAudioIndex = TranscodeAlg[4];
	this.playingSubtitleIndex = TranscodeAlg[5];
	
    //Set up GuiPlayer_Display
    GuiPlayer_Display.setDisplay(this.PlayerData,this.playingMediaSource,this.playingTranscodeStatus,this.offsetSeconds,this.playingVideoIndex,this.playingAudioIndex,this.playingSubtitleIndex,this.playingMediaSourceIndex,this.startParams[0]);
    
	//Set Resolution Display
	this.setDisplaySize();
	
	//Subtitles - If resuming find the correct index to start from!
    FileLog.write("Playback : Start Subtitle Processing");
	this.setSubtitles(this.playingSubtitleIndex);
	this.updateSubtitleTime(resumeTicksSamsung,"NewSubs");
	FileLog.write("Playback : End Subtitle Processing");

	//Create Tools Menu
	GuiPlayer_Display.createToolsMenu();
	
	//Update Server content is playing * update time
	//Server.videoStarted(this.PlayerData.Id,this.playingMediaSource.Id,this.PlayMethod);
    
	//Update URL with resumeticks
	FileLog.write("Playback : E+ Series Playback - Load URL");
	var url = this.playingURL;
	var position = 0;
	position = Math.round(resumeTicksSamsung / 1000);

	this.videoElem.src = url;
	this.videoElem.load();
    this.videoElem.play(); 
};

GuiPlayer.stopPlayback = function() {
	FileLog.write("Playback : Stopping");
	GuiPlayer.clearGuiItems();
	if (GuiPlayer.videoElem != null) {
		GuiPlayer.videoElem.pause();
		GuiPlayer.Status = "STOPPED";
		
		if (GuiPlayer.startParams[0] != 'Trailer') {
			var bookmark = GuiPlayer.videoElem.currentTime;
			var hms = GuiPlayer.PlayerData.duration;   // your input string
			var a = hms.split(':'); // split it at the colons

			// minutes are worth 60 seconds. Hours are worth 60 minutes.
			var totalseconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 
			
			if (bookmark == totalseconds) {
				bookmark = 0;
			}
			GuiPlayer.PlayerData.bookmark = bookmark;
			Server.videoStopped(GuiPlayer.PlayerData.id,bookmark);
		}
		
	}
	document.getElementById("videoPlayer").style.visibility = "hidden";
};

GuiPlayer.getGcd = function(a, b) {
    return (b == 0) ? a : GuiPlayer.getGcd (b, a % b);
}

GuiPlayer.setDisplaySize = function() {
	var width = this.PlayerData.contentWidth;
	var height = this.PlayerData.contentHeight;
	var gcd = this.getGcd(width, height);
	
	var aspectRatio = width/gcd + ":" + height/gcd;
	/*if (aspectRatio == "16:9") {
		this.plugin.SetDisplayArea(0, 0, 960, 540);
	} else if (aspectRatio == "4:3") {
		var newResolutionX = Math.round(540 * 4 / 3);
		var newResolutionY = 540;
		var centering = Math.round((960 - newResolutionX)/2);

		this.plugin.SetDisplayArea(parseInt(centering), parseInt(0), parseInt(newResolutionX), parseInt(newResolutionY));
	} else {
		//Scale Video	
		var ratioToShrinkX = 960 / this.PlayerData.contentWidth;
		var ratioToShrinkY = 540 / this.PlayerData.contentHeight;
			
		if (ratioToShrinkX < ratioToShrinkY) {
			var newResolutionX = 960;
			var newResolutionY = Math.round(this.PlayerData.contentHeight * ratioToShrinkX);
			var centering = Math.round((540-newResolutionY)/2);
				
			this.plugin.SetDisplayArea(parseInt(0), parseInt(centering), parseInt(newResolutionX), parseInt(newResolutionY));
		} else {
			var newResolutionX = Math.round(this.PlayerData.contentWidth * ratioToShrinkY);
			var newResolutionY = 540;
			var centering = Math.round((960-newResolutionX)/2);
				
			this.plugin.SetDisplayArea(parseInt(centering), parseInt(0), parseInt(newResolutionX), parseInt(newResolutionY));
		}			
	}*/	
};

GuiPlayer.setSubtitles = function(selectedSubtitleIndex) {
	if (selectedSubtitleIndex > -1) {
		var Stream = this.PlayerData.Subtitles[selectedSubtitleIndex];
		if (Stream) {
			//Set Colour & Size from User Settings
			Support.styleSubtitles("guiPlayer_Subtitles");
			
		    var url = Stream.Url;
		    this.PlayerDataSubtitle = Server.getSubtitles(url);
			FileLog.write("Subtitles : loaded "+url);
			
		    if (this.PlayerDataSubtitle == null) { 
		    	this.playingSubtitleIndex = -1; 
		    	return; 
		    } else {
		    	this.playingSubtitleIndex = selectedSubtitleIndex;
		    }
		    try{
		    	 this.PlayerDataSubtitle = parser.fromSrt(this.PlayerDataSubtitle,true);
		    }catch(e){
		        console.log(e); //error in the above string(in this case,yes)!
		    }

			// subtitles may not be sorted ascending by startTime, but we require it
			this.PlayerDataSubtitle.sort(function(a, b) {
				return a.startTime - b.startTime;
			});
		}
	}
};

GuiPlayer.updateSubtitleTime = function(newTime,direction) {
	if (this.playingSubtitleIndex != -1) {
		//Clear Down Subtitles
		this.subtitleSeeking = true;
		document.getElementById("guiPlayer_Subtitles").innerHTML = "";
		document.getElementById("guiPlayer_Subtitles").style.visibility = "hidden";
		
		if (direction == "FF") {
			if (newTime > this.PlayerDataSubtitle[this.PlayerDataSubtitle.length -1].startTime) {
				this.subtitleShowingIndex = this.PlayerDataSubtitle.length -1;
			} else {
				for (var index = this.subtitleShowingIndex; index < this.PlayerDataSubtitle.length; index++) {
					if (newTime <= this.PlayerDataSubtitle[index].startTime) {
						this.subtitleShowingIndex = index;
						break;
					}
				}
			}
		} else if (direction == "RW") {
			if (newTime < this.PlayerDataSubtitle[1].startTime) {
				this.subtitleShowingIndex = 1;
			} else {
				for (var index = 1; index <= this.subtitleShowingIndex; index++) {
					if (newTime <= this.PlayerDataSubtitle[index].startTime) {
						this.subtitleShowingIndex = index;
						break;
					}
				}
			}	
		} else {
			this.subtitleShowingIndex = 0;
			for (var index = 0; index < this.PlayerDataSubtitle.length; index++) {				
				if (newTime <= this.PlayerDataSubtitle[index].startTime) {
					this.subtitleShowingIndex = index;
					break;
				}
			}	
		}
		FileLog.write("Subtitle : new subtitleShowingIndex:  "+this.subtitleShowingIndex +" @ "+newTime);
		this.subtitleSeeking = false;
	}
};


//--------------------------------------------------------------------------------------------------

GuiPlayer.handleOnRenderingComplete = function() {
	GuiPlayer.stopPlayback();
	FileLog.write("Playback : Rendering Complete");
	
	if (GuiPlayer.startParams[0] == "PlayAll") {
	////Call Resume Option - Check playlist first, then AutoPlay property, then return
		this.PlayerIndex++;
		if (GuiPlayer.VideoData.length > this.PlayerIndex) {	
			//Take focus to no input
			document.getElementById("body").onkeydown = document.getElementById("NoKeyInput").onkeydown;
			
			this.PlayerData = GuiPlayer.VideoData[GuiPlayer.PlayerIndex];
			GuiPlayer_Versions.start(GuiPlayer.PlayerData,0,GuiPlayer.startParams[3]);
		} else {
			this.PlayerIndex = 0;
			GuiPlayer_Display.restorePreviousMenu();
		}
	} else if (File.getUserProperty("AutoPlay")){
		if (GuiPlayer.PlayerData.Type == "Episode") {
			GuiPlayer.AdjacentData = Server.getContent(Server.getAdjacentEpisodesURL(this.PlayerData.SeriesId,GuiPlayer.PlayerData.SeasonId,GuiPlayer.PlayerData.Id));
			if (GuiPlayer.AdjacentData == null) { return; }
			
			if (GuiPlayer.AdjacentData.Items.length == 2 && (GuiPlayer.AdjacentData.Items[1].IndexNumber > GuiPlayer.ItemData.IndexNumber)) {
				var url = Server.getItemInfoURL(GuiPlayer.AdjacentData.Items[1].Id);
				//Take focus to no input
				document.getElementById("body").onkeydown = document.getElementById("NoKeyInput").onkeydown;
				GuiPlayer.PlayerData = Server.getContent(url);
				if (GuiPlayer.PlayerData == null) { return; }
				GuiPlayer_Versions.start(GuiPlayer.PlayerData,0,GuiPlayer.startParams[3]);
			} else if (GuiPlayer.AdjacentData.Items.length > 2) {
				//Take focus to no input
				document.getElementById("body").onkeydown = document.getElementById("NoKeyInput").onkeydown;
				var url = Server.getItemInfoURL(GuiPlayer.AdjacentData.Items[2].Id);
				GuiPlayer.PlayerData = Server.getContent(url);
				if (GuiPlayer.PlayerData == null) { return; }
				GuiPlayer_Versions.start(GuiPlayer.PlayerData,0,GuiPlayer.startParams[3]);
			} else {
				GuiPlayer_Display.restorePreviousMenu();
			}
		} else {
			GuiPlayer_Display.restorePreviousMenu();
		}
	} else {
		GuiPlayer_Display.restorePreviousMenu();
	}
};


GuiPlayer.handleError = function(e) {
    if (this.getAttribute("src") === "" &&
	      this.error.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
	    // MEDIA_ERR_SRC_NOT_SUPPORTED occurs
	    // when changing or initializing source during playback
	    // Do not treat this as an error
	    // this.src is not null string but baseURI ("index.html" path)
	    // Use the getAttribute() method to get the current source
    }
	else if (this.error && typeof this.error.code === "number") {
	    switch (this.error.code) {
	      case MediaError.MEDIA_ERR_ABORTED:
	    	  GuiPlayer.handleConnectionFailed();
	        break;
	
	      case MediaError.MEDIA_ERR_ENCRYPTED:
	      case MediaError.MEDIA_ERR_DECODE:
	      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
	    	  GuiPlayer.handleRenderError.call(GuiPlayer, e);
	        break;
	
	      case MediaError.MEDIA_ERR_NETWORK:
	    	  GuiPlayer.handleOnNetworkDisconnected();
	        break;
	
	      default:
	        PlayerEvtListener.OnRenderError(e);
	    }
    }
		
}

GuiPlayer.handleConnectionFailed = function() {
	FileLog.write("Playback : Network Disconnected");
	GuiNotifications.setNotification(this.playingURL,"CONNECTION ERROR");
	GuiPlayer.stopPlayback();
	GuiPlayer_Display.restorePreviousMenu();
};

GuiPlayer.handleOnNetworkDisconnected = function() {
	//Transcoded files throw this error at end of playback?
	FileLog.write("Playback : Network Disconnected");
	GuiNotifications.setNotification(this.playingURL,"NETWORK DISCONNECTED");
	GuiPlayer.stopPlayback();
	GuiPlayer_Display.restorePreviousMenu();
};

GuiPlayer.handleRenderError = function(RenderErrorType) {
	FileLog.write("Playback : Render Error " + RenderErrorType);
    GuiNotifications.setNotification("Rendor Error Type : " + RenderErrorType);
    GuiPlayer.stopPlayback();
    GuiPlayer_Display.restorePreviousMenu();
};

GuiPlayer.setCurrentTime = function() {
	if (GuiPlayer.Status == "PLAYING") {

		//Subtitle Update
		if (GuiPlayer.playingSubtitleIndex != null && GuiPlayer.PlayerDataSubtitle != null && GuiPlayer.subtitleSeeking == false) {
			if (this.currentTime >= GuiPlayer.PlayerDataSubtitle[GuiPlayer.subtitleShowingIndex].endTime / 1000) {
				document.getElementById("guiPlayer_Subtitles").innerHTML = "";
				document.getElementById("guiPlayer_Subtitles").style.visibility = "hidden";
				if (GuiPlayer.PlayerDataSubtitle.length -1 > GuiPlayer.subtitleShowingIndex){
					GuiPlayer.subtitleShowingIndex++;
				}
			}
			if (this.currentTime >= GuiPlayer.PlayerDataSubtitle[GuiPlayer.subtitleShowingIndex].startTime / 1000 && this.currentTime < GuiPlayer.PlayerDataSubtitle[GuiPlayer.subtitleShowingIndex].endTime / 1000 && document.getElementById("guiPlayer_Subtitles").innerHTML != GuiPlayer.PlayerDataSubtitle.text) {
				var subtitleText = GuiPlayer.PlayerDataSubtitle[GuiPlayer.subtitleShowingIndex].text;
				subtitleText = subtitleText.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br />$2'); //support two-line subtitles

				// remove redundant breaks
				subtitleText = subtitleText.replace(/^<br \/>/, '');
				subtitleText = subtitleText.replace(/<br \/>$/, '');

				document.getElementById("guiPlayer_Subtitles").innerHTML = subtitleText; 
				document.getElementById("guiPlayer_Subtitles").style.visibility = "";
			}
		}
		
		//Update GUIs
		if (this.currentTime > 0 && GuiPlayer.setThreeD == false) {
			//Check 3D & Audio
			//Set Samsung Audio Output between DTS or PCM
			GuiPlayer.setupAudioConfiguration();
			GuiPlayer.setupThreeDConfiguration();			
			GuiPlayer.setThreeD = true;
		}
		
		var totalseconds = 0;
		if (GuiPlayer.startParams[0] != 'Trailer') {
			var hms = GuiPlayer.PlayerData.duration;   // your input string
			var a = hms.split(':'); // split it at the colons

			// minutes are worth 60 seconds. Hours are worth 60 minutes.
			totalseconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 
		} else {
			totalseconds = GuiPlayer.PlayerData.trailerDuration;
		}
		
		percentage = (100 * this.currentTime / (totalseconds));	
		document.getElementById("guiPlayer_Info_ProgressBar_Current").style.width = percentage + "%";
		document.getElementById("guiPlayer_Info_Time").innerHTML = Support.convertTicksToTimeSingle(this.currentTime * 1000);
		document.getElementById("guiPlayer_Info_Time_Total").innerHTML = Support.convertTicksToTimeSingle((totalseconds * 1000));
		GuiPlayer.updateTimeCount++;
		if (GuiPlayer.updateTimeCount == 8) {
			GuiPlayer.updateTimeCount = 0;
			Server.videoTime(GuiPlayer.PlayerData.Id,GuiPlayer.playingMediaSource.Id,this.currentTime,GuiPlayer.PlayMethod);
		}
	}
};

GuiPlayer.onBufferingStart = function() {
	if (GuiMusicPlayer.Status == "PLAYING"){
		return;
	}
	this.Status = "PLAYING";
	FileLog.write("Playback : Buffering...");
	
	//Show Loading Screen
    document.getElementById("guiPlayer_Loading").style.visibility = "";
	
	//Stop Subtitle Display - Mainly for Transcode pauses
	if (this.playingSubtitleIndex != null) {
		this.subtitleSeeking = true;
	}
};

GuiPlayer.onBufferingProgress = function(percent) {
	if (document.getElementById("guiPlayer_Loading").style.visibility == "" && percent > 5){
		document.getElementById("guiPlayer_Loading").innerHTML = "Buffering " + percent + "%";
	}
	FileLog.write("Playback : Buffering " + percent + "%");
};

GuiPlayer.onBufferingComplete = function() {
	if (GuiMusicPlayer.Status == "PLAYING"){
		return;
	}
	FileLog.write("Playback : Buffering Complete");
    
  //Start Subtitle Display - Mainly for Transcode pauses
	if (this.playingSubtitleIndex != null) {
		this.subtitleSeeking = false;
	}
    
    //Hide Loading Screen
	document.getElementById("guiPlayer_Loading").innerHTML = "Loading";
    document.getElementById("guiPlayer_Loading").style.visibility = "hidden";
    
	//Setup Volume & Mute Keys
	//Volume & Mute Control - Works!
	/*NNaviPlugin = document.getElementById("pluginObjectNNavi");
    NNaviPlugin.SetBannerState(PL_NNAVI_STATE_BANNER_VOL);
    pluginAPI.unregistKey(Common.API.KEY_VOL_UP);
    pluginAPI.unregistKey(Common.API.KEY_VOL_DOWN);
    pluginAPI.unregistKey(Common.API.KEY_MUTE);*/
       
	//Set Focus for Key Events - Must be done on successful load of video
	document.getElementById("body").onkeydown = document.getElementById("GuiPlayer").onkeydown;
};

GuiPlayer.OnStreamInfoReady = function() {
	FileLog.write("Playback : Stream Info Ready");
	GuiPlayer.videoElem.currentTime = GuiPlayer.videoStartTime;
	
		var totalseconds = 0;
		if (GuiPlayer.startParams[0] != 'Trailer') {
			var hms = GuiPlayer.PlayerData.duration;   // your input string
			var a = hms.split(':'); // split it at the colons

			// minutes are worth 60 seconds. Hours are worth 60 minutes.
			totalseconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 
		} else {
			totalseconds = GuiPlayer.PlayerData.trailerDuration;
		} 
		document.getElementById("guiPlayer_Info_Time").innerHTML = Support.convertTicksToTimeSingle(this.currentTime, (totalseconds * 1000));
		document.getElementById("guiPlayer_Info_Time_Total").innerHTML = Support.convertTicksToTimeSingle((totalseconds * 1000));

};

GuiPlayer.clearGuiItems = function() {
	if (this.infoTimer != null){
		clearTimeout(this.infoTimer);
	}
	document.getElementById("guiPlayer_Osd").style.opacity = 0;
	$('#guiPlayer_Osd').css('display','none');
	document.getElementById("guiPlayer_Tools").style.opacity = 0;
	document.getElementById("guiPlayer_Subtitles").innerHTML = "";
	document.getElementById("guiPlayer_Subtitles").style.visibility = "hidden";
};

//-----------------------------------------------------------------------------------------------------------------------------------------
//       GUIPLAYER PLAYBACK KEY HANDLERS
//-----------------------------------------------------------------------------------------------------------------------------------------

GuiPlayer.back = function() {
    document.getElementById("guiPlayer_Loading").style.visibility = "hidden";
    GuiPlayer.stopPlayback();
	GuiPlayer_Display.restorePreviousMenu();
};

GuiPlayer.keyDown = function() {
	var keyCode = event.keyCode;

	switch(keyCode) {
		case Common.API.KEY_RETURN:
		case 169:
			FileLog.write("Playback : Return By User");
			event.preventDefault();
			this.stopPlayback();
            GuiPlayer_Display.restorePreviousMenu();
			break;	
		case Common.API.KEY_RIGHT:
			event.preventDefault();
			this.handleRightKey();
			break;
		case Common.API.KEY_LEFT:
			event.preventDefault();
			this.handleLeftKey();
			break;		
		case Common.API.KEY_PLAY:
		case Common.API.KEY_UP:
			event.preventDefault();
			this.handlePlayKey();
			break;
		case Common.API.KEY_STOP:
			this.handleStopKey();
            break;
		case Common.API.KEY_PAUSE:
			this.handlePauseKey();
            break;   
        case Common.API.KEY_FF:
            this.handleFFKey();      
            break;       
        case Common.API.KEY_RW:
            this.handleRWKey();
            break;
        case Common.API.KEY_INFO:	
			GuiPlayer.handleInfoKey();
			break;
        case Common.API.KEY_3D:	
        	GuiPlayer.setupThreeDConfiguration();
			break;
        case Common.API.KEY_TOOLS:
        case Common.API.KEY_DOWN:
        	event.preventDefault();
    		if (this.infoTimer != null){
    			clearTimeout(this.infoTimer);
    		}
    		if (document.getElementById("guiPlayer_Osd").style.opacity != 0) {
    			$('#guiPlayer_Osd').css('opacity',1).animate({opacity:0}, 500, function() {
					$('#guiPlayer_Osd').css('display','none');
				});
    		}
    		document.getElementById("guiPlayer_Subtitles").style.top="auto";
    		document.getElementById("guiPlayer_Subtitles").style.bottom="100px";
    		GuiPlayer_Display.updateSelectedItems();
    		if (document.getElementById("guiPlayer_Tools").style.opacity != 1) {
    			$('#guiPlayer_Tools').css('opacity',0).animate({opacity:1}, 500);
    		}
    		document.getElementById("body").onkeydown = document.getElementById("GuiPlayer_Tools").onkeydown;
        	break;
        case Common.API.KEY_EXIT:
        	FileLog.write("EXIT KEY");
            event.preventDefault();
            this.stopPlayback();
            GuiPlayer_Display.restorePreviousMenu();
            break;	
	}
};

GuiPlayer.handleRightKey = function() {
	if (this.startParams[0] == "PlayAll") {
		this.PlayerIndex++;
		if (this.VideoData.length > this.PlayerIndex) {	
			this.stopPlayback();
			this.PlayerData = this.VideoData[this.PlayerIndex];
			GuiPlayer_Versions.start(this.PlayerData,0,this.startParams[3]);
		} else {
			//Reset PlayerData to correct index!!
			this.PlayerIndex--;
			this.PlayerData = this.VideoData[this.PlayerIndex];
		}
	} else {
		GuiPlayer.handleFFKey();
	}
};

GuiPlayer.handleLeftKey = function() {
	if (this.startParams[0] == "PlayAll") {
		this.PlayerIndex--;
		if (this.PlayerIndex >= 0) {	
			this.stopPlayback();
			this.PlayerData = this.VideoData[this.PlayerIndex];
			GuiPlayer_Versions.start(this.PlayerData,0,this.startParams[3]);
		} else {
			//Reset PlayerData to correct index!!
			this.PlayerIndex++;
			this.PlayerData = this.VideoData[this.PlayerIndex];
		}
	} else {
		GuiPlayer.handleRWKey();
	}
};

GuiPlayer.handlePlayKey = function() {
	if (this.Status == "PAUSED") {
		FileLog.write("Playback : Play by User");
		this.Status = "PLAYING";
		this.videoElem.play();
		document.getElementById("guiPlayer_Subtitles").style.bottom="100px";
		if (document.getElementById("guiPlayer_Osd").style.opacity == 0) {
			$('#guiPlayer_Osd').css('display','block');
			$('#guiPlayer_Osd').css('opacity',0).animate({opacity:1}, 500);
		}
		//Support.clock();
		if (this.infoTimer != null){
			document.getElementById("guiPlayer_ItemDetails").style.visibility="hidden";
			document.getElementById("guiPlayer_ItemDetails2").style.visibility="";
			clearTimeout(this.infoTimer);
		}
		this.infoTimer = setTimeout(function(){
			$('#guiPlayer_Osd').css('opacity',1).animate({opacity:0}, 500, function() {
				$('#guiPlayer_Osd').css('display','none');
			});
			setTimeout(function(){
				document.getElementById("guiPlayer_Subtitles").style.top="auto";
				document.getElementById("guiPlayer_Subtitles").style.bottom="60px";
			}, 500);
		}, 3000);
	}
	else
	{
		document.getElementById("guiPlayer_Subtitles").style.bottom="100px";
		if (document.getElementById("guiPlayer_Osd").style.opacity == 0) {
			$('#guiPlayer_Osd').css('display','block');
			$('#guiPlayer_Osd').css('opacity',0).animate({opacity:1}, 500);
		}
		if (this.infoTimer != null){
			document.getElementById("guiPlayer_ItemDetails").style.visibility="hidden";
			document.getElementById("guiPlayer_ItemDetails2").style.visibility="";
			clearTimeout(this.infoTimer);
		}
		this.infoTimer = setTimeout(function(){
			$('#guiPlayer_Osd').css('opacity',1).animate({opacity:0}, 500, function() {
				$('#guiPlayer_Osd').css('display','none');
			});
			setTimeout(function(){
				document.getElementById("guiPlayer_Subtitles").style.top="auto";
				document.getElementById("guiPlayer_Subtitles").style.bottom="60px";
			}, 500);
		}, 3000);
	}
};

GuiPlayer.handleStopKey = function() {
    FileLog.write("Playback : Stopped by User");
    this.stopPlayback();
    setTimeout(function(){
	    document.getElementById("guiPlayer_ItemDetails").style.visibility="hidden";
		document.getElementById("guiPlayer_ItemDetails2").style.visibility="";
	    GuiPlayer_Display.restorePreviousMenu();
    }, 250);
};

GuiPlayer.handlePauseKey = function() {
	if(this.Status == "PLAYING") {
		document.getElementById("guiPlayer_Subtitles").style.bottom="100px";
		if (document.getElementById("guiPlayer_Osd").style.opacity == 0) {
			$('#guiPlayer_Osd').css('display','block');
			$('#guiPlayer_Osd').css('opacity',0).animate({opacity:1}, 500);
		}
		FileLog.write("Playback : Paused by User");
		this.videoElem.pause();
		this.Status = "PAUSED";
		//Server.videoPaused(this.PlayerData.Id,this.playingMediaSource.Id,this.currentTime,this.PlayMethod);           	
		if (this.infoTimer != null){
			clearTimeout(this.infoTimer);
		}
		this.infoTimer = setTimeout(function(){
			setTimeout(function(){
				document.getElementById("guiPlayer_ItemDetails").style.visibility="hidden";
				document.getElementById("guiPlayer_ItemDetails2").style.visibility="";
			}, 500);
			$('#guiPlayer_Osd').css('opacity',1).animate({opacity:0}, 500, function() {
				$('#guiPlayer_Osd').css('display','none');
			});
			setTimeout(function(){
				document.getElementById("guiPlayer_Subtitles").style.top="auto";
				document.getElementById("guiPlayer_Subtitles").style.bottom="60px";
			}, 500);
		}, 10000);
	} 
};

GuiPlayer.handleFFKey = function() {
	FileLog.write("Playback : Fast Forward");
    if(this.Status == "PLAYING") {
    	if (this.PlayMethod == "DirectPlay") {
    		FileLog.write("Playback : Fast Forward : Direct Play");
    		GuiPlayer.updateSubtitleTime(this.currentTime + 29000,"FF");
        	this.videoElem.currentTime = this.currentTime + 30;
    	} else {
    		FileLog.write("Playback : Fast Forward : Transcoding");
    		this.newPlaybackPosition((this.currentTime + 30000) * 10000);
    	}
		document.getElementById("guiPlayer_Subtitles").style.bottom="100px";
		if (document.getElementById("guiPlayer_Osd").style.opacity == 0) {
			$('#guiPlayer_Osd').css('display','block');
			$('#guiPlayer_Osd').css('opacity',0).animate({opacity:1}, 500);
		} 
		if (this.infoTimer != null){
			clearTimeout(this.infoTimer);
		}
    	this.infoTimer = setTimeout(function(){
			setTimeout(function(){
				document.getElementById("guiPlayer_ItemDetails").style.visibility="hidden";
				document.getElementById("guiPlayer_ItemDetails2").style.visibility="";
				document.getElementById("guiPlayer_Subtitles").style.top="auto";
				document.getElementById("guiPlayer_Subtitles").style.bottom="60px";
			}, 500);
			$('#guiPlayer_Osd').css('opacity',1).animate({opacity:0}, 500, function() {
				$('#guiPlayer_Osd').css('display','none');
			});
		}, 3000);    	
    }  
};

GuiPlayer.handleRWKey = function() {
	FileLog.write("Playback : Rewind");
    if(this.Status == "PLAYING") {
    	if (this.PlayMethod == "DirectPlay") {
    		FileLog.write("Playback : Rewind : Direct Play");
    		GuiPlayer.updateSubtitleTime(this.currentTime - 13000,"RW");
    		this.videoElem.currentTime = this.currentTime - 10
    	} else {
    		FileLog.write("Playback : Rewind : Transcoding");
    		this.newPlaybackPosition((this.currentTime - 10000) * 10000);
    	}
		document.getElementById("guiPlayer_Subtitles").style.bottom="100px";
		if (document.getElementById("guiPlayer_Osd").style.opacity == 0) {
			$('#guiPlayer_Osd').css('display','block');
			$('#guiPlayer_Osd').css('opacity',0).animate({opacity:1}, 500);
		} 
		if (this.infoTimer != null){
			clearTimeout(this.infoTimer);
		}
    	this.infoTimer = setTimeout(function(){
			setTimeout(function(){
				document.getElementById("guiPlayer_ItemDetails").style.visibility="hidden";
				document.getElementById("guiPlayer_ItemDetails2").style.visibility="";
				document.getElementById("guiPlayer_Subtitles").style.top="auto";
				document.getElementById("guiPlayer_Subtitles").style.bottom="60px";
			}, 500);
			$('#guiPlayer_Osd').css('opacity',1).animate({opacity:0}, 500, function() {
				$('#guiPlayer_Osd').css('display','none');
			});
		}, 3000);   
    }  
};

GuiPlayer.handleInfoKey = function () {
	if (this.infoTimer != null){
		clearTimeout(this.infoTimer);
	}
	if (document.getElementById("guiPlayer_Osd").style.opacity == 0 || 
			document.getElementById("guiPlayer_ItemDetails").style.visibility == "hidden"){ //Full info called
		document.getElementById("guiPlayer_ItemDetails").style.visibility="";
		document.getElementById("guiPlayer_ItemDetails2").style.visibility="hidden";
		document.getElementById("guiPlayer_Subtitles").style.top="170px";
		if (document.getElementById("guiPlayer_Osd").style.opacity == 0) {
			$('#guiPlayer_Osd').css('display','block');
			$('#guiPlayer_Osd').css('opacity',0).animate({opacity:1}, 500);
		}
		this.infoTimer = setTimeout(function(){
			setTimeout(function(){
				document.getElementById("guiPlayer_ItemDetails").style.visibility="hidden";
				document.getElementById("guiPlayer_ItemDetails2").style.visibility="";
				document.getElementById("guiPlayer_Subtitles").style.top="auto";
				document.getElementById("guiPlayer_Subtitles").style.bottom="60px";
			}, 500);
			$('#guiPlayer_Osd').css('opacity',1).animate({opacity:0}, 500, function() {
				$('#guiPlayer_Osd').css('display','none');
			});
		}, 10000);
	} else { //Full info cancelled while on screen.
		$('#guiPlayer_Osd').css('opacity',1).animate({opacity:0}, 500, function() {
				$('#guiPlayer_Osd').css('display','none');
			});
		this.infoTimer = setTimeout(function(){
			document.getElementById("guiPlayer_ItemDetails").style.visibility="hidden";
			document.getElementById("guiPlayer_ItemDetails2").style.visibility="";
			document.getElementById("guiPlayer_Subtitles").style.top="auto";
			document.getElementById("guiPlayer_Subtitles").style.bottom="60px";
		}, 500);
	}
};

//-----------------------------------------------------------------------------------------------------------------------------------------
//       GUIPLAYER 3D & AUDIO OUTPUT SETTERS
//-----------------------------------------------------------------------------------------------------------------------------------------

GuiPlayer.setupThreeDConfiguration = function() {
	if (this.PlayerData.Video3DFormat !== undefined) {
		
	}
};

GuiPlayer.setupAudioConfiguration = function() {

	var codec = this.playingMediaSource.AudioCodec;
	
	//If audio has been transcoded need to manually set codec as codec in stream info will be wrong
	if ((File.getTVProperty("Dolby") && File.getTVProperty("AACtoDolby")) && codec == "aac") {
		codec = "ac3";
	}

};

GuiPlayer.getTranscodeProgress = function() {
	//Get Session Data (Media Streams)
    var SessionData = Server.getContent(Server.getCustomURL("/Sessions?format=json"));
    if (SessionData == null) { return; }
    
    for (var index = 0; index < SessionData.length; index++) {
    	if (SessionData[index].DeviceId == Server.getDeviceID()) {
    		return Math.floor(SessionData[index].TranscodingInfo.CompletionPercentage);
    	}
    }
    return null;  
};

GuiPlayer.checkTranscodeCanSkip = function(newtime) {	
	var totalseconds = 0;
	if (this.startParams[0] != 'Trailer') {
		var hms = this.PlayerData.duration;   // your input string
		var a = hms.split(':'); // split it at the colons

		// minutes are worth 60 seconds. Hours are worth 60 minutes.
		totalseconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 
	} else {
		totalseconds = this.PlayerData.trailerDuration;
	}
	
	var transcodePosition = (transcodeProgress / 100) * ((totalseconds * 1000) - this.offsetSeconds);
	if ((newtime > this.offsetSeconds) && newtime < transcodePosition) {
		return true;
	} else {
		return false;
	}
};

GuiPlayer.newPlaybackPosition = function(startPositionTicks) {

	this.videoElem.currentTime = startPositionTicks;
	   
};

GuiPlayer.newSubtitleIndex = function (newSubtitleIndex) {
	if (newSubtitleIndex == -1 && this.playingSubtitleIndex != null) {
		//Turn Off Subtitles
		this.PlayerDataSubtitle = null;
		this.playingSubtitleIndex = -1;
		this.subtitleShowingIndex = 0;
		this.subtitleSeeking = false;
		document.getElementById("guiPlayer_Subtitles").innerHTML = "";
		document.getElementById("guiPlayer_Subtitles").style.visibility = "hidden";
		document.getElementById("body").onkeydown = document.getElementById("GuiPlayer").onkeydown;
	} else {
		//Check its not already selected 
		if (newSubtitleIndex != this.playingSubtitleIndex) {
			//Prevent displaying Subs while loading
			this.subtitleSeeking = true; 
			document.getElementById("guiPlayer_Subtitles").innerHTML = "";
			document.getElementById("guiPlayer_Subtitles").style.visibility = "hidden";
			
			//Update SubtitleIndex and reset index
			this.playingSubtitleIndex = newSubtitleIndex;
			
			//Load New Subtitle File
			this.setSubtitles(this.playingSubtitleIndex);
		    
		    //Update subs index
		    this.updateSubtitleTime(this.currentTime,"NewSubs");
		    
		    //Load Back to main page GUI
			document.getElementById("body").onkeydown = document.getElementById("GuiPlayer").onkeydown;
		} else {
			//Do Nothing!
			document.getElementById("body").onkeydown = document.getElementById("GuiPlayer").onkeydown;
		}		
	}	
	//Keep the Subtitles menu up to date with the currently playing subs.
	GuiPlayer_Display.playingSubtitleIndex = this.playingSubtitleIndex;
};

//-----------------------------------------------------------------------------------------------------------------------------------------
//       GUIPLAYER STOP HANDLER ON APP EXIT
//-----------------------------------------------------------------------------------------------------------------------------------------

GuiPlayer.stopOnAppExit = function() {
	if (this.videoElem != null) {
		this.videoElem.pause();
		this.videoElem = null;
	}
};

