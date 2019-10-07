var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager(newPID, pidList, opIndex, executePid) {
            if (newPID === void 0) { newPID = 0; }
            if (pidList === void 0) { pidList = []; }
            if (opIndex === void 0) { opIndex = 0; }
            if (executePid === void 0) { executePid = []; }
            this.newPID = newPID;
            this.pidList = pidList;
            this.opIndex = opIndex;
            this.executePid = executePid;
        }
        MemoryManager.prototype.clear = function () {
            _Memory.eraseAll();
            this.clearDisplay();
            for (var i = 0; i < this.pidList.length; i++) {
                var pid = this.pidList[i]; // comparing the pids
                var count = 0;
                for (var x = 0; x < this.executePid.length; x++) {
                    if (pid != this.executePid[i]) {
                        count++;
                    }
                }
                if (count = this.executePid.length) {
                    this.executePid.push(pid);
                }
            }
        };
        MemoryManager.prototype.clearBlock = function (pID) {
            var index = -1;
            for (var i = 0; i < this.pidList.length; i++) {
                if (this.pidList[i] == pID) {
                    var table = document.getElementById("processMemTable");
                    if (i == 0) {
                        this.pidList[0] = -1;
                        index = 0;
                        for (var i = 0; i < 32; i++) {
                            var row = table.getElementsByTagName("tr")[i];
                            for (var x = 0; x < 9; x++) {
                                row.getElementsByTagName("td")[x].innerHTML = '0';
                            }
                        }
                    }
                }
            }
            _Memory.eraseBlock(index); // erase memory
        };
        MemoryManager.prototype.updateBlock = function (pid) {
            var memIndex = this.memIndex(pid);
            var opIndex = 0;
            var table = document.getElementById("processMemTable");
            if (memIndex == 0) {
                for (var i = 0; i < 32; i++) {
                    var row = table.getElementsByTagName("tr")[i];
                    for (var x = 0; x < 9; x++) {
                        row.getElementsByTagName("td")[x].innerHTML = this.getVar(opIndex);
                        opIndex++;
                    }
                }
            }
        };
        MemoryManager.prototype.clearDisplay = function () {
            var table = document.getElementById("processMemTable");
            for (var i = 0; i < 96; i++) {
                var row = table.getElementsByTagName("tr")[i];
                for (var x = 0; x < 9; x++) {
                    row.getElementsByTagName("td")[x].innerHTML = '00';
                }
            }
        };
        MemoryManager.prototype.hexDecimal = function (input) {
            return parseInt(input, 16);
        };
        MemoryManager.prototype.memIndex = function (PID) {
            for (var i = 0; i < this.pidList.length; i++) {
                if (this.pidList[i] == PID) {
                    PID++;
                    return i;
                }
            }
        };
        MemoryManager.prototype.getVar = function (location) {
            if ((location > _PCB.limit || location < _PCB.base)) {
                _StdOut.putText("Memory violation");
            }
            else {
                return _Memory.memory[location];
            }
        };
        MemoryManager.prototype.getOp = function (index) {
            return _MemoryAccessor.read(index);
        };
        MemoryManager.prototype.writeOpCode = function (constant, addr) {
            if (addr > _PCB.limit || addr < _PCB.base) {
                _StdOut.putText("Memory violation");
            }
            else {
                _Memory.memory[addr] = constant;
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
        MemoryManager.prototype.incPID = function (newPID) {
            return newPID++;
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
