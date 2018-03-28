var GuiUsers = {
	UserData : null,
	
	isManualEntry : false,
	
	rememberPassword : true,
	
	selectedUser : 0,
	selectedRow : 0,
	topLeftItem : 0, 
	MAXCOLUMNCOUNT : 3,
	MAXROWCOUNT : 1
}

GuiUsers.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
}

GuiUsers.start = function(runAutoLogin) {
	console.log("Page Enter : GuiUsers");
	//GuiHelper.setControlButtons(null,null,null,null,"Exit  ");
	Support.removeSplashScreen();
	
	//Reset Properties
	File.setUserEntry(null);
	this.selectedUser = 0;
	this.selectedRow = 0;
	this.topLeftItem = 0; 
	this.isManualEntry = false;
	this.rememberPassword = true;
	
	Support.destroyURLHistory();
	Support.fadeImage("images/bg1.jpg");
	document.getElementById("NotificationText").innerHTML = "";
	document.getElementById("Notifications").style.visibility = "hidden";
	
	//Load Data
	var url = Server.getServerAddr() + "";

	//Set File User Entry
	File.setUserEntry(0);
	//Change Focus and call function in GuiMain to initiate the page!
	GuiMainMenu.start();
}

GuiUsers.updateDisplayedUsers = function() {
	var htmltoadd = "";
	for (var index = this.topLeftItem; index < (Math.min(this.topLeftItem + this.getMaxDisplay(),this.UserData.length)); index++) {
		if (this.UserData[index].PrimaryImageTag) {			
			var imgsrc = Server.getImageURL(this.UserData[index].Id,"UsersPrimary",400,400,0,false,0);
			htmltoadd += "<div id=" + this.UserData[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=menuItem>"+ this.UserData[index].Name + "</div></div>";
		} else {
			htmltoadd += "<div id=" + this.UserData[index].Id + " style=background-image:url(images/loginusernoimage.png)><div class=menuItem>"+ this.UserData[index].Name + "</div></div>";
		}	
    }
		
	//Set Content to Server Data
	document.getElementById("guiUsers_allusers").innerHTML = htmltoadd;
}

//Function sets CSS Properties so show which user is selected
GuiUsers.updateSelectedUser = function () {	
	Support.updateSelectedNEW(this.UserData,this.selectedUser,this.topLeftItem,
			Math.min(this.topLeftItem + GuiUsers.getMaxDisplay(),this.UserData.length),"User Selected highlight1Boarder","User","");
}

//Function executes on the selection of a user - should log user in or generate error message on screen
GuiUsers.processSelectedUser = function () {
	var selectedUserId = this.UserData[this.selectedUser].Id;

	//Remove Focus & Display Loading
	
	document.getElementById("NoItems").focus();
	document.getElementById("guiLoading").style.visibility = "";

	//Load JSON File
	var userInFile = false;
	var fileJson = JSON.parse(File.loadFile()); 
    if (fileJson.Servers[File.getServerEntry()].Users.length > 0) {	
    	for (var index = 0; index < fileJson.Servers[File.getServerEntry()].Users.length; index++) {
    		var UserId = fileJson.Servers[File.getServerEntry()].Users[index].UserId;
    		if (UserId == selectedUserId){
    			userInFile = true;
    			var User = fileJson.Servers[File.getServerEntry()].Users[index].UserName;
    			var Password = fileJson.Servers[File.getServerEntry()].Users[index].Password;
    			
    			if (fileJson.Servers[File.getServerEntry()].Users[index].RememberPassword !== undefined) {
    				this.rememberPassword = fileJson.Servers[File.getServerEntry()].Users[index].RememberPassword;
    				document.getElementById("guiUsers_rempwdvalue").innerHTML = this.rememberPassword;
    			}
    			
    			//Authenticate with MB3 - if fail somehow bail?					
				var authenticateSuccess = Server.Authenticate(UserId, User, Password);		
				if (authenticateSuccess) {
					//Hide loading
					document.getElementById("guiLoading").style.visibility = "hidden";
					//document.getElementById("GuiUsers").focus();
					//Set File User Entry
					File.setUserEntry(index);
					//Change Focus and call function in GuiMain to initiate the page!
					GuiMainMenu.start();
				} else {
					//Doesn't delete, allows user to correct password for the user.
					//Hide loading
					document.getElementById("guiLoading").style.visibility = "hidden";
					document.getElementById("GuiUsers").focus();
					
					//Saved password failed - likely due to a user changing their password or user forgetting passwords!
					new GuiUsers_Input("guiUsers_Password");				
				}
				break;
    		}  		
    	}		
    }
	if (userInFile == false){
		if (this.UserData[this.selectedUser].HasPassword) {
			//Has password - Load IME	
			//Hide loading
			document.getElementById("guiLoading").style.visibility = "hidden";
			document.getElementById("GuiUsers").focus();
			new GuiUsers_Input("guiUsers_Password");
		} else {
			var pwdSHA1 = Sha1.hash("",true);
			var authenticateSuccess = Server.Authenticate(this.UserData[this.selectedUser].Id, this.UserData[this.selectedUser].Name, pwdSHA1);		
			if (authenticateSuccess) {
				//Reset GUI to as new - Not Required as it already is!!
				//Hide loading
				document.getElementById("guiLoading").style.visibility = "hidden";
				//Add Username & Password to DB
				File.addUser(this.UserData[this.selectedUser].Id,this.UserData[this.selectedUser].Name,pwdSHA1,this.rememberPassword);
				//Change Focus and call function in GuiMain to initiate the page!
				GuiMainMenu.start();
			} else {
				//Hide loading
				document.getElementById("guiLoading").style.visibility = "hidden";
				document.getElementById("GuiUsers").focus();
				//Div to display Network Failure - No password therefore no password error
				//This event should be impossible under normal circumstances
				GuiNotifications.setNotification("Network Error");
			}
		}
	}
	

}

GuiUsers.keyDown = function()
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
	
	switch(keyCode)
	{
		case Common.API.KEY_RETURN:
		case Common.API.KEY_PANEL_RETURN:
			console.log("RETURN");
			tizen.application.getCurrentApplication().hide();
			break;
		case Common.API.KEY_UP:
			this.selectedRow--;
			if (this.selectedRow < 1) {
				this.selectedRow = 0;
				document.getElementById("ManualLogin").className = "offWhite";
				GuiUsers.updateSelectedUser();
			} else if (this.selectedRow == 1) {
				this.isManualEntry = true;
				document.getElementById("ManualLogin").className = "highlight1Text";
				document.getElementById("ChangeServer").className = "offWhite";
				document.getElementById(this.UserData[this.selectedUser].Id).className = "User"; 
			} else if (this.selectedRow == 2) {
				document.getElementById("ManualLogin").className = "offWhite";
				document.getElementById("ChangeServer").className = "highlight1Text";
			}
			break;
		case Common.API.KEY_DOWN:
			this.selectedRow++;
			if (this.selectedRow == 1) {
				this.isManualEntry = true;
				document.getElementById("ManualLogin").className = "highlight1Text";
				document.getElementById("ChangeServer").className = "offWhite";
				document.getElementById(this.UserData[this.selectedUser].Id).className = "User"; 
			} else if (this.selectedRow > 1) {
				this.selectedRow = 2;
				document.getElementById("ManualLogin").className = "offWhite";
				document.getElementById("ChangeServer").className = "highlight1Text";
			}
			break;
		case Common.API.KEY_LEFT:
			console.log("LEFT");
			if (this.selectedRow == 0) {
				this.selectedUser--;
				if (this.selectedUser < 0) {
					this.selectedUser = this.UserData.length - 1;
					if(this.UserData.length > this.MAXCOLUMNCOUNT) {
						this.topLeftItem = (this.selectedUser-2);
						GuiUsers.updateDisplayedUsers();
					} else {
						this.topLeftItem = 0;
					}
				} else {
					if (this.selectedUser < this.topLeftItem) {
						this.topLeftItem--;
						if (this.topLeftItem < 0) {
							this.topLeftItem = 0;
						}
						GuiUsers.updateDisplayedUsers();
					}
				}
				GuiUsers.updateSelectedUser();
			}
			break;
		case Common.API.KEY_RIGHT:
			console.log("RIGHT");	
			if (this.selectedRow == 0) {
				this.selectedUser++;
				if (this.selectedUser >= this.UserData.length) {
					this.selectedUser = 0;
					this.topLeftItem = 0;
					GuiUsers.updateDisplayedUsers();
				} else {
					if (this.selectedUser >= this.topLeftItem+this.getMaxDisplay() ) {
						this.topLeftItem++;
						GuiUsers.updateDisplayedUsers();
					}
				}
				GuiUsers.updateSelectedUser();
			}
			break;
		case Common.API.KEY_ENTER:
		case Common.API.KEY_PANEL_ENTER:
			console.log("ENTER");
			if (this.selectedRow == 0) {
				GuiUsers.processSelectedUser();
			} else if (this.selectedRow == 1) {
				GuiUsers_Manual.start();
			} else if (this.selectedRow == 2) {
				GuiPage_Servers.start();
			}
			break;	
		case Common.API.KEY_BLUE:
			Server.setServerAddr("");
			File.setServerEntry(null);
			GuiPage_Servers.start();
			break;
		case Common.API.KEY_YELLOW:
			GuiNotifications.setNotification("All Passwords Deleted","Deletion");
			File.deleteUserPasswords();
			break;			
		case Common.API.KEY_GREEN:
			GuiNotifications.setNotification("All Users Deleted","Deletion");
			File.deleteAllUsers();
			break;		
		case Common.API.RETURN:
			console.log("RETURN KEY");
			event.preventDefault();
        	GuiUsers.start();
			break;
		case Common.API.KEY_EXIT:
			console.log("EXIT KEY");
			widgetAPI.sendExitEvent();
			break;
		default:
			console.log("Unhandled key");
			break;
	}
};


//////////////////////////////////////////////////////////////////
//  Input method for entering user password                     //
//////////////////////////////////////////////////////////////////
var GuiUsers_Input  = function(id) {   
    var imeReady = function(imeObject) {    	
    	installFocusKeyCallbacks();   	
    	document.getElementById("guiUsers_pwd").style.visibility="";
    	document.getElementById("guiUsers_Password").focus();
    }
    
    var ime = new IMEShell(id, imeReady,'en');
    ime.setKeypadPos(1300,90);
        
    var installFocusKeyCallbacks = function () {
        ime.setKeyFunc(Common.API.KEY_ENTER, function (keyCode) {
            console.log("Enter key pressed");    
           
            //Save pwd value first, then wipe for next use
            var pwd = document.getElementById("guiUsers_Password").value;
            ime.setString("");
            
            //Set focus back to GuiUsers to reset IME
            document.getElementById("GuiUsers").focus(); 
                             
            GuiUsers.IMEAuthenticate(pwd);           
        });
        
        //Keycode to abort login from password screen
        ime.setKeyFunc(Common.API.KEY_RED, function (keyCode) {
        	document.getElementById("guiUsers_pwd").style.visibility="hidden";
        	document.getElementById("GuiUsers").focus();   	
        }); 
        
        ime.setKeyFunc(Common.API.KEY_DOWN, function (keyCode) {
        	document.getElementById("guiUsers_rempwd").style.color = "red";
        	document.getElementById("GuiUsers_Pwd").focus();
        });
        
        ime.setKeyFunc(Common.API.KEY_RETURN, function (keyCode) {
        	event.preventDefault();
        	GuiUsers.start();
        });
        
        ime.setKeyFunc(Common.API.KEY_EXIT, function (keyCode) {
        	widgetAPI.sendExitEvent();
        });      
    }   
}

//Run from IME if user has password - Run in GuiUsers for ease of access to class variables
GuiUsers.IMEAuthenticate = function(password) {
    var pwdSHA1 = Sha1.hash(password,true);
	var authenticateSuccess = Server.Authenticate(this.UserData[this.selectedUser].Id, this.UserData[this.selectedUser].Name, pwdSHA1);		
	if (authenticateSuccess) {
		//Reset GUI to as new!
		document.getElementById("guiUsers_pwd").style.visibility="hidden";

		//Add Username & Password to DB - Save password only if rememberPassword = true
		if (this.rememberPassword == true) {
			File.addUser(this.UserData[this.selectedUser].Id,this.UserData[this.selectedUser].Name,pwdSHA1,this.rememberPassword);
		} else {
			File.addUser(this.UserData[this.selectedUser].Id,this.UserData[this.selectedUser].Name,"",this.rememberPassword);
		}
			
		//Change Focus and call function in GuiMain to initiate the page!
		GuiMainMenu.start();
	} else {
		//Wrong password - Reset IME focus and notifty user
		document.getElementById("guiUsers_Password").focus();
		GuiNotifications.setNotification("Bad password or network error.","Logon Error");
	}  
}

GuiUsers.keyDownPassword = function() {
		var keyCode = event.keyCode;
		console.log("Key pressed: " + keyCode);

		if (document.getElementById("Notifications").style.visibility == "") {
			document.getElementById("Notifications").style.visibility = "hidden";
			document.getElementById("NotificationText").innerHTML = "";
			event.preventDefault();
			//Change keycode so it does nothing!
			keyCode = "VOID";
		}
		
		switch(keyCode)
		{
			case Common.API.KEY_RETURN:
			case Common.API.KEY_PANEL_RETURN:
				console.log("RETURN");
				tizen.application.getCurrentApplication().hide();
				break;
			case Common.API.KEY_UP:
				if (document.getElementById("guiUsers_rempwd").style.color == "red") {
					document.getElementById("guiUsers_rempwd").style.color = "#f9f9f9";
					document.getElementById("guiUsers_Password").focus();  
				} else {
					this.rememberPassword = (this.rememberPassword == false) ? true : false;
					document.getElementById("guiUsers_rempwdvalue").innerHTML = this.rememberPassword;
				}
				break;	
			case Common.API.KEY_DOWN:
				if (document.getElementById("guiUsers_rempwdvalue").style.color == "red") {
					this.rememberPassword = (this.rememberPassword == false) ? true : false;
					document.getElementById("guiUsers_rempwdvalue").innerHTML = this.rememberPassword;
				}
				break;	
			case Common.API.KEY_RIGHT:
				console.log("RIGHT");
				if (document.getElementById("guiUsers_rempwd").style.color == "red") {
					document.getElementById("guiUsers_rempwd").style.color = "green";
					document.getElementById("guiUsers_rempwdvalue").style.color = "red";
				}
				break;
			case Common.API.KEY_LEFT:
				console.log("LEFT");
				if (document.getElementById("guiUsers_rempwdvalue").style.color == "red") {
					document.getElementById("guiUsers_rempwd").style.color = "red";
					document.getElementById("guiUsers_rempwdvalue").style.color = "#f9f9f9";
				}
				break;
			case Common.API.KEY_ENTER:
			case Common.API.KEY_PANEL_ENTER:
				console.log("ENTER");
				if (document.getElementById("guiUsers_rempwdvalue").style.color == "red") {
					document.getElementById("guiUsers_rempwd").style.color = "red";
					document.getElementById("guiUsers_rempwdvalue").style.color = "#f9f9f9";
				} else {
					document.getElementById("guiUsers_rempwd").style.color = "green";
					document.getElementById("guiUsers_rempwdvalue").style.color = "red";
				}
				break;	
			case Common.API.KEY_EXIT:
				console.log("EXIT KEY");
				widgetAPI.sendExitEvent();
				break;
			default:
				console.log("Unhandled key");
				break;
		}
	};