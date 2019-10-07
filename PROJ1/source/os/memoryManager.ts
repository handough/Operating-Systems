module TSOS {
    export class MemoryManager {
        constructor(public PID: number = -1, public pidList = [], public opIndex = 0, public executePid = []){
        }

        // converts to hex
        public hexDecimal(input){
            return parseInt(input, 16);
        }
        
        // updates the current PID
        public memIndex(){
            if(this.PID < 3){
                this.pidList.push(this.PID);
            }
            this.PID++;
            return this.PID;
        }

        public getOp(index){
            return _MemoryAccessor.read(index);
        }

        // writes operation codes to memory
        public writeOpCode(con, addr){
            if(addr > _PCB.limit || addr < _PCB.base){
                _StdOut.putText("cannot access that memory!");
            }else{
                _Memory.memory[addr] = con;
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
    }
}