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
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting, IR, PID, base, limit) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            if (IR === void 0) { IR = ''; }
            if (PID === void 0) { PID = 0; }
            if (base === void 0) { base = 0; }
            if (limit === void 0) { limit = 0; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.IR = IR;
            this.PID = PID;
            this.base = base;
            this.limit = limit;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.limit = 256; //this.getLimit(0);
            //_MemoryManager.pidList.length - 1]
        };
        Cpu.prototype.getLimit = function (pid) {
            var index; //= _MemoryManager.memIndex(pid);
            if (index == 0) {
                this.limit = 256;
                return 256;
            }
            else if (index == 1) {
                this.limit = 512;
                return 512;
            }
            else if (index == 2) {
                this.limit = 768;
                return 768;
            }
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            if (this.isExecuting) {
                //this.updateCPU();
                _PCB.state = "Running";
                // get memory block loc for the op 
                var index = _MemoryManager.memIndex(this.PID);
                // array of op codes 
                var op = _MemoryManager.getOp(index);
                this.runCode(op);
            }
        };
        Cpu.prototype.runCode = function (op) {
            var i = this.PC;
            //if(this.PC + 1 >= op.length){
            //this.endProgram(this.PID);
            // }else{
            console.log(op[this.PID][i]);
            if (op[this.PID][i] == 'A9') {
                this.loadAccumulator(op[this.PID][i + 1]);
                this.PC += 2;
            }
            else if (op[this.PID][i] == 'AD') {
                var loc = _MemoryManager.endianAddress(op[this.PID][i + 1], op[this.PID][i + 2]);
                loc += this.base;
                this.loadAccumulator(loc);
                this.PC += 3;
            }
            else if (op[this.PID][i] == 'A2') {
                this.loadXReg(op[this.PID][i + 1]);
                this.PC += 2;
            }
            else if (op[this.PID][i] == 'A0') {
                this.loadYReg(op[this.PID][i + 1]);
                this.PC += 2;
            }
            else if (op[this.PID][i] == '8D') {
                var loc = _MemoryManager.endianAddress(op[this.PID][i + 1], op[this.PID][i + 2]);
                loc += this.base;
                this.storeAcc(loc);
                this.PC += 3;
            }
            else if (op[this.PID][i] == 'AE') {
                var loc = _MemoryManager.endianAddress(op[this.PID][i + 1], op[this.PID][i + 2]);
                loc += this.base;
                this.loadXRegMem(loc);
                this.PC = 3;
            }
            else if (op[this.PID][i] == 'AC') {
                var loc = _MemoryManager.endianAddress(op[this.PID][i + 1], op[this.PID][i + 2]);
                loc += this.base;
                this.loadYRegMem(loc);
                this.PC += 3;
            }
            else if (op[this.PID][i] == '6D') {
                var loc = _MemoryManager.endianAddress(op[this.PID][i + 1], op[this.PID][i + 2]);
                loc += this.base;
                this.addCarry(loc);
                this.PC += 3;
            }
            else if (op[this.PID][i] == 'EC') {
                var loc = _MemoryManager.endianAddress(op[this.PID][i + 1], op[this.PID][i + 2]);
                loc += this.base;
                this.zFlag(loc);
                this.PC += 3;
            }
            else if (op[this.PID][i] == 'D0') {
                this.PC += 2;
                this.branchNotEqual(op[this.PID][i + 1], this.limit, op[this.PID]);
            }
            else if (op[this.PID][i] == 'FF') {
                _KernelInputQueue.enqueue(new TSOS.Interrupt(SYSTEM_CALL_IRQ, op)); // call interrupt
                this.systemCall();
                //this.PC += 1;
            }
            else if (op[this.PID][i] == 'EE') {
                var loc = _MemoryManager.endianAddress(op[this.PID][i + 1], op[this.PID][i + 2]);
                loc += this.base;
                this.PC += 3;
                this.incrementByte(loc);
            }
            else if (op[this.PID][i] == '00') {
                this.endProgram(this.PID);
            }
            TSOS.Control.updateProcessMem(this.PID);
            TSOS.Control.displayPCB();
            // }
        };
        Cpu.prototype.loadAccumulator = function (addr) {
            this.Acc = _MemoryManager.hexDecimal(addr);
            console.log("load acc mem " + addr);
            console.log("this acc from load acc " + this.Acc);
            this.IR = 'A9';
        };
        Cpu.prototype.loadAccMem = function (addr) {
            this.IR = 'AD';
            var a = _MemoryManager.getOp(this.PID);
            console.log(" get op from pid" + a);
            this.Acc = a[this.PID][addr];
            console.log("this acc mem " + this.Acc);
        };
        Cpu.prototype.loadXReg = function (addr) {
            this.IR = 'A2';
            console.log("load x reg " + addr);
            this.Xreg = _MemoryManager.hexDecimal(addr);
            console.log("xreg loaded imma kms " + this.Xreg);
        };
        Cpu.prototype.loadYReg = function (addr) {
            this.IR = 'A0';
            console.log("load y reg " + addr);
            this.Yreg = _MemoryManager.hexDecimal(addr);
            console.log("yreg loaded " + this.Yreg);
        };
        Cpu.prototype.storeAcc = function (addr) {
            this.IR = '8D'; // change IR
            console.log("load store acc " + addr);
            _MemoryManager.writeOpCode(this.Acc, addr);
        };
        Cpu.prototype.loadXRegMem = function (addr) {
            this.IR = 'AE'; // change the IR
            console.log(addr);
            var x = _MemoryManager.getOp(this.PID);
            console.log("load xregmem" + x);
            this.Xreg = x[this.PID][addr];
        };
        Cpu.prototype.loadYRegMem = function (addr) {
            this.IR = 'AC'; // change the IR 
            console.log("load y reg mem " + addr);
            var y = _MemoryManager.getOp(this.PID);
            console.log("load y reg mem y " + y);
            this.Yreg = y[this.PID][addr];
        };
        Cpu.prototype.addCarry = function (addr) {
            this.IR = '6D'; // change the IR
            var variable = _MemoryManager.getOp(this.PID);
            console.log("load y reg" + addr);
            console.log(variable[this.PID][addr]);
            var v = variable[this.PID][addr];
            this.Acc += parseInt(v);
        };
        Cpu.prototype.zFlag = function (addr) {
            this.IR = 'EC'; // change the IR
            var byte = _MemoryManager.getOp(this.PID);
            var b = byte[this.PID][addr];
            if (parseInt(b) != this.Xreg) {
                this.Zflag = 0; // change z flag if not equal
            }
            else {
                this.Zflag = 1; // change z flag
            }
        };
        Cpu.prototype.branchNotEqual = function (oper, lim, op) {
            var dist = _MemoryManager.hexDecimal(oper);
            var base = 0;
            if (this.Zflag == 0) {
                if (this.PC + dist + base > lim) {
                    //this.PC = (this.PC + dist + base) - lim + 2;
                    this.IR = op[this.PC]; // changing the IR
                }
                else {
                    //this.PC = this.PC + dist + 2;
                    this.IR = op[this.PC]; // changing the IR
                }
            }
            else {
                this.PC += 2;
                this.IR = 'D0';
            }
        };
        Cpu.prototype.systemCall = function () {
            if (this.Xreg == 1) {
                this.IR = 'FF';
                this.PC += 1;
                _StdOut.putText(this.Yreg + "");
                console.log("yreg from system call " + this.Yreg);
                _Console.advanceLine();
            }
            else if (this.Xreg == 2) {
                var term = false;
                var loc = this.Yreg + this.base;
                var str = "";
                while (!term) {
                    var char = _MemoryManager.getOp(this.PID);
                    var c = char[this.PID][loc];
                    if (c == 0) {
                        term = true;
                        break;
                    }
                    else {
                        str += String.fromCharCode(_MemoryManager.hexDecimal(c));
                        loc++;
                    }
                }
                _StdOut.putText(str);
                _Console.advanceLine();
                this.PC += 1;
                this.IR = 'FF';
            }
        };
        Cpu.prototype.incrementByte = function (loc) {
            this.IR = 'EE';
            var b = _MemoryManager.getOp(this.PID);
            var bb = b[this.PID][loc];
            _MemoryManager.writeOpCode(_MemoryManager.hexDecimal(bb + 1), loc);
        };
        Cpu.prototype.endProgram = function (args) {
            var table = document.getElementById("pcbTable");
            table.getElementsByTagName("tr")[1].getElementsByTagName("td")[2].innerHTML = '00';
            //_MemoryManager.clearBlock(this.PID);
            _MemoryManager.executePid.push(this.PID);
            _StdOut.putText("PID: " + this.PID + " done running. " + "Turn around time: " + _cpuScheduler.turnAroundTime);
            _Console.advanceLine();
            this.PC = 0;
            if (_cpuScheduler.count != _cpuScheduler.quantum) {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, args));
            }
            if (!_cpuScheduler.RR && !_cpuScheduler.fcfs) {
                this.isExecuting = false;
                _cpuScheduler.turnAroundTime = 0;
                _Console.putText(_OsShell.promptStr);
            }
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
