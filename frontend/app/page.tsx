"use client";
import { useState } from "react";
import axios from "axios";

// This component provides a Login and Sign Up form in one.
// You would integrate this into your app's routing.
export default function LoginPage() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");

    const endpoint = isLoginView ? "/login" : "/signup";
    const apiUrl = `http://localhost:8000${endpoint}`;

    try {
      // --- IMPORTANT ---
      // Your /login endpoint expects "form_data" (OAuth2PasswordRequestForm).
      // You CANNOT send JSON. You must send it as FormData.
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const response = await axios.post(apiUrl, formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      // Your /signup endpoint expects JSON, so you might need to adjust
      // if (isLoginView) {
      //   ... send formData
      // } else {
      //   ... send { username, password } as JSON
      // }

      console.log("Success:", response.data);
      // If login is successful, you'll get a token.
      // You should save this token (e.g., in localStorage)
      // and then redirect the user to the chat page.
      if (response.data.access_token) {
        // localStorage.setItem("authToken", response.data.access_token);
        // window.location.href = "/chat"; // Redirect to chat
      }

    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.detail || "An error occurred.");
      } else {
        setError("An unknown error occurred.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 flex flex-col space-y-6">
        {/* Header Text */}
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            {isLoginView ? "Welcome Back!" : "Create an Account"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLoginView
              ? "Sign in to continue to AURA"
              : "Get started with your creative assistant"}
          </p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Username Input */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="your_username"
            />
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="••••••••"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-3 rounded-xl text-white font-medium transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading
              ? "Loading..."
              : isLoginView
              ? "Login"
              : "Create Account"}
          </button>
        </form>

        {/* Toggle Button */}
        <div className="text-center">
          <button
            onClick={() => {
              setIsLoginView(!isLoginView);
              setError(""); // Clear errors when toggling
            }}
            className="text-sm text-blue-600 underline hover:text-blue-800 focus:outline-none"
          >
            {isLoginView
              ? "Don't have an account? Sign Up"
              : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}