var GuiPage_NewServer = {
	elementIds : [ "1","2","3","4","port","host"],
	inputs : [ null,null,null,null,null],
	ready : [ false,false,false,false,false],

}

GuiPage_NewServer.start = function() {
	console.log("Page Enter : GuiPage_NewServer");
	//GuiHelper.setControlButtons(null,null,null,null,"Return");
		
	document.getElementById("Counter").innerHTML = "";
	
	//Insert html into page
	document.getElementById("pageContent").innerHTML = "<div class='GuiPage_NewServer12key'> \
		<p style='padding-bottom:5px;'>Enter the IP address & port number of your Mezzmo server. <br>(You can leave the port blank for 53168)</p> \
		<form><input id='1' type='text' size='5'  maxlength='3' value=''/>. \
		<input id='2' type='text' size='5'  maxlength='3' value=''/>. \
		<input id='3' type='text' size='5'  maxlength='3' value=''/>. \
		<input id='4' type='text' size='5'  maxlength='3' value=''/>: \
		<input id='port' type='text' size='8'  maxlength='5'/></form> \ \
		<p style='padding-top:10px;padding-bottom:5px'>OR</p> \
		<p style='padding-bottom:5px'>Enter your server hostname here without http:// and <br>including : and port number.</p> \
		<form><input id='host' style='z-index:10;' type='text' size='25' value=''/></form> \
		</div>";
	
	//Set Backdrop
	Support.fadeImage("images/bg1.jpg");
	Support.removeSplashScreen();

	//Prepare all input elements for IME
	GuiPage_NewServer.createInputObjects();
	document.getElementById("body").onkeydown = document.getElementById("GuiPage_NewServer").onkeydown;
	document.getElementById('1').focus();
}

//Prepare all input elements for IME on Load!
GuiPage_NewServer.createInputObjects = function() {
	var previousIndex = 0;
	var nextIndex = 0;
    for (var index in this.elementIds) {
    	previousIndex = index - 1;
        if (previousIndex < 0) {
            previousIndex = GuiPage_NewServer.inputs.length - 1;
        }
        
        nextIndex = (previousIndex + 2) % GuiPage_NewServer.inputs.length;
        GuiPage_NewServer.inputs[index] = new GuiPage_NewServer_Input(this.elementIds[index],this.elementIds[previousIndex], this.elementIds[nextIndex]);
    }
}

//Function to check if IME is ready, and when so sets focus on first element in array
GuiPage_NewServer.ready = function(id) {
    var ready = true;
 
    for (var i in GuiPage_NewServer.elementIds) {
        if (GuiPage_NewServer.elementIds[i] == id) {
        	GuiPage_NewServer.ready[i] = true;
        }
        
        if (GuiPage_NewServer.ready[i] == false) {
            ready = false;
        }
    }
   
    if (ready) {
        document.getElementById(GuiPage_NewServer.elementIds[0]).focus();
    }
}

//Function to delete all the contents of the boxes
GuiPage_NewServer.deleteAllBoxes = function(currentId) {
	for (var index = 0;index < GuiPage_NewServer.elementIds.length;index++) {
		document.getElementById(GuiPage_NewServer.elementIds[index]).value=""; 
	}
}

//IME Key Handler
var GuiPage_NewServer_Input  = function(id,previousId, nextId) {   
    var imeReady = function(imeObject) {
    	installFocusKeyCallbacks();   
        GuiPage_NewServer.ready(id);
    }
    
    
    var previousElement = document.getElementById(previousId);
    var nextElement = document.getElementById(nextId);
    
   
}

GuiPage_NewServer.focusRight  = function() {
	var activeId = document.activeElement.id;
	if (activeId == '1') {
		document.getElementById('2').focus();
	}
	else if (activeId == '2') {
		document.getElementById('3').focus();
	}
	else if (activeId == '3') {
		document.getElementById('4').focus();
	}
	else if (activeId == '4') {
		document.getElementById('port').focus();
	}
	
}

GuiPage_NewServer.focusLeft  = function() {
	
	var activeId = document.activeElement.id;
	if (activeId == 'port') {
		document.getElementById('4').focus();
	}
	else if (activeId == '4') {
		document.getElementById('3').focus();
	}
	else if (activeId == '3') {
		document.getElementById('2').focus();
	}
	else if (activeId == '2') {
		document.getElementById('1').focus();
	}
	
}

GuiPage_NewServer.processServer = function() {

    GuiNotifications.setNotification("Please Wait","Checking Details",true);
            
    if (document.getElementById('1') == null) {
    	return;
    }
    
    //Get content from 4 boxes
    var IP1 = document.getElementById('1').value;
    var IP2 = document.getElementById('2').value;
    var IP3 = document.getElementById('3').value;
    var IP4 = document.getElementById('4').value;
    
    var host = document.getElementById('host').value;
    
    if (IP1 == "" || IP2 == "" || IP3 == "" || IP4 == "" ) {
    	//Check if host is empty
    	if (host == "") {
    		//not valid
			//hide Loading Div
			document.getElementById("loading").style.visibility = "hidden";
        	GuiNotifications.setNotification("Please re-enter your server details.","Incorrect Details",true);
    	} else {
    		document.getElementById("pageContent").focus();                                   
            //Timeout required to allow notification command above to be displayed
            setTimeout(function(){

				//show Loading Div
				document.getElementById("loading").style.visibility = "";
				Server.testConnectionSettings(host,false);
			}, 1000);
    	}
    } else {	
    	var Port = document.getElementById('port').value;
        if (Port == "") {
        	Port = "53168";
        }
        
        var ip = IP1 + '.' +  IP2 + '.' +  IP3 + '.' +  IP4 + ':' + Port;
        document.getElementById("pageContent").focus();                                   
        //Timeout required to allow notification command above to be displayed    
        setTimeout(function(){

			//show Loading Div
			document.getElementById("loading").style.visibility = "";
        	Server.testConnectionSettings(ip,false);
        }, 1000);
        
    }	
}

GuiPage_NewServer.keyDown = function()
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
		case 169:
		case Common.API.KEY_RETURN:
			console.log("RETURN");
			Support.processReturnURLHistory();
			break;
		case Common.API.KEY_LEFT:
			console.log("LEFT");	
			this.focusLeft();
			break;
		case Common.API.KEY_RIGHT:
			console.log("RIGHT");	
			event.preventDefault();
			this.focusRight();
			break;
		case Common.API.KEY_DOWN:
			break;
		case Common.API.KEY_UP:
			break;	
		case Common.API.KEY_ENTER:
		case Common.API.KEY_PANEL_ENTER:
		case 65376:
			console.log("ENTER");
			this.processServer();
			break;	
		case Common.API.KEY_EXIT:
			console.log ("EXIT KEY");
			break;
		default:
			console.log("Unhandled key");
			break;
	}
};