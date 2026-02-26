import React from "react";
import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "Nunito, sans-serif", background: "#f5f8fa", overflowX: "hidden" }}>

      {/* NAVBAR */}
    <nav style={{ background: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "68px" }}>
  <img src="/images/logo.png" height="50" alt="FreshersJob" />
  
  {/* NAV LINKS */}
<div style={{ display: "flex", gap: "8px" }}>
  {[["Home", "/", true], ["Browse Jobs", "/login", false], ["For Employers", "/post-job", false]].map(([label, path, active], i) => (
    <span key={i} onClick={() => navigate(path)} style={{ 
      color: active ? "#1a7a94" : "#4a6070", 
      fontWeight: 700, 
      fontSize: "0.88rem", 
      padding: "8px 12px", 
      borderRadius: "8px", 
      cursor: "pointer",
      background: active ? "#e8f7fa" : "transparent"
    }}>
      {label}
    </span>
  ))}
</div>

  <div style={{ display: "flex", gap: "12px" }}>
    <button onClick={() => navigate("/login")} style={{ padding: "10px 22px", borderRadius: "25px", border: "2px solid #3aafc4", background: "transparent", color: "#1a7a94", fontFamily: "Nunito, sans-serif", fontWeight: 700, cursor: "pointer" }}>
      Sign In
    </button>
    <button onClick={() => navigate("/signup")} style={{ padding: "10px 22px", borderRadius: "25px", border: "none", background: "linear-gradient(135deg, #3aafc4, #1a7a94)", color: "white", fontFamily: "Nunito, sans-serif", fontWeight: 700, cursor: "pointer" }}>
      Get Started
    </button>
  </div>
</nav>

      {/* HERO */}
      <div style={{ background: "linear-gradient(135deg, #e8f7fa 0%, #f0fbfe 50%, #d6f0f5 100%)", padding: "80px 40px", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "#e8f7fa", color: "#1a7a94", fontWeight: 700, fontSize: "0.8rem", padding: "6px 16px", borderRadius: "20px", marginBottom: "20px", border: "1px solid rgba(58,175,196,0.3)" }}>
          🎓 India's #1 Platform for Freshers
        </div>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", fontWeight: 900, lineHeight: 1.15, color: "#1c2b35", marginBottom: "16px" }}>
          Find Your <span style={{ color: "#3aafc4" }}>Dream Job</span><br />Start Your Career Today
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#6b7f8c", maxWidth: "540px", margin: "0 auto 36px", lineHeight: 1.7 }}>
          Thousands of top companies are hiring freshers. Apply in one click and land the job you deserve.
        </p>

        {/* Search Bar */}
        <div style={{ background: "white", borderRadius: "50px", display: "flex", alignItems: "center", maxWidth: "680px", margin: "0 auto 20px", padding: "8px 8px 8px 24px", boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}>
          <input type="text" placeholder="Job title, skills or company..." style={{ flex: 1, border: "none", outline: "none", fontFamily: "Nunito, sans-serif", fontSize: "1rem", color: "#1c2b35", padding: "6px 14px", background: "transparent" }} />
          <button onClick={() => navigate("/login")} style={{ background: "linear-gradient(135deg, #3aafc4, #1a7a94)", color: "white", border: "none", borderRadius: "40px", padding: "12px 28px", fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer" }}>
            Search Jobs
          </button>
        </div>

        {/* Popular Tags */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ color: "#6b7f8c", fontSize: "0.88rem", fontWeight: 600 }}>Popular:</span>
          {["Software Engineer", "Data Analyst", "UI/UX Designer", "Marketing", "Finance"].map((tag, i) => (
            <span key={i} onClick={() => navigate("/login")} style={{ background: "white", color: "#1a7a94", border: "1.5px solid rgba(58,175,196,0.4)", padding: "5px 14px", borderRadius: "20px", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div style={{ background: "white", padding: "28px 40px", display: "flex", justifyContent: "center", gap: "60px", borderBottom: "1px solid #eef2f4", flexWrap: "wrap" }}>
        {[["50,000+", "Active Jobs"], ["12,000+", "Companies Hiring"], ["2.5M+", "Freshers Placed"], ["95%", "Satisfaction Rate"]].map(([num, label], i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#1a7a94" }}>{num}</div>
            <div style={{ fontSize: "0.82rem", color: "#6b7f8c", fontWeight: 600 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* CATEGORIES */}
      <section style={{ padding: "70px 40px", background: "white" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 900, color: "#1c2b35", marginBottom: "10px" }}>Browse by Category</h2>
          <p style={{ color: "#6b7f8c" }}>Find jobs in your field of interest</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "16px", maxWidth: "1100px", margin: "0 auto" }}>
          {[["💻", "Software & IT", "18,240 Jobs"], ["📢", "Marketing", "7,890 Jobs"], ["💰", "Finance", "5,120 Jobs"], ["🎓", "Education", "4,300 Jobs"], ["🎨", "Design", "3,560 Jobs"], ["📞", "Sales & CRM", "6,700 Jobs"], ["📱", "Media & PR", "2,800 Jobs"], ["👥", "HR & Admin", "3,100 Jobs"]].map(([icon, title, count], i) => (
            <div key={i} onClick={() => navigate("/login")} style={{ background: "#f5f8fa", border: "2px solid transparent", borderRadius: "16px", padding: "24px 16px", textAlign: "center", cursor: "pointer", transition: "all 0.25s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#3aafc4"; e.currentTarget.style.background = "#e8f7fa"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.background = "#f5f8fa"; }}>
              <div style={{ fontSize: "2rem", marginBottom: "12px" }}>{icon}</div>
              <div style={{ fontWeight: 800, fontSize: "0.88rem", color: "#1c2b35", marginBottom: "4px" }}>{title}</div>
              <div style={{ fontSize: "0.75rem", color: "#6b7f8c", fontWeight: 600 }}>{count}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "70px 40px", background: "#f5f8fa" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 900, color: "#1c2b35", marginBottom: "10px" }}>How FreshersJob Works</h2>
          <p style={{ color: "#6b7f8c" }}>Get hired in 3 simple steps</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "32px", maxWidth: "900px", margin: "0 auto" }}>
          {[["1", "Create Your Profile", "Sign up and build your professional profile with your skills and resume in minutes."], ["2", "Discover & Apply", "Browse thousands of fresher-friendly jobs and apply with a single click."], ["3", "Get Hired 🎉", "Connect with recruiters, attend interviews, and start your dream career!"]].map(([num, title, desc], i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ width: "60px", height: "60px", background: "linear-gradient(135deg, #3aafc4, #1a7a94)", color: "white", fontSize: "1.5rem", fontWeight: 900, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 6px 18px rgba(58,175,196,0.3)" }}>{num}</div>
              <h4 style={{ fontWeight: 800, color: "#1c2b35", marginBottom: "8px" }}>{title}</h4>
              <p style={{ fontSize: "0.88rem", color: "#6b7f8c", lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div style={{ background: "linear-gradient(135deg, #1a7a94, #3aafc4)", padding: "80px 40px", textAlign: "center", color: "white" }}>
        <h2 style={{ fontSize: "2.2rem", fontWeight: 900, marginBottom: "14px" }}>Ready to Launch Your Career? 🚀</h2>
        <p style={{ fontSize: "1.05rem", opacity: 0.88, marginBottom: "32px", maxWidth: "500px", margin: "0 auto 32px" }}>
          Join over 2.5 million freshers who found their dream jobs on FreshersJob. It's completely free!
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
          <button onClick={() => navigate("/signup")} style={{ background: "white", color: "#1a7a94", padding: "14px 32px", borderRadius: "30px", fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: "1rem", border: "none", cursor: "pointer" }}>
            Create Free Account
          </button>
          <button onClick={() => navigate("/post-job")} style={{ background: "transparent", color: "white", padding: "14px 32px", borderRadius: "30px", fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: "1rem", border: "2px solid rgba(255,255,255,0.6)", cursor: "pointer" }}>
            Post a Job
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: "#1c2b35", color: "#8a9baa", padding: "50px 40px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "40px", maxWidth: "1100px", margin: "0 auto 40px" }}>
          <div>
            <img src="/images/logo.png" height="40" alt="FreshersJob" style={{ marginBottom: "10px" }} />
            <p style={{ fontSize: "0.88rem", lineHeight: 1.7, color: "#6a7f8e" }}>India's most trusted job platform for freshers. Find your dream job today.</p>
          </div>
          {[["For Job Seekers", ["Browse Jobs", "Upload Resume", "Career Advice", "Job Alerts"]], ["For Employers", ["Post a Job", "Search Resumes", "Pricing Plans"]], ["Company", ["About Us", "Contact", "Privacy Policy", "Terms"]]].map(([title, links], i) => (
            <div key={i}>
              <h5 style={{ color: "white", fontWeight: 800, marginBottom: "16px", fontSize: "0.9rem" }}>{title}</h5>
              {links.map((link, j) => (
                <div key={j} onClick={() => navigate("/login")} style={{ color: "#6a7f8e", fontSize: "0.85rem", marginBottom: "8px", cursor: "pointer" }}>{link}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid #2a3b46", paddingTop: "20px", textAlign: "center", fontSize: "0.82rem", color: "#4a6070", maxWidth: "1100px", margin: "0 auto" }}>
          © 2026 FreshersJob · Find Your Dream Job · Made in India ❤️
        </div>
      </footer>

    </div>
  );
}

export default Landing;