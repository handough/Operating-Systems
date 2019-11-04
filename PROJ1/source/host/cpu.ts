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
                        public PID: number = 0,
                        public quantum: number = 0) {
    
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
                if(this.isExecuting){
                    //this.updateCPU();
                    //_PCB.state = "Running";
                    var index = _MemoryManager.memIndex(this.PID);
                    var op = _MemoryManager.getOp(index);
                    this.runCode(op);
                    //this.PC++;
                }
            }

            public runCode(op){ 
                    var i = this.PC;
                    //console.log(op[0][i]);
                    if(op[0][i] == 'A9'){
                        this.loadAccumulator(op[0][i+1]);
                        this.PC += 2;
                    }else if(op[0][i] == 'AD'){
                        //var loc = _MemoryManager.endianAddress(op[0][i + 1], op[0][i + 2]);
                        //loc += _PCB.base;
                        this.loadAccumulator(op[0][i + 1]);
                        this.PC += 3;
                    }else if(op[0][i] == 'A2'){
                        this.loadXReg(op[0][i+1]);
                        this.PC += 2;
                    }else if(op[0][i] == 'A0'){
                        this.loadYReg(op[0][i+1]);
                        this.PC += 2;
                    }else if(op[0][i] == '8D'){
                        var loc = _MemoryManager.endianAddress(op[0][i + 1], op[0][i + 2]);
                        //loc += _PCB.base;
                        this.storeAcc(loc);
                        this.PC += 3;
                    }else if(op[0][i] == 'AE'){
                        var loc = _MemoryManager.endianAddress(op[0][i + 1], op[0][i + 2]);
                        //loc += _PCB.base;
                        this.loadXRegMem(loc);  
                        this.PC = 3;
                    }else if(op[0][i] == 'AC'){
                        var loc = _MemoryManager.endianAddress(op[0][i + 1], op[0][i + 2]);
                        //loc += _PCB.base;
                        this.loadYRegMem(loc);
                        this.PC += 3;
                    }else if(op[0][i] == '6D'){
                        var loc = _MemoryManager.endianAddress(op[0][i + 1], op[0][i + 2]);
                        //loc += _PCB.base;
                        this.addCarry(loc);
                        this.PC += 3;
                    }else if(op[0][i] == 'EC'){
                        var loc = _MemoryManager.endianAddress(op[0][i + 1], op[0][i + 2]);
                        //loc += _PCB.base;
                        this.zFlag(loc);
                        this.PC += 3;
                    }else if(op[0][i] == 'D0'){
                        this.PC += 2;
                        //this.branchNotEqual(op[0][i+1], _PCB.limit, op);
                    }else if(op[0][i] == 'FF'){
                        _KernelInputQueue.enqueue(new TSOS.Interrupt(SYSTEM_CALL_IRQ, op)); // call interrupt
                        var loc = _MemoryManager.endianAddress(op[0][i + 1], op[0][i + 2]);
                        this.systemCall(loc);
                        this.PC += 1;
                    }else if(op[0][i] == 'EE'){
                        var loc = _MemoryManager.endianAddress(op[0][i + 1], op[0][i + 2]);
                        //loc += _PCB.base;
                        this.PC += 3;
                        this.incrementByte(loc);
                    }else if(op[0][i] == '00'){
                        this.endProgram();
                    }else{
                        this.endProgram();
                    }
                    //TSOS.Control.updateMemoryTable();
                    TSOS.Control.displayPCB();
            }

            public loadAccumulator(addr){
                this.Acc= _MemoryManager.hexDecimal(addr);
                this.IR = 'A9';
            }

            public loadAccMem(addr){
                //addr += _currentPCB.base;
                this.IR = 'AD';
                this.Acc = _MemoryManager.writeOpCode(addr, _currentPCB);
            }

            public loadXReg(addr){
                //addr += _currentPCB.base;
                this.IR = 'A2';
                this.Xreg = _MemoryManager.hexDecimal(addr);   
            }

            public loadYReg(addr){ 
                this.IR = 'A0';
                this.Yreg = _MemoryManager.hexDecimal(addr);  
            }

            public storeAcc(addr){
                this.IR = '8D'; // change IR
                _MemoryManager.writeOpCode(this.Acc, addr);   
            }

            public loadXRegMem(addr){
                //this.PC += 1; // change the program counter 
                this.IR = 'AE'; // change the IR
                this.Xreg = _MemoryManager.getVariable(addr);   
            }

            public loadYRegMem(addr){
                //this.PC += 1; // change the program counter 
                this.IR = 'AC'; // change the IR 
                this.Yreg = _MemoryManager.getVariable(addr);   
            }

            public addCarry(addr){
                this.IR = '6D'; // change the IR
                var variable = _MemoryManager.getVariable(addr);
                //_PCB.Acc += parseInt(variable);
            }

            public zFlag(addr){
                this.IR = 'EC'; // change the IR
                var byte = _MemoryManager.getVariable(addr);
                if(parseInt(byte) != this.Xreg){
                    this.Zflag = 0; // change z flag if not equal
                }else{
                    this.Zflag = 1; // change z flag
                }
            }
/** 
            public branchNotEqual(lim, op, dist){
                var dist = _MemoryManager.hexDecimal(dist);
                var base = _PCB.base;
                if(_PCB.Z ==0){
                    if(_PCB.PC + dist + base > lim){
                        _PCB.PC = (_PCB.PC + dist + base ) - lim + 2;
                        _PCB.IR = op[_PCB.PC]; // changing the IR
                    }else{
                        _PCB.PC = _PCB.PC + dist + 2;
                        _PCB.IR = op[_PCB.PC]; // changing the IR
                    }
                }else{
                    _PCB.PC += 2;
                    _PCB.IR = 'D0';
                }
            }
*/
            public systemCall(addr){
                if(this.Xreg == 1){
                    this.IR = 'FF';
                    _StdOut.putText(addr + "");
                    _Console.advanceLine();
                }else if(this.Xreg == 2){
                    var term = false;
                    var loc = 0;//this.Yreg; 
                    var str = "";
                    while(!term){
                        var char = _MemoryManager.getOp(loc);
                        if(char == 0){
                            term = true;
                            break;
                        }else{
                            str += String.fromCharCode(_MemoryManager.hexDecimal(char));
                            loc++;
                        }
                    }
                    _StdOut.putText(str);
                    _Console.advanceLine();
                    this.IR = 'FF';
                }
            }

            public incrementByte(loc){
                this.IR = 'EE';
                var b = _MemoryManager.getVariable(loc);
                _MemoryManager.writeOpCode(_MemoryManager.hexDecimal(b+1), loc);
            }

            public endProgram(){
               // _MemoryManager.executePID.push(this.PID);
                _StdOut.putText("PID: " + this.PID + " done running."); //+ _cpuScheduler.turnAroundTime);
                _Console.advanceLine();
                //_PCB.clearPCB();
                this.isExecuting = false;
                _Console.putText(_OsShell.promptStr);
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