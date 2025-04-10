import { useEffect, useState } from "react";
import Chip from "./Chip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { COINS, GameState, Number, OutgoingMessages } from "@repo/common/types";
import { useSocket } from "@/hooks/use-socket";

interface BetSpot {
	number: Number;
	type: "number";
}

const RouletteTable = () => {
	const [name, setName] = useState("");
	const [submitted, setSubmitted] = useState(false);

	if (!submitted) {
		return (
			<div className="flex justify-center items-center bg-black h-screen w-screen">
				<div className="flex flex-col gap-2">
					<div className="text-white text-center font-bold text-4xl">
						Enter Your Name
					</div>
					<input
						type="text"
						onChange={(e) => setName(e.target.value)}
						className="px-6 py-2"
					/>
					<button
						className="px-4 py-2 bg-green-600 text-white"
						onClick={() => setSubmitted(true)}
					>
						Submit
					</button>
				</div>
			</div>
		);
	}

	return <RouletteTableMain name={name} />;
};

const RouletteTableMain = ({ name }: { name: string }) => {
	const [selectedChip, setSelectedChip] = useState<COINS>(COINS.One);
	const [balance, setBalance] = useState(2500);
	const [bets, setBets] = useState<Map<Number, number>>(new Map());
	const { socket, loading } = useSocket(name);
	const [state, setState] = useState<GameState>(GameState.GameOver);
	const [spinning, setSpinning] = useState(false);
	const [winningNum, setWinningNum] = useState<Number>();

	const numbers: Number[] = Array.from({ length: 37 }, (_, i) => i);
	const redNumbers = [
		1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
	];

	const handleBet = (spot: BetSpot) => {
		if (state !== GameState.CanBet) {
			return;
		}
		if (balance < selectedChip) {
			toast.error("Insufficient balance");
			return;
		}

		setBets((prev) => {
			const newBets = new Map(prev);
			const currentBet = newBets.get(spot.number) || 0;
			newBets.set(spot.number, currentBet + selectedChip);
			return newBets;
		});

		socket.send(
			JSON.stringify({
				type: "bet",
				clientId: "1",
				amount: selectedChip,
				number: spot.number,
			})
		);

		setBalance((prev) => prev - selectedChip);

		toast.success(`Bet placed on ${spot.number} for value ${selectedChip}`);
	};

	const getNumberColor = (num: number) => {
		if (num === 0) return "bg-table-green text-white";
		return redNumbers.includes(num)
			? "bg-number-red text-white"
			: "bg-number-black text-white";
	};

	useEffect(() => {
		if (!loading && socket) {
			socket.onmessage = (e) => {
				const data = e.data;
				const parsedData: OutgoingMessages = JSON.parse(data);
				// console.log(parsedData);
				if (parsedData.type === "current-state") {
					setState(parsedData.state);
				}

				if (parsedData.type === "start-game") {
					setState(GameState.CanBet);
				}

				if (parsedData.type === "end-game") {
					setState(GameState.GameOver);
				}

				if (parsedData.type === "stop-bets") {
					setState(GameState.CantBet);
					setSpinning(true);
				}

				if (parsedData.type === "won") {
					setWinningNum(parsedData.outcome);
					toast.success(`You won ${parsedData.wonAmount}`);
					setBalance(parsedData.balance);
					setBets(new Map());
					setState(GameState.GameOver);
					setSpinning(false);
					setTimeout(() => {
						setWinningNum(null);
					}, 3000);
				}

				if (parsedData.type === "lost") {
					const winners = new Set(parsedData.winners);
					// console.log(winners);
					setWinningNum(parsedData.outcome);
					if (winners.size > 0) {
						toast.success(
							`You lost. the Winning number was ${parsedData.outcome} and winners are : ${Array.from(winners).map((winner) => winner)}`
						);
					} else {
						toast.success(
							`You lost. the Winning number was ${parsedData.outcome} and dealer wins`
						);
					}
					setBalance(parsedData.balance);
					setBets(new Map());
					setState(GameState.GameOver);
					setSpinning(false);
					setTimeout(() => {
						setWinningNum(null);
					}, 3000);
				}
			};
		}
	}, [socket, loading]);

	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen w-screen bg-black text-white">
				Loading.......
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-table-green p-8 flex flex-col items-center justify-center gap-8">
			<div className="text-white text-2xl font-semibold">
				Balance: ${balance}
			</div>
			{state === GameState.CanBet && "Bets Open"}
			{state === GameState.CantBet && "Bets Closed"}
			{state === GameState.GameOver && "New Game starting soon"}
			<div className="bg-table-green border-4 border-table-border rounded-lg p-8 shadow-2xl">
				{/* Numbers Grid */}
				<div className="grid grid-cols-13 gap-1">
					{numbers.map((num) => (
						<div
							key={num}
							onClick={() => handleBet({ number: num, type: "number" })}
							className={cn(
								"w-12 h-12 flex items-center justify-center cursor-pointer",
								"transition-transform hover:scale-105 font-bold text-lg",
								getNumberColor(num)
							)}
						>
							{num}
							{bets.get(num) && (
								<div className="absolute animate-chip-drop">
									<Chip
										value={bets.get(num) || 0}
										className="w-8 h-8 text-sm"
									/>
								</div>
							)}
						</div>
					))}
				</div>
			</div>

			{/* Chips Selection */}
			{spinning ? (
				<img
					src="/roulette-wheel.png"
					alt="roulette wheel"
					className="h-64 w-64 animate-spin"
					style={{
						animationDuration: "2s",
					}}
				/>
				
			) : (
				<div className="flex gap-4">
					{Object.values(COINS)
						.filter((x) => !isNaN(x as number))
						.map((value: COINS) => (
							<Chip
								key={value}
								value={value}
								selected={selectedChip === value}
								onClick={() => setSelectedChip(value)}
							/>
						))}
				</div>
			)}
			{winningNum && <div className="font-extrabold text-4xl text-green-500 animate-pulse">{winningNum}</div>}
		</div>
	);
};

export default RouletteTable;
