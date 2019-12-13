/* ------------
     CPU.ts
     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.
     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

     module TSOS {

        export class Cpu {
    
            constructor(public PC: number = 0,
                        public Acc: number = 0,
                        public Xreg: number = 0,
                        public Yreg: number = 0,
                        public Zflag: number = 0,
                        public isExecuting: boolean = false,
                        public IR: string = '',
                        public PID: number = 0) {
    
            }
    
            public init(): void {
                this.PC = 0;
                this.Acc = 0;
                this.Xreg = 0;
                this.Yreg = 0;
                this.Zflag = 0;
                this.isExecuting = false;
            }

            public cycle(): void{
                _Kernel.krnTrace('CPU cycle');
                this.updateCPU();
                _PCB.state = "Running";
                // array of op codes 
                var op = _MemoryAccessor.read(_Runner);
                this.runCode(op);
            }

            public runCode(op){ 
                    var i = this.PC;
                    if(this.PC + 1 >= op.length){
                        this.endProgram();
                    }else{
                        console.log(op[i])
                        if(op[i] == 'A9'){
                            this.loadAccumulator(op[i+1]);
                            this.PC += 2;
                        }else if(op[i] == 'AD'){
                            var loc = _MemoryManager.endianAddress(op[i + 1], op[i + 2]);
                            var b = _PCB.getBase(_Runner);
                            loc += b;
                            this.loadAccMem(loc);
                            this.PC += 3;
                        }else if(op[i] == 'A2'){
                            this.loadXReg(op[i+1]);
                            console.log(op[this.PC+2])
                            this.PC += 2;
                        }else if(op[i] == 'A0'){
                            this.loadYReg(op[i+1]);
                            this.PC += 2;
                        }else if(op[i] == '8D'){
                            var loc = _MemoryManager.endianAddress(op[i + 1], op[i + 2]);
                            var b = _PCB.getBase(_Runner);
                            console.log(b + ' the base of store acc')
                            console.log(loc)
                            loc += b;
                            this.storeAcc(loc);
                            this.PC += 3;
                        }else if(op[i] == 'AE'){
                            var loc = _MemoryManager.endianAddress(op[i + 1], op[i + 2]);
                            var b = _PCB.getBase(_Runner);
                            loc += b;
                            this.loadXRegMem(loc);  
                            this.PC += 3;
                        }else if(op[i] == 'AC'){
                            var loc = _MemoryManager.endianAddress(op[i + 1], op[i + 2]);
                            var b = _PCB.getBase(_Runner);
                            loc += b;
                            this.loadYRegMem(loc);
                            this.PC += 3;
                        }else if(op[i] == '6D'){
                            var loc = _MemoryManager.endianAddress(op[i + 1], op[i + 2]);
                            var b = _PCB.getBase(_Runner);
                            loc += b;
                            this.addCarry(loc);
                            this.PC += 3;
                        }else if(op[i] == 'EC'){
                            var loc = _MemoryManager.endianAddress(op[i + 1], op[i + 2]);
                            console.log(loc)
                            var b = _PCB.getBase(_Runner);
                            loc += b; // base will be 0, 256, 512
                            this.zFlag(loc); // calling zflag to compare the bytes
                            this.PC += 3; // add to program counter
                        }else if(op[i] == 'D0'){
                            this.branchNotEqual(op[i+1], op);
                            //this.PC += 2;
                        }else if(op[i] == 'FF'){
                            _KernelInputQueue.enqueue(new TSOS.Interrupt(SYSTEM_CALL_IRQ, '')); // call interrupt
                            this.systemCall();
                        }else if(op[i] == 'EE'){
                            var loc = _MemoryManager.endianAddress(op[i + 1], op[i + 2]);
                            var b = _PCB.getBase(_Runner);
                            loc += b;
                            this.incrementByte(loc);
                            this.PC += 3;
                        }else if(op[i] == '00'){
                            this.endProgram();
                        }
                        if(_PCB.state != "TERMINATED" && _runAll != true){
                            TSOS.Control.displayPCB();
                        }
                        TSOS.Control.updateProcessMem(_PCB.pid);
                        //this.updateCPU();
                        //TSOS.Control.displayPCB();
                        if (_cpuScheduler.RR && _cpuScheduler.readyQueue.isEmpty() == false) {
                           _cpuScheduler.checkCount();
                        }
                }
            }

            public loadAccumulator(addr){
                //this.PC += 2;
                // load the accumulator with the translated op code
                this.Acc= _MemoryManager.hexDecimal(addr);
                console.log(this.Acc)
                this.IR = 'A9'; // change the IR
            }

            public loadAccMem(addr){
                //this.PC += 3;
                this.IR = 'AD'; // change the IR
                var a = _MemoryAccessor.read(_Runner); // getting array of op codes
                this.Acc = a[addr]; // setting the accumulator to opcode
                console.log(this.Acc)
                console.log(a[addr])
                console.log(_Memory.memory[addr])
            }

            public loadXReg(addr){
                //this.PC += 2;
                this.IR = 'A2'; // change the IR
                this.Xreg = _MemoryManager.hexDecimal(addr);  
            }

            public loadYReg(addr){ 
                ///this.PC += 2;
                this.IR = 'A0'; // change the IR
                this.Yreg = _MemoryManager.hexDecimal(addr); 
                console.log(this.Yreg)
            }

            public storeAcc(addr){
                //this.PC += 3;
                this.IR = '8D'; // change IR
                // writing op code 
                _MemoryManager.writeOpCode(this.Acc, addr, _Runner); 
                var y = _MemoryAccessor.read(_Runner);
                var bb = _Memory.memory[addr]
                console.log(bb)
            }

            public loadXRegMem(addr){
                //this.PC += 3; 
                this.IR = 'AE'; // change the IR
                var xee = parseInt(_Memory.memory[addr]);//(x[this.PID][addr]); 
                this.Xreg = xee;
                console.log(this.Xreg)
            }

            public loadYRegMem(addr){
                //this.PC += 3;
                this.IR = 'AC'; // change the IR 
                var y = _MemoryManager.getOp(this.PID); 
                var yee = parseInt(_Memory.memory[addr]);//(y[this.PID][addr]);
                this.Yreg = yee;
                console.log(this.Yreg)
            }

            public addCarry(addr){
                //this.PC += 3; // add to program counter
                this.IR = '6D'; // change the IR
                var y = _MemoryManager.getOp(this.PID);
                var v = _Memory.memory[addr];//variable[this.PID][addr];
                this.Acc += parseInt(v);
                console.log(this.Acc)
            }

            public zFlag(addr){
                this.IR = 'EC'; // change the IR
                var byte = _MemoryManager.getOp(this.PID);
                var bs = _Memory.memory[addr];//byte[this.PID][addr];
                if(bs == this.Xreg){
                    this.Zflag = 1; // change z flag if not equal
                }else{
                    this.Zflag = 0; // change z flag
                }
            }
 
            public branchNotEqual(oper, op){
                var dist = _MemoryManager.hexDecimal(oper);
                var newPC = this.PC + dist;
                var lim;
                var base;
                if(_Runner == 0){
                    lim = 256;
                    base = 0;
                }else if(_Runner == 1){
                    lim = 512;
                    base = 256;
                }else if(_Runner == 2){
                    lim = 768;
                    base = 512;
                }
                if(this.Zflag == 0){
                    if(newPC + base > lim){
                        newPC = (newPC + base) - lim + 2;
                        this.PC = newPC ;
                        this.IR = op[this.PC]; // changing the IR
                    }else{
                        this.PC = newPC + 2;
                        this.IR = op[this.PC]; // changing the IR
                    }
                }else{
                    this.PC += 2;
                    this.IR = 'D0';
                }
            }

            public systemCall(){
                if(this.Xreg == 1){
                    console.log(this.Xreg)
                    this.PC += 1;
                    this.IR = 'FF';
                    _StdOut.putText(this.Yreg + "");
                    _Console.advanceLine();
                }else if(this.Xreg == 2){
                    var base = 0;//_PCB.getBase(_Runner);
                    console.log(base + ' base in system call')
                    var term = false;
                    var loc = this.Yreg + base; 
                    var str = "";
                    while(!term){
                        var char = _MemoryAccessor.read(_Runner);
                        var c = char[loc];
                        if(c == 0){
                            term = true;
                            break;
                        }else{
                            str += String.fromCharCode(_MemoryManager.hexDecimal(c));
                            loc++;
                        }
                    }
                    _StdOut.putText(str);
                    _Console.advanceLine();
                    this.PC += 1;
                    this.IR = 'FF';
                }
            }

            public incrementByte(loc){
                //this.PC += 3;
                this.IR = 'EE';
                var b = _MemoryManager.getOp(this.PID);
                var bb =_Memory.memory[loc];//b[this.PID][loc];
                _MemoryManager.writeOpCode(_MemoryManager.hexDecimal(bb+1), loc, _Runner);
                var b = _MemoryManager.getOp(this.PID);
                var bb = _Memory.memory[loc];
                console.log(bb)

            }

            public endProgram(){
                if(_Ran == true){
                    this.clearCPU();
                    _Console.putText(_OsShell.promptStr);
                    _Ran = false;
                }
                _PCB.clearPCB();
                TSOS.Control.clearBlock(_PCB.pid);
                this.clearCPU();
                //_MemoryManager.executePid.push(_PCB.pid);
                _StdOut.putText("PID: " + this.PID + " done running. " + "Turn around time: " + _cpuScheduler.turnAroundTime);
                _Console.advanceLine();
                this.PC = 0;
                if(_cpuScheduler.count != _cpuScheduler.quantum){
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, 'Scheduling Event'));
                }
                if (!_cpuScheduler.RR && !_cpuScheduler.fcfs) {
                    this.isExecuting = false;
                    _cpuScheduler.turnAroundTime = 0; 
                    _Console.putText(_OsShell.promptStr);
                }
            }

            public updateCPU(){
                this.PID = _PCB.pid;
                _PCB.PC = this.PC;
                _PCB.Acc = this.Acc;
                _PCB.X = this.Xreg;
                _PCB.Y = this.Yreg;
                _PCB.Z = this.Zflag;
                _PCB.IR = this.IR;
            }

            public clearCPU(){
                this.IR = '';
                this.PC = 0;
                this.Acc = 0;
                this.Xreg = 0;
                this.Yreg = 0;
                this.Zflag = 0;
            }
    }
}