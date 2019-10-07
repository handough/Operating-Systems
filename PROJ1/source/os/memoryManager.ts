module TSOS {
    export class MemoryManager {
        constructor(public pidList = [], public opIndex = 0, public executePid = []){
  
        }
        public clear(){
            _Memory.eraseAll();
            this.clearDisplay();
            for(var i = 0; i < this.pidList.length; i++){
                var pid = this.pidList[i]; // comparing the pids
                var count = 0;
                for(var x = 0; x < this.executePid.length; x++){
                    if(pid != this.executePid[i]){
                        count++;
                    }
                }
                if(count = this.executePid.length){
                    this.executePid.push(pid);
                }
            }
        }

        public clearBlock(pID){
            var index = -1;
            for(var i = 0; i < this.pidList.length; i++){
                if(this.pidList[i] == pID){
                    var table = document.getElementById("processMemTable");
                    if(i ==0){
                        this.pidList[0] = -1;
                        index = 0;
                        for(var i = 0; i < 32; i++){
                            var row = table.getElementsByTagName("tr")[i];
                            for( var x = 0; x < 9; x++){
                                row.getElementsByTagName("td")[x].innerHTML = '0';
                            }
                        }
                    }
                }
            }
            _Memory.eraseBlock(index); // erase memory
        }

        public updateBlock(pid){
            var memIndex = this.memIndex(pid);
            var opIndex = 0;
            var table = document.getElementById("processMemTable");
            if(memIndex == 0){
                for(var i = 0; i < 32; i++){
                    var row = table.getElementsByTagName("tr")[i];
                    for(var x = 0; x < 9; x++){
                        row.getElementsByTagName("td")[x].innerHTML = this.getVar(opIndex);
                        opIndex++;
                    }
                }
            }
        }
        public clearDisplay(){
            var table = document.getElementById("processMemTable");
            for( var i =0; i < 96; i++){
                var row = table.getElementsByTagName("tr")[i];
                for(var x = 0; x < 9; x++){
                    row.getElementsByTagName("td")[x].innerHTML = '00';
                }
            }
        }

        public hexDecimal(input){
            return parseInt(input, 16);
        }

        public memIndex(PID){
            for(var i =0; i < this.pidList.length; i++){
                if(this.pidList[i] == PID){
                    return i;
                }
            }
        }

        public getVar(location){
            if((location > _PCB.limit || location < _PCB.base)){
                _StdOut.putText("Memory violation");
            }else{
                return _Memory.memory[location]
            }
        }
        
        public getOp(index){
            return _MemoryAccessor.read(index);
        }

        public writeOpCode(constant, addr){
            if(addr > _PCB.limit || addr < _PCB.base){
                _StdOut.putText("Memory violation");
            }else{
                _Memory.memory[addr] = constant;
            }
        }

        // write memory from the memory manager
        public writeMem(index, op){
            _MemoryAccessor.write(index, op);
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

        public incPID(){

        }
    }
}