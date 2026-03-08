const selectors = {
  searchInput: document.getElementById("searchInput"),
  searchBtn: document.getElementById("searchBtn"),
  detailDriver: document.getElementById("detailDriver"),
  detailType: document.getElementById("detailType"),
  detailArrival: document.getElementById("detailArrival"),
  detailDuration: document.getElementById("detailDuration"),
  detailFee: document.getElementById("detailFee"),
  receiverName: document.getElementById("receiverName"),
  receiverNin: document.getElementById("receiverNin"),
  receiverGender: document.getElementById("receiverGender"),
  confirmBtn: document.getElementById("confirmBtn"),
  cancelBtn: document.getElementById("cancelBtn"),
  printBtn: document.getElementById("printBtn"),
  rcptNo: document.getElementById("rcptNo"),
  rcptDate: document.getElementById("rcptDate"),
  rcptPlate: document.getElementById("rcptPlate"),
  rcptCategory: document.getElementById("rcptCategory"),
  rcptCheckin: document.getElementById("rcptCheckin"),
  rcptDuration: document.getElementById("rcptDuration"),
  rcptTotal: document.getElementById("rcptTotal"),
  rcptReceiver: document.getElementById("rcptReceiver"),
  rcptReceiverNin: document.getElementById("rcptReceiverNin"),
};

const feeRules = {
  truck: 3500,
  personal: 2000,
  taxi: 2500,
  coaster: 2800,
  boda: 1500,
};

const mockRecords = [
  {
    receiptId: "PE-2026-03-0001",
    plate: "UBA123X",
    driver: "Grace K.",
    type: "personal",
    arrival: "2026-03-07T07:12:00",
  },
  {
    receiptId: "PE-2026-03-0002",
    plate: "KBB-889",
    driver: "James M.",
    type: "taxi",
    arrival: "2026-03-07T09:24:00",
  },
  {
    receiptId: "PE-2026-03-0003",
    plate: "UDL-334",
    driver: "Amos T.",
    type: "boda",
    arrival: "2026-03-07T10:05:00",
  },
];

let currentRecord = null;

function normalizeSearch(value) {
  return value.trim().toUpperCase();
}

function formatTime(date) {
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

function calcFee(type, minutes) {
  const rate = feeRules[type] || 2000;
  const hours = Math.ceil(minutes / 60) || 1;
  return hours * rate;
}

function clearDetails() {
  currentRecord = null;
  selectors.detailDriver.textContent = "—";
  selectors.detailType.textContent = "—";
  selectors.detailArrival.textContent = "—";
  selectors.detailDuration.textContent = "—";
  selectors.detailFee.textContent = "UGX 0";
  selectors.rcptNo.textContent = "—";
  selectors.rcptDate.textContent = "—";
  selectors.rcptPlate.textContent = "—";
  selectors.rcptCategory.textContent = "—";
  selectors.rcptCheckin.textContent = "—";
  selectors.rcptDuration.textContent = "—";
  selectors.rcptTotal.textContent = "UGX 0";
  selectors.rcptReceiver.textContent = "—";
  selectors.rcptReceiverNin.textContent = "—";
  selectors.receiverName.value = "";
  selectors.receiverNin.value = "";
  selectors.receiverGender.value = "";
}

function setReceipt(record, minutes, fee) {
  const now = new Date();
  selectors.rcptNo.textContent = record.receiptId;
  selectors.rcptDate.textContent = formatTime(now);
  selectors.rcptPlate.textContent = record.plate;
  selectors.rcptCategory.textContent = record.type;
  selectors.rcptCheckin.textContent = formatTime(new Date(record.arrival));
  selectors.rcptDuration.textContent = formatDuration(minutes);
  selectors.rcptTotal.textContent = `UGX ${fee.toLocaleString()}`;
}

function updateDetails(record) {
  const arrival = new Date(record.arrival);
  const now = new Date();
  const diff = Math.max(0, Math.floor((now - arrival) / 60000));
  const fee = calcFee(record.type, diff);

  selectors.detailDriver.textContent = record.driver;
  selectors.detailType.textContent = record.type;
  selectors.detailArrival.textContent = formatTime(arrival);
  selectors.detailDuration.textContent = formatDuration(diff);
  selectors.detailFee.textContent = `UGX ${fee.toLocaleString()}`;

  setReceipt(record, diff, fee);
}

function findRecord(query) {
  const normalized = normalizeSearch(query);
  return mockRecords.find((rec) => {
    return (
      rec.receiptId.toUpperCase() === normalized ||
      rec.plate.replace(/\s+/g, "").toUpperCase() === normalized.replace(/\s+/g, "")
    );
  });
}

function showNotFound() {
  alert("No record found. Try a different receipt ID or plate number.");
  clearDetails();
}

function handleSearch() {
  const value = selectors.searchInput.value;
  if (!value.trim()) return;

  const record = findRecord(value);
  if (!record) {
    showNotFound();
    return;
  }

  currentRecord = record;
  updateDetails(record);
}

function validateReceiver() {
  const name = selectors.receiverName.value.trim();
  const nin = selectors.receiverNin.value.trim();
  const gender = selectors.receiverGender.value;

  if (!name) {
    alert("Receiver full name is required.");
    return false;
  }

  if (!nin) {
    alert("Receiver NIN is required.");
    return false;
  }

  if (!/^(CM|CF)[A-Z0-9]+$/i.test(nin)) {
    alert("Receiver NIN must start with CM or CF followed by letters/numbers.");
    return false;
  }

  if (!gender) {
    alert("Please choose a receiver gender.");
    return false;
  }

  return true;
}

function handleConfirm() {
  if (!currentRecord) {
    alert("Search for a record first.");
    return;
  }

  if (!validateReceiver()) return;

  selectors.rcptReceiver.textContent = selectors.receiverName.value.trim();
  selectors.rcptReceiverNin.textContent = selectors.receiverNin.value.trim();

  alert("Payment confirmed and sign-out complete.");
}

function handleCancel() {
  clearDetails();
  selectors.searchInput.value = "";
}

function handlePrint() {
  window.print();
}

function init() {
  clearDetails();
  selectors.searchBtn.addEventListener("click", handleSearch);
  selectors.searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  });

  selectors.confirmBtn.addEventListener("click", handleConfirm);
  selectors.cancelBtn.addEventListener("click", handleCancel);
  selectors.printBtn.addEventListener("click", handlePrint);
}

init();
