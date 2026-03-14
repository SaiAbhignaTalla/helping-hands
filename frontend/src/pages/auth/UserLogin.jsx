import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function UserLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      const { token, user_id, user_type, name, email } = response.data;

      // Save to auth context
      login({ user_id, user_type, name, email }, token);

      // Redirect based on user type
      if (user_type === "user") {
        navigate("/dashboard");
      } else if (user_type === "volunteer" || user_type === "organization") {
        navigate("/helper/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">HH</span>
          </div>
          <span className="text-2xl font-bold text-slate-800">
            Helping Hands
          </span>
        </Link>
        <h2 className="text-center text-3xl font-bold text-slate-900">
          Sign In
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Users, Volunteers, and Organizations
        </p>
      </div>

      {/* Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-lg sm:px-10 border border-gray-100">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="input-label">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="input-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                autoComplete="current-password"
              />
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">New user?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/register"
                className="w-full btn-outline block text-center"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
