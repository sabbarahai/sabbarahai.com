/* ============================================================
   SABBARAH AI — Base site behavior (preserved from the original)
   ============================================================ */

const GOOGLE_BOOKING_URL = "https://calendar.app.google/NntsHaXCaKPwTb8h9";
const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.getElementById("navMenu");
const bookingButtons = document.querySelectorAll(".js-booking");

window.addEventListener("scroll", () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
});

navToggle?.addEventListener("click", () => {
  const open = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!open));
  navMenu.classList.toggle("is-open", !open);
});

navMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

bookingButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!GOOGLE_BOOKING_URL) {
      alert("رابط حجز Google Calendar غير مضاف بعد. سنضيفه بعد اعتماد التصميم.");
      return;
    }
    window.open(GOOGLE_BOOKING_URL, "_blank", "noopener,noreferrer");
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
