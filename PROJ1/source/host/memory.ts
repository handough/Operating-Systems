(function(TSOS){
    var Memory = (function(){
        function Memory(){

        }
        Memory.prototype.init = function(){
            this.memoryArray = new Array(256);
            for(var i = 0; i < this.memoryArray.length; i++){
                this.memoryArray[i] = "00";
            }
        };
        return Memory;
    })
    TSOS.Memory = Memory;
})