var TSOS;
(function (TSOS) {
    var ProcessManager = /** @class */ (function () {
        function ProcessManager(count, residentList, readyQueue, RR) {
            if (count === void 0) { count = 0; }
            if (residentList === void 0) { residentList = []; }
            if (readyQueue === void 0) { readyQueue = null; }
            if (RR === void 0) { RR = false; }
            this.count = count;
            this.residentList = residentList;
            this.readyQueue = readyQueue;
            this.RR = RR;
            if (residentList == void 0) {
                residentList = [];
            }
            if (readyQueue == void 0) {
                readyQueue = new TSOS.Queue();
            }
        }
        ProcessManager.prototype.runProcess = function (pid) {
            this.readyQueue.enqueue(this.residentList[pid]);
            _CPU.isExecuting = true;
        };
        ProcessManager.prototype.clearMem = function () {
            // clear mem is used in the clear memory command to clear memory in the scheduler
            this.readyQueue.q = new Array();
            this.count = 1;
        };
        ProcessManager.prototype.loadReadyQueue = function () {
            // holds the row that the ready queue is displaying in the PCB
            var rowCount = 0;
            for (var i = 0; i < this.residentList.length; i++) {
                // if the residentList state is not terminated reset the rowNum to one
                // and add the values in the resident list to the ready queue
                // after adding i to the ready queue increment the row count
                if (this.residentList[i].state != "TERMINATED") {
                    this.residentList[i].rowNum = 1;
                    this.readyQueue.enqueue(this.residentList[i]);
                    rowCount++; //incrementing the row count
                }
            }
            // set the current PCB to the first item in the ready queue
            _PCB = this.readyQueue.dequeue();
            _PCB.state = "Running";
            TSOS.Control.displayPCBTable();
        };
        ProcessManager.prototype.unIncRowNum = function () {
            for (var i = 0; i < this.readyQueue.getSize(); i++) {
                if (this.readyQueue.q[i].rowNum > 1) {
                    this.readyQueue.q[i].rowNum -= 1;
                }
            }
            if (_PCB.pid > 1) {
                _PCB.rowNum -= 1;
            }
        };
        return ProcessManager;
    }());
    TSOS.ProcessManager = ProcessManager;
})(TSOS || (TSOS = {}));
