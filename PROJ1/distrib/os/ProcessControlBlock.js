var TSOS;
(function (TSOS) {
    var ProcessControlBlock = /** @class */ (function () {
        function ProcessControlBlock(PC, Acc, X, Y, Z, base, limit, part, pid, IR, curState, prior, local, rowNum, state) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (X === void 0) { X = 0; }
            if (Y === void 0) { Y = 0; }
            if (Z === void 0) { Z = 0; }
            if (base === void 0) { base = 0; }
            if (limit === void 0) { limit = 0; }
            if (part === void 0) { part = 0; }
            if (pid === void 0) { pid = 0; }
            if (IR === void 0) { IR = ''; }
            if (curState === void 0) { curState = 0; }
            if (prior === void 0) { prior = 0; }
            if (local === void 0) { local = 0; }
            if (rowNum === void 0) { rowNum = 0; }
            if (state === void 0) { state = ''; }
            this.PC = PC;
            this.Acc = Acc;
            this.X = X;
            this.Y = Y;
            this.Z = Z;
            this.base = base;
            this.limit = limit;
            this.part = part;
            this.pid = pid;
            this.IR = IR;
            this.curState = curState;
            this.prior = prior;
            this.local = local;
            this.rowNum = rowNum;
            this.state = state;
            if (rowNum == void 0) {
                rowNum = 1;
            }
        }
        ProcessControlBlock.prototype.init = function (pid) {
            this.pid = pid;
        };
        ProcessControlBlock.prototype.pcbDisplay = function () {
            var table = document.getElementById("pcbTable");
            var rows;
            rows = table.getElementsByTagName("tr")[this.rowNum];
            rows.getElementsByTagName("td")[0].innerHTML = this.pid + '';
            rows.getElementsByTagName("td")[1].innerHTML = this.state;
            rows.getElementsByTagName("td")[2].innerHTML = (this.PC + this.base) + '';
            rows.getElementsByTagName("td")[3].innerHTML = this.Acc + '';
            rows.getElementsByTagName("td")[4].innerHTML = this.IR;
            rows.getElementsByTagName("td")[5].innerHTML = this.X + '';
            rows.getElementsByTagName("td")[6].innerHTML = this.Y + '';
            rows.getElementsByTagName("td")[7].innerHTML = this.Z + '';
            rows.getElementsByTagName("td")[8].innerHTML = 'Memory';
        };
        ProcessControlBlock.prototype.insertPCBRows = function () {
            var table = document.getElementById("pcbTable");
            var rows = table.insertRow(this.rowNum);
            var cell1 = rows.insertCell(0);
            var cell2 = rows.insertCell(1);
            var cell3 = rows.insertCell(2);
            var cell4 = rows.insertCell(3);
            var cell5 = rows.insertCell(4);
            var cell6 = rows.insertCell(5);
            var cell7 = rows.insertCell(6);
            var cell8 = rows.insertCell(7);
            var cell9 = rows.insertCell(8);
            cell1.innerHTML = _PCB.pid + '';
            cell2.innerHTML = _PCB.state;
            cell3.innerHTML = _PCB.PC + '';
            cell4.innerHTML = _PCB.Acc + '';
            cell5.innerHTML = _PCB.IR;
            cell6.innerHTML = _PCB.X + '';
            cell7.innerHTML = _PCB.Y + '';
            cell8.innerHTML = _PCB.Z + '';
            cell9.innerHTML = 'Memory';
        };
        ProcessControlBlock.prototype.clearPCB = function () {
            // clearPCB terminates the cpu scheduler process
            this.state = 'TERMINATED';
            var table = document.getElementById("pcbTable");
            table.deleteRow(this.rowNum);
            if (_processManager.RR) {
                _processManager.unIncRowNum();
            }
        };
        ProcessControlBlock.prototype.getPID = function () {
            this.pid = _CPU.PID;
            return _CPU.PID;
        };
        ProcessControlBlock.prototype.getPC = function () {
            this.PC = _CPU.PC;
            return _CPU.PC;
        };
        ProcessControlBlock.prototype.getAcc = function () {
            this.Acc = _CPU.Acc;
            return _CPU.Acc;
        };
        ProcessControlBlock.prototype.getIR = function (IR) {
            this.IR = _CPU.IR;
        };
        ProcessControlBlock.prototype.getX = function () {
            this.X = _CPU.Xreg;
            return _CPU.Xreg;
        };
        ProcessControlBlock.prototype.getY = function () {
            this.Y = _CPU.Yreg;
            return _CPU.Yreg;
        };
        ProcessControlBlock.prototype.getZ = function () {
            this.Z = _CPU.Zflag;
            return _CPU.Zflag;
        };
        ProcessControlBlock.prototype.getBase = function (pid) {
            var index = _MemoryManager.memIndex(pid);
            if (index == 0) {
                this.base = 0;
                return 0;
            }
            else if (index == 1) {
                this.base = 256;
                return 256;
            }
        };
        ProcessControlBlock.prototype.getLimit = function (pid) {
            var index = _MemoryManager.memIndex(pid);
            if (index == 0) {
                this.limit = 256;
                return 256;
            }
        };
        ProcessControlBlock.prototype.getPart = function (pid) {
            var index = _MemoryManager.memIndex(pid);
            if (index == 0) {
                this.part = 1;
                return 1;
            }
        };
        return ProcessControlBlock;
    }());
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
