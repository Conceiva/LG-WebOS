var GuiPage_Servers = {
	ServerData : null,
	
	selectedItem : 0,
	topLeftItem : 0,
	isAddButton : false,
	MAXCOLUMNCOUNT : 3,
	MAXROWCOUNT : 1
}

GuiPage_Servers.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
}

GuiPage_Servers.start = function(runAutoLogin) {
	console.log("Page Enter : GuiPage_Servers");
	//GuiHelper.setControlButtons("Default ",null,null,"Delete","Exit");
	
	GuiMainMenu.changeVisibility("hidden");
	
	//Reset Properties
	this.selectedItem = 0;
	this.topLeftItem = 0; 
	this.isAddButton = false;
	
	//Load Data
	this.ServerData = JSON.parse(File.loadFile());

	this.ServerData.Servers.unshift({'Name':'Add a New Server', 'poster':'images/add.png'});
	
	Support.removeSplashScreen();
	
	//Change Display
	document.getElementById("pageContent").innerHTML = "<div id=ServersBack class='menu-icon' style='background-image:url(images/menu/Back-46x37.png)' onclick='Support.processReturnURLHistory();'></div><div style='padding-top:60px;text-align:center'> \
		<div id=GuiPage_Servers_allusers></div></div>" +
				"<div style='text-align:center' class='loginOptions' >" +
				"<p style='margin-top:15px'>Use the UP button to set the selected server as the default auto connect server</p>" +
				"<p>Use the DOWN button to delete the selected server</p></div>";
			
	this.updateDisplayedUsers();
	this.updateSelectedUser();
	
	//Set Backdrop
	Support.fadeImage("images/bg1.jpg");
	
	//Set focus to element in Index that defines keydown method! This enables keys to work :D
	document.getElementById("body").onkeydown = document.getElementById("GuiPage_Servers").onkeydown;

}

GuiPage_Servers.onclick = function(index) {
	GuiPage_Servers.selectedItem = index;
	GuiPage_Servers.processSelectedUser();
}

GuiPage_Servers.updateDisplayedUsers = function() {
	var htmltoadd = "";
	for (var index = this.topLeftItem; index < (Math.min(this.topLeftItem + this.getMaxDisplay(),this.ServerData.Servers.length)); index++) {
		this.ServerData.Servers[index].id = index;
		if (this.ServerData.Servers[index].poster === undefined) {
			this.ServerData.Servers[index].poster = 'images/server.png';
		}
		htmltoadd += "<div onclick='GuiPage_Servers.onclick(" + index + ")' id=" + this.ServerData.Servers[index].id + " style=background-image:url(" + this.ServerData.Servers[index].poster + ")><div class=menuItem>"+ this.ServerData.Servers[index].Name + "</div></div>";
    }
		
	//Set Content to Server Data
	var allusers = document.getElementById("GuiPage_Servers_allusers");
	if (allusers != null) {
		document.getElementById("GuiPage_Servers_allusers").innerHTML = htmltoadd;
	}
}

//Function sets CSS Properties so show which user is selected
GuiPage_Servers.updateSelectedUser = function () {	
	Support.updateSelectedNEW(this.ServerData.Servers,this.selectedItem,this.topLeftItem,
			Math.min(this.topLeftItem + GuiPage_Servers.getMaxDisplay(),this.ServerData.Servers.length),"User Selected highlightMezzmoBoarder","User","");
}

//Function executes on the selection of a user - should log user in or generate error message on screen
GuiPage_Servers.processSelectedUser = function () {
	if (this.selectedItem == 0) {
		//GuiPage_NewServer.start();
		GuiDisplay_Servers.start();
	} else {
		File.setServerEntry(this.selectedItem - 1); // offset by 1
		Support.processHomePageMenu("Home");
		//Server.testConnectionSettings(this.ServerData.Servers[this.selectedItem].Path,true);
	}
}

GuiPage_Servers.keyDown = function()
{
	var keyCode = event.keyCode;
	console.log("Key pressed: " + keyCode);

	if (document.getElementById("Notifications").style.visibility == "") {
		document.getElementById("Notifications").style.visibility = "hidden";
		document.getElementById("NotificationText").innerHTML = "";
		
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}
	
	switch(keyCode)
	{
		case Common.API.KEY_RETURN:
			console.log("RETURN");
			event.preventDefault();
			Support.processHomePageMenu("Home");
			break;
		case Common.API.KEY_LEFT:
			console.log("LEFT");
			event.preventDefault();	
			this.selectedItem--;
			if (this.selectedItem < 0) {
				this.selectedItem = this.ServerData.Servers.length - 1;
				if(this.ServerData.Servers.length > this.MAXCOLUMNCOUNT) {
					this.topLeftItem = (this.selectedItem-2);
					this.updateDisplayedUsers();
				} else {
					this.topLeftItem = 0;
				}
			} else {
				if (this.selectedItem < this.topLeftItem) {
					this.topLeftItem--;
					if (this.topLeftItem < 0) {
						this.topLeftItem = 0;
					}
					this.updateDisplayedUsers();
				}
			}
			this.updateSelectedUser();
			break;
		case Common.API.KEY_RIGHT:
			console.log("RIGHT");	
			event.preventDefault();
			this.selectedItem++;
			if (this.selectedItem >= this.ServerData.Servers.length) {
				this.selectedItem = 0;
				this.topLeftItem = 0;
				this.updateDisplayedUsers();
			} else {
				if (this.selectedItem >= this.topLeftItem+this.getMaxDisplay() ) {
					this.topLeftItem++;
					this.updateDisplayedUsers();
				}
			}
			this.updateSelectedUser();
			break;
		case Common.API.KEY_DOWN:
			if (this.selectedItem != 0) {
				File.deleteServer(this.selectedItem - 1);
			}
			break;
		case Common.API.KEY_UP:
			if (this.selectedItem != 0) {
				File.setDefaultServer(this.selectedItem - 1);
			}
			break;	
		case Common.API.KEY_ENTER:
		case Common.API.KEY_PANEL_ENTER:
			console.log("ENTER");
			GuiPage_Servers.processSelectedUser();
			break;	
		case Common.API.KEY_RED:

			break;
		case Common.API.KEY_YELLOW:
			File.deleteSettingsFile();
		case Common.API.KEY_BLUE:

			break;
		case Common.API.KEY_EXIT:
			console.log ("EXIT KEY");
			break;
		default:
			console.log("Unhandled key");
			break;
	}
};