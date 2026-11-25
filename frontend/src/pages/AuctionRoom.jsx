import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { createSocketConnection } from "../socket";
import { useAuth } from "../context/AuthContext";

const AuctionRoom = () => {

    const { auctionId } = useParams();
    const { user } = useAuth();

    const [socket, setSocket] = useState(null);

    const [currentBid, setCurrentBid] = useState(0);
    const [highestBidder, setHighestBidder] = useState(null);
    const [endsAt, setEndsAt] = useState(null);

    const [bidAmount, setBidAmount] = useState("");
    const [timeLeft, setTimeLeft] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [auctionStatus, setAuctionStatus] = useState("LOADING");

    // Connect to Socket.IO
    useEffect(() => {

        const token = localStorage.getItem("token");

        if (!token) return;

        const newSocket = createSocketConnection(token);

        setSocket(newSocket);

        newSocket.on("connect", () => {

            console.log("Connected to auction server");

            newSocket.emit("joinAuction", auctionId, (response) => {

                if (!response.success) {
                    setError(response.message);
                    setAuctionStatus("ERROR");
                    return;
                }

                setCurrentBid(response.auction.currentBid);
                setHighestBidder(response.auction.highestBidder);
                setEndsAt(response.auction.endsAt);
                setAuctionStatus(response.auction.status);

            });

        });

        newSocket.on("newBid", (data) => {

            setCurrentBid(data.amount);
            setHighestBidder(data.highestBidder);

            setMessage("A new bid has been placed!");

        });

        newSocket.on("connect_error", (err) => {
            setError(err.message);
        });

        return () => {
            newSocket.disconnect();
        };

    }, [auctionId]);

    // Countdown timer
    useEffect(() => {

        if (!endsAt) return;

        const updateTimer = () => {

            const difference = new Date(endsAt).getTime() - Date.now();

            if (difference <= 0) {
                setTimeLeft("Auction Ended");
                setAuctionStatus("COMPLETED");
                return;
            }

            const hours = Math.floor(difference / 3600000);

            const minutes = Math.floor(
                (difference % 3600000) / 60000
            );

            const seconds = Math.floor(
                (difference % 60000) / 1000
            );

            setTimeLeft(
                `${String(hours).padStart(2, "0")}:` +
                `${String(minutes).padStart(2, "0")}:` +
                `${String(seconds).padStart(2, "0")}`
            );

        };

        updateTimer();

        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);

    }, [endsAt]);

    // Place bid
    const handlePlaceBid = () => {

        if (!socket || !socket.connected) {
            setError("Not connected to auction server");
            return;
        }

        const amount = Number(bidAmount);

        if (!Number.isSafeInteger(amount) || amount <= currentBid) {
            setError("Enter a valid bid higher than the current bid");
            return;
        }

        setError("");
        setMessage("");

        socket.emit(
            "placeBid",
            {
                auctionId,
                amount
            },
            (response) => {

                if (!response.success) {
                    setError(response.message);
                    return;
                }

                setMessage("Your bid was accepted!");
                setBidAmount("");

            }
        );

    };

    return (

        <div className="min-h-screen bg-slate-50 px-6 py-12">

            <div className="max-w-5xl mx-auto">

                <div className="bg-slate-950 text-white p-8 md:p-12 rounded-3xl">

                    <p className="text-orange-400 uppercase tracking-widest text-sm font-bold">
                        Live Auction
                    </p>

                    <h1 className="text-4xl font-black mt-4">
                        Premium Auction Room
                    </h1>

                    <p className="text-slate-400 mt-3">
                        Auction ID: {auctionId}
                    </p>

                    <div className="grid md:grid-cols-2 gap-8 mt-12">

                        <div className="bg-slate-800 p-7 rounded-2xl">

                            <p className="text-slate-400">
                                Current Highest Bid
                            </p>

                            <h2 className="text-4xl font-black text-orange-400 mt-3">
                                ₹{currentBid.toLocaleString("en-IN")}
                            </h2>

                        </div>

                        <div className="bg-slate-800 p-7 rounded-2xl">

                            <p className="text-slate-400">
                                Time Remaining
                            </p>

                            <h2 className="text-4xl font-black mt-3">
                                {timeLeft || "--:--:--"}
                            </h2>

                        </div>

                    </div>

                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-8 mt-8">

                    <h2 className="text-2xl font-black">
                        Place Your Bid
                    </h2>

                    <p className="text-slate-500 mt-2">
                        Submit your bid to compete with other participants.
                    </p>

                    {user?.role === "BIDDER" && auctionStatus === "ACTIVE" && (

                        <div className="mt-8">

                            <label className="block font-semibold mb-2">
                                Your Bid Amount (₹)
                            </label>

                            <input
                                type="number"
                                min={currentBid + 1}
                                value={bidAmount}
                                onChange={(e) => setBidAmount(e.target.value)}
                                placeholder="Enter your bid"
                                className="w-full border border-slate-200 p-4 rounded-xl outline-none focus:border-orange-500"
                            />

                            <button
                                onClick={handlePlaceBid}
                                disabled={!socket?.connected}
                                className="w-full mt-5 bg-orange-500 text-white py-4 rounded-xl font-bold hover:bg-orange-600 disabled:opacity-50"
                            >
                                Place Bid →
                            </button>

                        </div>

                    )}

                    {user?.role === "AUCTIONEER" && (
                        <p className="mt-6 text-slate-500">
                            You are viewing this auction as its auctioneer.
                        </p>
                    )}

                    {error && (
                        <p className="mt-5 bg-red-50 text-red-600 p-4 rounded-xl">
                            {error}
                        </p>
                    )}

                    {message && (
                        <p className="mt-5 bg-green-50 text-green-700 p-4 rounded-xl">
                            {message}
                        </p>
                    )}

                    {auctionStatus === "COMPLETED" && (
                        <p className="mt-5 font-bold text-slate-700">
                            This auction has ended.
                        </p>
                    )}

                </div>

            </div>

        </div>

    );

};

export default AuctionRoom;