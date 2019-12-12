module TSOS {
    export class MemoryAccessor extends Memory{
        public write(memSlot, op){
            var opArray = new Array(op.toString().split(" "));
            var opCount = 0;
            if(memSlot == 0){ // if the ops are being written to the first part of memory 
                var pos = 0;
                for(var i = 0; i < 255; i++){
                    if(i == opArray[0].length){
                        this.memory[i] = -1;
                        break;
                    }
                    this.memory[i] = opArray[0][pos];
                    opCount++;
                    pos++;
                }
            }else if(memSlot == 1){ // if the ops are being written to the second part of memory 
                var pos = 0;
                for(var i = 256; i < 511; i++){
                    if(opCount == opArray[0].length){
                        this.memory[i] = -1;
                        break;
                    }
                    this.memory[i] = opArray[0][pos];
                    opCount++; 
                    pos++;   
                }
            }else if(memSlot == 2){ // if the ops are being written to the third part of memory 
                var pos = 0;
                for(var i = 512; i < 767; i++){
                    if(opCount == opArray[0].length){
                        this.memory[i] = -1;
                        break;
                    }
                    this.memory[i] = opArray[0][pos];
                    opCount++; 
                    pos++;   
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
                        opArray.push(this.memory[i]);
                    }else{
                        this.memory[i] = 0;
                        break;
                    }
                }
            }else if(memSlot == 2){
                for(var i = 512; i < 768; i++){
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