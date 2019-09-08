module TSOS{
    interface ClockInterface{
        currentTime: Date;
        setTime(d: Date): void;
    }
    export class Clock implements ClockInterface{
        currentTime: Date = new Date();
        setTime(d: Date){
            this.currentTime = d;
        }
        constructor(h: number, m: number){}
    }
}