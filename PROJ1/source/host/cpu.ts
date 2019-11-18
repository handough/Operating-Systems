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
                        public PID: number = -1,
                        public base: number = 0,
                        public limit: number = 0) {
    
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
                    _PCB.state = "Running";
                    // get memory block loc for the op 
                    var index = _MemoryManager.memIndex(this.PID);
                    // array of op codes 
                    var op = _MemoryManager.getOp(index);
                    this.runCode(op);
                }
            }

            public runCode(op){ 
                    var i = this.PC;
                    if(op[this.PID][i] == 'A9'){
                        this.loadAccumulator(op[this.PID][i+1]);
                        this.PC += 2;
                    }else if(op[this.PID][i] == 'AD'){
                        var loc = _MemoryManager.endianAddress(op[this.PID][i + 1], op[this.PID][i + 2]);
                        loc += this.base;
                        this.loadAccumulator(op[this.PID][i + 1]);
                        this.PC += 3;
                    }else if(op[this.PID][i] == 'A2'){
                        this.loadXReg(op[this.PID][i+1]);
                        this.PC += 2;
                    }else if(op[this.PID][i] == 'A0'){
                        this.loadYReg(op[this.PID][i+1]);
                        this.PC += 2;
                    }else if(op[this.PID][i] == '8D'){
                        var loc = _MemoryManager.endianAddress(op[this.PID][i + 1], op[this.PID][i + 2]);
                        loc += this.base;
                        this.storeAcc(loc);
                        this.PC += 3;
                    }else if(op[this.PID][i] == 'AE'){
                        var loc = _MemoryManager.endianAddress(op[this.PID][i + 1], op[this.PID][i + 2]);
                        loc += this.base;
                        this.loadXRegMem(loc);  
                        this.PC = 3;
                    }else if(op[this.PID][i] == 'AC'){
                        var loc = _MemoryManager.endianAddress(op[this.PID][i + 1], op[this.PID][i + 2]);
                        loc += this.base;
                        this.loadYRegMem(loc);
                        this.PC += 3;
                    }else if(op[this.PID][i] == '6D'){
                        var loc = _MemoryManager.endianAddress(op[this.PID][i + 1], op[this.PID][i + 2]);
                        loc += this.base;
                        this.addCarry(loc);
                        this.PC += 3;
                    }else if(op[this.PID][i] == 'EC'){
                        var loc = _MemoryManager.endianAddress(op[this.PID][i + 1], op[this.PID][i + 2]);
                        loc += this.base;
                        this.zFlag(loc);
                        this.PC += 3;
                    }else if(op[this.PID][i] == 'D0'){
                        this.PC += 2;
                        this.branchNotEqual(op[this.PID][i+1], this.limit, op[this.PID]);
                    }else if(op[this.PID][i] == 'FF'){
                        _KernelInputQueue.enqueue(new TSOS.Interrupt(SYSTEM_CALL_IRQ, op)); // call interrupt
                        //var loc = _MemoryManager.endianAddress(op[0][i + 1], op[0][i + 2]);
                        this.systemCall();
                        //this.PC += 1;
                    }else if(op[this.PID][i] == 'EE'){
                        var loc = _MemoryManager.endianAddress(op[this.PID][i + 1], op[this.PID][i + 2]);
                        loc += this.base;
                        this.PC += 3;
                        this.incrementByte(loc);
                    }else if(op[this.PID][i] == '00'){
                        this.endProgram();
                    }else{
                        this.endProgram();
                    }
                    TSOS.Control.displayPCB();
            }

            public loadAccumulator(addr){
                this.Acc= _MemoryManager.hexDecimal(addr);
                this.IR = 'A9';
            }

            public loadAccMem(addr){
                this.IR = 'AD';
                var a = _MemoryManager.getOp(this.PID);
                this.Acc = a[this.PID][addr];
            }

            public loadXReg(addr){
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
                this.IR = 'AE'; // change the IR
                var x = _MemoryManager.getOp(this.PID);  
                this.Xreg = x[this.PID][addr]; 
            }

            public loadYRegMem(addr){
                this.IR = 'AC'; // change the IR 
                var y = _MemoryManager.getOp(this.PID);  
                this.Yreg = y[this.PID][addr];
            }

            public addCarry(addr){
                this.IR = '6D'; // change the IR
                var variable = _MemoryManager.getOp(this.PID);
                var v = variable[this.PID][addr];
                this.Acc += parseInt(v);
            }

            public zFlag(addr){
                this.IR = 'EC'; // change the IR
                var byte = _MemoryManager.getOp(this.PID);
                var b = byte[this.PID][addr];
                if(parseInt(b) != this.Xreg){
                    this.Zflag = 0; // change z flag if not equal
                }else{
                    this.Zflag = 1; // change z flag
                }
            }
 
            public branchNotEqual(lim, op, dist){
                var dist = _MemoryManager.hexDecimal(dist);
                var base = this.base;
                /** 
                if(this.Zflag ==0){
                    if(this.PC + dist + base > lim){
                        this.PC = (this.PC + dist + base ) - lim + 2;
                        this.IR = op[this.PID];//[this.PC]; // changing the IR
                    }else{
                       this.PC = this.PC + dist + 2;
                        this.IR = op[this.PID];//[this.PC]; // changing the IR
                    }
                }else{
                    this.IR = 'D0';
                }*/
            }

            public systemCall(){
                if(this.Xreg == 1){
                    this.IR = 'FF';
                    this.PC += 1;
                    _StdOut.putText(this.Yreg + "");
                    console.log(this.Yreg);
                    _Console.advanceLine();
                }else if(this.Xreg == 2){
                    var term = false;
                    var loc = this.Yreg + this.base; 
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
                }
            }

            public incrementByte(loc){
                this.IR = 'EE';
                var b = _MemoryManager.getOp(this.PID);
                var bb = b[this.PID][loc];
                _MemoryManager.writeOpCode(_MemoryManager.hexDecimal(bb+1), loc);
            }

            public endProgram(){
                var table = <HTMLTableElement>document.getElementById("pcbTable");
                table.getElementsByTagName("tr")[1].getElementsByTagName("td")[2].innerHTML = '00';
                _StdOut.putText("PID: " + this.PID + " done running. " + "Turn around time: " + _cpuScheduler.turnAroundTime);
                _Console.advanceLine();
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