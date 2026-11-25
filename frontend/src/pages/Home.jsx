import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user, token } = useAuth();
  const isAuctioneer = user?.role === "AUCTIONEER";

  const [auctions, setAuctions] = useState([]);
  const [loadingAuctions, setLoadingAuctions] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formError, setFormError] = useState("");

  const [newAuction, setNewAuction] = useState({
    name: "",
    category: "Electronics",
    startingPrice: "",
    description: "",
    endTime: "",
    image: ""
  });

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/auctions"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch auctions");
        }

        setAuctions(data.auctions || []);

      } catch (error) {
        console.error("Error fetching auctions:", error);
        setFormError(error.message);

      } finally {
        setLoadingAuctions(false);
      }
    };

    fetchAuctions();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files?.[0];
      if (!file) {
        setNewAuction((prev) => ({ ...prev, image: "" }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAuction((prev) => ({ ...prev, image: reader.result || "" }));
      };
      reader.readAsDataURL(file);
      return;
    }

    setNewAuction((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const canDeleteAuction = (auction) => {
    if (!isAuctioneer || !user) return false;

    const currentUserId = String(user.id || user._id || "");
    const auctioneerId = String(
      auction.auctioneer?._id || auction.auctioneer || ""
    );

    return currentUserId === auctioneerId;
  };

  const handleCreateAuction = async (e) => {
    e.preventDefault();

    setFormError("");
    setSubmitting(true);

    const fallbackImage =
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800";

    try {
      if (!token) {
        throw new Error("Please log in again. Authentication token is missing.");
      }

      const auctionData = {
        title: newAuction.name,
        description: newAuction.description,
        category: newAuction.category,
        startingPrice: Number(newAuction.startingPrice),
        startsAt: new Date().toISOString(),
        endsAt: new Date(newAuction.endTime).toISOString(),
        image: newAuction.image || fallbackImage
      };

      const response = await fetch(
        "http://localhost:5000/api/auctions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(auctionData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Auction creation failed");
      }

      if (!data.auction) {
        throw new Error("Backend did not return the created auction");
      }

      // Only update UI after successful backend creation
      setAuctions((prev) => [data.auction, ...prev]);

      setNewAuction({
        name: "",
        category: "Electronics",
        startingPrice: "",
        description: "",
        endTime: "",
        image: ""
      });

      setShowCreateModal(false);

    } catch (error) {
      console.error("Create auction error:", error);
      setFormError(error.message);

    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAuction = async (auctionId) => {
    setDeletingId(auctionId);
    setFormError("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/auctions/${auctionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete auction");
      }

      setAuctions((prev) =>
        prev.filter((auction) => auction._id !== auctionId)
      );

    } catch (error) {
      console.error("Delete auction error:", error);
      setFormError(error.message);

    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white">
      {/* HERO SECTION */}
      <section className="bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block bg-orange-500/15 text-orange-400 px-4 py-2 rounded-full text-sm mb-6">
              The Future of Online Auctions
            </span>

            <h1 className="text-5xl md:text-6xl font-black leading-tight">
              Bid Smart.
              <br />
              Win <span className="text-orange-500">Big.</span>
            </h1>

            <p className="text-slate-400 mt-6 text-lg leading-relaxed max-w-lg">
              Discover exclusive items, compete with bidders in real time,
              and experience the excitement of live online auctions.
            </p>

            <div className="flex gap-4 mt-8 flex-wrap">
              {isAuctioneer ? (
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="bg-orange-500 hover:bg-orange-600 px-7 py-4 rounded-xl font-bold transition"
                >
                  + Create New Auction
                </button>
              ) : (
                <Link
                  to={user ? "/bidder-dashboard" : "/register"}
                  className="bg-orange-500 hover:bg-orange-600 px-7 py-4 rounded-xl font-bold transition"
                >
                  Start Bidding →
                </Link>
              )}

              <a
                href="#how-it-works"
                className="border border-slate-600 hover:bg-slate-800 px-7 py-4 rounded-xl font-semibold transition"
              >
                How It Works
              </a>
            </div>

            <div className="flex gap-10 mt-12">
              <div>
                <h3 className="text-3xl font-bold">1K+</h3>
                <p className="text-slate-400 text-sm">Registered Users</p>
              </div>

              <div>
                <h3 className="text-3xl font-bold">500+</h3>
                <p className="text-slate-400 text-sm">Auctions Listed</p>
              </div>

              <div>
                <h3 className="text-3xl font-bold">24/7</h3>
                <p className="text-slate-400 text-sm">Live Access</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1000"
              alt="Luxury auction item"
              className="rounded-3xl w-full h-[450px] object-cover"
            />

            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur text-slate-900 p-5 rounded-2xl">
              <p className="text-sm text-slate-500">Featured Collection</p>

              <div className="flex justify-between items-center mt-2">
                <div>
                  <h3 className="font-bold text-lg">Exclusive Auctions</h3>
                  <p className="text-sm text-slate-500">Discover something extraordinary</p>
                </div>

                <span className="text-orange-500 text-2xl">↗</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED AUCTIONS */}
      <section id="auctions" className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex justify-between items-end mb-12 flex-wrap gap-4">
          <div>
            <p className="text-orange-500 font-bold text-sm uppercase tracking-widest">
              Explore Marketplace
            </p>

            <h2 className="text-4xl font-black mt-3">
              Featured Auctions
            </h2>

            <p className="text-slate-500 mt-3">
              Explore some exciting items available for bidding.
            </p>
          </div>

          {isAuctioneer ? (
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="bg-orange-500 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-orange-600 transition"
            >
              + Create Auction
            </button>
          ) : (
            <span className="text-sm font-semibold text-slate-500">
              Live Listings
            </span>
          )}
        </div>

        {formError && !showCreateModal && (
          <p className="bg-red-50 text-red-600 p-3.5 rounded-xl mb-6 text-sm font-medium">
            {formError}
          </p>
        )}

        {loadingAuctions ? (
          <p className="text-center text-slate-500 py-10">
            Loading auctions...
          </p>
        ) : auctions.length === 0 ? (
          <p className="text-center text-slate-500 py-10">
            No auctions available yet.
          </p>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {auctions.map((auction) => {
              const ownerCanDelete = canDeleteAuction(auction);

              return (
                <div
                  key={auction._id}
                  className="border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition group flex flex-col"
                >
                  <div className="overflow-hidden">
                    <img
                      src={auction.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"}
                      alt={auction.title}
                      className="w-full h-60 object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-orange-500 text-xs font-bold uppercase tracking-wider">
                        {auction.category}
                      </p>

                      <h3 className="text-xl font-bold mt-2">
                        {auction.title}
                      </h3>

                      <p className="text-sm text-slate-500 mt-1.5">
                        Auctioneer:{" "}
                        <span className="font-semibold text-slate-700">
                          {auction.auctioneer?.name || "Verified Auctioneer"}
                        </span>
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mt-6">
                        <div>
                          <p className="text-slate-400 text-xs">Starting Price</p>

                          <p className="font-black text-xl">
                            ₹{Number(auction.startingPrice).toLocaleString("en-IN")}
                          </p>
                        </div>

                        <p className="text-sm text-slate-500">
                          {auction.status}
                        </p>
                      </div>

                      <div className="flex gap-2.5 mt-6">
                        <Link
                          to={user ? `/auction/${auction._id}` : "/login"}
                          className="flex-1 text-center bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-orange-500 transition"
                        >
                          Explore Auction
                        </Link>

                        {ownerCanDelete && (
                          <button
                            type="button"
                            disabled={deletingId === auction._id}
                            onClick={() => handleDeleteAuction(auction._id)}
                            className="px-4 py-3 rounded-xl font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                          >
                            {deletingId === auction._id ? "Deleting..." : "Delete"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-orange-500 font-bold text-sm uppercase">
              Simple Process
            </p>

            <h2 className="text-4xl font-black mt-3">
              How BidSphere Works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                number: "01",
                title: "Create an Account",
                description: "Register as an auctioneer or bidder to get started."
              },
              {
                number: "02",
                title: "Explore & Participate",
                description: "Discover auctions or create your own listing."
              },
              {
                number: "03",
                title: "Bid & Win",
                description: "Compete with other users and win exciting auctions."
              }
            ].map((item) => (
              <div key={item.number} className="bg-white p-8 rounded-2xl border border-slate-200">
                <span className="text-4xl font-black text-orange-500">
                  {item.number}
                </span>

                <h3 className="text-xl font-bold mt-6">
                  {item.title}
                </h3>

                <p className="text-slate-500 mt-3 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CREATE AUCTION MODAL (AUCTIONEER ONLY) */}
      {isAuctioneer && showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-7 md:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-orange-500">
                  Auctioneer Studio
                </p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  Create New Auction
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <p className="bg-red-50 text-red-600 p-3 rounded-lg mt-4 text-sm">
                {formError}
              </p>
            )}

            <form onSubmit={handleCreateAuction} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">
                  Item Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={newAuction.name}
                  onChange={handleChange}
                  placeholder="e.g. Vintage Mechanical Keyboard"
                  required
                  className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5">
                    Category
                  </label>
                  <select
                    name="category"
                    value={newAuction.category}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-orange-500 bg-white"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Luxury Watches">Luxury Watches</option>
                    <option value="Automobiles">Automobiles</option>
                    <option value="Art & Collectibles">Art & Collectibles</option>
                    <option value="Fashion">Fashion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5">
                    Starting Price (₹)
                  </label>
                  <input
                    type="number"
                    name="startingPrice"
                    min="1"
                    value={newAuction.startingPrice}
                    onChange={handleChange}
                    placeholder="5000"
                    required
                    className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={newAuction.endTime}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  name="image"
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="3"
                  value={newAuction.description}
                  onChange={handleChange}
                  placeholder="Describe item condition, authenticity, and details..."
                  required
                  className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/3 border border-slate-200 py-3.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-2/3 bg-orange-500 text-white py-3.5 rounded-xl font-bold hover:bg-orange-600 transition disabled:opacity-50"
                >
                  {submitting ? "Publishing..." : "Publish Auction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;