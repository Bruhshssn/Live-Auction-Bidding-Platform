import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuctioneerDashboard = () => {
  const { user, token } = useAuth();
  const isAuctioneer = user?.role === "AUCTIONEER";
  const currentAuctioneerName =
    user?.name || user?.fullName || user?.username || user?.email || "Auctioneer";

  const [allAuctions, setAllAuctions] = useState([]);
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
        const response = await fetch("http://localhost:5000/api/auctions");

        if (!response.ok) {
          throw new Error("Failed to fetch auctions");
        }

        const data = await response.json();
        setAllAuctions(data.auctions || []);
      } catch (error) {
        console.error("Error fetching auctions:", error);
      } finally {
        setLoadingAuctions(false);
      }
    };

    fetchAuctions();
  }, []);

  // Filter auctions belonging to the logged-in auctioneer
  const myAuctions = useMemo(() => {
    if (!user) return [];
    const ownerIdentifiers = [user.id, user._id, user.username, user.email].filter(Boolean);

    return allAuctions.filter(
      (auction) =>
        ownerIdentifiers.includes(auction.createdBy) ||
        ownerIdentifiers.includes(auction.auctioneerId) ||
        auction.auctioneerName === currentAuctioneerName
    );
  }, [allAuctions, user, currentAuctioneerName]);

  // Calculate live stats from the auctioneer's listings
  const stats = useMemo(() => {
    const now = new Date();
    const completedCount = myAuctions.filter(
      (a) => a.endTime && new Date(a.endTime) <= now
    ).length;
    const activeCount = myAuctions.length - completedCount;

    return [
      {
        title: "Total Auctions",
        value: myAuctions.length
      },
      {
        title: "Active Auctions",
        value: activeCount
      },
      {
        title: "Completed",
        value: completedCount
      }
    ];
  }, [myAuctions]);

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

  const handleCreateAuction = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    const formattedPrice = `₹${Number(newAuction.startingPrice).toLocaleString("en-IN")}`;
    const fallbackImage =
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800";

    const createdItem = {
      id: Date.now(),
      name: newAuction.name,
      category: newAuction.category,
      price: formattedPrice,
      startingPrice: Number(newAuction.startingPrice),
      description: newAuction.description,
      endTime: newAuction.endTime,
      bids: 0,
      image: newAuction.image.trim() || fallbackImage,
      auctioneerName: currentAuctioneerName,
      auctioneerId: user?.id || user?._id,
      createdBy: user?.username || user?.email
    };

    try {
      const response = await fetch("http://localhost:5000/api/auctions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(createdItem)
      });

      if (response.ok) {
        const data = await response.json();
        setAllAuctions((prev) => [data.auction || createdItem, ...prev]);
      } else {
        setAllAuctions((prev) => [createdItem, ...prev]);
      }
    } catch {
      setAllAuctions((prev) => [createdItem, ...prev]);
    } finally {
      setSubmitting(false);
      setNewAuction({
        name: "",
        category: "Electronics",
        startingPrice: "",
        description: "",
        endTime: "",
        image: ""
      });
      setShowCreateModal(false);
    }
  };

  const handleDeleteAuction = async (auctionId) => {
    setDeletingId(auctionId);
    try {
      await fetch(`http://localhost:5000/api/auctions/${auctionId}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
    } catch {
      // Fallback to local state removal if backend endpoint isn't running
    } finally {
      setAllAuctions((prev) => prev.filter((item) => item.id !== auctionId));
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between gap-5 items-start md:items-center">
        <div>
          <p className="text-slate-500">Auctioneer Dashboard</p>

          <h1 className="text-3xl font-black mt-2">
            Welcome, {user?.username || currentAuctioneerName}
          </h1>

          <p className="text-slate-500 mt-2">
            Manage your auctions from one place.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition"
        >
          + Create Auction
        </button>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white border border-slate-200 rounded-2xl p-7"
          >
            <div className="flex justify-between">
              <p className="text-slate-500 font-medium">{stat.title}</p>
            </div>

            <h2 className="text-4xl font-black mt-5">{stat.value}</h2>
          </div>
        ))}
      </div>

      {/* AUCTIONS */}
      <div className="mt-12 bg-white border border-slate-200 rounded-2xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Your Recent Auctions</h2>
          {myAuctions.length > 0 && (
            <span className="text-sm text-slate-500 font-medium">
              {myAuctions.length} {myAuctions.length === 1 ? "listing" : "listings"}
            </span>
          )}
        </div>

        {loadingAuctions ? (
          <div className="text-center py-20 text-slate-500">
            Loading auctions...
          </div>
        ) : myAuctions.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="font-bold text-xl mt-5">No auctions created yet</h3>

            <p className="text-slate-500 mt-2">
              Your created auctions will appear here.
            </p>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="mt-6 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition"
            >
              + Create Your First Auction
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {myAuctions.map((auction) => {
              const isCompleted =
                auction.endTime && new Date(auction.endTime) <= new Date();

              return (
                <div
                  key={auction.id}
                  className="border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition flex flex-col"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={auction.image}
                      alt={auction.name}
                      className="w-full h-52 object-cover"
                    />
                    <span
                      className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${
                        isCompleted
                          ? "bg-slate-900 text-white"
                          : "bg-emerald-500 text-white"
                      }`}
                    >
                      {isCompleted ? "Completed" : "Active"}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-orange-500 text-xs font-bold uppercase tracking-wider">
                        {auction.category}
                      </p>

                      <h3 className="text-lg font-bold mt-1.5">{auction.name}</h3>

                      <p className="text-xs text-slate-500 mt-1">
                        Auctioneer:{" "}
                        <span className="font-semibold text-slate-700">
                          {auction.auctioneerName || currentAuctioneerName}
                        </span>
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mt-5">
                        <div>
                          <p className="text-slate-400 text-xs">Starting Price</p>
                          <p className="font-black text-lg">{auction.price}</p>
                        </div>

                        <p className="text-sm text-slate-500">
                          {auction.bids} bids
                        </p>
                      </div>

                      <div className="flex gap-2.5 mt-5">
                        <Link
                          to={`/auction/${auction.id}`}
                          className="flex-1 text-center bg-slate-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-500 transition"
                        >
                          View Details
                        </Link>

                        {(isAuctioneer || true) && (
                          <button
                            type="button"
                            disabled={deletingId === auction.id}
                            onClick={() => handleDeleteAuction(auction.id)}
                            className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                          >
                            {deletingId === auction.id ? "Deleting..." : "Delete"}
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
      </div>

      {/* CREATE AUCTION MODAL */}
      {showCreateModal && (
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

export default AuctioneerDashboard;