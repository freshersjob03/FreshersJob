// =============================
//   FreshersJob - Main JS
// =============================

// ── Active Nav Link Highlighter ──
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop();
  const navLinks = document.querySelectorAll(".nav-links a");

  navLinks.forEach(link => {
    const linkPage = link.getAttribute("href");
    if (linkPage === currentPage) {
      link.classList.add("active");
    }
  });
});

// ── Bookmark Toggle ──
document.addEventListener("click", (e) => {
  if (e.target.closest(".bookmark-btn")) {
    const btn = e.target.closest(".bookmark-btn");
    btn.classList.toggle("bookmarked");

    const svg = btn.querySelector("svg path");
    if (btn.classList.contains("bookmarked")) {
      btn.style.color = "#3aafc4";
      btn.title = "Saved!";
    } else {
      btn.style.color = "";
      btn.title = "Save Job";
    }
  }
});

// ── Like Button Toggle ──
document.addEventListener("click", (e) => {
  if (e.target.closest(".like-btn")) {
    const btn = e.target.closest(".like-btn");
    btn.classList.toggle("liked");

    const countEl = btn.querySelector(".like-count");
    if (countEl) {
      let count = parseInt(countEl.textContent);
      countEl.textContent = btn.classList.contains("liked") ? count + 1 : count - 1;
    }

    btn.style.color = btn.classList.contains("liked") ? "#3aafc4" : "";
  }
});

// ── Search Bar Enter Key ──
const searchInput = document.querySelector(".search-bar input");
if (searchInput) {
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const query = searchInput.value.trim();
      if (query) {
        window.location.href = `pages/feed.html?search=${encodeURIComponent(query)}`;
      }
    }
  });
}

// ── Search Button Click ──
const searchBtn = document.querySelector(".search-btn");
if (searchBtn) {
  searchBtn.addEventListener("click", () => {
    const input = document.querySelector(".search-bar input");
    if (input && input.value.trim()) {
      window.location.href = `pages/feed.html?search=${encodeURIComponent(input.value.trim())}`;
    }
  });
}

// ── Notification Bell Badge ──
function updateNotificationBadge(count) {
  const badge = document.querySelector(".notif-badge");
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  }
}

// ── Smooth Scroll for anchor links ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// ── Toast Notification ──
function showToast(message, type = "success") {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  toast.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    background: ${type === "success" ? "#1a7a94" : "#e53935"};
    color: white;
    padding: 14px 24px;
    border-radius: 12px;
    font-family: 'Nunito', sans-serif;
    font-weight: 700;
    font-size: 0.92rem;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    z-index: 9999;
    animation: fadeUp 0.3s ease forwards;
  `;

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ── Mobile Menu Toggle ──
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".nav-links");

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("open");
  });
}

// ── Scroll to top on page load ──
window.scrollTo(0, 0);

console.log("FreshersJob JS loaded ✅");