var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager(PID, pidList, opIndex, executePid) {
            if (PID === void 0) { PID = -1; }
            if (pidList === void 0) { pidList = []; }
            if (opIndex === void 0) { opIndex = 0; }
            if (executePid === void 0) { executePid = []; }
            this.PID = PID;
            this.pidList = pidList;
            this.opIndex = opIndex;
            this.executePid = executePid;
        }
        // converts to hex
        MemoryManager.prototype.hexDecimal = function (input) {
            return parseInt(input, 16);
        };
        // updates the current PID
        MemoryManager.prototype.memIndex = function () {
            if (this.PID < 3) {
                this.pidList.push(this.PID);
            }
            this.PID++;
            return this.PID;
        };
        MemoryManager.prototype.getOp = function (index) {
            return _MemoryAccessor.read(index);
        };
        // writes operation codes to memory
        MemoryManager.prototype.writeOpCode = function (con, addr) {
            if (addr > _PCB.limit || addr < _PCB.base) {
                _StdOut.putText("cannot access that memory!");
            }
            else {
                _Memory.memory[addr] = con;
            }
        };
        // write memory from the memory manager
        MemoryManager.prototype.writeMem = function (index, op) {
            _MemoryAccessor.write(index, op);
        };
        MemoryManager.prototype.endianAddress = function (addrB, addrE) {
            if (addrB == '00' && addrE == '00') {
                return 0;
            }
            var addr = 0;
            var str = '';
            if (addrE == '00' && addrB != '00') {
                str += addrB;
            }
            else {
                str += addrE;
                str += addrB;
            }
            addr = this.hexDecimal(str);
            return addr;
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
