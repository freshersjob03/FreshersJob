import React, { useState, useEffect } from "react";
import { useClerk, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
function Feed() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/jobs");
      const data = await res.json();
      setJobs(data);
      setFiltered(data);
    } catch (err) {
      setError("Failed to load jobs!");
    }
  };

  const handleSearch = (searchVal, locationVal, typeVal) => {
    let results = jobs;
    if (searchVal) {
      results = results.filter(job =>
        job.title.toLowerCase().includes(searchVal.toLowerCase()) ||
        job.company.toLowerCase().includes(searchVal.toLowerCase()) ||
        job.skills?.some(s => s.toLowerCase().includes(searchVal.toLowerCase()))
      );
    }
    if (locationVal) {
      results = results.filter(job => job.location === locationVal);
    }
    if (typeVal) {
      results = results.filter(job => job.job_type === typeVal);
    }
    setFiltered(results);
  };

  const initials = user?.firstName?.charAt(0) + user?.lastName?.charAt(0) || "YO";

  return (
    <div style={{ fontFamily: "Nunito, sans-serif", background: "#f5f8fa", minHeight: "100vh" }}>

      {/* NAVBAR */}
      <nav style={{
        background: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        position: "sticky", top: 0, zIndex: 100,
        padding: "0 32px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: "64px", gap: "16px"
      }}>
        <img src="/images/logo.png" height="50" alt="FreshersJob" />

        <div style={{ flex: 1, maxWidth: "400px", position: "relative", display: "flex", alignItems: "center" }}>
         <input type="text" placeholder="Search jobs, companies, skills..."
  value={search}
  onChange={e => { setSearch(e.target.value); handleSearch(e.target.value, location, jobType); }}
  style={{ width: "100%", padding: "9px 16px 9px 36px", border: "2px solid #dde4e8", borderRadius: "25px", fontFamily: "Nunito, sans-serif", fontSize: "0.88rem", outline: "none", background: "#f5f8fa" }} /> 
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {["Home", "Jobs", "Network", "Messages", "Alerts"].map((item, i) => (
            <a key={i} href="#" style={{ textDecoration: "none", color: "#4a6070", fontWeight: 700, fontSize: "0.78rem", padding: "6px 10px", borderRadius: "8px", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
              {item}
            </a>
          ))}
        </div>

        <div style={{ position: "relative" }}>
          <div onClick={() => document.getElementById("dropMenu").style.display === "none" ? document.getElementById("dropMenu").style.display = "block" : document.getElementById("dropMenu").style.display = "none"}
            style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #3aafc4, #1a7a94)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer" }}>
            {initials}
          </div>
          <div id="dropMenu" style={{ display: "none", position: "absolute", top: "48px", right: 0, background: "white", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", padding: "8px", minWidth: "160px", zIndex: 999 }}>
            <div onClick={() => navigate("/profile")} style={{ padding: "10px 14px", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", borderRadius: "8px" }}>👤 Profile</div>
            <div onClick={() => navigate("/saved")} style={{ padding: "10px 14px", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", borderRadius: "8px" }}>🔖 Saved Jobs</div>
            <div onClick={() => signOut()} style={{ padding: "10px 14px", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", borderRadius: "8px", color: "#e53935" }}>🚪 Logout</div>
            <div onClick={() => navigate("/post-job")} style={{ padding: "10px 14px", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", borderRadius: "8px" }}>📝 Post a Job</div>
          </div>
        </div>
      </nav>

      {/* FEED LAYOUT */}
      <div style={{ maxWidth: "1100px", margin: "24px auto", padding: "0 20px", display: "grid", gridTemplateColumns: "260px 1fr 280px", gap: "20px" }}>
{/* LEFT SIDEBAR */}
<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

  {/* Profile Card */}
  <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
    <div style={{ height: "60px", background: "linear-gradient(135deg, #3aafc4, #1a7a94)" }}></div>
    <div style={{ padding: "0 16px 16px", textAlign: "center" }}>
      <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "linear-gradient(135deg, #3aafc4, #1a7a94)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: "1.2rem", margin: "-30px auto 10px", border: "3px solid white" }}>
        {initials}
      </div>
      <div style={{ fontWeight: 900, fontSize: "0.95rem" }}>{user?.firstName} {user?.lastName}</div>
      <div style={{ fontSize: "0.78rem", color: "#6b7f8c" }}>Fresher · Looking for opportunities</div>
    </div>
  </div>

  {/* Filter Card */}
  <div style={{ background: "white", borderRadius: "16px", padding: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
    <h4 style={{ fontWeight: 900, marginBottom: "14px", paddingBottom: "8px", borderBottom: "2px solid #f5f8fa" }}>🔍 Filter Jobs</h4>

    <div style={{ marginBottom: "14px" }}>
      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#4a6070", marginBottom: "6px" }}>Job Type</label>
      <select value={jobType} onChange={e => { setJobType(e.target.value); handleSearch(search, location, e.target.value); }}
        style={{ width: "100%", padding: "8px 10px", border: "2px solid #dde4e8", borderRadius: "8px", fontFamily: "Nunito, sans-serif", fontSize: "0.82rem", outline: "none" }}>
        <option value="">All Types</option>
        <option value="Full-time">Full-time</option>
        <option value="Part-time">Part-time</option>
        <option value="Internship">Internship</option>
        <option value="Remote">Remote</option>
      </select>
    </div>

    <div style={{ marginBottom: "14px" }}>
      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#4a6070", marginBottom: "6px" }}>Location</label>
      <select value={location} onChange={e => { setLocation(e.target.value); handleSearch(search, e.target.value, jobType); }}
        style={{ width: "100%", padding: "8px 10px", border: "2px solid #dde4e8", borderRadius: "8px", fontFamily: "Nunito, sans-serif", fontSize: "0.82rem", outline: "none" }}>
        <option value="">All Locations</option>
        {["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune"].map(l => (
          <option key={l} value={l}>{l}</option>
        ))}
      </select>
    </div>

    <button onClick={() => { setSearch(""); setLocation(""); setJobType(""); setFiltered(jobs); }}
      style={{ width: "100%", padding: "10px", background: "linear-gradient(135deg, #3aafc4, #1a7a94)", color: "white", border: "none", borderRadius: "10px", fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
      Clear Filters
    </button>
  </div>

</div>

        {/* MAIN FEED */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "16px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ fontSize: "1rem", fontWeight: 900 }}>Jobs For You 🎯</h2>
              <span style={{ fontSize: "0.82rem", color: "#6b7f8c" }}>{filtered.length} jobs found</span>
            </div>
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}
          {filtered.map(job => (
            <div key={job.id} style={{ background: "white", borderRadius: "16px", padding: "20px", border: "2px solid transparent", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", transition: "all 0.25s", cursor: "pointer" }}
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
                <span>🎓 Fresher</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "14px" }}>
                {job.skills?.map((skill, i) => (
                  <span key={i} style={{ background: "#e8f7fa", color: "#1a7a94", fontSize: "0.72rem", fontWeight: 700, padding: "3px 10px", borderRadius: "20px" }}>{skill}</span>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f0f2f4", paddingTop: "12px" }}>
                <span style={{ fontWeight: 900, color: "#1a7a94" }}>₹{job.salary_min/100000}–{job.salary_max/100000} LPA</span>
                <button onClick={() => navigate(`/job/${job.id}`)}
                  style={{ padding: "8px 20px", background: "linear-gradient(135deg, #3aafc4, #1a7a94)", color: "white", border: "none", borderRadius: "20px", fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>
                  Apply Now →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT SIDEBAR */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ background: "linear-gradient(135deg, #1a7a94, #3aafc4)", borderRadius: "16px", padding: "20px", color: "white" }}>
            <h4 style={{ fontWeight: 900, marginBottom: "8px" }}>💡 Career Tip</h4>
            <p style={{ fontSize: "0.82rem", opacity: 0.88, lineHeight: 1.6, marginBottom: "14px" }}>Complete your profile to get 3x more interview calls!</p>
            <button onClick={() => navigate("/profile")} style={{ background: "white", color: "#1a7a94", border: "none", borderRadius: "20px", padding: "8px 18px", fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: "0.82rem", cursor: "pointer" }}>
              Complete Profile →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Feed;