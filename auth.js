const validUsers = {
  admin: {
    password: "admin123",
    redirect: "reports.html",
  },
  attendant: {
    password: "park2026",
    redirect: "dashboard.html",
  },
};

const form = document.getElementById("loginForm");
const errorEl = document.getElementById("error");

function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.add("show");
}

function clearError() {
  errorEl.textContent = "";
  errorEl.classList.remove("show");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();

  const username = form.username.value.trim();
  const password = form.password.value;

  const user = validUsers[username.toLowerCase()];

  if (!user || password !== user.password) {
    showError("Invalid username or password. Please try again.");
    form.password.value = "";
    form.password.focus();
    return;
  }

  const role = username.toLowerCase() === "admin" ? "Admin" : "Attendant";
  const session = {
    username: username,
    role: role,
    loggedAt: new Date().toISOString(),
  };
  localStorage.setItem("parkease_session", JSON.stringify(session));

  window.location.href = user.redirect;
});
