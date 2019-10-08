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
                        public currentPCB: number = 0) {
    
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
                    this.updateCPU();
                    //TSOS.Control.updateMemoryTable();
                    this.runCode();
                    this.PC++;
                    //this.currentPCB.clockTicks++;
                }
                //this.end();
                //TSOS.Control.updateMemoryTable();
            }

            public end(){
                this.isExecuting = false;
            }

            public runCode(){
                this.IR = _Memory.memory[this.currentPCB].toUpperCase();
                //_PCB.state = "Running";
                switch(this.IR){
                    case "A9":
                        this.loadAccumulator();
                        break;
                    case "AD":
                        this.loadAccMem();
                        break;
                    case "8D":
                        _Memory.memory[this.PID] = this.Acc.toString(16);
                        break;
                    case "6D":
                        this.loadAccMem();
                        break;
                    case "A2":
                        this.loadXReg();
                        break;
                    case "AE":
                        this.loadXRegMem();
                        break;
                    case "A0":
                        this.loadXRegMem();
                        break;
                    case "AC":
                        this.loadYReg();
                        break;
                    case "00":
                        break;
                    case "EC":
                        this.zFlag();
                        break;
                    case "D0":
                        if(this.Zflag == 0){
                            this.loadAccMem();
                        }else{
                            this.PC++;
                        }
                        break;
                    case "EE":
                        this.IR = _PCB.base.toString();
                        break;
                    case "FF":
                        if(this.Xreg == 1){
                            _StdOut.putText(this.Yreg.toString());
                        }else if(this.Xreg == 2){
                            var index = this.Yreg + this.currentPCB;
                            while(_Memory.memory[index] != "00"){
                                _StdOut.putText(String.fromCharCode(parseInt(_Memory.memory[index++], 16)));
                            }
                        }
                        break;
                    default:
                            _PCB.state = "TERMINATED";
                        break;
                }
                this.isExecuting = false;
            }


            public loadAccumulator(){
                _PCB.PC += 2;
                _PCB.Acc = _MemoryManager.hexDecimal(_PCB.PC);
            }

            public loadAccMem(){
                _PCB.PC += 3;
                _PCB.IR = 'AD';
                _PCB.Acc = _MemoryManager.getVar(_PCB.PC);   
            }

            public loadXReg(){
                _PCB.PC += 2;
                _PCB.IR = 'A2';
                _PCB.Acc = _MemoryManager.hexDecimal(_PCB.PC);   
            }

            public loadYReg(){
                _PCB.PC += 3;
                _PCB.IR = '8D';
                _MemoryManager.writeOpCode(_PCB.Acc, this.PID);  
            }

            public storeAcc(){
                _PCB.PC += 2;
                _PCB.IR = 'A2';
                _PCB.Acc = _MemoryManager.hexDecimal(this.PID);   
            }

            public loadXRegMem(){
                _PCB.PC += 3;
                _PCB.IR = 'AE';
                _PCB.X = _MemoryManager.getVar(this.PID);   
            }

            public loadYRegMem(){
                _PCB.PC += 3;
                _PCB.IR = 'AC';
                _PCB.Y = _MemoryManager.getVar(this.PID);   
            }

            public addCarry(){
                _PCB.PC += 3;
                _PCB.IR = '6D';
                var variable = _MemoryManager.getVar(this.PID)
                _PCB.Acc += parseInt(variable);  
            }

            public zFlag(){
                _PCB.PC += 3;
                _PCB.IR = 'EC';
                var byte = _MemoryManager.getVar(this.PID)
                if(parseInt(byte) != _PCB.X){
                    _PCB.Z = 0;
                }else{
                    _PCB.Z = 1;
                }
            }

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

            public systemCall(){
                if(_PCB.X == 1){
                    _PCB.PC += 1;
                    _PCB.IR = 'FF';
                    _StdOut.putText(_PCB.Y + "");
                    _Console.advanceLine();
                }else if(_PCB.X == 2){
                    var term = false;
                    var loc = + _PCB.Y + _PCB.base;
                    var str = "";
                    while(!term){
                        var char = _MemoryManager.getVariable(loc);
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
                    _PCB.PC += 1;
                    _PCB.IR = 'FF';
                }
            }

            public incrementByte(loc){
                _PCB.PC += 3;
                _PCB.IR = 'EE';
                var b = _MemoryManager.getVar(loc);
                _MemoryManager.writeOpCode(_MemoryManager.hexDecimal(b+1), loc);
            }

            public endProgram(){
                var table = document.getElementById("cpuTable");
                table.getElementsByTagName("tr")[1].getElementsByTagName("td")[2].innerHTML = '00';
                _MemoryManager.executePID.push(this.PID);
                _StdOut.putText("PID: " + this.PID + " done.");
                _Console.advanceLine();
                _PCB.clearPCB();
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