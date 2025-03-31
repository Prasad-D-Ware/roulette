import { WebSocket } from "ws";
import { COINS, OutgoingMessages } from "./types";
import { GameManager } from "./GameManager";

export class User {
    id : number;
    name : string;
    balance : number;
    locked : number;
    ws : WebSocket;

    constructor(id : number , name : string, ws : WebSocket){
        this.id = id;
        this.name = name;
        this.balance = 2500;
        this.ws = ws;
    }

    bet(clientId : string, amount : COINS , betNumber : number){
        this.balance -= amount;
        this.locked +=amount;

        const response = GameManager.getInstance().bet(amount , betNumber , this.id);

        if(response){
            this.send({ clientId,
                type : "bet",   
                amount : amount,
                balance  : this.balance,
                locked : this.locked, })
        }else{
            this.send({
                clientId,
                type : "bet-undo",   
                amount : amount,
                balance  : this.balance,
                locked : this.locked, 
            })
        }
    }

    send( payload : OutgoingMessages){

    }

}