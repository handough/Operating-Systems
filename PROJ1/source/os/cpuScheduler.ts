module TSOS {

    export class CpuScheduler {

        public constructor(public quantum: number = 6, 
                           public residentList: any = [],
                           public count: number = 1,
                           public readyQueue: TSOS.Queue,
                           public turnAroundTime: number = 0,
                           public RR: boolean = false){
    
        }

        public clearMem(){
            // create new array to clear memory
            this.readyQueue.q = new Array();
            // reset the count to one
            this.count = 1;
        }

        public contextSwitch(){
            if(this.RR){
                if(this.readyQueue.isEmpty()){ // if the ready queue is empty set is executing to false
                    _CPU.isExecuting = false;  // if is executing is false the turnaround time is set to 0
                    this.turnAroundTime = 0;   
                    this.clearMem();
                }
            }else{
                if(_PCB.state != "TERMINATED"){
                    _PCB.state = "Ready";
                   // _PCB.displayPCB();
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
            _PCB = this.readyQueue.dequeue();
            _PCB.state = "Running"; // set PCB state to running 
            
        }

        public sortReadyQueue(){
            var PCBB = [];
            var fixLen = this.readyQueue.getSize();
            // dequeue the ready queue into an array
            for(var i = 0; i < fixLen; i++){
                var PCBBB = this.readyQueue.dequeue();
                PCBB.push(PCBBB);
            }
            var sortPCB = [];
            // changing row number to display the sorted PCBs
            for(var j = 0; j < sortPCB.length; j++){
                sortPCB[j][0].rowNum = i + 1;
            }
        }

        public checkCount(params){
            if(this.count < this.quantum){
                this.count++;
            }else{
                this.count = 1;
                _KernelInputQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ,params));
            }
        }

        public deIncrementRowNum(){
            for(var i = 0; i < this.readyQueue.getSize(); i++){
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