var TSOS;
(function (TSOS) {
    var CpuScheduler = /** @class */ (function () {
        function CpuScheduler(quantum, residentList, count, readyQueue, turnAroundTime, RR) {
            if (quantum === void 0) { quantum = 0; }
            if (residentList === void 0) { residentList = []; }
            if (count === void 0) { count = 0; }
            if (turnAroundTime === void 0) { turnAroundTime = 0; }
            if (RR === void 0) { RR = false; }
            this.quantum = quantum;
            this.residentList = residentList;
            this.count = count;
            this.readyQueue = readyQueue;
            this.turnAroundTime = turnAroundTime;
            this.RR = RR;
            if (quantum == void 0) {
                quantum = 6;
            }
            if (residentList == void 0) {
                residentList = [];
            }
        }
        CpuScheduler.prototype.init = function () {
            this.quantum = 6;
            this.residentList = 0;
            this.count = 1;
            this.turnAroundTime = 0;
            this.RR = false;
        };
        CpuScheduler.prototype.clearMem = function () {
            // create new array to clear memory
            this.readyQueue.q = new Array();
            // reset the count to one
            this.count = 1;
        };
        CpuScheduler.prototype.contextSwitch = function () {
            if (this.RR) {
                if (this.readyQueue.isEmpty()) { // if the ready queue is empty set is executing to false
                    _CPU.isExecuting = false; // if is executing is false the turnaround time is set to 0
                    this.turnAroundTime = 0;
                    this.clearMem();
                }
                else {
                    if (_PCB.state != "TERMINATED") {
                        _PCB.state = "Ready";
                        // _PCB.displayPCB();
                        this.readyQueue.enqueue(_PCB);
                    }
                    _PCB = this.readyQueue.dequeue();
                    _PCB.state = "Running";
                    if (_PCB.inHDD) {
                        _Kernel.krnSwap();
                    }
                }
            }
        };
        CpuScheduler.prototype.loadReadyQueue = function () {
            var rowCounter = 1; // keeps track of the row the PCB is being displayed in ready queue
            for (var i = 0; i < this.residentList.length; i++) {
                if (this.residentList[i].state != "TERMINATED") {
                    this.residentList[i].rowNum = 1;
                    this.readyQueue.enqueue(this.residentList[i]);
                    rowCounter++; // increment row counter for each loop
                }
            }
            _PCB = this.readyQueue.dequeue();
            _PCB.state = "Running"; // set PCB state to running 
            if (_PCB.inHDD) {
                _Kernel.krnSwap();
            }
        };
        CpuScheduler.prototype.sortReadyQueue = function () {
            var PCBB = [];
            var fixLen = this.readyQueue.getSize();
            // dequeue the ready queue into an array
            for (var i = 0; i < fixLen; i++) {
                var PCBBB = this.readyQueue.dequeue();
                PCBB.push(PCBBB);
            }
            var sortPCB = [];
            // changing row number to display the sorted PCBs
            for (var j = 0; j < sortPCB.length; j++) {
                sortPCB[j][0].rowNum = i + 1;
            }
            for (var i = 0; i < sortPCB.length; i++) {
                this.readyQueue.enqueue(sortPCB[i[0]]);
            }
        };
        CpuScheduler.prototype.checkCount = function (params) {
            if (this.count < this.quantum) {
                this.count++;
            }
            else {
                this.count = 1;
                _KernelInputQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, params));
            }
        };
        CpuScheduler.prototype.deIncrementRowNum = function () {
            for (var i = 0; i < this.readyQueue.getSize(); i++) {
                if (this.readyQueue.q[i].rowNum > 1) {
                    this.readyQueue.q[i].rowNum -= 1;
                }
            }
            if (_CPU.PID > 1) {
                _PCB.rowNum -= 1;
            }
        };
        return CpuScheduler;
    }());
    TSOS.CpuScheduler = CpuScheduler;
})(TSOS || (TSOS = {}));
