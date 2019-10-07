module TSOS {
    export class ProcessManager{
        constructor(public count: number = 0,
            public residentList= [],
            public readyQueue: any = null,
            public RR: boolean = false){
            if(residentList == void 0){ residentList = [];}
            if(readyQueue == void 0){ readyQueue = new TSOS.Queue();}
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
            this.displayReadyQueue();
        }

        public displayReadyQueue(){
            var table = <HTMLTableElement>document.getElementById("pcbTable");
            if (table.rows.length == 1) {
                //Display current PCB
                var row = <HTMLTableRowElement>table.insertRow(1);
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2);
                var cell4 = row.insertCell(3);
                var cell5 = row.insertCell(4);
                var cell6 = row.insertCell(5);
                var cell7 = row.insertCell(6);
                var cell8 = row.insertCell(7);
                var cell9 = row.insertCell(8);
                cell1.innerHTML = _PCB.pid + '';
                cell2.innerHTML = _PCB.state;
                cell3.innerHTML = _PCB.PC + '';
                cell4.innerHTML = _PCB.Acc + '';
                cell5.innerHTML = _PCB.IR;
                cell6.innerHTML = _PCB.X + '';
                cell7.innerHTML = _PCB.Y + '';
                cell8.innerHTML = _PCB.Z + '';
                cell9.innerHTML = 'Memory';
                _PCB.getBase(_PCB.pid);
                _PCB.getLimit(_PCB.pid);
                _PCB.getPart(_PCB.pid);
                for (var i = 0; i < this.readyQueue.getSize(); i++) {
                    // get the PCB from the ready queue without dequeueing
                    var temporaryPCB = this.readyQueue.q[i]; 
                    temporaryPCB.State = "Ready";
                    var row = table.insertRow(i + 2);
                    var cell1 = row.insertCell(0);
                    var cell2 = row.insertCell(1);
                    var cell3 = row.insertCell(2);
                    var cell4 = row.insertCell(3);
                    var cell5 = row.insertCell(4);
                    var cell6 = row.insertCell(5);
                    var cell7 = row.insertCell(6);
                    var cell8 = row.insertCell(7);
                    var cell9 = row.insertCell(8);
                    cell1.innerHTML = temporaryPCB.pid + '';
                    cell2.innerHTML = temporaryPCB.state;
                    cell3.innerHTML = temporaryPCB.PC + '';
                    cell4.innerHTML = temporaryPCB.Acc + '';
                    cell5.innerHTML = temporaryPCB.IR;
                    cell6.innerHTML = temporaryPCB.X + '';
                    cell7.innerHTML = temporaryPCB.Y + '';
                    cell8.innerHTML = temporaryPCB.Z + '';
                    cell9.innerHTML = 'Memory';
                }
            }
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