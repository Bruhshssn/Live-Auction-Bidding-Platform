import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {

  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
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
        "http://localhost:5000/api/auth/login",
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
        throw new Error(data.message || "Login failed");
      }

      login(data.user, data.token);

      navigate("/");

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-5 py-12">

      <div className="bg-white w-full max-w-md p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100">

        <Link to="/" className="text-2xl font-black text-slate-900">
          Bid<span className="text-orange-500">Sphere.</span>
        </Link>

        <h1 className="text-3xl font-black mt-10">
          Welcome Back!
        </h1>

        <p className="text-slate-500 mt-2">
          Login to continue your auction experience.
        </p>

        {error && (
          <p className="bg-red-50 text-red-600 p-3 rounded-lg mt-6 text-sm">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">

          <div>
            <label className="block text-sm font-semibold mb-2">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="w-full border border-slate-200 rounded-xl p-4 outline-none focus:border-orange-500"
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
              placeholder="Enter your password"
              required
              className="w-full border border-slate-200 rounded-xl p-4 outline-none focus:border-orange-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold hover:bg-orange-600 transition disabled:opacity-50"
          >
            {loading ? "Logging In..." : "Login to Account"}
          </button>

        </form>

        <p className="text-center text-sm text-slate-500 mt-8">
          Don't have an account?{" "}
          <Link to="/register" className="text-orange-500 font-bold">
            Register
          </Link>
        </p>

      </div>

    </div>
  );

};

export default Login;