module TSOS{
    export class ProcessControlBlock{
        constructor(public PC: number = 0, 
                    public Acc: number = 0, 
                    public X: number = 0, 
                    public Y: number = 0, 
                    public Z: number = 0,
                    public base: number = 0,
                    public limit: number = 0,
                    public part: number = 0,
                    public pid: number = 0, 
                    public IR: string = '', 
                    public curState: number = 0, 
                    public prior: number = 0, 
                    public local: number = 0,
                    public rowNum: number = 0,
                    public state: string = ''){
                        if(rowNum == void 0){rowNum = 1;}
        }   
        
        public init(pid){
            this.pid = pid;
        }

        public pcbDisplay(){
            var table = document.getElementById("pcbTable");
            var rows;
            rows = table.getElementsByTagName("tr")[this.rowNum];
            rows.getElementsByTagName("td")[0].innerHTML = this.pid + '';
            rows.getElementsByTagName("td")[1].innerHTML = this.state;
            rows.getElementsByTagName("td")[2].innerHTML = (this.PC + this.base) + '';
            rows.getElementsByTagName("td")[3].innerHTML = this.Acc + '';
            rows.getElementsByTagName("td")[4].innerHTML = this.IR;
            rows.getElementsByTagName("td")[5].innerHTML = this.X + '';
            rows.getElementsByTagName("td")[6].innerHTML = this.Y + '';
            rows.getElementsByTagName("td")[7].innerHTML = this.Z + '';
            rows.getElementsByTagName("td")[8].innerHTML = 'Memory';
        }

        public insertPCBRows(){
            var table = (<HTMLTableElement>document.getElementById("pcbTable"));
            var rows = table.insertRow(this.rowNum);
            var cell1 = rows.insertCell(0);
            var cell2 = rows.insertCell(1);
            var cell3 = rows.insertCell(2);
            var cell4 = rows.insertCell(3);
            var cell5 = rows.insertCell(4);
            var cell6 = rows.insertCell(5);
            var cell7 = rows.insertCell(6);
            var cell8 = rows.insertCell(7);
            var cell9 = rows.insertCell(8);
            cell1.innerHTML = _PCB.pid + '';
            cell2.innerHTML = _PCB.state;
            cell3.innerHTML = _PCB.PC + '';
            cell4.innerHTML = _PCB.Acc + '';
            cell5.innerHTML = _PCB.IR;
            cell6.innerHTML = _PCB.X + '';
            cell7.innerHTML = _PCB.Y + '';
            cell8.innerHTML = _PCB.Z + '';
            cell9.innerHTML = 'Memory';
        }

        public clearPCB(){
            // clearPCB terminates the cpu scheduler process
            this.state = 'TERMINATED';
            var table = <HTMLTableElement>document.getElementById("pcbTable");
            table.deleteRow(this.rowNum);
            if(_processManager.RR){
                _processManager.unIncRowNum();
            }
        }

        public getPID(){
            this.pid = _CPU.PID;
            return _CPU.PID;
        }

        public getPC(){
            this.PC = _CPU.PC;
            return _CPU.PC;
        }

        public getAcc(){
            this.Acc = _CPU.Acc;
            return _CPU.Acc;
        }

        public getIR(IR){
            this.IR = _CPU.IR;
        }

        public getX(){
            this.X = _CPU.Xreg;
            return _CPU.Xreg;
        }

        public getY(){
            this.Y = _CPU.Yreg;
            return _CPU.Yreg;
        }

        public getZ(){
            this.Z = _CPU.Zflag;
            return _CPU.Zflag;
        }

        public getBase(pid){
            var index = _MemoryManager.memIndex(pid);
            if(index == 0){
                this.base = 0;
                return 0;
            }else if(index == 1){
                this.base = 256;
                return 256;
            }
        }

        public getLimit(pid){
            var index = _MemoryManager.memIndex(pid);
            if(index == 0){
                this.limit = 256;
                return 256;
            }
        }

        public getPart(pid){
            var index = _MemoryManager.memIndex(pid);
            if(index == 0){
                this.part = 1;
                return 1;
            }
        }
    }
}