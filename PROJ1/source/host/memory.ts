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