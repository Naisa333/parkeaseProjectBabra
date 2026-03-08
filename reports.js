const selectors = {
  currentDate: document.getElementById("currentDate"),
  prevDay: document.getElementById("prevDay"),
  nextDay: document.getElementById("nextDay"),
  cardRevenue: document.getElementById("cardRevenue"),
  cardTyre: document.getElementById("cardTyre"),
  cardBattery: document.getElementById("cardBattery"),
  changeRevenue: document.getElementById("changeRevenue"),
  changeTyre: document.getElementById("changeTyre"),
  changeBattery: document.getElementById("changeBattery"),
  reportRows: document.getElementById("reportRows"),
  tableSearch: document.getElementById("tableSearch"),
  pagination: document.getElementById("pagination"),
  grandTotal: document.getElementById("grandTotal"),
  downloadPdf: document.getElementById("downloadPdf"),
  exportCsv: document.getElementById("exportCsv"),
};

const PAGE_SIZE = 5;
let currentDate = new Date();
let currentPage = 1;
let activeRecords = [];

const mockDailyData = {
  "2026-03-06": {
    revenue: 320000,
    tyre: 82000,
    battery: 28000,
    records: [
      { receipt: "PE-2026-03-0061", plate: "UBA 143X", in: "07:01", out: "10:25", duration: "3h 24m", fee: 17500 },
      { receipt: "PE-2026-03-0062", plate: "KBB 889", in: "08:12", out: "11:10", duration: "2h 58m", fee: 17500 },
      { receipt: "PE-2026-03-0063", plate: "UDL 334", in: "09:03", out: "11:58", duration: "2h 55m", fee: 17500 },
      { receipt: "PE-2026-03-0064", plate: "UBD 007", in: "09:29", out: "12:10", duration: "2h 41m", fee: 17500 },
      { receipt: "PE-2026-03-0065", plate: "UAK 550", in: "10:15", out: "13:34", duration: "3h 19m", fee: 17500 },
      { receipt: "PE-2026-03-0066", plate: "UZZ 921", in: "10:54", out: "12:59", duration: "2h 05m", fee: 17500 },
      { receipt: "PE-2026-03-0067", plate: "UCD 371", in: "11:20", out: "13:40", duration: "2h 20m", fee: 17500 },
      { receipt: "PE-2026-03-0068", plate: "UQQ 912", in: "12:15", out: "14:40", duration: "2h 25m", fee: 17500 },
    ],
  },
  "2026-03-07": {
    revenue: 360000,
    tyre: 94000,
    battery: 32000,
    records: [
      { receipt: "PE-2026-03-0071", plate: "UBA 230X", in: "07:10", out: "10:00", duration: "2h 50m", fee: 17500 },
      { receipt: "PE-2026-03-0072", plate: "KBB 981", in: "08:22", out: "11:12", duration: "2h 50m", fee: 17500 },
      { receipt: "PE-2026-03-0073", plate: "UDL 891", in: "08:55", out: "12:10", duration: "3h 15m", fee: 17500 },
      { receipt: "PE-2026-03-0074", plate: "UBD 100", in: "09:40", out: "13:01", duration: "3h 21m", fee: 17500 },
      { receipt: "PE-2026-03-0075", plate: "UAK 522", in: "10:08", out: "13:22", duration: "3h 14m", fee: 17500 },
      { receipt: "PE-2026-03-0076", plate: "UZZ 900", in: "10:50", out: "14:07", duration: "3h 17m", fee: 17500 },
      { receipt: "PE-2026-03-0077", plate: "UCD 389", in: "11:10", out: "14:05", duration: "2h 55m", fee: 17500 },
      { receipt: "PE-2026-03-0078", plate: "UQQ 920", in: "12:15", out: "15:00", duration: "2h 45m", fee: 17500 },
    ],
  },
};

function formatDateLabel(date) {
  return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function formatCurrency(amount) {
  return `UGX ${amount.toLocaleString()}`;
}

function getDayKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function updateDateDisplay() {
  selectors.currentDate.textContent = formatDateLabel(currentDate);
}

function getMockDataFor(date) {
  const key = getDayKey(date);
  return mockDailyData[key] || { revenue: 0, tyre: 0, battery: 0, records: [] };
}

function calculateChange(today, yesterday) {
  if (yesterday === 0) return { pct: 0, up: true };
  const diff = today - yesterday;
  const pct = Math.round((diff / (yesterday || 1)) * 100);
  return { pct: Math.abs(pct), up: diff >= 0 };
}

function applyChangeLabel(element, value, isUp) {
  element.textContent = `${isUp ? "+" : "-"}${value}%`;
  element.className = "";
  element.classList.add(isUp ? "up" : "down");
}

function updateMetrics() {
  const today = getMockDataFor(currentDate);
  const yesterday = getMockDataFor(new Date(currentDate.getTime() - 86400000));

  selectors.cardRevenue.textContent = formatCurrency(today.revenue);
  selectors.cardTyre.textContent = formatCurrency(today.tyre);
  selectors.cardBattery.textContent = formatCurrency(today.battery);

  const revenueChange = calculateChange(today.revenue, yesterday.revenue);
  const tyreChange = calculateChange(today.tyre, yesterday.tyre);
  const batteryChange = calculateChange(today.battery, yesterday.battery);

  applyChangeLabel(selectors.changeRevenue, revenueChange.pct, revenueChange.up);
  applyChangeLabel(selectors.changeTyre, tyreChange.pct, tyreChange.up);
  applyChangeLabel(selectors.changeBattery, batteryChange.pct, batteryChange.up);
}

function getFilteredRecords() {
  const query = selectors.tableSearch.value.trim().toUpperCase();
  const data = getMockDataFor(currentDate).records;
  if (!query) return data;
  return data.filter((r) => {
    return r.receipt.toUpperCase().includes(query) || r.plate.toUpperCase().includes(query);
  });
}

function renderTable() {
  const records = getFilteredRecords();
  activeRecords = records;
  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
  currentPage = Math.min(currentPage, totalPages);

  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = records.slice(start, start + PAGE_SIZE);

  selectors.reportRows.innerHTML = pageItems
    .map((r) => {
      return `
        <tr>
          <td>${r.receipt}</td>
          <td>${r.plate}</td>
          <td>${r.in}</td>
          <td>${r.out}</td>
          <td>${r.duration}</td>
          <td>${formatCurrency(r.fee)}</td>
        </tr>
      `;
    })
    .join("");

  renderPagination(totalPages);
  updateGrandTotal(records);
}

function renderPagination(totalPages) {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  selectors.pagination.innerHTML = "";

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Prev";
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener("click", () => {
    currentPage = Math.max(1, currentPage - 1);
    renderTable();
  });
  selectors.pagination.appendChild(prevBtn);

  pages.forEach((page) => {
    const btn = document.createElement("button");
    btn.textContent = String(page);
    btn.classList.toggle("active", page === currentPage);
    btn.addEventListener("click", () => {
      currentPage = page;
      renderTable();
    });
    selectors.pagination.appendChild(btn);
  });

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener("click", () => {
    currentPage = Math.min(totalPages, currentPage + 1);
    renderTable();
  });
  selectors.pagination.appendChild(nextBtn);
}

function updateGrandTotal(records) {
  const total = records.reduce((sum, r) => sum + (r.fee || 0), 0);
  selectors.grandTotal.textContent = formatCurrency(total);
}

function handleDateChange(direction) {
  currentDate = new Date(currentDate.getTime() + direction * 86400000);
  currentPage = 1;
  updateDateDisplay();
  updateMetrics();
  renderTable();
}

function createCsv() {
  const rows = [
    ["Receipt #", "Plate #", "In-time", "Out-time", "Duration", "Fee"],
    ...activeRecords.map((r) => [r.receipt, r.plate, r.in, r.out, r.duration, r.fee]),
  ];
  const content = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `parkease-report-${getDayKey(currentDate)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function init() {
  updateDateDisplay();
  updateMetrics();
  renderTable();

  selectors.prevDay.addEventListener("click", () => handleDateChange(-1));
  selectors.nextDay.addEventListener("click", () => handleDateChange(1));

  selectors.tableSearch.addEventListener("input", () => {
    currentPage = 1;
    renderTable();
  });

  selectors.downloadPdf.addEventListener("click", () => {
    window.print();
  });

  selectors.exportCsv.addEventListener("click", createCsv);
}

init();
