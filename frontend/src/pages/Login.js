import React, { useState } from "react";
import { useSignIn } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

function Login() {
  const { signIn, isLoaded } = useSignIn();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    try {
      const result = await signIn.create({
        identifier: email,
        password: password,
      });
      if (result.status === "complete") {
        navigate("/");
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || "Login failed!");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", fontFamily: "Nunito, sans-serif",
      background: "linear-gradient(135deg, #e8f7fa 0%, #f0fbfe 50%, #d6f0f5 100%)"
    }}>
      <div style={{
        background: "white", borderRadius: "24px", padding: "40px",
        width: "100%", maxWidth: "460px", boxShadow: "0 20px 60px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ textAlign: "center", fontWeight: 900, fontSize: "1.5rem", marginBottom: "8px" }}>
          Welcome Back 👋
        </h2>
        <p style={{ textAlign: "center", color: "#6b7f8c", marginBottom: "28px" }}>
          Login to FreshersJob
        </p>

        {error && <p style={{ color: "#e53935", textAlign: "center", marginBottom: "16px" }}>{error}</p>}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontWeight: 700, fontSize: "0.88rem", color: "#4a6070", marginBottom: "8px" }}>
              Email Address
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com" required
              style={{ width: "100%", padding: "12px 16px", border: "2px solid #dde4e8", borderRadius: "12px", fontFamily: "Nunito, sans-serif", fontSize: "0.95rem", outline: "none" }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontWeight: 700, fontSize: "0.88rem", color: "#4a6070", marginBottom: "8px" }}>
              Password
            </label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password" required
              style={{ width: "100%", padding: "12px 16px", border: "2px solid #dde4e8", borderRadius: "12px", fontFamily: "Nunito, sans-serif", fontSize: "0.95rem", outline: "none" }}
            />
          </div>

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "14px",
            background: "linear-gradient(135deg, #3aafc4, #1a7a94)",
            color: "white", border: "none", borderRadius: "12px",
            fontFamily: "Nunito, sans-serif", fontWeight: 800,
            fontSize: "1rem", cursor: "pointer"
          }}>
            {loading ? "Logging in..." : "Login to FreshersJob"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "0.88rem", color: "#6b7f8c" }}>
          Don't have an account? <a href="/signup" style={{ color: "#1a7a94", fontWeight: 800 }}>Sign up</a>
        </p>
      </div>
    </div>
  );
}

export default Login;