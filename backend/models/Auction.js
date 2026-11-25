
const mongoose = require("mongoose");

const auctionSchema = new mongoose.Schema({

    // Auction creator
    auctioneer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // Auction details
    title: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    image: {
        type: String,
        default: ""
    },

    // Pricing details
    startingPrice: {
        type: Number,
        required: true,
        min: 1
    },

    currentBid: {
        type: Number,
        required: true,
        min: 1
    },

    minBidIncrement: {
        type: Number,
        default: 100,
        min: 1
    },

    // Highest bidder
    highestBidder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    // Auction timing
    startsAt: {
        type: Date,
        required: true
    },

    endsAt: {
        type: Date,
        required: true
    },

    // Auction status
    status: {
        type: String,
        enum: ["UPCOMING", "ACTIVE", "COMPLETED"],
        default: "UPCOMING"
    }

}, {
    timestamps: true
});

// Validate auction duration
auctionSchema.pre("validate", function () {

    if (this.endsAt <= this.startsAt) {
        this.invalidate(
            "endsAt",
            "Auction end time must be after start time"
        );
    }

    if (this.currentBid < this.startingPrice) {
        this.invalidate(
            "currentBid",
            "Current bid cannot be lower than starting price"
        );
    }

});

// Indexes for marketplace queries
auctionSchema.index({ status: 1, endsAt: 1 });
auctionSchema.index({ auctioneer: 1, createdAt: -1 });

module.exports = mongoose.model("Auction", auctionSchema);
