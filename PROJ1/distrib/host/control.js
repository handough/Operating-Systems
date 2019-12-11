/* ------------
     Control.ts
     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.
     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)
     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
//
// Control Services
//
var TSOS;
(function (TSOS) {
    var Control = /** @class */ (function () {
        function Control() {
        }
        Control.hostInit = function () {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.
            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = document.getElementById('display');
            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");
            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            TSOS.CanvasTextFunctions.enable(_DrawingContext); // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.
            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("taHostLog").value = "";
            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("btnStartOS").focus();
            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        };
        Control.hostLog = function (msg, source) {
            if (source === void 0) { source = "?"; }
            // Note the OS CLOCK.
            var clock = _OSclock;
            // Note the REAL clock in milliseconds since January 1, 1970.
            var now = new Date().getTime();
            // Build the log string.
            var str = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now + " })" + "\n";
            // Update the log console.
            var taLog = document.getElementById("taHostLog");
            taLog.value = str + taLog.value;
            // TODO in the future: Optionally update a log database or some streaming service.
        };
        //
        // Host Events
        //
        Control.hostBtnStartOS_click = function (btn) {
            // Disable the (passed-in) start button...
            btn.disabled = true;
            // .. enable the Halt and Reset buttons ...
            document.getElementById("btnHaltOS").disabled = false;
            document.getElementById("btnReset").disabled = false;
            // .. set focus on the OS console display ...
            document.getElementById("display").focus();
            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new TSOS.Cpu(); // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init(); //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.
            _Memory = new TSOS.Memory();
            _Memory.init();
            _MemoryAccessor = new TSOS.MemoryAccessor();
            _hardDrive = new TSOS.hardDrive();
            _MemoryManager = new TSOS.MemoryManager();
            _cpuScheduler = new TSOS.CpuScheduler();
            _PCB = new TSOS.ProcessControlBlock();
            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(TSOS.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new TSOS.Kernel();
            _Kernel.krnBootstrap(); // _GLaDOS.afterStartup() will get called in there, if configured.
        };
        Control.hostBtnHaltOS_click = function (btn) {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        };
        Control.hostBtnReset_click = function (btn) {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        };
        Control.displayProcMem = function (op) {
            var table = document.getElementById("processMemTable");
            var fullCount = 0; // keep track if the count is full (full at 3)
            var index = -1; // where PID is being loaded, checked if there is anymore space 
            // displays data in process mem table 
            for (var i = 0; i < _MemoryManager.memoryUsed.length; i++) {
                if (_MemoryManager.memoryUsed[i] == 0) {
                    if (i == 0) {
                        index = i;
                        var opCount = 0; // substring position 
                        for (var i = 0; i <= 32; i++) {
                            var row = table.getElementsByTagName("tr")[i];
                            for (var j = 1; j < 9; j++) {
                                if (opCount + 2 > op.length) {
                                    row.getElementsByTagName("td")[j].innerHTML = '0';
                                }
                                else {
                                    row.getElementsByTagName("td")[j].innerHTML = op.substring(opCount, opCount + 2);
                                    opCount += 3;
                                }
                            }
                        }
                        _MemoryManager.memoryUsed[0] = 1; // memory used 
                    }
                    else if (i == 1) {
                        index = i;
                        var opCount = 0; // sub string position 
                        for (var i = 33; i <= 64; i++) {
                            var row = table.getElementsByTagName("tr")[i];
                            for (var j = 1; j < 9; j++) {
                                if (opCount + 2 > op.length) {
                                    row.getElementsByTagName("td")[j].innerHTML = '0';
                                }
                                else {
                                    row.getElementsByTagName("td")[j].innerHTML = op.substring(opCount, opCount + 2);
                                    opCount += 3;
                                }
                            }
                        }
                        _MemoryManager.memoryUsed[1] = 1; // 2nd block of memory used 
                    }
                    else if (i == 2) {
                        index = i;
                        var opCount = 0; // substring position 
                        for (var i = 65; i <= 96; i++) {
                            var row = table.getElementsByTagName("tr")[i];
                            for (var j = 1; j < 9; j++) {
                                if (opCount + 2 > op.length) {
                                    row.getElementsByTagName("td")[j].innerHTML = '0';
                                }
                                else {
                                    row.getElementsByTagName("td")[j].innerHTML = op.substring(opCount, opCount + 2);
                                    opCount += 3;
                                }
                            }
                        }
                        _MemoryManager.memoryUsed[2] = 1; // 3rd block of memory space used 
                    }
                    break; //Leave loop
                }
                else {
                    fullCount += 1;
                }
            }
            return index;
        };
        Control.updateProcessMem = function (PID) {
            var memoryIndex = _MemoryManager.memIndex(PID);
            var opIndex = 0;
            var table = document.getElementById("processMemTable");
            var a = _MemoryManager.getOp(_CPU.PID);
            if (memoryIndex == 0) {
                for (var i = 0; i < 32; i++) {
                    var row = table.getElementsByTagName("tr")[i];
                    for (var j = 1; j < 9; j++) {
                        row.getElementsByTagName("td")[j].innerHTML = a[opIndex] + '';
                        opIndex++;
                    }
                }
            }
            else if (memoryIndex == 1) {
                opIndex += 256;
                for (var i = 32; i < 64; i++) {
                    var row = table.getElementsByTagName("tr")[i];
                    for (var j = 1; j < 9; j++) {
                        var a = _MemoryManager.getOp(_CPU.PID);
                        row.getElementsByTagName("td")[j].innerHTML = a[opIndex] + '';
                        opIndex++;
                    }
                }
            }
            else if (memoryIndex == 2) {
                opIndex += 512;
                for (var i = 64; i < 96; i++) {
                    var row = table.getElementsByTagName("tr")[i];
                    for (var j = 1; j < 9; j++) {
                        var a = _MemoryManager.getOp(_CPU.PID);
                        row.getElementsByTagName("td")[j].innerHTML = a[opIndex] + '';
                        opIndex++;
                    }
                }
            }
        };
        Control.updateMemoryTable = function () {
            var table = document.getElementById("pcbTable");
            //Display current PCB
            var row = table.insertRow(_PCB.rowNum);
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            var cell4 = row.insertCell(3);
            var cell5 = row.insertCell(4);
            var cell6 = row.insertCell(5);
            var cell7 = row.insertCell(6);
            var cell8 = row.insertCell(7);
            var cell9 = row.insertCell(8);
            cell1.innerHTML = _PCB.pid + '';
            cell2.innerHTML = _PCB.state + '';
            cell3.innerHTML = _CPU.PC + '';
            cell4.innerHTML = _CPU.Acc + '';
            cell5.innerHTML = _CPU.IR + '';
            cell6.innerHTML = _CPU.Xreg + '';
            cell7.innerHTML = _CPU.Yreg + '';
            cell8.innerHTML = _CPU.Zflag + '';
            if (_PCB.inHDD) {
                cell9.innerHTML = "Hard Drive";
            }
            else {
                cell9.innerHTML = "Memory";
            }
            _PCB.getBase(_PCB.pid);
            _PCB.getLimit(_PCB.pid);
            _PCB.getPart(_PCB.pid);
        };
        Control.displayPCB = function () {
            var table = document.getElementById("pcbTable");
            var row = table.getElementsByTagName("tr")[_PCB.rowNum];
            row.getElementsByTagName("td")[0].innerHTML = _PCB.pid + '';
            row.getElementsByTagName("td")[1].innerHTML = _PCB.state + '';
            row.getElementsByTagName("td")[2].innerHTML = _CPU.PC + '';
            row.getElementsByTagName("td")[3].innerHTML = _CPU.Acc + '';
            row.getElementsByTagName("td")[4].innerHTML = _CPU.IR;
            row.getElementsByTagName("td")[5].innerHTML = _CPU.Xreg + '';
            row.getElementsByTagName("td")[6].innerHTML = _CPU.Yreg + '';
            row.getElementsByTagName("td")[7].innerHTML = _CPU.Zflag + '';
            if (_PCB.inHDD) {
                row.getElementsByTagName("td")[8].innerHTML = 'Hard Drive';
            }
            else {
                row.getElementsByTagName("td")[8].innerHTML = 'Memory';
            }
            _PCB.getBase(_CPU.PID);
            _PCB.getLimit(_CPU.PID);
            _PCB.getPart(_CPU.PID);
        };
        Control.clearBlock = function (pidder) {
            // pidder is the current PID sent from the CPU
            var index = -1; // starting index used to clear block
            // looping through all of the pid loc in mem
            for (var i = 0; i < _MemoryManager.pidLoc.length; i++) {
                // if the current pidLoc == the PID that is being cleared 
                if (_MemoryManager.pidLoc[i] == pidder) {
                    var table = document.getElementById("processMemTable");
                    if (i == 0) { // if i == 0 clear pidLoc[0] position 
                        _MemoryManager.pidLoc[0] = -1; // clear the PID locs
                        _MemoryManager.memoryUsed[0] = 0; // clear the used mem
                        index = 0; // used to clear block
                        for (var i = 0; i < 32; i++) {
                            var row = table.getElementsByTagName("tr")[i];
                            for (var j = 1; j < 9; j++) {
                                row.getElementsByTagName("td")[j].innerHTML = '0';
                            }
                        }
                    }
                    else if (i == 1) { // if i == 1 clear pidLoc[1] position
                        _MemoryManager.pidLoc[1] = -1; // clear the PID locs
                        _MemoryManager.memoryUsed[1] = 0; // clear the used mem
                        index = 1; // used to clear block
                        for (var i = 32; i < 64; i++) {
                            var row = table.getElementsByTagName("tr")[i];
                            for (var j = 1; j < 9; j++) {
                                row.getElementsByTagName("td")[j].innerHTML = '0';
                            }
                        }
                    }
                    else if (i == 2) { // if i == 2 clear pidLoc[2] position
                        _MemoryManager.pidLoc[2] = -1; // clear the PID locs
                        _MemoryManager.memoryUsed[2] = 0; // clear the used mem
                        index = 2; // used to clear block
                        for (var i = 64; i < 96; i++) {
                            var row = table.getElementsByTagName("tr")[i];
                            for (var j = 1; j < 9; j++) {
                                row.getElementsByTagName("td")[j].innerHTML = '0';
                            }
                        }
                    }
                    break;
                }
            }
            // erase memory at the indexes position 
            _Memory.eraseBlock(index);
        };
        Control.createHDDTable = function () {
            var table = document.getElementById("hardDriveTable");
            var x = 1;
            // elements of TSB display
            var track = 0;
            var sector = 0;
            var block = 0;
            //create actual table
            for (var i = 0; i <= 999; i++) {
                if (track == 3 && sector == 7 && block == 8) {
                    break;
                }
                var row = table.insertRow(x);
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                // change the block sector and track
                if (block == 8) {
                    block = 0;
                    sector++;
                }
                if (sector == 8) {
                    block = 0;
                    sector = 0;
                    track++;
                }
                cell1.innerHTML = track.toString() + ":" + sector.toString() + ":" + block.toString();
                var TSB = track.toString() + sector.toString() + block.toString();
                cell2.innerHTML = _hardDrive.read(TSB);
                block++;
                x++;
            }
        };
        return Control;
    }());
    TSOS.Control = Control;
})(TSOS || (TSOS = {}));
