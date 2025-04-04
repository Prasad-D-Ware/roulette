import React, { useState } from "react";
import Chip from "./Chip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BetSpot {
  number: number;
  type: "number" | "section";
  value: string;
}

const RouletteTable = () => {
  const [selectedChip, setSelectedChip] = useState<number>(1);
  const [balance, setBalance] = useState(2500);
  const [bets, setBets] = useState<Map<string, number>>(new Map());

  const numbers = Array.from({ length: 37 }, (_, i) => i);
  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

  const handleBet = (spot: BetSpot) => {
    if (balance < selectedChip) {
      toast.error("Insufficient balance");
      return;
    }

    setBets((prev) => {
      const newBets = new Map(prev);
      const currentBet = newBets.get(spot.value) || 0;
      newBets.set(spot.value, currentBet + selectedChip);
      return newBets;
    });

    setBalance((prev) => prev - selectedChip);
    
    toast.success(`Bet placed on ${spot.value}`);
  };

  const getNumberColor = (num: number) => {
    if (num === 0) return "bg-table-green text-white";
    return redNumbers.includes(num) ? "bg-number-red text-white" : "bg-number-black text-white";
  };

  return (
    <div className="min-h-screen bg-table-green p-8 flex flex-col items-center justify-center gap-8">
      <div className="text-white text-2xl font-semibold">Balance: ${balance}</div>
      
      <div className="bg-table-green border-4 border-table-border rounded-lg p-8 shadow-2xl">
        {/* Numbers Grid */}
        <div className="grid grid-cols-13 gap-1">
          {numbers.map((num) => (
            <div
              key={num}
              onClick={() => handleBet({ number: num, type: "number", value: num.toString() })}
              className={cn(
                "w-12 h-12 flex items-center justify-center cursor-pointer",
                "transition-transform hover:scale-105 font-bold text-lg",
                getNumberColor(num)
              )}
            >
              {num}
              {bets.get(num.toString()) && (
                <div className="absolute animate-chip-drop">
                  <Chip value={bets.get(num.toString()) || 0} className="w-8 h-8 text-sm" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chips Selection */}
      <div className="flex gap-4">
        {[1, 10, 100, 500].map((value) => (
          <Chip
            key={value}
            value={value}
            selected={selectedChip === value}
            onClick={() => setSelectedChip(value)}
          />
        ))}
      </div>
    </div>
  );
};

export default RouletteTable;