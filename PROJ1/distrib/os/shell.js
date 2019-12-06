/* ------------
   Shell.ts
   The OS Shell - The "command line interface" (CLI) for the console.
    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    var Shell = /** @class */ (function () {
        function Shell() {
            // Properties
            this.promptStr = ">";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
        }
        Shell.prototype.init = function () {
            var sc;
            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            // whereAmI
            sc = new TSOS.ShellCommand(this.shellLocation, "location", "- displays the users current location.");
            this.commandList[this.commandList.length] = sc;
            // sky command
            sc = new TSOS.ShellCommand(this.shellSky, "sky", "- displays the color of the sky.");
            this.commandList[this.commandList.length] = sc;
            // date and time
            sc = new TSOS.ShellCommand(this.shellDate, "date", "- displays the current date and time.");
            this.commandList[this.commandList.length] = sc;
            // BSOD
            sc = new TSOS.ShellCommand(this.shellBSOD, "bsod", "- displays the blue screen of death.");
            this.commandList[this.commandList.length] = sc;
            // load
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "- validates the user code in the HTML5 text area.");
            this.commandList[this.commandList.length] = sc;
            // format a file
            sc = new TSOS.ShellCommand(this.shellFormat, "format", "- initialize all blocks in all sectors in all tracks.");
            this.commandList[this.commandList.length] = sc;
            // run
            sc = new TSOS.ShellCommand(this.shellRun, "run", "- runs the user input program.");
            this.commandList[this.commandList.length] = sc;
            // create file
            sc = new TSOS.ShellCommand(this.shellCreate, "create", "- create a file name.");
            this.commandList[this.commandList.length] = sc;
            // write to a file
            sc = new TSOS.ShellCommand(this.shellWrite, "write", "- write to a file.");
            this.commandList[this.commandList.length] = sc;
            // read a file
            sc = new TSOS.ShellCommand(this.shellRead, "read", "- read a file.");
            this.commandList[this.commandList.length] = sc;
            // delete a file
            sc = new TSOS.ShellCommand(this.shellDelete, "delete", "- delete a file.");
            this.commandList[this.commandList.length] = sc;
            // delete a file
            sc = new TSOS.ShellCommand(this.shellList, "ls", "- list created files.");
            this.commandList[this.commandList.length] = sc;
            // set schedule 
            sc = new TSOS.ShellCommand(this.shellSchedule, "setschedule", "- set scheduling algorithm.");
            this.commandList[this.commandList.length] = sc;
            // get current scheduling algorithm
            sc = new TSOS.ShellCommand(this.shellGetSchedule, "getschedule", "- get the current scheduling algorithm.");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellClearMem, "clearMem", "- Clears memory");
            this.commandList[this.commandList.length] = sc;
            // kill
            sc = new TSOS.ShellCommand(this.shellKill, "kill", "- kills the current running process");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellPS, "ps", "- display the PID and state of all processes");
            this.commandList[this.commandList.length] = sc;
            // status <string>
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "<string> - Displays the status message specified by the user.");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // runs all user programs
            sc = new TSOS.ShellCommand(this.shellRunAll, "runAll", "- runs all user programs");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellQuantum, "quantum", "- let the user set the Round Robin quantum");
            this.commandList[this.commandList.length] = sc;
            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.
            // Display the initial prompt.
            this.putPrompt();
        };
        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
        };
        Shell.prototype.handleInput = function (buffer) {
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
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args); // Note that args is always supplied, though it might be empty.
            }
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) { // Check for curses.
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) { // Check for apologies.
                    this.execute(this.shellApology);
                }
                else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        };
        // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
        Shell.prototype.execute = function (fn, args) {
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
        };
        Shell.prototype.parseInput = function (buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            // 2. Lower-case it.
            buffer = buffer.toLowerCase();
            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript. See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        };
        //
        // Shell Command Functions. Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        };
        Shell.prototype.shellCurse = function () {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        };
        Shell.prototype.shellApology = function () {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        };
        // Although args is unused in some of these functions, it is always provided in the 
        // actual parameter list when this function is called, so I feel like we need it.
        Shell.prototype.shellVer = function (args) {
            _StdOut.putText("This is the first version");
        };
        Shell.prototype.shellLocation = function (args) {
            _StdOut.putText("You are on your computer!");
        };
        Shell.prototype.shellSky = function (args) {
            _StdOut.putText("The sky is blue");
        };
        Shell.prototype.shellDate = function (args) {
            var d = new Date();
            d = new Date();
            _StdOut.putText("The current date and time: " + Date());
        };
        Shell.prototype.shellBSOD = function (args) {
            _Canvas = document.getElementById('display');
            _DrawingContext = _Canvas.getContext('2d');
            _DrawingContext.fillStyle = "blue"; // setting color to blue
            _DrawingContext.fillRect(0, 0, 500, 500); // filling canvas
        };
        Shell.prototype.shellStatus = function (args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                var status = prompt("Enter your status");
                document.getElementById("statusmessage").innerHTML = status;
            }
        };
        Shell.prototype.shellPS = function () {
            var str = "Active processes: ";
            // if cpu scheduler ready queue is empty 
            if (_cpuScheduler.readyQueue.isEmpty() && _CPU.isExecuting == false) {
                _StdOut.putText("No active processes");
            }
            else {
                if (_cpuScheduler.readyQueue.isEmpty() && _CPU.isExecuting == true) {
                    str += _CPU.PID + " ";
                }
                else {
                    str += _CPU.PID + " ";
                    for (var i = 0; i < _cpuScheduler.readyQueue.getSize(); i++) {
                        var tempPID = _cpuScheduler.readyQueue.q[i].PID;
                        str += tempPID + " ";
                    }
                }
                _StdOut.putText(str);
            }
        };
        Shell.prototype.shellFormat = function () {
            _krnHardDriveDriver.krnHDDFormat();
            _StdOut.putText("Hard drive has been formatted.");
        };
        Shell.prototype.shellCreate = function (params) {
            if (!_krnHardDriveDriver.formatted) {
                _StdOut.putText("format hard drive first!");
            }
            else if (params == '') {
                _StdOut.putText("please put a file name!");
            }
            else if (params.length > 1) {
                _StdOut.putText("No spaces allowed in file name");
            }
            else if (params[0].length > 30) {
                _StdOut.putText("file name too large");
            }
            else {
                var result = _krnHardDriveDriver.krnHDDCreateFile(params.toString());
                // check if there is space for new files
                if (result == -1) {
                    _StdOut.putText("No file space available!");
                }
                else if (result == 0) {
                    _StdOut.putText("That file already exists!");
                }
                else {
                    _StdOut.putText("File created " + params);
                }
            }
        };
        Shell.prototype.shellWrite = function (params) {
            // make HDD sure formatted
            if (!_krnHardDriveDriver.formatted) {
                _StdOut.putText("Format hard drive first");
            }
            else if (params == '') { // check if its empty
                _StdOut.putText("File name and data required");
            }
            else if (params.length < 2) {
                _StdOut.putText("Data required after file name");
            }
            else if (params[1].charAt(0) != "\'" || params[params.length - 1].charAt(params[params.length - 1].length - 1) != "\'") {
                _StdOut.putText("Data is required to have single quotes!");
            }
            else if (_krnHardDriveDriver.krnHDDCheckFileExists(params[0].toString()) == false) {
                _StdOut.putText("File not found");
            }
            else {
                _StdOut.putText("Your data was written to the file!");
                // format data to write
                var data = '';
                for (var i = 1; i < params.length; i++) {
                    data += params[i];
                    if (params.length > 2 && i != params.length - 1) {
                        data += ' ';
                    }
                }
                data = data.substring(1, data.length - 1);
                _krnHardDriveDriver.krnHDDWriteFile(params[0].toString(), data);
            }
        };
        Shell.prototype.shellRead = function (params) {
            //Check if the HDD is formatted first
            if (!_krnHardDriveDriver.formatted) {
                _StdOut.putText("Format HDD first!");
            }
            else if (params == '') {
                _StdOut.putText("Give a filename");
            }
            else if (params.length > 1) {
                _StdOut.putText("Do not put a space in file name!");
            }
            else if (_krnHardDriveDriver.krnHDDCheckFileExists(params[0].toString()) == false) {
                _StdOut.putText("File does not exist");
            }
            else {
                var fileContents = _krnHardDriveDriver.krnHDDReadFile(params[0].toString());
                if (fileContents == '') {
                    _StdOut.putText("File is empty");
                }
                else {
                    _StdOut.putText(fileContents);
                }
            }
        };
        Shell.prototype.shellList = function () {
            //Check if the HDD is formatted first
            if (!_krnHardDriveDriver.formatted) {
                _StdOut.putText("Hard drive must be formatted first!");
            }
            else {
                _krnHardDriveDriver.krnHDDListFiles();
            }
        };
        Shell.prototype.shellDelete = function (params) {
            // check if the HDD is formatted first 
            if (!_krnHardDriveDriver.formatted) {
                _StdOut.putText("Format the HDD first!");
            }
            else if (params == '') {
                _StdOut.putText("please put a file name!");
            }
            else if (params.length > 1) {
                _StdOut.putText("No spaces allowed in file name");
            }
            else if (_krnHardDriveDriver.krnHDDCheckFileExists(params[0].toString()) == false) {
                _StdOut.putText("file does not exist");
            }
            else {
                _StdOut.putText("Deleted file " + params[0].toString());
                _krnHardDriveDriver.krnHDDDeleteFile(params[0].toString());
            }
        };
        // run all processes 
        Shell.prototype.shellRunAll = function () {
            // round robin scheduling 
            if (!_cpuScheduler.RR) {
                _cpuScheduler.RR = true;
                _cpuScheduler.quantum = 6;
            }
            // if it is one, just perform a single run
            var singleRun = 0;
            var index = 0;
            for (var i = 0; i < _cpuScheduler.residentList.length; i++) {
                if (_cpuScheduler.residentList[i].state) {
                    singleRun++;
                    index = i;
                }
            }
            if (singleRun == 1) {
                this.shellRun(_cpuScheduler.residentList[index].PID);
            }
            else {
                var x = false;
                for (var i = 0; i < _cpuScheduler.residentList.length; i++) {
                    if (_cpuScheduler.residentList[i].state == '') {
                        x = true;
                    }
                }
                if (x) {
                    _cpuScheduler.loadReadyQueue();
                    _CPU.isExecuting = true; // execute cpu to true
                }
                else {
                    _StdOut.putText("No programs loaded to execute.");
                }
            }
        };
        Shell.prototype.shellRun = function (params) {
            var pidString = '';
            for (var i = 0; i < params.length; i++) {
                pidString += params[i];
            }
            var xVar = true;
            for (var i = 0; i < _MemoryManager.executePid.length; i++) {
                if (parseInt(pidString) == _MemoryManager.executePid[i]) {
                    _StdOut.putText("PID: " + pidString + " does not exist");
                    xVar = false;
                }
            }
            if (xVar) {
                if (parseInt(pidString) == NaN) {
                    _StdOut.putText("Please enter a numeric PID.");
                }
                else if (parseInt(pidString) > _MemoryManager.pidList.length - 1) {
                    _StdOut.putText("PID: " + pidString + " does not exist");
                }
                else if (pidString == '') {
                    _StdOut.putText("Please enter a PID along with the run command");
                }
                else {
                    // change pcb to one in resident list
                    for (var i = 0; i < _cpuScheduler.residentList.length; i++) {
                        if (_cpuScheduler.residentList[i].PID == parseInt(pidString)) {
                            _PCB = _cpuScheduler.residentList[i];
                            break;
                        }
                    }
                    _PCB.state = "Ready";
                    TSOS.Control.updateMemoryTable();
                    //_PCB.displayPCB();
                    // check if mem or HDD is being used 
                    if (_PCB.inHDD) {
                        _Kernel.krnSwap();
                        _CPU.isExecuting = true;
                    }
                    else {
                        _CPU.isExecuting = true; // running the CPU
                    }
                }
            }
        };
        Shell.prototype.shellSchedule = function (sched) {
            if (sched == '') {
                _StdOut.putText("Please enter a scheduling algorithm.");
            }
            else if (sched.length > 1) {
                _StdOut.putText("You can only set to one scheduling algorithm.");
            }
            else if (_CPU.isExecuting) {
                _StdOut.putText("Can't change scheduling technique while CPU is running!");
            }
            else if (sched[0] == 'rr') {
                _StdOut.putText("Scheduling set to RR.");
                _cpuScheduler.RR = true;
                _cpuScheduler.quantum = 6;
                _cpuScheduler.fcfs = false;
                _cpuScheduler.priority = false;
            }
            else if (sched[0] == 'fcfs') {
                _StdOut.putText("Scheduling set to FCFS.");
                _cpuScheduler.quantum = 99999999999999;
                _cpuScheduler.RR = true;
                _cpuScheduler.fcfs = true;
                _cpuScheduler.priority = false;
            }
            else if (sched[0] == 'priority') {
                _StdOut.putText("Scheduling set to priority.");
                _cpuScheduler.RR = true;
                _cpuScheduler.fcfs = false;
                _cpuScheduler.priority = true;
                _cpuScheduler.quantum = 99999999999999;
            }
            else {
                _StdOut.putText("Error please choose valid scheduling algorithm.");
            }
        };
        Shell.prototype.shellGetSchedule = function () {
            if (!_cpuScheduler.RR && !_cpuScheduler.fcfs && !_cpuScheduler.priority) {
                _StdOut.putText("The RR scheduling algorithm is in use.");
            }
            else if (_cpuScheduler.fcfs) {
                _StdOut.putText("The FCFS scheduling algorithm is in use.");
            }
            else if (_cpuScheduler.priority) {
                _StdOut.putText("The priority scheduling algorithm is in use.");
            }
            else if (_cpuScheduler.RR) {
                _StdOut.putText("The RR scheduling algorithm is in use.");
            }
        };
        Shell.prototype.shellLoad = function (params) {
            // get op codes from user text area 
            var input = document.getElementById("taProgramInput").value;
            var hexCharacters = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', ' '];
            // send error if input is empty 
            if (input == '') {
                _StdOut.putText("No input.");
            }
            else {
                // loop through all of the possible characters 
                var counter = 0;
                for (var i = 0; i < input.length; i++) {
                    var letters = input.charAt(i);
                    for (var j = 0; j < hexCharacters.length; j++) {
                        // if the letter = the hex it is found 
                        if (letters == hexCharacters[j]) {
                            counter++;
                        }
                    }
                }
                if (counter == input.length) {
                    var op = document.getElementById("taProgramInput").value; //Op Codes
                    var index = TSOS.Control.displayProcMem(op);
                    // if memory is full, format the HDD
                    if (index == -1 && !_krnHardDriveDriver.formatted) {
                        _StdOut.putText("Format the HDD!");
                    }
                    else {
                        if (op.split(" ").length > 256) {
                            _StdOut.putText("Program is too large");
                        }
                        else {
                            // if priority is chosen then check if it can be used
                            if (params.length >= 1 && !_cpuScheduler.priority) {
                                _StdOut.putText("Must set schedule to priority");
                            }
                            else if (params.length > 1) {
                                _StdOut.putText("Enter a number for priority");
                            }
                            else {
                                // if there is no memory use HDD
                                if (index == -1) {
                                    // create new file
                                    // increment PID
                                    _MemoryManager.pidReturn();
                                    var PID = _MemoryManager.pidList[_MemoryManager.pidList.length - 1]; //Naming purposes
                                    var newFileName = 'process' + PID.toString();
                                    _krnHardDriveDriver.krnHDDCreateFile(newFileName);
                                    // actually writting to the file
                                    _krnHardDriveDriver.krnHDDWriteFile(newFileName, op);
                                    var newPCB = new TSOS.ProcessControlBlock();
                                    if (_cpuScheduler.priority) {
                                        var priority;
                                        if (params.length == 0) {
                                            priority = 32;
                                        }
                                        else {
                                            priority = parseInt(params[0]);
                                        }
                                        newPCB.init(_MemoryManager.pidList[_MemoryManager.pidList.length - 1], priority);
                                    }
                                    else {
                                        newPCB.init(_MemoryManager.pidList[_MemoryManager.pidList.length - 1], op);
                                        ;
                                    }
                                    newPCB.inHDD = true;
                                    if (!_cpuScheduler.RR) {
                                        newPCB.rowNum = 1;
                                    }
                                    _cpuScheduler.residentList.push(newPCB);
                                    _StdOut.putText("Program loaded. PID " + (PID));
                                }
                                else {
                                    // write ops to mem
                                    _MemoryManager.writeToMemory(index, op);
                                    _MemoryManager.pidReturn();
                                    _MemoryManager.pidLoc[index] = _MemoryManager.pidList[_MemoryManager.pidList.length - 1];
                                    var newPCB = new TSOS.ProcessControlBlock();
                                    if (_cpuScheduler.priority) {
                                        var priority;
                                        if (params.length == 0) {
                                            priority = 32;
                                        }
                                        else {
                                            priority = parseInt(params[0]);
                                        }
                                        newPCB.init(_MemoryManager.pidList[_MemoryManager.pidList.length - 1], priority);
                                    }
                                    else {
                                        newPCB.init(_MemoryManager.pidList[_MemoryManager.pidList.length - 1], op);
                                    }
                                    _cpuScheduler.residentList.push(newPCB);
                                    _StdOut.putText("Program loaded. PID " + (_MemoryManager.pidList[_MemoryManager.pidList.length - 1]));
                                }
                            }
                        }
                    }
                }
                else {
                    _StdOut.putText("Not Validated.");
                }
            }
        };
        // change the quantum for round robin scheduling 
        Shell.prototype.shellQuantum = function (params) {
            if (params == '') {
                _StdOut.putText("please provide a quantum");
                _Console.advanceLine();
            }
            else {
                _StdOut.putText("Quantum set to " + params);
                _cpuScheduler.quantum = parseInt(params); // get PID as an integer
            }
        };
        // kill all active processes
        Shell.prototype.shellKill = function (params) {
            var PID = parseInt(params); // gets the PID as int
            _KernelInputQueue.enqueue(new TSOS.Interrupt(KILL_IRQ, params));
        };
        Shell.prototype.shellClearMem = function () {
            if (_CPU.isExecuting) {
                _StdOut.putText("The CPU is executing, try again.");
            }
            else {
                _MemoryManager.clearAll();
                for (var i = 0; i < _cpuScheduler.residentList.length; i++) {
                    if (_cpuScheduler.residentList[i].state == '') {
                        _MemoryManager.executePid.push(_cpuScheduler.residentList[i].PID);
                        _cpuScheduler.residentList[i].state = "TERMINATED";
                    }
                }
            }
        };
        Shell.prototype.shellHelp = function (args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        };
        Shell.prototype.shellShutdown = function (args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed. If possible. Not a high priority. (Damn OCD!)
        };
        Shell.prototype.shellCls = function (args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        };
        Shell.prototype.shellMan = function (args) {
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
                    case "quantum":
                        _StdOut.putText("let the user set the Round Robin quantum");
                        break;
                    case "location":
                        _StdOut.putText("Displays the current location of the user.");
                        break;
                    case "sky":
                        _StdOut.putText("Displays the color of the sky.");
                        break;
                    case "ps":
                        _StdOut.putText("displays the PID and state of all processes");
                        break;
                    case "clearMem":
                        _StdOut.putText("Clears memory.");
                        break;
                    case "Date":
                        _StdOut.putText("Date displays the current date and time.");
                        break;
                    case "delete":
                        _StdOut.putText("Delete a file.");
                        break;
                    case "runAll":
                        _StdOut.putText("runs all user programs");
                        break;
                    case "format":
                        _StdOut.putText("initializes all block in all sectors in all tracks");
                        break;
                    case "setschedule":
                        _StdOut.putText("sets cpu scheduling algorithm.");
                        break;
                    case "getschedule":
                        _StdOut.putText("gets current cpu scheduling algorithm.");
                        break;
                    case "create":
                        _StdOut.putText("create file name");
                        break;
                    case "read":
                        _StdOut.putText("read a file");
                        break;
                    case "write":
                        _StdOut.putText("write to a file");
                        break;
                    case "ls":
                        _StdOut.putText("list files");
                        break;
                    case "bsod":
                        _StdOut.putText("BSOD displays the blue screen of death");
                        break;
                    case "kill":
                        _StdOut.putText("Kills the current running process");
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
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        };
        Shell.prototype.shellTrace = function (args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
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
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        };
        Shell.prototype.shellRot13 = function (args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellPrompt = function (args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        };
        return Shell;
    }());
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
