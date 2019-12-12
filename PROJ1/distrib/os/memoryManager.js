var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager(pidLoc, memoryUsed, pidList, opIndex, executePid, pidder) {
            if (pidLoc === void 0) { pidLoc = [-1, -1, -1]; }
            if (memoryUsed === void 0) { memoryUsed = [0, 0, 0]; }
            if (pidList === void 0) { pidList = []; }
            if (opIndex === void 0) { opIndex = 0; }
            if (executePid === void 0) { executePid = []; }
            if (pidder === void 0) { pidder = []; }
            this.pidLoc = pidLoc;
            this.memoryUsed = memoryUsed;
            this.pidList = pidList;
            this.opIndex = opIndex;
            this.executePid = executePid;
            this.pidder = pidder;
            if (pidList == void 0) {
                pidList = [];
            }
        }
        // clear all memory and displays 
        MemoryManager.prototype.clearAll = function () {
            this.memoryUsed = [0, 0, 0];
            this.pidLoc = [-1, -1, -1];
            _Memory.eraseAll();
            this.clearDisplay();
            // add all unexecuted PIDs to executed PIDs
            for (var i = 0; i < this.pidList.length; i++) {
                var pid = this.pidList[i]; // PID comparasion
                var counter = 0; // counter used to check if it has been executed or not 
                for (var x = 0; x < this.executePid.length; x++) {
                    if (pid != this.executePid[i]) {
                        counter++;
                    }
                }
                if (counter == this.executePid.length) {
                    this.executePid.push(pid);
                }
            }
        };
        // clear all display of memory blocks
        MemoryManager.prototype.clearDisplay = function () {
            var table = document.getElementById("processMemTable");
            for (var i = 0; i < 96; i++) {
                var row = table.getElementsByTagName("tr")[i];
                for (var x = 0; x < 9; x++) {
                    row.getElementsByTagName("td")[x].innerHTML = '00';
                }
            }
        };
        // converts to hex
        MemoryManager.prototype.hexDecimal = function (input) {
            return parseInt(input, 16);
        };
        // returns the correct memory block index
        MemoryManager.prototype.memIndex = function (PID) {
            for (var i = 0; i < this.pidLoc.length; i++) {
                if (this.pidLoc[i] == PID) {
                    return i;
                }
            }
        };
        /**
                // returns OP codes from memory
                public getVariable(index){
                    return _Memory.memory[_CPU.PID][index];
                }*/
        // returns OP codes from memory
        MemoryManager.prototype.getOp = function (index) {
            return _MemoryAccessor.read(index);
        };
        // writes operation codes to memory
        MemoryManager.prototype.writeOpCode = function (con, addr, pid) {
            var l = _PCB.getLimit(pid);
            var b = _PCB.getBase(pid);
            console.log(addr);
            // send error if the addr is greater than the limit or less than the base
            if (addr > l || addr < b) {
                _StdOut.putText("Cannot access that part of memory!");
            }
            else {
                // if the addr is within the base and limit save in mem
                _Memory.memory[addr] = con;
            }
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
        MemoryManager.prototype.pidReturn = function () {
            if (this.pidList[0] == null) {
                this.pidList.push(0);
            }
            else {
                this.pidList.push(this.pidList[this.pidList.length - 1] + 1);
            }
        };
        // write to memory in memory accessor 
        MemoryManager.prototype.writeToMemory = function (index, op) {
            // the index is the memory slot in mem
            // the op is the operations being written to memory
            _MemoryAccessor.write(index, op);
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
