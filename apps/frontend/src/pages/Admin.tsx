import { useSocket } from "@/hooks/use-socket";
import { cn } from "@/lib/utils";
import { GameState, Number, OutgoingMessages } from "@repo/common/types";
import { useEffect, useState } from "react";

const Admin = () => {
	const [password, setPassword] = useState("");
	const [submitted, setSubmitted] = useState(false);

	if (!submitted) {
		return (
			<div className="flex justify-center items-center bg-black h-screen w-screen">
				<div className="flex flex-col gap-2">
					<div className="text-white text-center font-bold text-4xl">
						Enter Admin Password
					</div>
					<input
						type="text"
						onChange={(e) => setPassword(e.target.value)}
						className="px-6 py-2"
					/>
					<button
						className="px-4 py-2 bg-red-600 text-white"
						onClick={() => setSubmitted(true)}
					>
						Submit
					</button>
				</div>
			</div>
		);
	}

	return <AdminMain password={password} />;
};

const AdminMain = ({ password }: { password: string }) => {
	const { socket, loading } = useSocket(password);
	const [state, setState] = useState<GameState>(GameState.GameOver);

	const numbers: Number[] = Array.from({ length: 37 }, (_, i) => i);
	const redNumbers = [
		1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
	];

	const getNumberColor = (num: number) => {
		if (num === 0) return "bg-table-green text-white";
		return redNumbers.includes(num)
			? "bg-number-red text-white"
			: "bg-number-black text-white";
	};

	const handleSelect = ({ number }) => {
		socket.send(
			JSON.stringify({
				type: "end-game",
				output: number,
			})
		);
	};

	const handleSpin = () =>{
		// console.log("spin wheel for random number")
		const winningNum =  Math.floor(Math.random() * 37);
		setTimeout(() => {
			handleSelect({number : winningNum});
		}, 3000);
	}

	useEffect(() => {
		if (!loading && socket) {
			socket.onmessage = (e) => {
				const data = e.data;
				const parsedData: OutgoingMessages = JSON.parse(data);
				if (parsedData.type === "current-state") {
					setState(parsedData.state);
				}

				if (parsedData.type === "start-game") {
					setState(GameState.CanBet);
				}

				if (parsedData.type === "won" || parsedData.type === "lost") {
					setState(GameState.GameOver);
				}

				if (parsedData.type === "stop-bets") {
					setState(GameState.CantBet);
				}
			};
		}
	}, [socket, loading]);

	return (
		<div className="min-h-screen bg-table-green p-8 flex flex-col items-center justify-center gap-8">
			{state === GameState.CanBet && "Bets Open"}
			{state === GameState.CantBet && "Bets Closed"}
			{state === GameState.GameOver && "Game Over"}
			<div className="bg-table-green border-4 border-table-border rounded-lg p-8 shadow-2xl">
				{/* Numbers Grid */}
				<div className="grid grid-cols-13 gap-1">
					{numbers.map((num) => (
						<div
							key={num}
							onClick={() => handleSelect({ number: num })}
							className={cn(
								"w-12 h-12 flex items-center justify-center cursor-pointer",
								"transition-transform hover:scale-105 font-bold text-lg",
								getNumberColor(num)
							)}
						>
							{num}
						</div>
					))}
				</div>
				<div className="flex justify-center mt-10">
					<button className={`px-6 py-2 ${state === GameState.CantBet ? "bg-green-600" : "disabled bg-green-600/50 hover:cursor-not-allowed"} text-white text-xl font-semibold rounded-md`} onClick={handleSpin}>SPIN</button>
				</div>
			</div>

			<button
				onClick={() =>
					socket.send(
						JSON.stringify({
							type: "start-game",
						})
					)
				}
				className={`${state === GameState.GameOver ? "bg-green-600" : "disabled bg-green-600/50 hover:cursor-not-allowed"} px-6 py-2 rounded-md text-xl font-bold text-white`}
			>
				Start Game 
			</button>
			<button
				onClick={() =>
					socket.send(
						JSON.stringify({
							type: "stop-bets",
						})
					)
				}
				className={`${state === GameState.CanBet ? "bg-green-600 " : "disabled bg-green-600/50  hover:cursor-not-allowed"} px-6 py-2 rounded-md text-xl font-bold text-white`}
			>
				Stop Bets 
			</button>
		</div>
	);
};

export default Admin;
