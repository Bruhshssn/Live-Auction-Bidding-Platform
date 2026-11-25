
const express = require("express");
const router = express.Router();

const {
  createAuction,
  getAllAuctions,
  getMyAuctions,
  deleteAuction
} = require("../controller/auctionController");

const protect = require("../middleware/authMiddleware");

// Public marketplace endpoint
router.get("/", getAllAuctions);

// Protected auctioneer endpoints
router.post("/", protect, createAuction);
router.get("/my-auctions", protect, getMyAuctions);
router.delete("/:id", protect, deleteAuction);

module.exports = router;
