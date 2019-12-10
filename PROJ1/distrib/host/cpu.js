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
            //if(this.isExecuting){
            //this.updateCPU();
            _PCB.state = "Running";
            // get memory block loc for the op 
            var index = _MemoryManager.memIndex(this.PID);
            // array of op codes 
            var op = _MemoryManager.getOp(index);
            this.runCode(op);
            //}
        };
        Cpu.prototype.runCode = function (op) {
            var i = this.PC;
            //if(this.PC + 1 >= op[this.PID].length){
            //this.endProgram(this.PID);
            //}else{
            //console.log(op[this.PID][14])
            if (op[this.PID][i] == 'A9') {
                this.loadAccumulator(op[this.PID][i + 1]);
                this.PC += 2;
                console.log(this.PC);
            }
            else if (op[this.PID][i] == 'AD') {
                var loc = _MemoryManager.endianAddress(op[this.PID][i + 1], op[this.PID][i + 2]);
                loc += _PCB.base;
                this.loadAccMem(loc);
                //this.loadAccumulator(loc);
                this.PC += 3;
            }
            else if (op[this.PID][i] == 'A2') {
                this.loadXReg(op[this.PID][i + 1]);
                this.PC += 2;
                console.log(this.PC);
            }
            else if (op[this.PID][i] == 'A0') {
                this.loadYReg(op[this.PID][i + 1]);
                this.PC += 2;
            }
            else if (op[this.PID][i] == '8D') {
                var loc = _MemoryManager.endianAddress(op[this.PID][i + 1], op[this.PID][i + 2]);
                loc += _PCB.base;
                this.storeAcc(loc);
                console.log(loc);
                this.PC += 3;
            }
            else if (op[this.PID][i] == 'AE') {
                var loc = _MemoryManager.endianAddress(op[this.PID][i + 1], op[this.PID][i + 2]);
                loc += _PCB.base;
                this.loadXRegMem(loc);
                this.PC += 3;
            }
            else if (op[this.PID][i] == 'AC') {
                var loc = _MemoryManager.endianAddress(op[this.PID][i + 1], op[this.PID][i + 2]);
                loc += _PCB.base;
                this.loadYRegMem(loc);
                this.PC += 3;
                console.log(this.PC);
            }
            else if (op[this.PID][i] == '6D') {
                var loc = _MemoryManager.endianAddress(op[this.PID][i + 1], op[this.PID][i + 2]);
                loc += _PCB.base;
                this.addCarry(loc);
                this.PC += 3;
                console.log(this.PC);
            }
            else if (op[this.PID][i] == 'EC') {
                var loc = _MemoryManager.endianAddress(op[this.PID][i + 1], op[this.PID][i + 2]);
                loc += _PCB.base; // base will be 0, 256, 512
                this.zFlag(loc); // calling zflag to compare the bytes
                this.PC += 3; // add to program counter
            }
            else if (op[this.PID][i] == 'D0') {
                console.log(op[this.PID][i + 1]);
                this.branchNotEqual(op[this.PID][i + 1], _PCB.limit, op[this.PID]);
                //this.PC += 2;
            }
            else if (op[this.PID][i] == 'FF') {
                console.log(this.PC);
                _KernelInputQueue.enqueue(new TSOS.Interrupt(SYSTEM_CALL_IRQ, op)); // call interrupt
                this.systemCall();
            }
            else if (op[this.PID][i] == 'EE') {
                var loc = _MemoryManager.endianAddress(op[this.PID][i + 1], op[this.PID][i + 2]);
                loc += _PCB.base;
                this.incrementByte(loc);
                this.PC += 3;
            }
            else if (op[this.PID][i] == '00') {
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
        };
        Cpu.prototype.loadAccumulator = function (addr) {
            //this.PC += 2;
            // load the accumulator with the translated op code
            this.Acc = _MemoryManager.hexDecimal(addr);
            console.log(this.Acc + " load acc");
            console.log(this.PC);
            this.IR = 'A9'; // change the IR
        };
        Cpu.prototype.loadAccMem = function (addr) {
            //this.PC += 3;
            this.IR = 'AD'; // change the IR
            var a = _MemoryManager.getOp(this.PID); // getting array of op codes
            this.Acc = a[this.PID][addr]; // setting the accumulator to opcode
        };
        Cpu.prototype.loadXReg = function (addr) {
            //this.PC += 2;
            this.IR = 'A2'; // change the IR
            this.Xreg = _MemoryManager.hexDecimal(addr);
            console.log(this.Xreg + " load x reg");
            console.log(this.PC);
        };
        Cpu.prototype.loadYReg = function (addr) {
            ///this.PC += 2;
            this.IR = 'A0'; // change the IR
            this.Yreg = _MemoryManager.hexDecimal(addr);
            console.log(this.Yreg + ' load y reg');
            console.log(this.PC);
        };
        Cpu.prototype.storeAcc = function (addr) {
            console.log(addr);
            //this.PC += 3;
            this.IR = '8D'; // change IR
            // writing op code 
            _MemoryManager.writeOpCode(this.Acc, addr);
        };
        Cpu.prototype.loadXRegMem = function (addr) {
            //this.PC += 3; 
            this.IR = 'AE'; // change the IR
            var x = _MemoryManager.getOp(this.PID);
            var xee = x[this.PID][addr];
            this.Xreg = xee;
        };
        Cpu.prototype.loadYRegMem = function (addr) {
            //this.PC += 3;
            this.IR = 'AC'; // change the IR 
            var y = _MemoryManager.getOp(this.PID);
            var yee = parseInt(y[this.PID][addr]);
            this.Yreg = yee;
            console.log(this.Yreg + ' load yregmem');
        };
        Cpu.prototype.addCarry = function (addr) {
            //this.PC += 3; // add to program counter
            this.IR = '6D'; // change the IR
            var variable = _MemoryManager.getOp(this.PID);
            var v = variable[this.PID][addr];
            console.log(v + ' addddd carrrtttttyyyy');
            this.Acc += parseInt(v);
            console.log(this.Acc + ' add carry ');
            //console.log(this.PC)
        };
        Cpu.prototype.zFlag = function (addr) {
            /**
            this.PC += 3; // add to program counter
            this.IR = 'EC'; // change the IR
            var byte = _MemoryManager.getOp(this.PID); // returns array of op codes
            var b = byte[this.PID][addr]; // gets individual byte from mem array(byte)
            var addy = parseInt(b, 16);
            //var yaddy = parseInt(this.Xreg.toString(), 16);
            //console.log(addy + ' '+yaddy + ' the addy being compared');
            if(addy == this.Xreg){
                this.Zflag = 1; // change z flag if not equal
            }else{
                this.Zflag = 0; // change z flag if the byte from the mem array is = to Xreg
            }*/
            console.log(addr);
            this.IR = 'EC'; // change the IR
            var byte = _MemoryManager.getOp(this.PID);
            var bs = byte[this.PID][addr];
            console.log(bs);
            var b = parseInt(bs, 16);
            console.log(b);
            console.log(this.Xreg);
            if (b == this.Xreg) {
                this.Zflag = 1; // change z flag if not equal
            }
            else {
                this.Zflag = 0; // change z flag
            }
            console.log(this.PC);
        };
        Cpu.prototype.branchNotEqual = function (oper, lim, op) {
            //oper, opList
            /**
            // dist is the translated individual op code
            var dist = _MemoryManager.hexDecimal(oper);
            console.log(dist);
            if(this.Zflag == 0){
                this.PC = this.PC + dist + 2;
                console.log(this.PC + ' greater than lim');
                this.IR = opList[this.PC]; // changing the IR
                if(this.PC >= 256){//opList.length){
                    this.PC = this.PC - 256;
                }else{
                    this.PC = this.PC;
                }
            }else{
                this.PC += 2;
                this.IR = 'D0';
            }*/
            console.log(this.PC);
            console.log(oper);
            var dist = _MemoryManager.hexDecimal(oper);
            console.log(dist);
            console.log(this.PC);
            var base = 0;
            if (this.Zflag == 0) {
                if (this.PC + dist + base > 256) {
                    this.PC = (this.PC + dist) - 255 + 1;
                    console.log(this.PC);
                    this.IR = op[this.PC]; // changing the IR
                }
                else {
                    this.PC = this.PC + 2;
                    console.log(this.PC);
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
                this.PC += 1;
                this.IR = 'FF';
                _StdOut.putText(this.Yreg + "");
                _Console.advanceLine();
            }
            else if (this.Xreg == 2) {
                var term = false;
                var loc = this.Yreg; //+ _PCB.base; 
                console.log(loc);
                var str = "";
                while (!term) {
                    var char = _MemoryManager.getOp(this.PID);
                    console.log(char[this.PID]);
                    var c = char[this.PID][loc];
                    console.log(c);
                    if (c == 0) {
                        term = true;
                        break;
                    }
                    else {
                        str += String.fromCharCode(_MemoryManager.hexDecimal(c));
                        console.log(str);
                        loc++;
                    }
                }
                _StdOut.putText(str);
                _Console.advanceLine();
                this.PC += 1;
                this.IR = 'FF';
                console.log(this.PC);
            }
        };
        Cpu.prototype.incrementByte = function (loc) {
            //this.PC += 3;
            this.IR = 'EE';
            var b = _MemoryManager.getOp(this.PID);
            var bb = b[this.PID][loc];
            console.log(_MemoryManager.writeOpCode(_MemoryManager.hexDecimal(bb + 1), loc));
            _MemoryManager.writeOpCode(_MemoryManager.hexDecimal(bb + 1), loc);
        };
        Cpu.prototype.endProgram = function (args) {
            var table = document.getElementById("pcbTable");
            table.getElementsByTagName("tr")[1].getElementsByTagName("td")[2].innerHTML = '00';
            TSOS.Control.clearBlock(this.PID);
            _MemoryManager.executePid.push(this.PID);
            _StdOut.putText("PID: " + this.PID + " done running. " + "Turn around time: " + _cpuScheduler.turnAroundTime);
            _Console.advanceLine();
            this.PC = 0;
            //this.PID++;
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
