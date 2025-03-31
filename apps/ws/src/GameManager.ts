import { Bet, GameState, Number } from "./types";

export class GameManager{
    state : GameState = GameState.GameOver;
    bets : Bet[] = [];
    private static _instance : GameManager;
    private lastWinner : Number = Number.Zero;
    private constructor(){

    }

    public static getInstance() {
        if(!this._instance){
            this._instance = new GameManager();
        }

        return this._instance;
    }

    // end users will call this 
    public bet(amount : number,betNumber : Number , id : number) : boolean{
        if(this.state === GameState.CanBet){
            this.bets.push({
                amount,
                number : betNumber,
                id
            })
            return true;
        }
        return false;
    }

    public start(){
        this.state = GameState.CanBet;
    }

    public end(output : Number){
        this.lastWinner = output;
        this.state = GameState.GameOver;
    }
}