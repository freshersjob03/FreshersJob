import React from "react";
import { useClerk, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const navigate = useNavigate();
  const initials = (user?.firstName?.charAt(0) || "") + (user?.lastName?.charAt(0) || "");

  return (
    <div style={{ fontFamily: "Nunito, sans-serif", background: "#f5f8fa", minHeight: "100vh" }}>

      {/* NAVBAR */}
      <nav style={{ background: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", position: "sticky", top: 0, zIndex: 100, padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
        <img src="/images/logo.png" height="50" alt="FreshersJob" />
        <div style={{ display: "flex", gap: "4px" }}>
          {[["Home", "/"], ["Jobs", "/"], ["Network", "/"], ["Messages", "/"], ["Alerts", "/"]].map(([label, path], i) => (
            <span key={i} onClick={() => navigate(path)} style={{ color: "#4a6070", fontWeight: 700, fontSize: "0.78rem", padding: "6px 10px", borderRadius: "8px", cursor: "pointer" }}>{label}</span>
          ))}
        </div>
        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #3aafc4, #1a7a94)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, cursor: "pointer" }}
          onClick={() => signOut()}>
          {initials}
        </div>
      </nav>

      {/* PROFILE LAYOUT */}
      <div style={{ maxWidth: "1100px", margin: "24px auto", padding: "0 20px", display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px" }}>

        {/* MAIN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Profile Header */}
          <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ height: "120px", background: "linear-gradient(135deg, #1a7a94, #3aafc4)" }}></div>
            <div style={{ padding: "0 24px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "16px" }}>
                <div style={{ width: "90px", height: "90px", borderRadius: "50%", background: "linear-gradient(135deg, #3aafc4, #1a7a94)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: "1.8rem", marginTop: "-45px", border: "4px solid white" }}>
                  {initials}
                </div>
                <button style={{ padding: "9px 20px", border: "2px solid #3aafc4", borderRadius: "25px", background: "transparent", color: "#1a7a94", fontFamily: "Nunito, sans-serif", fontWeight: 700, cursor: "pointer" }}>
                  ✏️ Edit Profile
                </button>
              </div>
              <div style={{ fontWeight: 900, fontSize: "1.3rem" }}>{user?.firstName} {user?.lastName}</div>
              <div style={{ color: "#4a6070", fontSize: "0.92rem", marginBottom: "8px" }}>Fresher · Looking for opportunities</div>
              <div style={{ color: "#6b7f8c", fontSize: "0.82rem" }}>📧 {user?.emailAddresses?.[0]?.emailAddress}</div>
            </div>
          </div>

          {/* About */}
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontWeight: 900, marginBottom: "16px" }}>👤 About</h3>
            <p style={{ color: "#4a6070", lineHeight: 1.8, fontSize: "0.9rem" }}>Add a summary about yourself to let recruiters know who you are!</p>
          </div>

          {/* Skills */}
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontWeight: 900, marginBottom: "16px" }}>🛠️ Skills</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {["React.js", "Node.js", "JavaScript", "Python", "SQL"].map((skill, i) => (
                <span key={i} style={{ background: "#e8f7fa", color: "#1a7a94", padding: "7px 16px", borderRadius: "20px", fontSize: "0.82rem", fontWeight: 700 }}>{skill}</span>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ background: "linear-gradient(135deg, #1a7a94, #3aafc4)", borderRadius: "16px", padding: "20px", color: "white" }}>
            <h4 style={{ fontWeight: 900, marginBottom: "8px" }}>📄 Your Resume</h4>
            <p style={{ fontSize: "0.82rem", opacity: 0.88, marginBottom: "14px" }}>Upload your latest resume to apply faster!</p>
            <button style={{ background: "white", color: "#1a7a94", border: "none", borderRadius: "20px", padding: "8px 18px", fontFamily: "Nunito, sans-serif", fontWeight: 800, cursor: "pointer" }}>
              📤 Upload Resume
            </button>
          </div>

          <div style={{ background: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h4 style={{ fontWeight: 900, marginBottom: "14px" }}>💡 Tips to Get Hired</h4>
            {["Add a professional photo", "Upload your resume", "Add at least 5 skills", "Write a strong About section"].map((tip, i) => (
              <div key={i} style={{ fontSize: "0.82rem", color: "#4a6070", display: "flex", gap: "8px", marginBottom: "10px" }}>
                <span>⬜</span>{tip}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Profile;