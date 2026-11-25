const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const Auction = require("../models/Auction");
const Bid = require("../models/Bid");

let io;

const initializeSocket = (server) => {

    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });

    // Authenticate socket connections
    io.use((socket, next) => {

        try {

            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error("Authentication required"));
            }

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            socket.user = decoded;

            next();

        } catch (error) {

            next(new Error("Invalid or expired token"));

        }

    });

    io.on("connection", (socket) => {

        console.log("User connected:", socket.user.id);

        // Join a particular auction room
        socket.on("joinAuction", async (auctionId, callback) => {

            try {

                const auction = await Auction.findById(auctionId);

                if (!auction) {
                    return callback?.({
                        success: false,
                        message: "Auction not found"
                    });
                }

                const room = `auction:${auctionId}`;

                socket.join(room);

                callback?.({
                    success: true,
                    auction: {
                        id: auction._id,
                        currentBid: auction.currentBid,
                        highestBidder: auction.highestBidder,
                        endsAt: auction.endsAt,
                        status: auction.status
                    }
                });

                console.log(
                    `${socket.user.id} joined auction ${auctionId}`
                );

            } catch (error) {

                callback?.({
                    success: false,
                    message: "Unable to join auction"
                });

            }

        });

        // Place a bid
        socket.on("placeBid", async (data, callback) => {

            try {

                // Only bidders can place bids
                if (socket.user.role !== "BIDDER") {
                    return callback?.({
                        success: false,
                        message: "Only bidders can place bids"
                    });
                }

                const { auctionId, amount } = data;

                if (
                    !auctionId ||
                    !Number.isSafeInteger(amount) ||
                    amount <= 0
                ) {
                    return callback?.({
                        success: false,
                        message: "Invalid bid details"
                    });
                }

                const now = new Date();

                // Read minimum increment for validation
                const auction = await Auction.findById(auctionId)
                    .select("currentBid minBidIncrement status endsAt");

                if (!auction) {
                    return callback?.({
                        success: false,
                        message: "Auction not found"
                    });
                }

                if (
                    auction.status !== "ACTIVE" ||
                    auction.endsAt <= now
                ) {
                    return callback?.({
                        success: false,
                        message: "Auction has ended"
                    });
                }

                const minimumBid =
                    auction.currentBid + auction.minBidIncrement;

                if (amount < minimumBid) {
                    return callback?.({
                        success: false,
                        message: `Minimum acceptable bid is ${minimumBid}`
                    });
                }

                // Atomic MongoDB update
                const updatedAuction = await Auction.findOneAndUpdate(
                    {
                        _id: auctionId,
                        status: "ACTIVE",
                        endsAt: { $gt: now },
                        currentBid: {
                            $lte: amount - auction.minBidIncrement
                        }
                    },
                    {
                        $set: {
                            currentBid: amount,
                            highestBidder: socket.user.id
                        },
                        $inc: {
                            __v: 1
                        }
                    },
                    {
                        new: true
                    }
                );

                // Another bid may have changed the price first
                if (!updatedAuction) {
                    return callback?.({
                        success: false,
                        message: "Your bid was unsuccessful. Refresh and try again."
                    });
                }

                // Save bid history
                const newBid = await Bid.create({
                    auction: auctionId,
                    bidder: socket.user.id,
                    amount: amount
                });

                const bidDetails = {
                    bidId: newBid._id,
                    auctionId: auctionId,
                    bidderId: socket.user.id,
                    amount: updatedAuction.currentBid,
                    highestBidder: updatedAuction.highestBidder,
                    createdAt: newBid.createdAt
                };

                // Send confirmation to the bidder
                callback?.({
                    success: true,
                    message: "Bid placed successfully",
                    bid: bidDetails
                });

                // Broadcast to everyone in this auction room
                io.to(`auction:${auctionId}`).emit(
                    "newBid",
                    bidDetails
                );

            } catch (error) {

                console.error("Bidding error:", error);

                callback?.({
                    success: false,
                    message: "Something went wrong while placing your bid"
                });

            }

        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.user.id);
        });

    });

    return io;
};

const getIO = () => {

    if (!io) {
        throw new Error("Socket.IO is not initialized");
    }

    return io;
};

module.exports = {
    initializeSocket,
    getIO
};