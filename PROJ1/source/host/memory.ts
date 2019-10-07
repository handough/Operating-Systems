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
        
    }
}