
const Auction = require("../models/Auction");

// CREATE AUCTION
const createAuction = async (req, res) => {
  try {
    if (req.user.role !== "AUCTIONEER") {
      return res.status(403).json({
        message: "Only auctioneers can create auctions"
      });
    }

    const {
      title,
      description,
      category,
      startingPrice,
      startsAt,
      endsAt,
      image
    } = req.body;

    if (
      !title ||
      !description ||
      !category ||
      startingPrice === undefined ||
      !startsAt ||
      !endsAt
    ) {
      return res.status(400).json({
        message: "Please provide all required auction details"
      });
    }

    const price = Number(startingPrice);
    const startDate = new Date(startsAt);
    const endDate = new Date(endsAt);
    const now = new Date();

    if (!Number.isFinite(price) || price < 1) {
      return res.status(400).json({
        message: "Starting price must be at least ₹1"
      });
    }

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      endDate <= startDate ||
      endDate <= now
    ) {
      return res.status(400).json({
        message: "Please provide valid future auction dates"
      });
    }

    const auction = await Auction.create({
      auctioneer: req.user.id,
      title,
      description,
      category,
      startingPrice: price,
      currentBid: price,
      startsAt: startDate,
      endsAt: endDate,
      image: image || "",
      status: startDate <= now ? "ACTIVE" : "UPCOMING"
    });

    res.status(201).json({
      message: "Auction created successfully",
      auction
    });

  } catch (error) {
    console.error("Create auction error:", error);

    res.status(500).json({
      message: error.message || "Failed to create auction"
    });
  }
};


// GET ALL AUCTIONS (MARKETPLACE)
const getAllAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find()
      .populate("auctioneer", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: auctions.length,
      auctions
    });

  } catch (error) {
    console.error("Fetch auctions error:", error);

    res.status(500).json({
      message: "Failed to fetch auctions"
    });
  }
};


// GET AUCTIONS CREATED BY LOGGED-IN AUCTIONEER
const getMyAuctions = async (req, res) => {
  try {
    if (req.user.role !== "AUCTIONEER") {
      return res.status(403).json({
        message: "Only auctioneers can access this resource"
      });
    }

    const auctions = await Auction.find({
      auctioneer: req.user.id
    })
      .populate("auctioneer", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: auctions.length,
      auctions
    });

  } catch (error) {
    console.error("Fetch my auctions error:", error);

    res.status(500).json({
      message: "Failed to fetch your auctions"
    });
  }
};


// DELETE AUCTION
const deleteAuction = async (req, res) => {
  try {
    if (req.user.role !== "AUCTIONEER") {
      return res.status(403).json({
        message: "Only auctioneers can delete auctions"
      });
    }

    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({
        message: "Auction not found"
      });
    }

    if (auction.auctioneer.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only delete your own auctions"
      });
    }

    if (auction.status === "COMPLETED") {
      return res.status(400).json({
        message: "Completed auctions cannot be deleted"
      });
    }

    await auction.deleteOne();

    res.status(200).json({
      message: "Auction deleted successfully"
    });

  } catch (error) {
    console.error("Delete auction error:", error);

    res.status(500).json({
      message: "Failed to delete auction"
    });
  }
};


module.exports = {
  createAuction,
  getAllAuctions,
  getMyAuctions,
  deleteAuction
};
