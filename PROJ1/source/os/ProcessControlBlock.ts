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
                    public rowNum: number = 1,
                    public state: string = "",
                    public inHDD: boolean = false){
                        if(rowNum == void 0){rowNum = 1;}
        }   
        
        public init(pid, priority){
            if(priority == void 0){priority = 32;}
            this.pid = pid;
            this.base = this.getBase(_MemoryManager.pidList[_MemoryManager.pidList.length - 1]);
            this.limit = this.getLimit(_MemoryManager.pidList[_MemoryManager.pidList.length - 1]);
            this.part = this.getPart(_MemoryManager.pidList[_MemoryManager.pidList.length - 1]);

        }

        public clearPCB(){
            // clearPCB terminates the cpu scheduler process
            this.state = 'TERMINATED';
            var table = <HTMLTableElement>document.getElementById("pcbTable");
            //table.deleteRow(this.rowNum);
            if (_cpuScheduler.fcfs) {
                table.deleteRow(1);
            }
            else {
                //table.deleteRow(this.rowNum);
                // if there are several PCB
                if (_cpuScheduler.RR) {
                    _cpuScheduler.deIncrementRowNum();
                }
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
            this.IR = IR;
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

        public getBase(op){
            var index = op;//_MemoryManager.memIndex(op);
            if(index == 0){
                this.base = 0;
                return 0;
            }else if(index == 1){
                this.base = 256;
                return 256;
            }else if(index == 2){
                this.base = 512;
                return 512;
            }else{
                this.base = 0;
                return 0;
            }
        }

        public getLimit(op){
            var index = _Runner;//_MemoryManager.memIndex(op);
            if(index == 0){
                this.limit = 256;
                return 256;
            }else if(index == 1){
                this.limit = 512;
                return 512;
            }else if(index == 2){
                this.limit = 768;
                return 768;
            }else{
                this.limit = 256;
                return 256;
            }
        }

        public getPart(pid){
            var index = _Runner;//_MemoryManager.memIndex(pid);
            if(index == 0){
                this.part = 1;
                return 1;
            }else if(index == 1){
                this.part = 2;
                return 2;
            }else if(index == 2){
                this.part = 3;
                return 3;
            }else{
                this.part = 1;
                return 3;
            }
        }
    }
}