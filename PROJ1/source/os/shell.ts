/* ------------
   Shell.ts
   The OS Shell - The "command line interface" (CLI) for the console.
    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";

        constructor() {
        }

        public init() {
            var sc: ShellCommand;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                                  "ver",
                                  "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

             // whereAmI

            sc = new ShellCommand(this.shellLocation,
                                  "location",
                                  "- displays the users current location.");
            this.commandList[this.commandList.length] = sc;

            // sky command
            sc = new ShellCommand(this.shellSky,
                                  "sky",
                                  "- displays the color of the sky.");
            this.commandList[this.commandList.length] = sc;

            // date and time
            sc = new ShellCommand(this.shellDate,
                                  "date",
                                  "- displays the current date and time.");
            this.commandList[this.commandList.length] = sc;

            // BSOD
            sc = new ShellCommand(this.shellBSOD,
                                  "bsod",
                                  "- displays the blue screen of death.");
            this.commandList[this.commandList.length] = sc;

            // load
            sc = new ShellCommand(this.shellLoad,
                                  "load",
                                  "- validates the user code in the HTML5 text area.");
            this.commandList[this.commandList.length] = sc;

            // run
            sc = new ShellCommand(this.shellRun,
                                    "run",
                                     "- runs the user input program.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                                  "cls",
                                  "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // status <string>
            sc = new ShellCommand(this.shellStatus,
                                 "status",
                                 "<string> - Displays the status message specified by the user.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                                  "man",
                                  "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                                  "trace",
                                  "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                                  "rot13",
                                  "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                                  "prompt",
                                  "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.

            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match. 
            // TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index: number = 0;
            var found: boolean = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);  // Note that args is always supplied, though it might be empty.
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
        public execute(fn, args?) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }

        public parseInput(buffer: string): UserCommand {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript. See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions. Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
           if (_SarcasticMode) {
              _StdOut.putText("I think we can put our differences behind us.");
              _StdOut.advanceLine();
              _StdOut.putText("For science . . . You monster.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }

        // Although args is unused in some of these functions, it is always provided in the 
        // actual parameter list when this function is called, so I feel like we need it.

        public shellVer(args: string[]) {
            _StdOut.putText("This is the first version");
        }

        public shellLocation(args: string[]){
            _StdOut.putText("You are on your computer!");
        }

        public shellSky(args: string[]){
            _StdOut.putText("The sky is blue");
        }

        public shellDate(args: string[]){
            var d = new Date();
            d = new Date();
            _StdOut.putText("The current date and time: " + Date());
        }

        public shellBSOD(args: string[]){
            _Canvas = <HTMLCanvasElement>document.getElementById('display');
            _DrawingContext = _Canvas.getContext('2d');
            _DrawingContext.fillStyle = "blue"; // setting color to blue
            _DrawingContext.fillRect(0,0,500,500); // filling canvas

        }

        public shellStatus(args: string[]){
            if(args.length > 0){
                _OsShell.promptStr = args[0];
            }else{
                var status = prompt("Enter your status");
                document.getElementById("statusmessage").innerHTML = status;
            }
        }

        public shellRun(args: string[]){
            if(args.length > 0){
               TSOS.Control.displayPCBTable();
            }else{
                _StdOut.putText("Please enter valid input!");
            }
        }

        public shellLoad(){
            var input = (<HTMLInputElement>document.getElementById("taProgramInput")).value;
            var letterNum = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F',' '];  // instead of checking for a regular expression
            var validInput = 0;
            for(var i = 0; i < input.length; i++){
                var position = input.charAt(i);
                for(var x = 0; x < letterNum.length; x++){
                    if(position == letterNum[x]){
                        validInput++
                    }
                }
            }
            // check for valid input 
            if(input == ''){ 
                // if there is no user input display error
                _StdOut.putText("No input, please enter valid characters");
            }else if(validInput == input.length){
                var op = (<HTMLInputElement>document.getElementById("taProgramInput")).value;
                // index of block being displayed
                var index = TSOS.Control.displayProcMem(op);
                // write the operation to the memory manager
                _MemoryManager.writeMem(index, op);
                // increment the current PID
                _MemoryManager.memIndex();
                // create a new process control block
                var createPCB = new TSOS.ProcessControlBlock();
                // set the new PCB pid to the pid in memory
                createPCB.init(_MemoryManager.pidList[_MemoryManager.pidList.length]);
                // push the new PCB to the resident list 
                //_processManager.residentList.push(createPCB);
                // print out the PID for the new program in the memory manager
                _StdOut.putText("New program loaded. PID: " + (_MemoryManager.PID));
            } 
        }

        public shellHelp(args: string[]) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args: string[]) {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed. If possible. Not a high priority. (Damn OCD!)
        }

        public shellCls(args: string[]) {         
            _StdOut.clearScreen();     
            _StdOut.resetXY();
        }

        public shellMan(args: string[]) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    case "load":
                        _StdOut.putText("Validates user code in the HTML5 text area");
                        break;
                    case "run":
                        _StdOut.putText("Runs user inputed program");
                        break;
                    case "ver":
                        _StdOut.putText("Ver displays the current version");
                        break;
                    case "shutdown":
                        _StdOut.putText("Shutdown shuts down the SvegOS");
                        break;                       
                     case "CLS":
                        _StdOut.putText("CLS clears the screen");
                        break;
                    case "man <topic>":
                        _StdOut.putText("man <topic> displays the manual page for <topic>");
                        break;
                    case "location":
                        _StdOut.putText("Displays the current location of the user.");
                        break;
                    case "sky":
                        _StdOut.putText("Displays the color of the sky.");
                        break;
                    case "Date":
                        _StdOut.putText("Date displays the current date and time.");
                        break;
                    case "bsod":
                        _StdOut.putText("BSOD displays the blue screen of death");
                        break;
                    case "trace <on | off>":
                        _StdOut.putText("trace enables/disables the OS trace");
                        break;
                    case "rot13 <string>":
                        _StdOut.putText("rot13 does rot13 enxcryption on string");
                        break;
                    case "status <string>":
                        _StdOut.putText("status <string> sets status message specified by user.");
                        break;
                    case "prompt <string>":
                        _StdOut.putText("Prompt sets the prompt");
                        break;    
                    // TODO: Make descriptive MANual page entries for the the rest of the shell commands here.
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args: string[]) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        } else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args: string[]) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args: string[]) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

    }
}