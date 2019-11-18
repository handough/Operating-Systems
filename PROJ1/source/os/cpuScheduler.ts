module TSOS {
    export class CpuScheduler {
        constructor(public quantum: number = 6,              
                    public residentList: any = [],
                    public count: number = 1,
                    public readyQueue: TSOS.Queue = null,
                    public turnAroundTime: number = 0,
                    public RR: boolean = false,
                    public fcfs: boolean = false,
                    public priority: boolean = false){
    
        }

        public clearMem(){
            // create new array to clear memory
            this.readyQueue.q = new Array();
            // reset the count to one
            this.count = 1;
        }

        public contextSwitch(){
            if(this.RR || this.fcfs || this.priority){
                if(this.readyQueue.isEmpty()){ // if the ready queue is empty set is executing to false
                    _CPU.isExecuting = false;  // if is executing is false the turnaround time is set to 0
                    this.turnAroundTime = 0;   
                    this.clearMem();
                }else{
                    if(_CPU.isExecuting == true){
                        this.readyQueue.enqueue(_PCB);
                    }
                    _PCB = this.readyQueue.dequeue();
                    //_PCB.state = "Running";
                    if(_PCB.inHDD){
                        _Kernel.krnSwap();
                    }
                }
            }
        }

        public loadReadyQueue(){
            var rowCounter = 1; // keeps track of the row the PCB is being displayed in ready queue
            for(var i = 0; i < this.residentList.length; i++){
                if(this.residentList[i].state != "TERMINATED"){
                    if(!this.fcfs && ! this.priority){
                        this.residentList[i].rowNum = rowCounter;
                    }else{
                        this.residentList[i].rowNum  = 1;
                    }
                    this.readyQueue.enqueue(this.residentList[i]);
                    rowCounter++; // increment row counter for each loop
                }
            }
            if(this.priority){
                this.sortReadyQueue();
            }
            _PCB = this.readyQueue.dequeue();
            _PCB.state = "Running"; // set PCB state to running 
            if(_PCB.inHDD){
                _Kernel.krnSwap();
            }
            
        }

        public sortReadyQueue(){
            var PCBB = [];
            var pri = [];
            var fixLen = this.readyQueue.getSize();
            // dequeue the ready queue into an array
            for(var i = 0; i < fixLen; i++){
                var PCBBB = this.readyQueue.dequeue();
                PCBB.push(PCBBB);
                pri.push(this.priority);
            }
            var sortPCB = [];
            pri = pri.sort();
            // sort PCB based on priority
            for(var x = 0; x < fixLen; x++){
                var prio = pri[i];
                for(var r = 0; r < PCBB.length; r++){
                    if(PCBB[r].priority == prio){
                        sortPCB.push(PCBB.splice(r,1));
                    }
                }
            }
            // changing row number to display the sorted PCBs
            for(var j = 0; j < sortPCB.length; j++){
                sortPCB[j][0].rowNum = i + 1;
            }
            for(var i = 0; i < sortPCB.length; i++){
                this.readyQueue.enqueue(sortPCB[i[0]]);
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
            if(_CPU.PID > 1){
                _PCB.rowNum -= 1;
            }
        }
    }
}