module TSOS {
    export class MemoryAccessor extends Memory{
        public write(memSlot, op){
            var opArray = op.split(" ");
            var opCount = 0;
            if(memSlot == 0){
                for(var i =0; i < 256; i++){
                    if(i == opArray.length){
                        this.memory[i] = -1;
                        break;
                    }
                    this.memory[i] = opArray[opCount];
                    opCount++;
                }
            }
        }

        public read(memSlot){
            var opArray = [];
            if(memSlot == 0){
                for(var i =0; i < 256; i++){
                    if(this.memory[i] != -1){
                        opArray.push(this.memory[i]);
                    }else{
                        this.memory[i] = 0;
                        break;
                    }
                }
            }
            return opArray;
        }
    }
}