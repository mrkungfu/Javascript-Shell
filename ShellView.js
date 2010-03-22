var keyboard = {
	mac_us: {
		"8": "backspace",
		"13": "return",
		"16": "shift", //
		"17": "control", //
		"18": "alt", //
		"32": " ",
		"37": "left",
		"38": "up",
		"39": "right",
		"40": "down",
		"48": "0",
		"49": "1",
		"50": "2",
		"51": "3",
		"52": "4",
		"53": "5",
		"54": "6",
		"55": "7",
		"56": "8",
		"57": "9",
		"65": "a",
		"66": "b",
		"67": "c",
		"68": "d",
		"69": "e",
		"70": "f",
		"71": "g",
		"72": "h",
		"73": "i",
		"74": "j",
		"75": "k",
		"76": "l",
		"77": "m",
		"78": "n",
		"79": "o",
		"80": "p",
		"81": "q",
		"82": "r",
		"83": "s",
		"84": "t",
		"85": "u",
		"86": "v",
		"87": "w",
		"88": "x",
		"89": "y",
		"90": "z",
		"91": "command",
		"93": "command",
		"186": ";",
		"187": "=",
		"188": ",",
		"189": "-",
		"190": ".",
		"191": "/",
		"192": "`",
		"219": "[",
		"220": "\\",
		"221": "]",
		"222": "'"
	}
};

var shiftValue = {
	"0": ")",
	"1": "!",
	"2": "@",
	"3": "#",
	"4": "$",
	"5": "%",
	"6": "^",
	"7": "&",
	"8": "*",
	"9": "(",
	"a": "A",
	"b": "B",
	"c": "C",
	"d": "D",
	"e": "E",
	"f": "F",
	"g": "G",
	"h": "H",
	"i": "I",
	"j": "J",
	"k": "K",
	"l": "L",
	"m": "M",
	"n": "N",
	"o": "O",
	"p": "P",
	"q": "Q",
	"r": "R",
	"s": "S",
	"t": "T",
	"u": "U",
	"v": "V",
	"w": "W",
	"x": "X",
	"y": "Y",
	"z": "Z",
	";": ":",
	"=": "+",
	",": "<",
	"-": "_",
	".": ">",
	"/": "?",
	"`": "~",
	"[": "{",
	"\\": "|",
	"]": "}",
	"'": "\""
};

/*
 * 'action' contains functions in the Controller object
 *  these functions perform actions, such as moving the cursor
 *  or triggering the processing of a command.
 *  
 *  note: is it best to mange function names like this?
 */
var action = {
	"left": "moveLeft",
	"right": "moveRight",
	"backspace": "processBackspace",
	"return": "processCommand",
	"up": "backHistory",
	"down": "forwardHistory"
};

/*
 * this seems silly now.  only benefit to test for modifier status...
 */
var modifierMapping = {
	"command": "command",
	"shift": "shift",
	"control": "control",
	"alt": "xalt"
};

/****************************** HTTP Shell *********************************/

// do we need to return the string?  need to better understand the convention for object creation, etc.
String.prototype.convert2HTML = function() {
	return this.replace(/&/gi,"&amp;").replace(/</gi,"&lt;");
}

Object.prototype.clone = function() {
  var newObj = (this instanceof Array) ? [] : {};
  for (i in this) {
    if (i == 'clone') continue;
    if (this[i] && typeof this[i] == "object") {
      newObj[i] = this[i].clone();
    } else newObj[i] = this[i]
  } return newObj;
};

if (typeof(HTTPShell) == 'undefined') {
	HTTPShell = {
		DEBUG: false,
		
		EOF: null
	};
}

if (typeof(HTTPShell.Controller) == 'undefined') {
console.log("<HTTPShell.Controller>");
	HTTPShell.Controller = function() {
		return {
			
			onload: function () {
				console.log("<onload>");
				//init();
				
				//Setup Event Handlers
				document.onkeydown = this.handleKey;
				
				//set functions for focus and blur actions based on window focus
				window.onfocus=HTTPShell.View.focusCursor;
				window.onblur=HTTPShell.View.blurCursor;
				
				//hack to get background 
				document.getElementById("previous").innerHTML = "<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>";
				alert("Use 'ls' and 'cd' commands to browse the DOM.\n'more' can be used on innerHTML elements.\n\nApologies for the dialog, but it also\ngets around a bug.");
				document.getElementById("previous").innerHTML = "";
				
				//set focus to the current window
				window.focus();
				console.log("</onload>");
			},
			
			handleKey: function (e) {
				console.log("<checkKeyCode>");
				
				var controller = HTTPShell.Controller;
				var model = HTTPShell.Model;
				var keymap;
				var mapped_key;
				var keycode;
				
				if (window.event) { //IE, ?
				  keycode = window.event.keyCode;
				} else if (e) { //FF, ?
				  keycode = e.which;
				}
				
				//get keyboard type from settings (should check this somewhere..) and map the keycode
				keymap = keyboard[model.settings.keyboard];
				mapped_key = keymap[keycode.toString()];
				
				if (typeof(modifierMapping[mapped_key]) == 'undefined') { //check if the key is a modifier
					if (e.metaKey || e.altKey || e.ctrlKey) { //if not, process exceptions for any modifiers that are pressed
						//process exceptions
					} else if (typeof(controller[action[mapped_key]]) !== 'undefined') { //otherwise process action, if exists
						if (mapped_key == 'backspace') { //override backspace as special case (prevent browser going back a page)
							controller[action[mapped_key]]();
							return false; //override's event handler
						} else {
							controller[action[mapped_key]]();
						}
					} else 	if (typeof(mapped_key) !== 'undefined') { //if not an action, but a key that we map (note: what about shift-space? I think it's handled now..)
						if (e.shiftKey == true && mapped_key !== ' ') {
							controller.processKey(shiftValue[mapped_key]);
						} else {
							controller.processKey(mapped_key);
						}
					} else {
						alert("keycode not found/implemented: " + keycode + "\nemail: mrkungfu [at] gmail [dot] com");
					}
				}
								
				//returning false prevents futher events from processing(?)
				//which should happen when backspace pressed or command is up (alt for windows?)
			  
				console.log("</checkKeyCode>");
			},
			
			processKey: function (keycode) {
				//hand this off to the view and model to do the heavy lifting...
				
				console.log("<processKey>");

				HTTPShell.Model.insertCharacterAtCursor(keycode);

				HTTPShell.View.displayLine();
			    
			    console.log("</processKey>");
			},
			
			processCommand: function () {
				console.log("<processCommand>");

				//clear display for the current line
				HTTPShell.View.hideLine();
				
				//update previous display list with current line
				HTTPShell.View.updatePrevious();
				HTTPShell.Model.addCurrent2History();

				//search path for command and execute...
				//console.log("seraching for " + shell_variables.command.data + "...");
				HTTPShell.Model.logHistory();
				HTTPShell.Model.createArgList();
				
				//HTTPShell.View.displayText("some text");
				if(HTTPShell.Commands[HTTPShell.Model.command.argumentlist[0]])
				{
					HTTPShell.Commands[HTTPShell.Model.command.argumentlist[0]]();
				} else {
					if(HTTPShell.Model.command.argumentlist[0] != "")
						HTTPShell.View.displayText("Command not found!");
				}

				//start again with a fresh command/line
				HTTPShell.Model.clearLine();

				//display the new line
				HTTPShell.View.displayLine();
				
				console.log("</processCommand>");
			},
			
			moveLeft: function () {
				HTTPShell.Model.decrementCursorPosition();
				HTTPShell.View.displayLine();
			},

			moveRight: function () {
				HTTPShell.Model.incrementCursorPosition();
				HTTPShell.View.displayLine();
			},
			
			processBackspace: function () {
				HTTPShell.Model.deleteCharacterBeforeCursor();
				HTTPShell.View.displayLine();
			},
			
			EOF: null
		};
	}();
console.log("</HTTPShell.Controller>");
}

if (typeof(HTTPShell.View) == 'undefined') {
console.log("<HTTPShell.View>");
	HTTPShell.View = function() {
		return {
			
			displayLine: function () {
				var command;
				var head = HTTPShell.Model.headText();
				var cursor = HTTPShell.Model.cursorText();
				var tail = HTTPShell.Model.tailText();

				document.getElementById("prompt").innerHTML = HTTPShell.Model.settings.prompt;
				
				if (cursor == "") {
					cursor = " ";
				}

				command = document.getElementById("command");
				command.innerHTML = head.convert2HTML() +
					"<span id=\"cursor\" style=\"background: grey;\">" +
					cursor.convert2HTML() + "</span>" +
					tail.convert2HTML();
				
				window.location="#cursor";
				document.body.scrollTop = document.body.scrollHeight;
			},
			
			displayCommand: function () {
				
			},
			
			blurCursor: function () {
				if(document.getElementById("cursor")) {
					document.getElementById("cursor").style.backgroundColor = "transparent";
					document.getElementById("cursor").style.outlineColor = "grey";
					document.getElementById("cursor").style.outlineStyle = "solid";
					document.getElementById("cursor").style.outlineWidth = "1px";
				}
			},
			
			focusCursor: function () {
				if(document.getElementById("cursor")) {
					document.getElementById("cursor").style.backgroundColor = "grey";
					document.getElementById("cursor").style.outlineColor = "transparent";
					document.getElementById("cursor").style.outlineStyle = "none";
				}
			},

			updatePrevious: function () {
				document.getElementById("previous").innerHTML = document.getElementById("previous").innerHTML
						+ HTTPShell.Model.settings.prompt
						+ HTTPShell.Model.command.data.convert2HTML()
						+ "<br />";
			},
			
			hideLine: function () {
				document.getElementById("prompt").innerHTML = "";
				document.getElementById("command").innerHTML = "";
			},
			
			displayText: function (tempText) {
				document.getElementById("previous").innerHTML = document.getElementById("previous").innerHTML
						+ tempText.convert2HTML()
						+ "<br />";
			},
			
			EOF: null
		};
	}();
console.log("</HTTPShell.View>");
}

if (typeof(HTTPShell.Model) == 'undefined') {
console.log("<HTTPShell.Model>");
	HTTPShell.Model = function() {
		return {
			//Global settings
			// - wrap
			// - keyboard type
			// - history size
			// pull from cookie/server in the future
			settings: {
				wrap: true,
				keyboard: "mac_us",
				historySize: 500,
				prompt: "mrkungfu$ "
			},

			//Global variables
			// - history array
			// - command
			history: {
				'data': {},
				'size': 0
			},//array - last object is most recent
			
			command: {
				'data': "",
				'argumentlist': {},
				'cursor': 0
			}, //current command line model
			
			pwd: {
				'page': "",
				'path': ""
			}, //DOM path?

			insertCharacterAtCursor: function (character) {
				//
				this.command.data = this.headText() + character + this.cursorText() + this.tailText();
				this.incrementCursorPosition();
			},
			
			deleteCharacterBeforeCursor: function () {
				//
				var truncated_head = this.command.data.substr(0,HTTPShell.Model.command.cursor-1);

				this.command.data = truncated_head + this.cursorText() + this.tailText();
				this.decrementCursorPosition();
			},
			
			deleteCharacterAtCursor: function () {
				//
				this.command.data = this.headText() + this.tailText();
			},
			
			clearLine: function () {
				//
				this.command.cursor = 0;
				this.command.data = "";
			},
			
			decrementCursorPosition: function () {
				if(this.command.cursor > 0) {
					this.command.cursor -= 1	
				}
			},
			
			incrementCursorPosition: function () {
				if(this.command.cursor < this.command.data.length) {
					this.command.cursor += 1;	
				}
			},
			
			headText: function () {
				return this.command.data.substring(0, this.command.cursor);
			},
			
			cursorText: function () {
				return this.command.data.substring(this.command.cursor, this.command.cursor+1);
			},
			
			tailText: function () {
				return this.command.data.substring(this.command.cursor+1);
			},

			addCommand2History: function (acommand) {
				this.history.data[this.history.size] = acommand.clone();
				this.history.size++;
			},

			addCurrent2History: function () {
				this.addCommand2History(this.command.data)
				//console.log(this.history.data)
				//console.log(this.history.size)
			},

			logHistory: function () {
				for(i = 0; i < this.history.size % 5; i++)
				{
					console.log(this.history.data[i]);
				}
			},
			createArgList: function () {
				var fullCommand = this.command.data;
				this.command.argumentlist = fullCommand.split(" ");
				console.log(this.command.argumentlist);
			},
			
			writeCookie: function () {
				//
			},
			
			readCookie: function () {
				//
			},
			
			EOF: null
		};
	}();
console.log("</HTTPShell.Model>");
}


if (typeof(HTTPShell.Commands) == 'undefined') {
console.log("<HTTPShell.Commands>");
	HTTPShell.Commands = function() {
		return {
			
			ls: function () {
				var root;
				var alength;
				
				if (HTTPShell.Model.pwd.page == "")
				{
					HTTPShell.Model.pwd.page = window;
				}
				if (HTTPShell.Model.pwd.path == "")
				{
					HTTPShell.Model.pwd.path = HTTPShell.Model.pwd.page.document;
				}
				
				root = HTTPShell.Model.pwd.path;//document.body.childNodes[1].childNodes[1];
				alength = root.childNodes.length;
				
				HTTPShell.View.displayText("Total " + alength);
				
				for(i = 0; i < alength; i++)
				{
					switch(root.childNodes[i].nodeType)
					{
						case 1:
							var subdirsize = 0;
							for(j = 0; j < root.childNodes[i].childNodes.length; j++)
							{
								if(root.childNodes[i].childNodes[j].nodeType == 1) subdirsize++;
							}
							HTTPShell.View.displayText("d--x--x--x " + subdirsize + " " + i + " (<" + root.childNodes[i].tagName + ">)");
							break;
						case 2:
							HTTPShell.View.displayText("-rwx--x--x 1 " + root.childNodes[i].nodeName + "(" + i + ")");
							break;
						case 3:
							//HTTPShell.View.displayText("-rwx--x--x 1 " + root.childNodes[i].nodeName + "(" + i + ")");
							break;
						case 4:
							break;
					}
				}
				
				HTTPShell.View.displayText("-rwx--x--x 1 innerHTML");
				
				//list attributes
				//for(i = 0; i < root.attributes.length; i++)
				//{
				//	HTTPShell.View.displayText("-rwx--x--x 1 " + root.addtribues[i] + "(" + i + ")");
				//}
				
			},
			
			cd: function () {
				var destination = HTTPShell.Model.command.argumentlist[1];
				
				//this needs to be replaced by a real path parser
				//also need to define a realistic path format...
				switch(destination)
				{
					case "..":
						HTTPShell.Model.pwd.path = HTTPShell.Model.pwd.path.parentNode;
						break;
					case ".":
						break;
					case undefined:
						HTTPShell.Model.pwd.path = HTTPShell.Model.pwd.page.document;
						break;
					default:
						if (!isNaN(parseFloat(destination)) && isFinite(destination) && (HTTPShell.Model.pwd.path.childNodes[destination] != undefined))
							HTTPShell.Model.pwd.path = HTTPShell.Model.pwd.path.childNodes[destination];
						else
							HTTPShell.View.displayText("Directory not found!");
				}
			},
			
			cdd: function () {
				HTTPShell.Model.pwd.path = HTTPShell.Model.pwd.path.parentNode;
			},
			
			more: function () {
				var filename = HTTPShell.Model.command.argumentlist[1];
				if(filename == "innerHTML") {
					var htmltext = new String(HTTPShell.Model.pwd.path.innerHTML);
					HTTPShell.View.displayText(htmltext);
				}
			},
			
			EOF: null
		};
	}();
console.log("</HTTPShell.Commands>");
}

//document.onkeydown = HTTPShell.Controller.checkKeycode;