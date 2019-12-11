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
                //if(this.isExecuting){
                    //this.updateCPU();
                    _PCB.state = "Running";
                    // get memory block loc for the op 
                    var index = _MemoryManager.memIndex(this.PID);
                    // array of op codes 
                    var op = _MemoryManager.getOp(index);
                    this.runCode(op);
                //}
            }

            public runCode(op){ 
                    var i = this.PC;
                    //if(this.PC + 1 >= op[this.PID].length){
                        //this.endProgram(this.PID);
                    //}else{
                        //console.log(op[this.PID][14])
                        if(op[this.PID][i] == 'A9'){
                            var h = _Memory.memory[i+1];
                            this.loadAccumulator(op[this.PID][i+1]);
                            this.PC += 2;
                        }else if(op[this.PID][i] == 'AD'){
                            var loc = _MemoryManager.endianAddress(op[this.PID][i + 1], op[this.PID][i + 2]);
                            loc += _PCB.base;
                            this.loadAccMem(loc);
                            //this.loadAccumulator(loc);
                            this.PC += 3;
                        }else if(op[this.PID][i] == 'A2'){

                            this.loadXReg(op[this.PID][i+1]);
                            this.PC += 2;
                        }else if(op[this.PID][i] == 'A0'){
                            this.loadYReg(op[this.PID][i+1]);
                            this.PC += 2;
                        }else if(op[this.PID][i] == '8D'){
                            var loc = _MemoryManager.endianAddress(op[this.PID][i + 1], op[this.PID][i + 2]);
                            loc += _PCB.base;
                            this.storeAcc(loc);
                            this.PC += 3;
                        }else if(op[this.PID][i] == 'AE'){
                            var loc = _MemoryManager.endianAddress(op[this.PID][i + 1], op[this.PID][i + 2]);
                            loc += _PCB.base;
                            this.loadXRegMem(loc);  
                            this.PC += 3;
                        }else if(op[this.PID][i] == 'AC'){
                            var loc = _MemoryManager.endianAddress(op[this.PID][i + 1], op[this.PID][i + 2]);
                            loc += _PCB.base;
                            this.loadYRegMem(loc);
                            this.PC += 3;
                        }else if(op[this.PID][i] == '6D'){
                            var loc = _MemoryManager.endianAddress(op[this.PID][i + 1], op[this.PID][i + 2]);
                            loc += _PCB.base;
                            this.addCarry(loc);
                            this.PC += 3;
                        }else if(op[this.PID][i] == 'EC'){
                            var loc = _MemoryManager.endianAddress(op[this.PID][i + 1], op[this.PID][i + 2]);
                            loc += _PCB.base; // base will be 0, 256, 512
                            this.zFlag(loc); // calling zflag to compare the bytes
                            this.PC += 3; // add to program counter
                        }else if(op[this.PID][i] == 'D0'){
                            this.branchNotEqual(op[this.PID][i+1], _PCB.limit, op[this.PID]);
                            //this.PC += 2;
                        }else if(op[this.PID][i] == 'FF'){
                            _KernelInputQueue.enqueue(new TSOS.Interrupt(SYSTEM_CALL_IRQ, '')); // call interrupt
                            this.systemCall();
                        }else if(op[this.PID][i] == 'EE'){
                            var loc = _MemoryManager.endianAddress(op[this.PID][i + 1], op[this.PID][i + 2]);
                            loc += _PCB.base;
                            this.incrementByte(loc);
                            this.PC += 3;
                        }else if(op[this.PID][i] == '00'){
                            this.endProgram(this.PID);
                        }
                        //if(_PCB.state != "TERMINATED"){
                            //TSOS.Control.displayPCB();
                        //}
                        TSOS.Control.updateProcessMem(this.PID);
                        TSOS.Control.displayPCB();
                        //if (_cpuScheduler.RR && _cpuScheduler.readyQueue.isEmpty() == false) {
                           // _cpuScheduler.checkCount(this.PID);
                        //}
                //}
            }

            public loadAccumulator(addr){
                //this.PC += 2;
                // load the accumulator with the translated op code
                this.Acc= _MemoryManager.hexDecimal(addr);
                console.log(this.Acc + " load acc")
                console.log(this.PC)
                this.IR = 'A9'; // change the IR
            }

            public loadAccMem(addr){
                //this.PC += 3;
                this.IR = 'AD'; // change the IR
                var a = _MemoryManager.getOp(this.PID); // getting array of op codes
                this.Acc = a[this.PID][addr]; // setting the accumulator to opcode
                console.log(this.Acc)
                console.log(this.PC)
            }

            public loadXReg(addr){
                //this.PC += 2;
                this.IR = 'A2'; // change the IR
                this.Xreg = _MemoryManager.hexDecimal(addr);  
                console.log(this.Xreg + " load x reg")
                console.log(this.PC + ' the PC at loadxreg')
            }

            public loadYReg(addr){ 
                ///this.PC += 2;
                this.IR = 'A0'; // change the IR
                this.Yreg = _MemoryManager.hexDecimal(addr); 
                console.log(this.Yreg + ' load y reg')
                console.log(this.PC + ' the pc at loadyreg')
            }

            public storeAcc(addr){
                console.log(addr)
                //this.PC += 3;
                this.IR = '8D'; // change IR
                var get = _MemoryManager.getOp(this.PID);
                // writing op code 
                _MemoryManager.writeOpCode(this.Acc, addr); 
                console.log(_Memory.memory[addr])  
                var g = get[this.PID][addr];
                console.log(this.Acc)
                //console.log(g + ' writen to mem in store acc')
            }

            public loadXRegMem(addr){
                //this.PC += 3; 
                this.IR = 'AE'; // change the IR
                var x = _MemoryManager.getOp(this.PID); 
                var xee = parseInt(_Memory.memory[addr]);//(x[this.PID][addr]); 
                this.Xreg = xee;
                console.log(this.Xreg + ' the xreg at load mem')
                console.log(this.PC + ' pc at loadxregmem')
            }

            public loadYRegMem(addr){
                //this.PC += 3;
                this.IR = 'AC'; // change the IR 
                var y = _MemoryManager.getOp(this.PID); 
                var yee = parseInt(_Memory.memory[addr]);//(y[this.PID][addr]);
                this.Yreg = yee;
                console.log(this.Yreg + ' load yregmem')
                console.log(this.PC + ' the pc at loadyregmem')
            }

            public addCarry(addr){
                //this.PC += 3; // add to program counter
                this.IR = '6D'; // change the IR
                var variable = _MemoryManager.getOp(this.PID);
                var v = _Memory.memory[addr];//variable[this.PID][addr];
                this.Acc += parseInt(v);
                console.log(this.Acc + ' add carry ')
                console.log(this.PC + ' the pc at addcarry')
            }

            public zFlag(addr){
                this.IR = 'EC'; // change the IR
                var byte = _MemoryManager.getOp(this.PID);
                var bs = _Memory.memory[addr];//byte[this.PID][addr];
                var b = parseInt(bs,16);
                console.log(b);
                console.log(this.Xreg)
                console.log(this.PC + ' the pc at zflag')
                if(b == this.Xreg){
                    this.Zflag = 1; // change z flag if not equal
                }else{
                    this.Zflag = 0; // change z flag
                }
            }
 
            public branchNotEqual(oper, lim, op){
                console.log(this.PC)
                console.log(oper);
                var dist = _MemoryManager.hexDecimal(oper);
                console.log(dist);
                var base = 0;
                var newPC = this.PC + dist;
                if(this.Zflag == 0){
                    if(this.PC + dist + base > 256){
                        newPC = newPC - 255+1;
                        this.PC = newPC ;
                        console.log(this.PC + ' the pc at branchnoteawual');
                        this.IR = op[this.PC]; // changing the IR
                        console.log(op[this.PC] + ' the new op in branchnotequal')
                    }else{
                        this.PC = newPC+2;
                        console.log(this.PC);
                        this.IR = op[this.PC]; // changing the IR
                    }
                }else{
                    this.PC += 2;
                    this.IR = 'D0';
                }
            }

            public systemCall(){
                if(this.Xreg == 1){
                    this.PC += 1;
                    this.IR = 'FF';
                    _StdOut.putText(this.Yreg + "");
                    _Console.advanceLine();
                }else if(this.Xreg == 2){
                    var term = false;
                    var loc = this.Yreg + _PCB.base; 
                    var str = "";
                    while(!term){
                        var char = _MemoryManager.getOp(this.PID);
                        var c = char[this.PID][loc];
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
                    console.log(this.PC)
                }
            }

            public incrementByte(loc){
                //this.PC += 3;
                this.IR = 'EE';
                var b = _MemoryManager.getOp(this.PID);
                var bb = _Memory.memory[loc];//b[this.PID][loc];
                _MemoryManager.writeOpCode(_MemoryManager.hexDecimal(bb+1), loc);
            }

            public endProgram(args){
                var table = <HTMLTableElement>document.getElementById("pcbTable");
                table.getElementsByTagName("tr")[1].getElementsByTagName("td")[2].innerHTML = '00';
                TSOS.Control.clearBlock(this.PID);
                _MemoryManager.executePid.push(this.PID);
                _StdOut.putText("PID: " + this.PID + " done running. " + "Turn around time: " + _cpuScheduler.turnAroundTime);
                _Console.advanceLine();
                this.PC = 0;
                _PCB.pid = this.PID;
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
                this.PC = _PCB.PC;
                this.Acc = _PCB.Acc;
                this.Xreg = _PCB.X;
                this.Yreg = _PCB.Y;
                this.Zflag = _PCB.Z;
                this.IR = _PCB.IR;
            }
    }
}