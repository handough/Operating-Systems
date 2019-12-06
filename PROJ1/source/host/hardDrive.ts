module TSOS{
    export class hardDrive{
        constructor(public TSBList =[]){

        }

        public write(tsb, data){
            sessionStorage[tsb] = data;
        }

        public read(tsb){
            return sessionStorage[tsb];
        }
    }
}