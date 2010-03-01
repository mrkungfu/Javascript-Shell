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
				
				window.onfocus=HTTPShell.View.focusCursor;
				window.onblur=HTTPShell.View.blurCursor;
				
				//set focus
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
				//which should happend when backspace pressed or command is up (alt for windows?)
			  
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

				//clear display
				HTTPShell.View.hideLine();
				
				//update previous
				HTTPShell.View.updatePrevious();

				//search path for command and execute...
				//console.log("seraching for " + shell_variables.command.data + "...");

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
			},
			
			displayCommand: function () {
				
			},
			
			blurCursor: function () {
				document.getElementById("cursor").style.backgroundColor = "transparent";
				document.getElementById("cursor").style.outlineColor = "grey";
				document.getElementById("cursor").style.outlineStyle = "solid";
				document.getElementById("cursor").style.outlineWidth = "1px";
			},
			
			focusCursor: function () {
				document.getElementById("cursor").style.backgroundColor = "grey";
				document.getElementById("cursor").style.outlineColor = "transparent";
				document.getElementById("cursor").style.outlineStyle = "none";
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
			history: {},//array - last object is most recent
			
			command: {
				'data': "",
				'cursor': 0
			}, //current command line model
			
			pwd: "//", //DOM path?

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

//document.onkeydown = HTTPShell.Controller.checkKeycode;