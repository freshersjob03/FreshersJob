import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

function SavedJobs() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const initials = (user?.firstName?.charAt(0) || "") + (user?.lastName?.charAt(0) || "");

  useEffect(() => {
    if (user) fetchSavedJobs();
  }, [user]);

const fetchSavedJobs = async () => {
  try {
    const res = await fetch(`http://localhost:5000/api/jobs/saved/${user.id}`);
    const data = await res.json();
    setSavedJobs(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Failed to load saved jobs!");
    setSavedJobs([]);
  }
  setLoading(false);
};

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
          onClick={() => navigate("/profile")}>
          {initials}
        </div>
      </nav>

      {/* CONTENT */}
      <div style={{ maxWidth: "800px", margin: "24px auto", padding: "0 20px" }}>
        <h2 style={{ fontWeight: 900, marginBottom: "20px" }}>🔖 Saved Jobs</h2>

        {loading && <p style={{ color: "#6b7f8c" }}>Loading saved jobs...</p>}

        {!loading && savedJobs.length === 0 && (
          <div style={{ background: "white", borderRadius: "16px", padding: "40px", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: "2rem", marginBottom: "12px" }}>🔖</div>
            <h3>No saved jobs yet!</h3>
            <p style={{ color: "#6b7f8c", marginTop: "8px" }}>Browse jobs and click bookmark to save them!</p>
            <button onClick={() => navigate("/")} style={{ marginTop: "16px", padding: "10px 24px", background: "linear-gradient(135deg, #3aafc4, #1a7a94)", color: "white", border: "none", borderRadius: "20px", fontFamily: "Nunito, sans-serif", fontWeight: 700, cursor: "pointer" }}>
              Browse Jobs →
            </button>
          </div>
        )}

        {savedJobs.map((job, i) => (
          <div key={i} style={{ background: "white", borderRadius: "16px", padding: "20px", marginBottom: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "2px solid transparent" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#3aafc4"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "transparent"}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "#e8f7fa", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#1a7a94" }}>
                  {job.company.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: "1rem" }}>{job.title}</div>
                  <div style={{ fontSize: "0.82rem", color: "#6b7f8c" }}>{job.company}</div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", marginBottom: "12px", fontSize: "0.8rem", color: "#6b7f8c" }}>
              <span>📍 {job.location}</span>
              <span>💼 {job.job_type}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f0f2f4", paddingTop: "12px" }}>
              <span style={{ fontWeight: 900, color: "#1a7a94" }}>₹{job.salary_min/100000}–{job.salary_max/100000} LPA</span>
              <button onClick={() => navigate(`/job/${job.job_id}`)} style={{ padding: "8px 20px", background: "linear-gradient(135deg, #3aafc4, #1a7a94)", color: "white", border: "none", borderRadius: "20px", fontFamily: "Nunito, sans-serif", fontWeight: 700, cursor: "pointer" }}>
                View Job →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SavedJobs;