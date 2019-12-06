/* ------------
     Kernel.ts
     Routines for the Operating System, NOT the host.
     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

     module TSOS {

        export class Kernel {
            //
            // OS Startup and Shutdown Routines
            //
            public krnBootstrap() {      // Page 8. {
                Control.hostLog("bootstrap", "host");  // Use hostLog because we ALWAYS want this, even if _Trace is off.
    
                // Initialize our global queues.
                _KernelInterruptQueue = new Queue();  // A (currently) non-priority queue for interrupt requests (IRQs).
                _KernelBuffers = new Array();         // Buffers... for the kernel.
                _KernelInputQueue = new Queue();      // Where device input lands before being processed out somewhere.
    
                // Initialize the console.
                _Console = new Console();             // The command line interface / console I/O device.
                _Console.init();
    
                // Initialize standard input and output to the _Console.
                _StdIn  = _Console;
                _StdOut = _Console;
    
                // Load the Keyboard Device Driver
                this.krnTrace("Loading the keyboard device driver.");
                _krnKeyboardDriver = new DeviceDriverKeyboard();     // Construct it.
                _krnKeyboardDriver.driverEntry();                    // Call the driverEntry() initialization routine.
                this.krnTrace(_krnKeyboardDriver.status);
                // loading the HDD device driver
                this.krnTrace("Loading the HDD driver");
                _krnHardDriveDriver = new TSOS.deviceDriverHDD();
                //_krnHardDriveDriver.driverEntry(); 
                this.krnTrace(_krnHardDriveDriver.status);

                // load the memory manager 
                //_MemoryManager = new MemoryManager();
    
                //
                // ... more?
                //
    
                // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
                this.krnTrace("Enabling the interrupts.");
                this.krnEnableInterrupts();
    
                // Launch the shell.
                this.krnTrace("Creating and Launching the shell.");
                _OsShell = new Shell();
                _OsShell.init();
    
                // Finally, initiate student testing protocol.
                if (_GLaDOS) {
                    _GLaDOS.afterStartup();
                }
            }
    
            public krnShutdown() {
                this.krnTrace("begin shutdown OS");
                // TODO: Check for running processes.  If there are some, alert and stop. Else...
                // ... Disable the Interrupts.
                this.krnTrace("Disabling the interrupts.");
                this.krnDisableInterrupts();
                //
                // Unload the Device Drivers?
                // More?
                //
                this.krnTrace("end shutdown OS");
            }
    
    
            public krnOnCPUClockPulse() {
                /* This gets called from the host hardware simulation every time there is a hardware clock pulse.
                   This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
                   This, on the other hand, is the clock pulse from the hardware / VM / host that tells the kernel
                   that it has to look for interrupts and process them if it finds any.                          
                */
    
                // Check for an interrupt, if there are any. Page 560
                if (_KernelInterruptQueue.getSize() > 0) {
                    // Process the first interrupt on the interrupt queue.
                    // TODO (maybe): Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                    var interrupt = _KernelInterruptQueue.dequeue();
                    this.krnInterruptHandler(interrupt.irq, interrupt.params);
                } else if (_CPU.isExecuting) { // If there are no interrupts then run one CPU cycle if there is anything being processed.
                    _CPU.cycle();
                } else {                       // If there are no interrupts and there is nothing being executed then just be idle.
                    this.krnTrace("Idle");
                }
            }
    
    
            //
            // Interrupt Handling
            //
            public krnEnableInterrupts() {
                // Keyboard
                Devices.hostEnableKeyboardInterrupt();
                // Put more here.
            }
    
            public krnDisableInterrupts() {
                // Keyboard
                Devices.hostDisableKeyboardInterrupt();
                // Put more here.
            }
    
            public krnInterruptHandler(irq, params) {
                // This is the Interrupt Handler Routine.  See pages 8 and 560.
                // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on. Page 766.
                this.krnTrace("Handling IRQ~" + irq);
    
                // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
                // TODO: Consider using an Interrupt Vector in the future.
                // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
                //       Maybe the hardware simulation will grow to support/require that in the future.
                switch (irq) {
                    case TIMER_IRQ:
                        this.krnTimerISR();               // Kernel built-in routine for timers (not the clock).
                        break;
                    case KEYBOARD_IRQ:
                        _krnKeyboardDriver.isr(params);   // Kernel mode device driver
                        _StdIn.handleInput();
                        break;
                    case KILL_IRQ:
                        var PID = params;
                        //If nothing is running then print no active process
                        if (_CPU.isExecuting == false) {
                            _StdOut.putText("No Active Processes");
                        }else if (PID == _PCB.pid) {
                            _CPU.endProgram(PID);
                        }else {
                            for (var i = 0; i < _cpuScheduler.readyQueue.getSize(); i++) {
                                if (_cpuScheduler.readyQueue.q[i].PID == PID) {
                                    //_MemoryManager.clearBlock(PID); //Clear memory block
                                    _MemoryManager.executePid.push(PID); //Increment that this PID has been executed
                                    _StdOut.putText("PID: " + PID + " done. Turnaround Time = " + _cpuScheduler.turnAroundTime + ". Wait Time = " + (_cpuScheduler.turnAroundTime - _cpuScheduler.readyQueue.q[i].waitTime));
                                    _cpuScheduler.readyQueue.q[i].clearPCB(); //Clear the PCB
                                    if(_cpuScheduler.readyQueue.q[i].inHDD){
                                        _krnHardDriveDriver.krnHDDDeleteFile('process' + _cpuScheduler.readyQueue.q[i].PID.toString());
                                    }
                                    _cpuScheduler.readyQueue.q.splice(i, 1); //Remove this PCB from the ready queue
                                    _Console.advanceLine();
                                    break;
                                }
                            }
                        }
                        break;
                    case CONTEXT_SWITCH_IRQ:
                        _cpuScheduler.contextSwitch();
                        break;
                    case SYSTEM_CALL_IRQ:
                        break;
                    default:
                        this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
                }
            }
    
            public krnTimerISR() {
                // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
                // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
                // Or do it elsewhere in the Kernel. We don't really need this.
            }
    
            //
            // System Calls... that generate software interrupts via tha Application Programming Interface library routines.
            //
            // Some ideas:
            // - ReadConsole
            // - WriteConsole
            // - CreateProcess
            // - ExitProcess
            // - WaitForProcessToExit
            // - CreateFile
            // - OpenFile
            // - ReadFile
            // - WriteFile
            // - CloseFile
    
    
            //
            // OS Utility Routines
            //
            public krnTrace(msg: string) {
                 // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
                 if (_Trace) {
                    if (msg === "Idle") {
                        // We can't log every idle clock pulse because it would quickly lag the browser quickly.
                        if (_OSclock % 10 == 0) {
                            // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                            // idea of the tick rate and adjust this line accordingly.
                            Control.hostLog(msg, "OS");
                        }
                    } else {
                        Control.hostLog(msg, "OS");
                    }
                 }
            }
    
            public krnTrapError(msg) {
                Control.hostLog("OS ERROR - TRAP: " + msg);
                _Canvas = <HTMLCanvasElement>document.getElementById('display');
                _DrawingContext = _Canvas.getContext('2d');
                _DrawingContext.fillStyle = "blue"; // setting color to blue
                _DrawingContext.fillRect(0,0,500,500); // filling canvas
                // TODO: Display error on console, perhaps in some sort of colored screen. (Maybe blue?)
                this.krnShutdown();
            }

            public krnSwap(){
                 
                var op = _krnHardDriveDriver.krnHDDReadFile('process' + _CPU.PID); //Get op codes from file
                _krnHardDriveDriver.krnHDDDeleteFile('process' + _CPU.PID); //Delete the file
                var index = TSOS.Control.displayProcMem(op);
                if(index == -1){
                    var opMemArray = _MemoryManager.getOp(0);
                    //Create and write file for that process going into the HDD out of memory
                    _krnHardDriveDriver.krnHDDCreateFile('process' + _MemoryManager.pidLoc[0].toString());
                    _krnHardDriveDriver.krnHDDWriteFile('process' + _MemoryManager.pidLoc[0].toString(), opMemArray.join(" "));
                    // change PCB of file to record location
                    for(var i = 0; i < _cpuScheduler.residentList.length; i++){
                        if(_cpuScheduler.residentList[i].PID == _MemoryManager.pidLoc[0]){
                            _cpuScheduler.residentList[i].inHDD = true;
                            var table = document.getElementById("pcbTable");
                            var row = table.getElementsByTagName("tr")[_cpuScheduler.residentList[i].rowNumber];
                            row.getElementsByTagName("td")[8].innerHTML = 'Hard Drive';
                        }
                    }
                    _MemoryManager.writeToMemory(0, op);
                    _MemoryManager.pidLoc[0] = _CPU.PID; 
                    //_CPU.inHDD = false; * need to check this
                }else{
                    // write all ops to memory
                    _MemoryManager.writeToMemory(index, op);
                    _MemoryManager.pidLoc[0] = _CPU.PID;
                    //_CPU.inHDD = false;
                }
                
            }
        }
    }