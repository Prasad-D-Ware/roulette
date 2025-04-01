export type IncommingMessage = {
    type : "bet",
    clientId : string,
    amount : number,
    number : number,
} | {
    type : "start-game";
} |  {
    type : "end-game";
    output : Number
} | {
    type : "stop-bets"
}

export type OutgoingMessages = {
    type : "current-state",
    state : GameState,
} | {
    type : "bet",
    clientId : string,
    amount : number,
    balance : number,
    locked : number,
} |  {
    type : "bet-undo",
    clientId : string,
    amount : number,
    balance : number,
    locked : number,
} |  {
    type : "won",
    balance : number,
    locked : number,
    wonAmount : number,
    outcome : Number
} | {
    type : "lost",
    balance : number,
    locked : number,
    outcome : Number
} | {
    type : "start-game";
} |  {
    type : "end-game";
    output : Number
} | {
    type : "stop-bets"
}


export enum COINS {
    One = 1,
    Five = 5,
    Ten = 10,
    TwentyFive = 25,
    Fifty = 50,
    Hundred = 100,
    TwoFifty = 250,
    FiveHundred = 500,
}

export enum  Number {
    Zero = 0,
    One = 1,
    Two = 2,
    Three = 3,
    Four = 4,
    Five = 5,
    Six = 6,
    Seven = 7,
    Eight = 8,
    Nine = 9,
    Ten = 10,
    Eleven = 11,
    Twelve = 12,
    Thirteen = 13,
    Fourteen = 14,
    Fifteen = 15,
    Sixteen = 16,
    Seventeen = 17,
    Eighteen = 18,
    Nineteen = 19,
    Twenty = 20,
    TwentyOne = 21,
    TwentyTwo = 22,
    TwentyThree = 23,
    TwentyFour = 24,
    TwentyFive = 25,
    TwentySix = 26,
    TwentySeven = 27,
    TwentyEight = 28,
    TwentyNine = 29,
    Thirty = 30,
    ThirtyOne = 31,
    ThirtyTwo = 32,
    ThirtyThree = 33,
    ThirtyFour = 34,
    ThirtyFive = 35,
}

export enum GameState {
    CanBet,
    CantBet,
    GameOver
}

export type Bet = {
    id:number;
    amount : number;
    number : number;
}