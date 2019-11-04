module TSOS {
    export class Memory {
        constructor(public memory = []){
        }

        // sets memory to 0 
        public init(): void{
            for(var i = 0; i < 768; i++){
                this.memory.push(0);
            }
        }
        
        // resets memory to all zeros
        public eraseAll(){
            this.init();
        }

        public eraseBlock(memSlot){
            if(memSlot == 0){
                for(var i = 0; i < 256; i++){
                    this.memory[i] = 0;
                }
            }else if(memSlot == 1){
                for(var i = 256; i < 512; i++){
                    this.memory[i] = 0;
                }
            }else if(memSlot == 2){
                for(var i = 512; i < 768; i++){
                    this.memory[i] = 0;
                }
            }
        }
    }
}