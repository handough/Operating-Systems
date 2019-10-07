module TSOS {
    export class ProcessManager{
        constructor(public count: number = 0,
            public residentList= [],
            public readyQueue: any = null,
            public RR: boolean = false){
            if(residentList == void 0){ residentList = [];}
            if(readyQueue == void 0){ readyQueue = new TSOS.Queue();}
        }

        public runProcess(pid){
            this.readyQueue.enqueue(this.residentList[pid]);
            _CPU.isExecuting = true;
        }

        public clearMem(){
            // clear mem is used in the clear memory command to clear memory in the scheduler
            this.readyQueue.q = new Array();
            this.count = 1;
        }

        public loadReadyQueue(){
            // holds the row that the ready queue is displaying in the PCB
            var rowCount = 0;
            for(var i = 0; i < this.residentList.length; i++){
                // if the residentList state is not terminated reset the rowNum to one
                // and add the values in the resident list to the ready queue
                // after adding i to the ready queue increment the row count
                if(this.residentList[i].state != "TERMINATED"){
                    this.residentList[i].rowNum = 1;
                    this.readyQueue.enqueue(this.residentList[i]);
                    rowCount++; //incrementing the row count
                }
            }
            // set the current PCB to the first item in the ready queue
            _PCB = this.readyQueue.dequeue();
            _PCB.state = "Running";
            TSOS.Control.displayPCBTable();
        }

        public unIncRowNum(){
            for( var i = 0; i < this.readyQueue.getSize(); i++){
                if(this.readyQueue.q[i].rowNum > 1){
                    this.readyQueue.q[i].rowNum -= 1;
                }
            }
            if(_PCB.pid > 1){
                _PCB.rowNum -= 1;
            }
        }
    }
}