var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager(mem, pid, pidList, opIndex, executePid) {
            if (mem === void 0) { mem = [0, 0, 0]; }
            if (pid === void 0) { pid = [-1, -1, -1]; }
            if (pidList === void 0) { pidList = []; }
            if (opIndex === void 0) { opIndex = 0; }
            if (executePid === void 0) { executePid = []; }
            this.mem = mem;
            this.pid = pid;
            this.pidList = pidList;
            this.opIndex = opIndex;
            this.executePid = executePid;
        }
        MemoryManager.prototype.clear = function () {
            this.mem = [0, 0, 0];
            this.pid = [-1, -1, -1];
            _Memory.eraseAll();
            this.clearDisplay();
            for (var i = 0; i < this.pid.length; i++) {
                var pid = this.pid[i]; // comparing the pids
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
        MemoryManager.prototype.displayBlock = function (op) {
            // change process
            var table = document.getElementById("processMemTable");
            var count = 0; // spot for 3 segments of memory
            var index = -1;
            for (var i = 0; i < this.mem.length; i++) {
                if (this.mem[i] == 0) {
                    if (i == 0) {
                        index = i;
                        var opCount = 0;
                        for (var j = 0; j <= 32; j++) {
                            var row = table.getElementsByTagName("tr")[j];
                            for (var x = 0; x < 9; x++) {
                                if (opCount + 2 > op.length) {
                                    row.getElementsByTagName("td")[x].innerHTML = '0';
                                }
                                else {
                                    if (j == 0) {
                                        for (var i = 0; i <= 256; i += 8) {
                                            var rows = table.getElementsByTagName("tr")[i];
                                            var cell = 0;
                                            var cell1 = rows.insertCell(1);
                                            var hexRow = i.toString(16);
                                            if (i != 0) {
                                                cell1.innerHTML = "0x";
                                                if (hexRow.length == 1) {
                                                    cell1.innerHTML += "00" + hexRow;
                                                }
                                                else if (hexRow.length == 2) {
                                                    cell1.innerHTML += "0" + hexRow;
                                                }
                                                else {
                                                    cell1.innerHTML += hexRow;
                                                }
                                            }
                                            var opCounts = 0;
                                            for (var j = 0; j <= 256; j++) {
                                                var rowss = table.getElementsByTagName("tr")[j];
                                                for (var x = 0; x < 8; x++) {
                                                    rowss.getElementsByTagName("td")[x + 1].innerHTML = op.substring(opCounts, opCounts + 2);
                                                    opCounts += 3;
                                                }
                                            }
                                            cell++;
                                        }
                                    }
                                }
                            }
                        }
                        this.mem[0] = 1; // first segment of memory used 
                    }
                    break;
                }
                else {
                    count = count + 1;
                }
            }
            return index;
        };
        MemoryManager.prototype.clearBlock = function (pID) {
            var index = -1;
            for (var i = 0; i < this.pid.length; i++) {
                if (this.pid[i] == pID) {
                    var table = document.getElementById("processMemTable");
                    if (i == 0) {
                        this.pid[0] = -1;
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
            for (var i = 0; i < this.pid.length; i++) {
                if (this.pid[i] == PID) {
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
            return _Memory.read(index);
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
            _Memory.write(index, op);
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
