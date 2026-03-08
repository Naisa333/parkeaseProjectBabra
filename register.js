const form = {
  driverName: document.getElementById("driverName"),
  phone: document.getElementById("phone"),
  vehicleType: document.getElementById("vehicleType"),
  numberPlate: document.getElementById("numberPlate"),
  vehicleModel: document.getElementById("vehicleModel"),
  nin: document.getElementById("nin"),
  ninField: document.getElementById("ninField"),
  receipt: document.getElementById("receipt"),
  printBtn: document.getElementById("printBtn"),
  profileInfo: document.getElementById("profileInfo"),
  sessionInfo: document.getElementById("sessionInfo"),
  clearBtn: document.getElementById("clearBtn"),
  submitBtn: document.getElementById("submitBtn"),
  errors: {
    driverName: document.getElementById("driverNameError"),
    phone: document.getElementById("phoneError"),
    vehicleType: document.getElementById("vehicleTypeError"),
    numberPlate: document.getElementById("numberPlateError"),
    vehicleModel: document.getElementById("vehicleModelError"),
    nin: document.getElementById("ninError"),
  },
};

function getSession() {
  const raw = localStorage.getItem("parkease_session");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function formatReceipt() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `PE-${year}-${month}-${random}`;
}

function setSessionInfo() {
  const session = getSession();
  if (session) {
    form.profileInfo.textContent = `${session.username} (${session.role})`;
    const started = new Date(session.loggedAt);
    form.sessionInfo.textContent = `Session started: ${started.toLocaleString()}`;
  }
}

function showFieldError(field, message) {
  form.errors[field].textContent = message;
  form.errors[field].classList.add("show");
}

function clearFieldError(field) {
  form.errors[field].textContent = "";
  form.errors[field].classList.remove("show");
}

function clearAllErrors() {
  Object.keys(form.errors).forEach((key) => clearFieldError(key));
}

function validateName(value) {
  if (!value.trim()) return "Name is required.";
  if (!/^[A-Z][a-zA-Z ]+$/.test(value.trim())) {
    return "Must start with capital letter and contain no numbers.";
  }
  return "";
}

function validatePhone(value) {
  const normalized = value.trim();
  if (!normalized) return "Phone number is required.";
  const patterns = [
    /^\+256\d{9}$/,
    /^0[67]\d{8}$/,
  ];
  const valid = patterns.some((p) => p.test(normalized));
  return valid ? "" : "Enter a valid Ugandan number (e.g. +256700000000 or 0700000000).";
}

function validateVehicleType(value) {
  return value ? "" : "Please pick a vehicle type.";
}

function validateNumberPlate(value) {
  const v = value.trim().toUpperCase();
  if (!v) return "Number plate is required.";
  if (!/^U[A-Z0-9 ]{1,6}$/.test(v)) {
    return "Start with U; only letters/numbers; max 7 chars.";
  }
  return "";
}

function validateVehicleModel(value) {
  return value.trim() ? "" : "Vehicle model/color is required.";
}

function validateNin(value, required) {
  const v = value.trim();
  if (!required) return "";
  if (!v) return "NIN is required for boda-boda.";
  if (!/^(CM|CF)[A-Z0-9]+$/i.test(v)) {
    return "NIN must start with CM/CF followed by letters/numbers.";
  }
  return "";
}

function updateNinVisibility() {
  const isBoda = form.vehicleType.value === "boda";
  form.ninField.style.display = isBoda ? "block" : "none";
}

function clearForm() {
  form.driverName.value = "";
  form.phone.value = "";
  form.vehicleType.value = "";
  form.numberPlate.value = "";
  form.vehicleModel.value = "";
  form.nin.value = "";
  updateNinVisibility();
  clearAllErrors();
}

function handleSubmit() {
  clearAllErrors();

  const values = {
    driverName: form.driverName.value,
    phone: form.phone.value,
    vehicleType: form.vehicleType.value,
    numberPlate: form.numberPlate.value,
    vehicleModel: form.vehicleModel.value,
    nin: form.nin.value,
  };

  const errors = {
    driverName: validateName(values.driverName),
    phone: validatePhone(values.phone),
    vehicleType: validateVehicleType(values.vehicleType),
    numberPlate: validateNumberPlate(values.numberPlate),
    vehicleModel: validateVehicleModel(values.vehicleModel),
    nin: validateNin(values.nin, values.vehicleType === "boda"),
  };

  const hasError = Object.values(errors).some((msg) => msg);

  Object.entries(errors).forEach(([field, message]) => {
    if (message) showFieldError(field, message);
  });

  if (hasError) return;

  const receipt = formatReceipt();
  form.receipt.value = receipt;
  alert(`Registration successful! Receipt: ${receipt}`);
}

function handlePrint() {
  if (!form.receipt.value) {
    alert("Please register first to generate a receipt.");
    return;
  }

  window.print();
}

function handleKeys(event) {
  if (event.ctrlKey && event.key === "Enter") {
    event.preventDefault();
    handleSubmit();
  }

  if (event.key === "Escape") {
    event.preventDefault();
    clearForm();
  }
}

function init() {
  setSessionInfo();
  updateNinVisibility();

  form.vehicleType.addEventListener("change", () => {
    updateNinVisibility();
    clearFieldError("vehicleType");
  });

  form.submitBtn.addEventListener("click", handleSubmit);
  form.clearBtn.addEventListener("click", clearForm);

  document.addEventListener("keydown", handleKeys);
  form.printBtn.addEventListener("click", handlePrint);
}

init();
