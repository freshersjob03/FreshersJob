import React, { useState } from "react";
import { useSignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const { signUp, isLoaded } = useSignUp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep(2);
    } catch (err) {
      setError(err.errors?.[0]?.message || "Signup failed!");
    }
    setLoading(false);
  };

  const handleOTP = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: otp });
      if (result.status === "complete") {
        navigate("/");
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || "Invalid OTP!");
    }
    setLoading(false);
  };

  const inputStyle = {
    width: "100%", padding: "12px 16px",
    border: "2px solid #dde4e8", borderRadius: "12px",
    fontFamily: "Nunito, sans-serif", fontSize: "0.95rem", outline: "none"
  };

  const labelStyle = {
    display: "block", fontWeight: 700,
    fontSize: "0.88rem", color: "#4a6070", marginBottom: "8px"
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
          {step === 1 ? "Create Account 🚀" : "Verify Email 📧"}
        </h2>
        <p style={{ textAlign: "center", color: "#6b7f8c", marginBottom: "28px" }}>
          {step === 1 ? "Join FreshersJob for free" : `We sent a code to ${email}`}
        </p>

        {error && <p style={{ color: "#e53935", textAlign: "center", marginBottom: "16px" }}>{error}</p>}

        {step === 1 ? (
          <form onSubmit={handleSignup}>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com" required style={inputStyle} />
            </div>
            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Create a strong password" required style={inputStyle} />
            </div>
            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "14px",
              background: "linear-gradient(135deg, #3aafc4, #1a7a94)",
              color: "white", border: "none", borderRadius: "12px",
              fontFamily: "Nunito, sans-serif", fontWeight: 800,
              fontSize: "1rem", cursor: "pointer"
            }}>
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOTP}>
            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>Enter OTP Code</label>
              <input type="text" value={otp} onChange={e => setOtp(e.target.value)}
                placeholder="Enter 6-digit code" required style={{ ...inputStyle, textAlign: "center", fontSize: "1.5rem", letterSpacing: "8px" }} />
            </div>
            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "14px",
              background: "linear-gradient(135deg, #3aafc4, #1a7a94)",
              color: "white", border: "none", borderRadius: "12px",
              fontFamily: "Nunito, sans-serif", fontWeight: 800,
              fontSize: "1rem", cursor: "pointer"
            }}>
              {loading ? "Verifying..." : "Verify OTP →"}
            </button>
          </form>
        )}

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "0.88rem", color: "#6b7f8c" }}>
          Already have an account? <a href="/login" style={{ color: "#1a7a94", fontWeight: 800 }}>Login</a>
        </p>
      </div>
    </div>
  );
}

export default Signup;