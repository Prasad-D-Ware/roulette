import { Bet, GameState, Number } from "@repo/common/types";
import { UserManager } from "./UserManager";

export class GameManager{
    state : GameState = GameState.GameOver;
    bets : Bet[] = [];
    private static _instance : GameManager;
    private _lastWinner : Number = Number.Zero;
    winners : String[] = [];
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

    //admin will use these
    public start(){
        this.state = GameState.CanBet;
        UserManager.getInstance().broadcast({
            type : "start-game"
        })
    }

    stopBets(){
        this.state = GameState.CantBet;
        UserManager.getInstance().broadcast({
            type : "stop-bets"
        })
    }

    public end(output : Number){
        this._lastWinner = output;
        this.bets.forEach(bet=>{
            if(bet.number === output){
                // user won
                UserManager.getInstance().won(bet.id , bet.amount , output, this.winners);
            }else{
                UserManager.getInstance().lost(bet.id , bet.amount , output);
            }
        });
        this.state = GameState.GameOver;
        UserManager.getInstance().flush(output,this.winners);
        this.bets = [];
        this.winners = [];
    }
}