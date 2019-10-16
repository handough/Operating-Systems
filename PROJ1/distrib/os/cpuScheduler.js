var TSOS;
(function (TSOS) {
    var cpuScheduler = /** @class */ (function () {
        function cpuScheduler(quantum, residentList, count, priority, readyQueue, turnAroundTime, RR) {
            if (quantum === void 0) { quantum = 0; }
            if (residentList === void 0) { residentList = []; }
            if (count === void 0) { count = 0; }
            if (priority === void 0) { priority = 0; }
            if (turnAroundTime === void 0) { turnAroundTime = 0; }
            if (RR === void 0) { RR = 0; }
            this.quantum = quantum;
            this.residentList = residentList;
            this.count = count;
            this.priority = priority;
            this.readyQueue = readyQueue;
            this.turnAroundTime = turnAroundTime;
            this.RR = RR;
        }
        cpuScheduler.prototype.clearMem = function () {
            // create new array to clear memory
            this.readyQueue.q = new Array();
            // reset the count to one
            this.count = 1;
        };
        cpuScheduler.prototype.contextSwitch = function () {
            if (this.RR || this.priority) {
                if (this.readyQueue.isEmpty()) { // if the ready queue is empty set is executing to false
                    _CPU.isExecuting = false; // if is executing is false the turnaround time is set to 0
                    this.turnAroundTime = 0;
                    this.clearMem();
                }
            }
            else {
                if (_PCB.state != "TERMINATED") {
                    _PCB.state = "Ready";
                    // _PCB.displayPCB();
                    this.readyQueue.enqueue(_PCB);
                }
                _PCB = this.readyQueue.dequeue();
                _PCB.state = "Running";
            }
        };
        cpuScheduler.prototype.loadReadyQueue = function () {
            var rowCounter = 1; // keeps track of the row the PCB is being displayed in ready queue
            for (var i = 0; i < this.residentList.length; i++) {
                if (this.residentList[i].state != "TERMINATED") {
                    this.residentList[i].rowNum = 1;
                    this.readyQueue.enqueue(this.residentList[i]);
                    rowCounter++; // increment row counter for each loop
                }
            }
            if (this.priority) {
                this.sortReadyQueue(); // sort ready to queue according to priority 
            }
            _PCB = this.readyQueue.dequeue();
            _PCB.state = "Running"; // set PCB state to running 
        };
        cpuScheduler.prototype.sortReadyQueue = function () {
            var PCBB = [];
            var priNum = [];
            var fixLen = this.readyQueue.getSize();
            // dequeue the ready queue into an array
            for (var i = 0; i < fixLen; i++) {
                var PCBBB = this.readyQueue.dequeue();
                PCBB.push(PCBBB);
                priNum.push(PCBBB.priority);
            }
            var sortPCB = [];
            // sorted list of priority number going least to greatest
            priNum = priNum.sort();
            // sort all PCBs according to their set priority 
            for (var i = 0; i < fixLen; i++) {
                var pri = priNum[i];
                for (var x = 0; x < PCBB.length; x++) {
                    if (PCBB[x].priority = pri) {
                        sortPCB.push(PCBB.splice(x, 1));
                    }
                }
            }
            // changing row number to display the sorted PCBs
            for (var j = 0; j < sortPCB.length; j++) {
                sortPCB[j][0].rowNum = i + 1;
            }
        };
        return cpuScheduler;
    }());
    TSOS.cpuScheduler = cpuScheduler;
})(TSOS || (TSOS = {}));
