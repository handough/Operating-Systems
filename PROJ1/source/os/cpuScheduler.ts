module TSOS {

    export class cpuScheduler {
        public constructor(public quantum: number = 0, 
                           public residentList = [],
                           public count: number = 0,
                           public priority: number = 0,
                           public readyQueue: TSOS.Queue,
                           public turnAroundTime: number = 0,
                           public RR: number = 0){

        }
        public clearMem(){
            // create new array to clear memory
            this.readyQueue.q = new Array();
            // reset the count to one
            this.count = 1;
        }

        public contextSwitch(){
            if(this.RR || this.priority){
                if(this.readyQueue.isEmpty()){ // if the ready queue is empty set is executing to false
                    _CPU.isExecuting = false;  // if is executing is false the turnaround time is set to 0
                    this.turnAroundTime = 0;   
                    this.clearMem();
                }
            }else{
                if(_PCB.state != "TERMINATED"){
                    _PCB.state = "Ready";
                    _PCB.displayPCB();
                    this.readyQueue.enqueue(_PCB);
                }
                _PCB = this.readyQueue.dequeue();
                _PCB.state = "Running";

            }
        }

        public loadReadyQueue(){
            var rowCounter = 1; // keeps track of the row the PCB is being displayed in ready queue
            for(var i = 0; i < this.residentList.length; i++){
                if(this.residentList[i].state != "TERMINATED"){
                    this.residentList[i].rowNum = 1;
                    this.readyQueue.enqueue(this.residentList[i]);
                    rowCounter++; // increment row counter for each loop
                }
            }
            if(this.priority){
                this.sortReadyQueue(); // sort ready to queue according to priority 
            }
            _PCB = this.readyQueue.dequeue();
            _PCB.state = "Running"; // set PCB state to running 
            
        }

        public sortReadyQueue(){
            var PCBB = [];
            var priNum = [];
            var fixLen = this.readyQueue.getSize();
            // dequeue the ready queue into an array
            for(var i = 0; i < fixLen; i++){
                var PCBBB = this.readyQueue.dequeue();
                PCBB.push(PCBBB);
                priNum.push(PCBBB.priority);
            }
            var sortPCB = [];
            // sorted list of priority number going least to greatest
            priNum = priNum.sort();
            // sort all PCBs according to their set priority 
            for(var i = 0; i <fixLen; i++){
                var pri = priNum[i];
                for(var x = 0; x < PCBB.length; x++){
                    if(PCBB[x].priority = pri){
                        sortPCB.push(PCBB.splice(x, 1));
                    }
                }
            }
            // changing row number to display the sorted PCBs
            for(var j = 0; j < sortPCB.length; j++){
                sortPCB[j][0].rowNum = i + 1;
            }
        }
    }
}