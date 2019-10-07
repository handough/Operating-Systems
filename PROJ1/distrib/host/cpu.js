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
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting, IR, PID) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            if (IR === void 0) { IR = ''; }
            if (PID === void 0) { PID = 0; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.IR = IR;
            this.PID = PID;
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
            this.updateCPU();
            _PCB.state = "Running";
            var index = _MemoryManager.memIndex(this.PID);
            var op = _MemoryManager.getOp(index);
            this.executeCode(op);
        };
        Cpu.prototype.executeCode = function (op) {
            if (this.PC + 1 >= op.length) {
                this.endProgram();
            }
            else {
                var i = this.PC;
                if (op[i] == 'A9') {
                    this.loadAccumulator(op[i + 1]);
                }
                else if (op[i] == 'AD') {
                    var loc = _MemoryManager.endianAddress(op[i + 1], op[i + 2]);
                    loc += _PCB.base;
                    this.loadAccMem(loc);
                }
                else if (op[i] == 'A2') {
                    this.loadXReg(op[i + 1]);
                }
                else if (op[i] == 'A0') {
                    this.loadYReg(op[i + 1]);
                }
                else if (op[i] == '8D') {
                    var loc = _MemoryManager.endianAddress(op[i + 1], op[i + 2]);
                    loc += _PCB.base;
                    this.storeAcc(loc);
                }
                else if (op[i] == 'AE') {
                    var loc = _MemoryManager.endianAddress(op[i + 1], op[i + 2]);
                    loc += _PCB.base;
                    this.loadXReg(loc);
                }
                else if (op[i] == 'AC') {
                    var loc = _MemoryManager.endianAddress(op[i + 1], op[i + 2]);
                    loc += _PCB.base;
                    this.loadYReg(loc);
                }
                else if (op[i] == '6D') {
                    var loc = _MemoryManager.endianAddress(op[i + 1], op[i + 2]);
                    loc += _PCB.base;
                    this.addCarry(loc);
                }
                else if (op[i] == 'EC') {
                    var loc = _MemoryManager.endianAddress(op[i + 1], op[i + 2]);
                    loc += _PCB.base;
                    this.zFlag(loc);
                }
                else if (op[i] == 'D0') {
                    this.branchNotEqual(op[i + 1], _PCB.limit, op);
                }
                else if (op[i] == 'FF') {
                    //_KernelInterruptQueue.enqueue(new TSOS.Interrupt(irq, ''));
                    this.systemCall();
                }
                else if (op[i] == 'EE') {
                    var loc = _MemoryManager.endianAddress(op[i + 1], op[i + 2]);
                    loc += _PCB.base;
                    this.incrementByte(loc);
                }
                else if (op[i] == '00') {
                    this.endProgram();
                }
                if (_PCB.state != "TERMINATED") {
                    _PCB.pcbDisplay();
                }
                _MemoryManager.updateBlock(_PCB.pid);
                _PCB.getIR(op[i]);
                this.updateCPU();
                this.displayCPU();
            }
        };
        Cpu.prototype.loadAccumulator = function (loc) {
            _PCB.PC += 2;
            _PCB.IR = 'A9';
            _PCB.Acc = _MemoryManager.hexDecimal(loc);
        };
        Cpu.prototype.loadAccMem = function (loc) {
            _PCB.PC += 3;
            _PCB.IR = 'AD';
            _PCB.Acc = _MemoryManager.getVar(loc);
        };
        Cpu.prototype.loadXReg = function (loc) {
            _PCB.PC += 2;
            _PCB.IR = 'A2';
            _PCB.Acc = _MemoryManager.hexDecimal(loc);
        };
        Cpu.prototype.loadYReg = function (memLoc) {
            _PCB.PC += 3;
            _PCB.IR = '8D';
            _MemoryManager.writeOpCode(_PCB.Acc, memLoc);
        };
        Cpu.prototype.storeAcc = function (loc) {
            _PCB.PC += 2;
            _PCB.IR = 'A2';
            _PCB.Acc = _MemoryManager.hexDecimal(loc);
        };
        Cpu.prototype.loadXRegMem = function (loc) {
            _PCB.PC += 3;
            _PCB.IR = 'AE';
            _PCB.X = _MemoryManager.getVar(loc);
        };
        Cpu.prototype.loadYRegMem = function (loc) {
            _PCB.PC += 3;
            _PCB.IR = 'AC';
            _PCB.Y = _MemoryManager.getVar(loc);
        };
        Cpu.prototype.addCarry = function (loc) {
            _PCB.PC += 3;
            _PCB.IR = '6D';
            var variable = _MemoryManager.getVar(loc);
            _PCB.Acc += parseInt(variable);
        };
        Cpu.prototype.zFlag = function (loc) {
            _PCB.PC += 3;
            _PCB.IR = 'EC';
            var byte = _MemoryManager.getVar(loc);
            if (parseInt(byte) != _PCB.X) {
                _PCB.Z = 0;
            }
            else {
                _PCB.Z = 1;
            }
        };
        Cpu.prototype.branchNotEqual = function (lim, op, dist) {
            var dist = _MemoryManager.hexDecimal(dist);
            var base = _PCB.base;
            if (_PCB.Z == 0) {
                if (_PCB.PC + dist + base > lim) {
                    _PCB.PC = (_PCB.PC + dist + base) - lim + 2;
                    _PCB.IR = op[_PCB.PC]; // changing the IR
                }
                else {
                    _PCB.PC = _PCB.PC + dist + 2;
                    _PCB.IR = op[_PCB.PC]; // changing the IR
                }
            }
            else {
                _PCB.PC += 2;
                _PCB.IR = 'D0';
            }
        };
        Cpu.prototype.systemCall = function () {
            if (_PCB.X == 1) {
                _PCB.PC += 1;
                _PCB.IR = 'FF';
                _StdOut.putText(_PCB.Y + "");
                _Console.advanceLine();
            }
            else if (_PCB.X == 2) {
                var term = false;
                var loc = +_PCB.Y + _PCB.base;
                var str = "";
                while (!term) {
                    var char = _MemoryManager.getVariable(loc);
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
                _PCB.PC += 1;
                _PCB.IR = 'FF';
            }
        };
        Cpu.prototype.incrementByte = function (loc) {
            _PCB.PC += 3;
            _PCB.IR = 'EE';
            var b = _MemoryManager.getVar(loc);
            _MemoryManager.writeOpCode(_MemoryManager.hexDecimal(b + 1), loc);
        };
        Cpu.prototype.endProgram = function () {
            var table = document.getElementById("cpuTable");
            table.getElementsByTagName("tr")[1].getElementsByTagName("td")[2].innerHTML = '00';
            _MemoryManager.clearBlock(this.PID);
            _MemoryManager.executePid.push(this.PID);
            _StdOut.putText("PID: " + this.PID + " done.");
            _Console.advanceLine();
            _PCB.clearPCB();
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
        Cpu.prototype.displayCPU = function () {
            var table = "";
            table += "<td>" + (this.PC + _PCB.base) + "</td>";
            table += "<td>" + this.Acc + "</td>";
            table += "<td>" + this.IR + "</td>";
            table += "<td>" + this.Xreg + "</td>";
            table += "<td>" + this.Yreg + "</td>";
            table += "<td>" + this.Zflag + "</td>";
            document.getElementById("cpuTableBody").innerHTML = table;
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
