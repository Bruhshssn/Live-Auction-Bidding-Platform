import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "BIDDER"
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      navigate("/login", {
        state: { message: "Account created successfully. Please log in." }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-5 py-12">
      <div className="bg-white w-full max-w-lg p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100">
        <Link to="/" className="text-2xl font-black text-slate-900">
          Bid<span className="text-orange-500">Sphere.</span>
        </Link>

        <h1 className="text-3xl font-black mt-8">
          Create Your Account
        </h1>

        <p className="text-slate-500 mt-2">
          Join the auction marketplace today.
        </p>

        {error && (
          <p className="bg-red-50 text-red-600 p-3 rounded-lg mt-5 text-sm">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Username
            </label>

            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
              className="w-full border border-slate-200 rounded-xl p-3.5 outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@gmail.com"
              required
              className="w-full border border-slate-200 rounded-xl p-3.5 outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 8 characters"
              minLength={8}
              required
              className="w-full border border-slate-200 rounded-xl p-3.5 outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-3">
              Choose Your Account Type
            </label>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  role: "AUCTIONEER"
                })}
                className={`p-5 rounded-xl border-2 text-left transition ${
                  formData.role === "AUCTIONEER"
                    ? "border-orange-500 bg-orange-50"
                    : "border-slate-200 hover:border-slate-400"
                }`}
              >
                <span className="text-3xl">🏷️</span>

                <h3 className="font-bold mt-3">
                  Auctioneer
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Create and manage auctions.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  role: "BIDDER"
                })}
                className={`p-5 rounded-xl border-2 text-left transition ${
                  formData.role === "BIDDER"
                    ? "border-orange-500 bg-orange-50"
                    : "border-slate-200 hover:border-slate-400"
                }`}
              >
                <span className="text-3xl">🔨</span>

                <h3 className="font-bold mt-3">
                  Bidder
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Participate in auctions.
                </p>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold hover:bg-orange-600 transition disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-7">
          Already have an account?{" "}
          <Link to="/login" className="text-orange-500 font-bold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;