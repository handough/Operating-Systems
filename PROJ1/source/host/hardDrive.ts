module TSOS{
    export class hardDrive{
        constructor(public TSBList =[]){
            if(TSBList == void 0){ TSBList = [];}
            this.TSBList = TSBList;
        }

        public write(tsb, data){
            sessionStorage[tsb] = data;
        }

        public read(tsb){
            return sessionStorage[tsb];
        }
    }
}