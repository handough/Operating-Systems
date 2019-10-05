module TSOS {
    export class Memory {
        constructor(public memory = []){
            if(memory == void 0){
                memory = [];
            }
        }

        public init(): void{
            for(var i = 0; i < 256; i++){
                this.memory.push(0);
            }
        }

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
        }
        public eraseBlock(memSlot) {
            if (memSlot == 0) {
                for (var i = 0; i < 256; i++) {
                    this.memory[i] = 0;
                }
            }
        }

        public eraseAll(){
            this.init();
        }
    }
}