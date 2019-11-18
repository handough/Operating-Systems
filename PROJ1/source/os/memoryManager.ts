module TSOS {
    export class MemoryManager {
        constructor(public pidLoc = [-1,-1,-1], 
            public memoryUsed = [0,0,0], 
            public pidList = [], 
            public opIndex:number = 0, 
            public executePid = [],){
        }
        // clear all memory and displays 
        public clearAll(){
            this.memoryUsed = [0,0,0];
            this.pidLoc = [-1,-1,-1];
            _Memory.eraseAll();
            this.clearDisplay();
            // add all unexecuted PIDs to executed PIDs
            for(var i = 0; i < this.pidList.length; i++){
                var pid = this.pidList[i]; // PID comparasion
                var counter = 0; // counter used to check if it has been executed or not 
                for(var x = 0; x < this.executePid.length; x++){
                    if(pid != this.executePid[i]){
                        counter++;
                    }
                }
                if(counter == this.executePid.length){
                    this.executePid.push(pid);
                }
            }
        }

        // clear all display of memory blocks
        public clearDisplay(){
            var table = document.getElementById("processMemTable");
            for(var i = 0; i < 96; i++){
                var row = table.getElementsByTagName("tr")[i];
                for(var x = 0; x < 9; x++){
                    row.getElementsByTagName("td")[x].innerHTML = '00';
                }
            }
        }
        // converts to hex
        public hexDecimal(input){
            return parseInt(input, 16);
        }
        
        // returns the correct memory block index
        public memIndex(PID){
            for(var i = 0; i < this.pidLoc.length; i++){
                if(this.pidLoc[i] == PID){
                    return i;
                }
            }
        }

        // returns OP codes from memory
        public getVariable(index){
            return _Memory.memory[_CPU.PID][index];
        }

        // returns OP codes from memory
        public getOp(index){
            return _MemoryAccessor.read(index);
        }

        // writes operation codes to memory
        public writeOpCode(con, addr){
            //if(addr > _CPU.limit || addr < _PCB.base){
                //_StdOut.putText("cannot access that memory!");
            //}else{
                _Memory.memory[_CPU.PID][addr] = con;
            //}
        }

        public endianAddress(addrB, addrE){
            if (addrB == '00' && addrE == '00') {
                return 0;
            }
            var addr = 0;
            var str = '';
            if (addrE == '00' && addrB != '00') {
                str += addrB;
            }
            else {
                str += addrE;
                str += addrB;
            }
            addr = this.hexDecimal(str);
            return addr;
        }

        public pidReturn(){
            if(this.pidList[0] == null){
                this.pidList.push(0);
            }else{
                this.pidList.push(this.pidList[_CPU.PID][this.pidList.length - 1] + 1);
            }
        }

        // write to memory in memory accessor 
        public writeToMemory(index, op){
            _MemoryAccessor.write(index, op);
        }
    }
}