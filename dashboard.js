const ui = {
  userName: document.getElementById("userName"),
  userRole: document.getElementById("userRole"),
  shiftTime: document.getElementById("shiftTime"),
  occupancyBar: document.getElementById("occupancyBar"),
  occupancyLabel: document.getElementById("occupancyLabel"),
  freeSlots: document.getElementById("freeSlots"),
  vehiclesCount: document.getElementById("vehiclesCount"),
  search: document.getElementById("search"),
  arrivalsTable: document.getElementById("arrivalsTable"),
  navLinks: document.querySelectorAll(".nav__link"),
  notificationBtn: document.getElementById("notifications"),
  quickArrival: document.getElementById("btnArrival"),
  quickSignOut: document.getElementById("btnSignOut"),
  quickPrint: document.getElementById("btnPrint"),
};

function ensureLoggedIn() {
  const session = localStorage.getItem("parkease_session");
  if (!session) {
    window.location.href = "index.html";
    return null;
  }

  try {
    return JSON.parse(session);
  } catch {
    localStorage.removeItem("parkease_session");
    window.location.href = "index.html";
    return null;
  }
}

const dashboardState = {
  user: {
    name: "Park Attendant",
    role: "Attendant",
    shift: "07:00 → 15:00",
  },
  occupancy: {
    totalSlots: 200,
    occupied: 142,
  },
};

function initUser() {
  const session = ensureLoggedIn();
  if (!session) return;

  ui.userName.textContent = session.username;
  ui.userRole.textContent = session.role;
  ui.shiftTime.textContent = dashboardState.user.shift;
}

function updateStats() {
  const { occupied, totalSlots } = dashboardState.occupancy;
  const free = totalSlots - occupied;
  const occupancyPercent = Math.round((occupied / totalSlots) * 100);

  ui.vehiclesCount.textContent = occupied;
  ui.freeSlots.textContent = free;
  ui.occupancyBar.style.width = `${occupancyPercent}%`;
  ui.occupancyBar.setAttribute("aria-valuenow", String(occupancyPercent));
  ui.occupancyLabel.textContent = `Occupancy: ${occupancyPercent}%`;
}

function setupSearch() {
  ui.search.addEventListener("input", (event) => {
    const query = event.target.value.trim().toLowerCase();
    const rows = Array.from(ui.arrivalsTable.querySelectorAll("tr"));

    rows.forEach((row) => {
      const cells = Array.from(row.querySelectorAll("td"));
      const text = cells.map((cell) => cell.textContent.toLowerCase()).join(" ");
      row.style.display = text.includes(query) ? "table-row" : "none";
    });
  });
}

function setupActionsMenu() {
  const menus = document.querySelectorAll(".actions-menu");

  menus.forEach((menu) => {
    const button = menu.querySelector("button");
    const panel = menu.querySelector(".menu");

    button.addEventListener("click", () => {
      panel.classList.toggle("open");
    });

    panel.addEventListener("click", (event) => {
      const action = event.target.getAttribute("data-action");
      if (!action) return;
      const row = menu.closest("tr");
      const plate = row.querySelectorAll("td")[1]?.textContent;

      if (action === "details") {
        alert(`Details for ${plate || "vehicle"}.`);
      }
      if (action === "signout") {
        alert(`Sign out ${plate || "vehicle"}.`);
      }

      panel.classList.remove("open");
    });

    document.addEventListener("click", (event) => {
      if (!menu.contains(event.target)) {
        panel.classList.remove("open");
      }
    });
  });
}

function setupNavLinks() {
  ui.navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      ui.navLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      const target = link.getAttribute("data-nav");
      alert(`Navigating to ${target} (prototype).`);
    });
  });
}

function setupQuickActions() {
  ui.quickArrival.addEventListener("click", () => {
    alert("Register arrival clicked (prototype).");
  });

  ui.quickSignOut.addEventListener("click", () => {
    alert("Vehicle sign-out clicked (prototype)." );
  });

  ui.quickPrint.addEventListener("click", () => {
    window.print();
  });
}

function setupNotifications() {
  ui.notificationBtn.addEventListener("click", () => {
    alert("No new notifications (prototype).");
  });
}

function start() {
  const session = ensureLoggedIn();
  if (!session) return;

  initUser();
  updateStats();
  setupSearch();
  setupActionsMenu();
  setupNavLinks();
  setupQuickActions();
  setupNotifications();
  setupLogout();
}

function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("parkease_session");
    window.location.href = "index.html";
  });
}

start();
