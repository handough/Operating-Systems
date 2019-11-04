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
var TSOS;
(function (TSOS) {
    var Cpu = /** @class */ (function () {
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting, IR, PID, quantum) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            if (IR === void 0) { IR = ''; }
            if (PID === void 0) { PID = 0; }
            if (quantum === void 0) { quantum = 0; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.IR = IR;
            this.PID = PID;
            this.quantum = quantum;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            if (this.isExecuting) {
                //this.updateCPU();
                //_PCB.state = "Running";
                var index = _MemoryManager.memIndex(this.PID);
                var op = _MemoryManager.getOp(index);
                this.runCode(op);
                //this.PC++;
            }
        };
        Cpu.prototype.runCode = function (op) {
            var i = this.PC;
            //console.log(op[0][i]);
            if (op[0][i] == 'A9') {
                this.loadAccumulator(op[0][i + 1]);
                this.PC += 2;
            }
            else if (op[0][i] == 'AD') {
                //var loc = _MemoryManager.endianAddress(op[0][i + 1], op[0][i + 2]);
                //loc += _PCB.base;
                this.loadAccumulator(op[0][i + 1]);
                this.PC += 3;
            }
            else if (op[0][i] == 'A2') {
                this.loadXReg(op[0][i + 1]);
                this.PC += 2;
            }
            else if (op[0][i] == 'A0') {
                this.loadYReg(op[0][i + 1]);
                this.PC += 2;
            }
            else if (op[0][i] == '8D') {
                var loc = _MemoryManager.endianAddress(op[0][i + 1], op[0][i + 2]);
                //loc += _PCB.base;
                this.storeAcc(loc);
                this.PC += 3;
            }
            else if (op[0][i] == 'AE') {
                var loc = _MemoryManager.endianAddress(op[0][i + 1], op[0][i + 2]);
                //loc += _PCB.base;
                this.loadXRegMem(loc);
                this.PC = 3;
            }
            else if (op[0][i] == 'AC') {
                var loc = _MemoryManager.endianAddress(op[0][i + 1], op[0][i + 2]);
                //loc += _PCB.base;
                this.loadYRegMem(loc);
                this.PC += 3;
            }
            else if (op[0][i] == '6D') {
                var loc = _MemoryManager.endianAddress(op[0][i + 1], op[0][i + 2]);
                //loc += _PCB.base;
                this.addCarry(loc);
                this.PC += 3;
            }
            else if (op[0][i] == 'EC') {
                var loc = _MemoryManager.endianAddress(op[0][i + 1], op[0][i + 2]);
                //loc += _PCB.base;
                this.zFlag(loc);
                this.PC += 3;
            }
            else if (op[0][i] == 'D0') {
                this.PC += 2;
                //this.branchNotEqual(op[0][i+1], _PCB.limit, op);
            }
            else if (op[0][i] == 'FF') {
                _KernelInputQueue.enqueue(new TSOS.Interrupt(SYSTEM_CALL_IRQ, op)); // call interrupt
                var loc = _MemoryManager.endianAddress(op[0][i + 1], op[0][i + 2]);
                this.systemCall(loc);
                this.PC += 1;
            }
            else if (op[0][i] == 'EE') {
                var loc = _MemoryManager.endianAddress(op[0][i + 1], op[0][i + 2]);
                //loc += _PCB.base;
                this.PC += 3;
                this.incrementByte(loc);
            }
            else if (op[0][i] == '00') {
                this.endProgram();
            }
            else {
                this.endProgram();
            }
            //TSOS.Control.updateMemoryTable();
            TSOS.Control.displayPCB();
        };
        Cpu.prototype.loadAccumulator = function (addr) {
            this.Acc = _MemoryManager.hexDecimal(addr);
            this.IR = 'A9';
        };
        Cpu.prototype.loadAccMem = function (addr) {
            //addr += _currentPCB.base;
            this.IR = 'AD';
            this.Acc = _MemoryManager.writeOpCode(addr, _currentPCB);
        };
        Cpu.prototype.loadXReg = function (addr) {
            //addr += _currentPCB.base;
            this.IR = 'A2';
            this.Xreg = _MemoryManager.hexDecimal(addr);
        };
        Cpu.prototype.loadYReg = function (addr) {
            this.IR = 'A0';
            this.Yreg = _MemoryManager.hexDecimal(addr);
        };
        Cpu.prototype.storeAcc = function (addr) {
            this.IR = '8D'; // change IR
            _MemoryManager.writeOpCode(this.Acc, addr);
        };
        Cpu.prototype.loadXRegMem = function (addr) {
            //this.PC += 1; // change the program counter 
            this.IR = 'AE'; // change the IR
            this.Xreg = _MemoryManager.getVariable(addr);
        };
        Cpu.prototype.loadYRegMem = function (addr) {
            //this.PC += 1; // change the program counter 
            this.IR = 'AC'; // change the IR 
            this.Yreg = _MemoryManager.getVariable(addr);
        };
        Cpu.prototype.addCarry = function (addr) {
            this.IR = '6D'; // change the IR
            var variable = _MemoryManager.getVariable(addr);
            //_PCB.Acc += parseInt(variable);
        };
        Cpu.prototype.zFlag = function (addr) {
            this.IR = 'EC'; // change the IR
            var byte = _MemoryManager.getVariable(addr);
            if (parseInt(byte) != this.Xreg) {
                this.Zflag = 0; // change z flag if not equal
            }
            else {
                this.Zflag = 1; // change z flag
            }
        };
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
        Cpu.prototype.systemCall = function (addr) {
            if (this.Xreg == 1) {
                this.IR = 'FF';
                _StdOut.putText(addr + "");
                _Console.advanceLine();
            }
            else if (this.Xreg == 2) {
                var term = false;
                var loc = 0; //this.Yreg; 
                var str = "";
                while (!term) {
                    var char = _MemoryManager.getOp(loc);
                    if (char == 0) {
                        term = true;
                        break;
                    }
                    else {
                        str += String.fromCharCode(_MemoryManager.hexDecimal(char));
                        loc++;
                    }
                }
                _StdOut.putText(str);
                _Console.advanceLine();
                this.IR = 'FF';
            }
        };
        Cpu.prototype.incrementByte = function (loc) {
            this.IR = 'EE';
            var b = _MemoryManager.getVariable(loc);
            _MemoryManager.writeOpCode(_MemoryManager.hexDecimal(b + 1), loc);
        };
        Cpu.prototype.endProgram = function () {
            // _MemoryManager.executePID.push(this.PID);
            _StdOut.putText("PID: " + this.PID + " done running."); //+ _cpuScheduler.turnAroundTime);
            _Console.advanceLine();
            //_PCB.clearPCB();
            this.isExecuting = false;
            _Console.putText(_OsShell.promptStr);
        };
        Cpu.prototype.updateCPU = function () {
            this.PID = _PCB.pid;
            this.PC = _PCB.PC;
            this.Acc = _PCB.Acc;
            this.Xreg = _PCB.X;
            this.Yreg = _PCB.Y;
            this.Zflag = _PCB.Z;
            this.IR = _PCB.IR;
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
