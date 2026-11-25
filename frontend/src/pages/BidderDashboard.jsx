import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const BidderDashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: "Active Bids",
      value: 0,
      icon: "🔨"
    },
    {
      title: "Auctions Won",
      value: 0,
      icon: "🏆"
    },
    {
      title: "Watching",
      value: 0,
      icon: "❤️"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div>
        <p className="text-slate-500">Bidder Dashboard</p>

        <h1 className="text-3xl font-black mt-2">
          Welcome, {user?.username || user?.name} 👋
        </h1>

        <p className="text-slate-500 mt-2">
          Track your bids and discover exciting auctions.
        </p>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white border border-slate-200 rounded-2xl p-7"
          >
            <div className="flex justify-between">
              <p className="text-slate-500 font-medium">
                {stat.title}
              </p>

              <span className="text-2xl">{stat.icon}</span>
            </div>

            <h2 className="text-4xl font-black mt-5">
              {stat.value}
            </h2>
          </div>
        ))}
      </div>

      {/* AVAILABLE AUCTIONS */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black">
            Explore Auctions
          </h2>

          <Link
            to="/"
            className="text-orange-500 font-semibold"
          >
            View Marketplace →
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
          <div className="text-5xl">🔨</div>

          <h3 className="font-bold text-xl mt-5">
            Ready to place your first bid?
          </h3>

          <p className="text-slate-500 mt-2">
            Available auctions will appear here.
          </p>

          <Link
            to="/"
            className="inline-block mt-6 bg-orange-500 text-white px-7 py-3 rounded-xl font-bold"
          >
            Explore Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BidderDashboard;