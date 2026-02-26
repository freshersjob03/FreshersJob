import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

function PostJob() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", company: "", location: "",
    job_type: "Full-time", salary_min: "", salary_max: "",
    description: "", requirements: ""
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addSkill = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (i) => setSkills(skills.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          salary_min: parseInt(form.salary_min) * 100000,
          salary_max: parseInt(form.salary_max) * 100000,
          skills,
          employer_id: user.id
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert("🎉 Job posted successfully!");
        navigate("/");
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Server error!");
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
    <div style={{ fontFamily: "Nunito, sans-serif", background: "#f5f8fa", minHeight: "100vh" }}>

      {/* NAVBAR */}
      <nav style={{ background: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", position: "sticky", top: 0, zIndex: 100, padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
        <img src="/images/logo.png" height="50" alt="FreshersJob" />
        <button onClick={() => navigate("/")} style={{ padding: "8px 20px", background: "linear-gradient(135deg, #3aafc4, #1a7a94)", color: "white", border: "none", borderRadius: "20px", fontFamily: "Nunito, sans-serif", fontWeight: 700, cursor: "pointer" }}>
          ← Back to Feed
        </button>
      </nav>

      {/* FORM */}
      <div style={{ maxWidth: "700px", margin: "24px auto", padding: "0 20px" }}>
        <h2 style={{ fontWeight: 900, marginBottom: "20px" }}>📝 Post a New Job</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "16px" }}>

            <div>
              <label style={labelStyle}>Job Title</label>
              <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Junior Software Developer" required style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Company Name</label>
              <input name="company" value={form.company} onChange={handleChange} placeholder="Your company name" required style={inputStyle} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Location</label>
                <select name="location" value={form.location} onChange={handleChange} style={inputStyle}>
                  <option value="">Select Location</option>
                  {["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune"].map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Job Type</label>
                <select name="job_type" value={form.job_type} onChange={handleChange} style={inputStyle}>
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Internship</option>
                  <option>Remote</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Min Salary (LPA)</label>
                <input name="salary_min" type="number" value={form.salary_min} onChange={handleChange} placeholder="e.g. 3" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Max Salary (LPA)</label>
                <input name="salary_max" type="number" value={form.salary_max} onChange={handleChange} placeholder="e.g. 6" required style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Job Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe the role..." rows={4} required style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Requirements</label>
              <textarea name="requirements" value={form.requirements} onChange={handleChange} placeholder="List requirements..." rows={4} required style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Skills (press Enter to add)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", padding: "12px", border: "2px solid #dde4e8", borderRadius: "12px", minHeight: "50px" }}>
                {skills.map((skill, i) => (
                  <span key={i} style={{ background: "#e8f7fa", color: "#1a7a94", padding: "4px 12px", borderRadius: "20px", fontSize: "0.82rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                    {skill}
                    <span onClick={() => removeSkill(i)} style={{ cursor: "pointer", fontWeight: 900 }}>×</span>
                  </span>
                ))}
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={addSkill}
                  placeholder="e.g. React.js" style={{ border: "none", outline: "none", fontFamily: "Nunito, sans-serif", fontSize: "0.9rem", minWidth: "120px" }} />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #3aafc4, #1a7a94)", color: "white", border: "none", borderRadius: "12px", fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: "1rem", cursor: "pointer" }}>
              {loading ? "Posting..." : "🚀 Post Job"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}

export default PostJob;