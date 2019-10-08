var TSOS;
(function (TSOS) {
    var ProcessControlBlock = /** @class */ (function () {
        function ProcessControlBlock(PC, Acc, X, Y, Z, base, limit, pid, IR, rowNum, state, clockTicks) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (X === void 0) { X = 0; }
            if (Y === void 0) { Y = 0; }
            if (Z === void 0) { Z = 0; }
            if (base === void 0) { base = 0; }
            if (limit === void 0) { limit = 0; }
            if (pid === void 0) { pid = 0; }
            if (IR === void 0) { IR = ''; }
            if (rowNum === void 0) { rowNum = 0; }
            if (state === void 0) { state = "Running"; }
            if (clockTicks === void 0) { clockTicks = 0; }
            this.PC = PC;
            this.Acc = Acc;
            this.X = X;
            this.Y = Y;
            this.Z = Z;
            this.base = base;
            this.limit = limit;
            this.pid = pid;
            this.IR = IR;
            this.rowNum = rowNum;
            this.state = state;
            this.clockTicks = clockTicks;
            if (rowNum == void 0) {
                rowNum = 1;
            }
        }
        ProcessControlBlock.prototype.init = function (pid) {
            this.pid = pid;
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
            return _CPU.IR;
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
        };
        ProcessControlBlock.prototype.getLimit = function (pid) {
            var index = _MemoryManager.memIndex(pid);
            if (index == 0) {
                this.limit = 256;
                return 256;
            }
        };
        return ProcessControlBlock;
    }());
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
