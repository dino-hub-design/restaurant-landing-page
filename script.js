// ===============================
// Data
// ===============================
const MENU = [
  { name: "Tomato Bruschetta", desc: "Toasted bread, tomato, basil, olive oil.", price: 7, cat: "starters" },
  { name: "Chicken Caesar Salad", desc: "Crisp romaine, parmesan, house dressing.", price: 9, cat: "starters" },
  { name: "Beef Steak", desc: "Grilled steak, herb butter, seasonal sides.", price: 18, cat: "mains" },
  { name: "Creamy Mushroom Pasta", desc: "Pasta in creamy mushroom sauce.", price: 14, cat: "mains" },
  { name: "Chocolate Lava Cake", desc: "Warm center, vanilla scoop.", price: 8, cat: "desserts" },
  { name: "Cheesecake Slice", desc: "Classic baked cheesecake.", price: 7, cat: "desserts" },
  { name: "Fresh Lemonade", desc: "House lemonade, mint option.", price: 4, cat: "drinks" },
  { name: "Espresso", desc: "Strong, smooth, freshly brewed.", price: 2, cat: "drinks" },
];

// ===============================
// Helpers
// ===============================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

// ===============================
// Smooth anchor + offset handling
// ===============================
function scrollToHash(hash) {
  const target = document.querySelector(hash);
  if (!target) return;

  const header = document.querySelector(".topbar");
  const headerH = header ? header.offsetHeight : 0;

  const y = window.scrollY + target.getBoundingClientRect().top - headerH - 18;
  window.scrollTo({ top: y, behavior: "smooth" });
}

// Make nav clicks smooth and accurate
$$('#nav a').forEach(a => {
  a.addEventListener("click", (e) => {
    const href = a.getAttribute("href");
    if (!href || !href.startsWith("#")) return;
    e.preventDefault();
    scrollToHash(href);
  });
});

// ===============================
// Scroll-spy nav (RELIABLE)
// Picks section closest to viewport center
// ===============================
const navLinks = $$("#nav a");
const sections = navLinks
  .map(a => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);

function setActiveLink(id) {
  navLinks.forEach(a => {
    a.classList.toggle("active", a.getAttribute("href") === `#${id}`);
  });
}

function updateActiveSection() {
  const centerY = window.innerHeight / 2;

  let bestSection = null;
  let bestDistance = Infinity;

  for (const section of sections) {
    const rect = section.getBoundingClientRect();
    const sectionCenter = rect.top + rect.height / 2;
    const distance = Math.abs(sectionCenter - centerY);

    const isVisible = rect.bottom > 80 && rect.top < window.innerHeight - 80;
    if (isVisible && distance < bestDistance) {
      bestDistance = distance;
      bestSection = section;
    }
  }

  if (bestSection) setActiveLink(bestSection.id);
}

// Efficient scroll handler
let ticking = false;
window.addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    updateActiveSection();
    ticking = false;
  });
});

window.addEventListener("resize", updateActiveSection);
updateActiveSection();

// ===============================
// Theme toggle (vibe)
// ===============================
const themeBtn = $("#themeBtn");
let vibe = 0;

themeBtn?.addEventListener("click", () => {
  vibe = (vibe + 1) % 2;
  if (vibe === 1) {
    document.documentElement.style.setProperty("--brand", "#f59e0b");
    document.documentElement.style.setProperty("--brand2", "#f472b6");
  } else {
    document.documentElement.style.setProperty("--brand", "#22c55e");
    document.documentElement.style.setProperty("--brand2", "#60a5fa");
  }
});

// ===============================
// Gallery modal
// ===============================
const modal = $("#modal");
const modalImg = $("#modalImg");
const modalTitle = $("#modalTitle");
const modalDesc = $("#modalDesc");
const closeBtn = $("#closeModal");
const openGalleryBtn = $("#openGalleryBtn");
const shots = $$(".shot");

function closeModal() {
  modal?.classList.remove("open");
  modal?.setAttribute("aria-hidden", "true");
  if (modalImg) modalImg.src = "";
}

function openShot(shot) {
  if (!modal || !modalImg) return;
  const img = shot.querySelector("img");
  if (!img) return;

  modalTitle.textContent = shot.dataset.title || "Photo";
  modalDesc.textContent = shot.dataset.desc || "";
  modalImg.src = img.src;

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

closeBtn?.addEventListener("click", closeModal);
modal?.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

shots.forEach(s => s.addEventListener("click", () => openShot(s)));
openGalleryBtn?.addEventListener("click", () => { if (shots[0]) openShot(shots[0]); });

// ===============================
// Menu filter + search
// ===============================
const menuList = $("#menuList");
const resultsMsg = $("#resultsMsg");
const search = $("#search");
const filterRow = $("#filterRow");
let activeFilter = "all";

function renderMenu() {
  if (!menuList) return;

  const q = (search?.value || "").trim().toLowerCase();

  const filtered = MENU.filter(item => {
    const matchCat = activeFilter === "all" || item.cat === activeFilter;
    const matchText = !q || (item.name + " " + item.desc).toLowerCase().includes(q);
    return matchCat && matchText;
  });

  menuList.innerHTML = filtered.map(item => `
    <div class="item">
      <div>
        <h4>${item.name}</h4>
        <p>${item.desc}</p>
      </div>
      <div class="price">€${item.price}</div>
    </div>
  `).join("");

  if (resultsMsg) {
    resultsMsg.textContent = filtered.length
      ? `Showing ${filtered.length} items.`
      : "No results. Try a different search.";
  }
}

filterRow?.addEventListener("click", (e) => {
  const btn = e.target.closest(".pill");
  if (!btn) return;

  activeFilter = btn.dataset.filter;

  $$(".pill").forEach(p => p.classList.remove("active"));
  btn.classList.add("active");

  renderMenu();
});

search?.addEventListener("input", renderMenu);
renderMenu();

// ===============================
// Reservation form validation
// ===============================
const form = $("#reserveForm");
const formMsg = $("#formMsg");
const dateInput = $("#date");
const fillDemoBtn = $("#fillDemo");

const today = new Date();
const iso = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
  .toISOString()
  .slice(0, 10);

if (dateInput) dateInput.min = iso;

function isPhoneValid(v) {
  return /^[+\d][\d\s-]{7,}$/.test((v || "").trim());
}

form?.addEventListener("submit", (e) => {
  e.preventDefault();
  if (formMsg) formMsg.textContent = "";

  const name = ($("#name")?.value || "").trim();
  const phone = ($("#phone")?.value || "").trim();
  const date = ($("#date")?.value || "").trim();
  const time = ($("#time")?.value || "").trim();
  const guests = ($("#guests")?.value || "").trim();

  if (name.length < 2) return (formMsg.textContent = "Please enter your name.");
  if (!isPhoneValid(phone)) return (formMsg.textContent = "Please enter a valid phone number.");
  if (!date || !time || !guests) return (formMsg.textContent = "Please select date, time and guests.");

  formMsg.textContent = `✅ Request sent! (${date} at ${time} for ${guests} guests)`;
  form.reset();
  if (dateInput) dateInput.min = iso;
});

fillDemoBtn?.addEventListener("click", () => {
  $("#name").value = "Dino";
  $("#phone").value = "+387 61 123 456";
  $("#date").value = iso;
  $("#time").value = "19:30";
  $("#guests").value = "2";
  $("#occasion").value = "None";
  $("#notes").value = "Window seat if possible.";
  if (formMsg) formMsg.textContent = "Demo details filled.";
});
