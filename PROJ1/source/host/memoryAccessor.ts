module TSOS {
    export class MemoryAccessor extends Memory{
        public write(memSlot, op){
            var opArray = new Array(op.split(" "));
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
            }else if(memSlot == 1){
                for(var i = 256; i < 512; i++){
                    if(i == opArray.length){
                        this.memory[i] = -1;
                        break;
                    }
                    this.memory[i] = opArray[opCount];
                    opCount++;    
                }
            }else if(memSlot == 2){
                for(var i = 512; i < 768; i++){
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
            }else if(memSlot == 1){
                for(var i = 256; i < 512; i++){
                    if(this.memory[i] != -1){
                        opArray.push[this.memory[i]];
                    }else{
                        this.memory[i] = 0;
                        break;
                    }
                }
            }else if(memSlot == 2){
                for(var i = 512; i < 768; i++){
                    if(this.memory[i] != -1){
                        opArray.push[this.memory[i]];
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