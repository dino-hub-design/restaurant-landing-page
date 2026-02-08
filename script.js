// ===== MENU DATA (edit here) =====
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

// ===== SCROLL SPY NAV =====
const navLinks = [...document.querySelectorAll("#nav a")];
const sections = navLinks.map(a => document.querySelector(a.getAttribute("href")));

function setActiveNav() {
  const y = window.scrollY + 120;
  let idx = 0;
  sections.forEach((sec, i) => {
    if (sec && sec.offsetTop <= y) idx = i;
  });
  navLinks.forEach(a => a.classList.remove("active"));
  navLinks[idx]?.classList.add("active");
}

window.addEventListener("scroll", setActiveNav);
setActiveNav();

// ===== THEME TOGGLE =====
const themeBtn = document.getElementById("themeBtn");
let vibe = 0;

themeBtn.addEventListener("click", () => {
  vibe = (vibe + 1) % 2;
  if (vibe === 1) {
    document.documentElement.style.setProperty("--brand", "#f59e0b");
    document.documentElement.style.setProperty("--brand2", "#f472b6");
  } else {
    document.documentElement.style.setProperty("--brand", "#22c55e");
    document.documentElement.style.setProperty("--brand2", "#60a5fa");
  }
});

// ===== GALLERY MODAL =====
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const closeBtn = document.getElementById("closeModal");

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  modalImg.src = "";
}

function openShot(shot) {
  const img = shot.querySelector("img");
  modalTitle.textContent = shot.dataset.title || "Photo";
  modalDesc.textContent = shot.dataset.desc || "";
  modalImg.src = img.src;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

closeBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

const shots = [...document.querySelectorAll(".shot")];
shots.forEach(s => s.addEventListener("click", () => openShot(s)));

document.getElementById("openGalleryBtn").addEventListener("click", () => {
  if (shots[0]) openShot(shots[0]);
});

// ===== MENU FILTER + SEARCH =====
const menuList = document.getElementById("menuList");
const resultsMsg = document.getElementById("resultsMsg");
const search = document.getElementById("search");
const filterRow = document.getElementById("filterRow");
let activeFilter = "all";

function renderMenu() {
  const q = search.value.trim().toLowerCase();

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

  resultsMsg.textContent = filtered.length
    ? `Showing ${filtered.length} items.`
    : "No results. Try a different search.";
}

filterRow.addEventListener("click", (e) => {
  const btn = e.target.closest(".pill");
  if (!btn) return;
  activeFilter = btn.dataset.filter;

  [...filterRow.querySelectorAll(".pill")].forEach(p => p.classList.remove("active"));
  btn.classList.add("active");
  renderMenu();
});

search.addEventListener("input", renderMenu);
renderMenu();

// ===== RESERVATION FORM VALIDATION =====
const form = document.getElementById("reserveForm");
const formMsg = document.getElementById("formMsg");
const dateInput = document.getElementById("date");

// Min date = today
const today = new Date();
const iso = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
  .toISOString()
  .slice(0, 10);

dateInput.min = iso;

function isPhoneValid(v) {
  return /^[+\d][\d\s-]{7,}$/.test(v.trim());
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  formMsg.textContent = "";

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const guests = document.getElementById("guests").value;

  if (name.length < 2) return (formMsg.textContent = "Please enter your name.");
  if (!isPhoneValid(phone)) return (formMsg.textContent = "Please enter a valid phone number.");
  if (!date || !time || !guests) return (formMsg.textContent = "Please select date, time and guests.");

  formMsg.textContent = `✅ Request sent! (${date} at ${time} for ${guests} guests)`;
  form.reset();
  dateInput.min = iso;
});

document.getElementById("fillDemo").addEventListener("click", () => {
  document.getElementById("name").value = "Dino";
  document.getElementById("phone").value = "+387 61 123 456";
  document.getElementById("date").value = iso;
  document.getElementById("time").value = "19:30";
  document.getElementById("guests").value = "2";
  document.getElementById("occasion").value = "None";
  document.getElementById("notes").value = "Window seat if possible.";
  formMsg.textContent = "Demo details filled.";
});
