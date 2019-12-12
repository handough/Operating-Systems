var TSOS;
(function (TSOS) {
    var CpuScheduler = /** @class */ (function () {
        function CpuScheduler(quantum, residentList, count, readyQueue, turnAroundTime, RR, fcfs, priority) {
            if (quantum === void 0) { quantum = 6; }
            if (residentList === void 0) { residentList = []; }
            if (count === void 0) { count = 1; }
            if (readyQueue === void 0) { readyQueue = new TSOS.Queue; }
            if (turnAroundTime === void 0) { turnAroundTime = 0; }
            if (RR === void 0) { RR = false; }
            if (fcfs === void 0) { fcfs = false; }
            if (priority === void 0) { priority = false; }
            this.quantum = quantum;
            this.residentList = residentList;
            this.count = count;
            this.readyQueue = readyQueue;
            this.turnAroundTime = turnAroundTime;
            this.RR = RR;
            this.fcfs = fcfs;
            this.priority = priority;
        }
        CpuScheduler.prototype.clearMem = function () {
            // create new array to clear memory
            this.readyQueue.q = new Array();
            // reset the count to one
            this.count = 1;
        };
        CpuScheduler.prototype.contextSwitch = function (params) {
            if (this.RR || this.fcfs || this.priority) {
                if (this.readyQueue.isEmpty()) { // if the ready queue is empty set is executing to false
                    _CPU.isExecuting = false; // if is executing is false the turnaround time is set to 0
                    this.turnAroundTime = 0;
                    this.clearMem();
                }
                else {
                    if (_PCB.state != "TERMINATED") {
                        _PCB.state = "Ready";
                        if (_runAll != true) {
                            TSOS.Control.displayPCB();
                        }
                        this.readyQueue.enqueue(_PCB);
                    }
                    _PCB = this.readyQueue.dequeue();
                    _PCB.state = "Running";
                    _CPU.isExecuting = true;
                    // must swap if in HDD
                    if (_PCB.inHDD) {
                        _Kernel.krnSwap(params);
                    }
                }
            }
        };
        CpuScheduler.prototype.loadReadyQueue = function () {
            var pid;
            var rowCounter = 1; // keeps track of the row the PCB is being displayed in ready queue
            for (var i = 0; i < this.residentList.length; i++) {
                if (this.residentList[i].state != "TERMINATED") {
                    if (!this.fcfs && !this.priority) {
                        this.residentList[i].rowNum = rowCounter;
                    }
                    else {
                        this.residentList[i].rowNum = 1;
                    }
                    pid = this.residentList[i].pid;
                    this.readyQueue.enqueue(this.residentList[i]);
                    rowCounter++; // increment row counter for each loop
                }
            }
            if (this.priority) {
                this.sortReadyQueue();
            }
            _PCB = this.readyQueue.dequeue();
            _PCB.state = "Running"; // set PCB state to running 
            _CPU.isExecuting = true;
            if (_PCB.inHDD) {
                pid = this.residentList[i].pid;
                _Kernel.krnSwap(pid);
            }
        };
        CpuScheduler.prototype.sortReadyQueue = function () {
            var PCBer = [];
            var pri = [];
            var fixedSize = this.readyQueue.getSize();
            // put ready queue into array 
            for (var i = 0; i < fixedSize; i++) {
                var PCB = this.readyQueue.dequeue();
                PCBer.push(PCB);
                pri.push(PCB.priority);
            }
            var sortPCB = [];
            // sort list
            pri = pri.sort();
            // sort based on priority 
            for (var i = 0; i < fixedSize; i++) {
                var priority = pri[i];
                for (var j = 0; j < PCBer.length; j++) {
                    if (PCBer[j].priority == priority) {
                        sortPCB.push(PCBer.splice(j, 1));
                    }
                }
            }
            // change row number
            for (var i = 0; i < sortPCB.length; i++) {
                sortPCB[i][0].rowNumber = i + 1;
            }
            for (var i = 0; i < sortPCB.length; i++) {
                this.readyQueue.enqueue(sortPCB[i][0]);
            }
        };
        CpuScheduler.prototype.checkCount = function () {
            if (this.count < this.quantum) {
                this.count++;
            }
            else {
                this.count = 1;
                _KernelInputQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, 'Scheduling Event'));
            }
        };
        CpuScheduler.prototype.deIncrementRowNum = function () {
            for (var i = 0; i < this.readyQueue.getSize(); i++) {
                if (this.readyQueue.q[i].rowNum > 1) {
                    this.readyQueue.q[i].rowNum -= 1;
                }
            }
            if (_PCB.pid > 1) {
                _PCB.rowNum -= 1;
            }
        };
        return CpuScheduler;
    }());
    TSOS.CpuScheduler = CpuScheduler;
})(TSOS || (TSOS = {}));
