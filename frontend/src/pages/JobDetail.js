import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate, useParams } from "react-router-dom";

function JobDetail() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const initials = (user?.firstName?.charAt(0) || "") + (user?.lastName?.charAt(0) || "");

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/jobs/${id}`);
      const data = await res.json();
      setJob(data);
    } catch (err) {
      console.error("Failed to load job!");
    }
    setLoading(false);
  };

  const applyJob = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: id, candidate_id: user.id })
      });
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      alert("Failed to apply!");
    }
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: "40px" }}>Loading...</p>;
  if (!job) return <p style={{ textAlign: "center", marginTop: "40px" }}>Job not found!</p>;

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
      <div style={{ maxWidth: "1100px", margin: "24px auto", padding: "0 20px", display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px" }}>

        {/* MAIN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          <span onClick={() => navigate("/")} style={{ color: "#1a7a94", fontWeight: 700, cursor: "pointer" }}>← Back to Jobs</span>

          {/* Job Header */}
          <div style={{ background: "white", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "#e8f7fa", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "1.1rem", color: "#1a7a94" }}>
                {job.company?.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: "1.4rem", fontWeight: 900 }}>{job.title}</div>
                <div style={{ color: "#6b7f8c", fontWeight: 700 }}>{job.company}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", padding: "16px 0", borderTop: "1px solid #f0f2f4", borderBottom: "1px solid #f0f2f4", marginBottom: "16px" }}>
              <span style={{ color: "#4a6070", fontWeight: 700, fontSize: "0.85rem" }}>📍 {job.location}</span>
              <span style={{ color: "#4a6070", fontWeight: 700, fontSize: "0.85rem" }}>💼 {job.job_type}</span>
              <span style={{ color: "#4a6070", fontWeight: 700, fontSize: "0.85rem" }}>🎓 Fresher</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {job.skills?.map((skill, i) => (
                <span key={i} style={{ background: "#e8f7fa", color: "#1a7a94", fontSize: "0.78rem", fontWeight: 700, padding: "5px 14px", borderRadius: "20px" }}>{skill}</span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontWeight: 900, marginBottom: "16px" }}>📋 Job Description</h3>
            <p style={{ color: "#4a6070", lineHeight: 1.8, fontSize: "0.9rem" }}>{job.description}</p>
          </div>

          {/* Requirements */}
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontWeight: 900, marginBottom: "16px" }}>✅ Requirements</h3>
            <p style={{ color: "#4a6070", lineHeight: 1.8, fontSize: "0.9rem" }}>{job.requirements}</p>
          </div>

        </div>

        {/* SIDEBAR */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#1a7a94", marginBottom: "4px" }}>
              ₹{job.salary_min/100000}–{job.salary_max/100000} LPA
            </div>
            <div style={{ fontSize: "0.78rem", color: "#6b7f8c", marginBottom: "20px" }}>Annual Package</div>
            <div style={{ marginBottom: "20px" }}>
              {[["Job Type", job.job_type], ["Location", job.location], ["Experience", "Fresher"]].map(([label, value], i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f2f4", fontSize: "0.82rem" }}>
                  <span style={{ color: "#6b7f8c" }}>{label}</span>
                  <span style={{ fontWeight: 800 }}>{value}</span>
                </div>
              ))}
            </div>
            <button onClick={applyJob} style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #3aafc4, #1a7a94)", color: "white", border: "none", borderRadius: "12px", fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: "1rem", cursor: "pointer", marginBottom: "10px" }}>
              Apply Now →
            </button>
            <button onClick={() => navigate("/")} style={{ width: "100%", padding: "12px", background: "transparent", border: "2px solid #dde4e8", borderRadius: "12px", fontFamily: "Nunito, sans-serif", fontWeight: 700, color: "#4a6070", cursor: "pointer" }}>
              ← Back to Jobs
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default JobDetail;