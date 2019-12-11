module TSOS {
    export class MemoryAccessor extends Memory{
        public write(memSlot, op){
            var opArray = new Array(op.toString().split(" "));
            var opCount = 0;
            if(memSlot == 0){ // if the ops are being written to the first part of memory 
                for(var i = 0; i < 256; i++){
                    if(i == opArray.length){
                        this.memory[i] = -1;
                        break;
                    }
                    this.memory[i] = opArray[opCount];
                    opCount++;
                }
            }else if(memSlot == 1){ // if the ops are being written to the second part of memory 
                for(var i = 256; i < 512; i++){
                    if(opCount == opArray.length){
                        this.memory[i] = -1;
                        break;
                    }
                    this.memory[i] = opArray[opCount];
                    opCount++;    
                }
            }else if(memSlot == 2){ // if the ops are being written to the third part of memory 
                for(var i = 512; i < 768; i++){
                    if(opCount == opArray.length){
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
                    if(this.memory[memSlot][i] != -1){
                        opArray.push(this.memory[memSlot][i]);
                    }else{
                        this.memory[memSlot][i] = 0;
                        break;
                    }
                }
            }else if(memSlot == 1){
                for(var i = 256; i < 512; i++){
                    if(this.memory[memSlot][i] != -1){
                        opArray.push(this.memory[memSlot][i]);
                    }else{
                        this.memory[memSlot][i] = 0;
                        break;
                    }
                }
            }else if(memSlot == 2){
                for(var i = 512; i < 768; i++){
                    if(this.memory[memSlot][i] != -1){
                        opArray.push(this.memory[memSlot][i]);
                    }else{
                        this.memory[memSlot][i] = 0;
                        break;
                    }
                }
            }
            return opArray;
        }
    }
}