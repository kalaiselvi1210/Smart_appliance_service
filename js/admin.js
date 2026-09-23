/**
 * SMART APPLIANCE SERVICE REQUEST SYSTEM
 * Admin Dashboard - Stats, Status Updates, Deletions, and Demo Data
 */

document.addEventListener("DOMContentLoaded", () => {
  const adminTableBody = document.getElementById("adminTableBody");
  const searchInput = document.getElementById("adminSearch");
  const statusFilter = document.getElementById("adminStatusFilter");
  const demoDataBtn = document.getElementById("loadDemoBtn");
  const clearDataBtn = document.getElementById("clearDataBtn");

  // Initial dashboard render
  refreshAdminDashboard();

  // Search and Filter Listeners
  if (searchInput) searchInput.addEventListener("input", refreshAdminDashboard);
  if (statusFilter) statusFilter.addEventListener("change", refreshAdminDashboard);

  // Load Demo Data Action
  if (demoDataBtn) {
    demoDataBtn.addEventListener("click", () => {
      loadDemoData();
    });
  }

  // Clear All Records Action
  if (clearDataBtn) {
    clearDataBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear ALL service request data? This cannot be undone.")) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(COUNTER_KEY);
        refreshAdminDashboard();
        showToast("All data cleared successfully.", "success");
      }
    });
  }

  function refreshAdminDashboard() {
    updateStatistics();
    renderTable();
  }

  // Update Top Metric Stat Counters
  function updateStatistics() {
    const requests = getServiceRequests();
    
    setStatText("statTotal", requests.length);
    setStatText("statSubmitted", requests.filter((r) => r.status === "Request Submitted").length);
    setStatText("statReview", requests.filter((r) => r.status === "Under Review").length);
    setStatText("statAssigned", requests.filter((r) => r.status === "Technician Assigned").length);
    setStatText("statProgress", requests.filter((r) => r.status === "Service in Progress").length);
    setStatText("statCompleted", requests.filter((r) => r.status === "Completed").length);
    setStatText("statCancelled", requests.filter((r) => r.status === "Cancelled").length);
  }

  function setStatText(elementId, val) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = val;
  }

  // Render Requests Table with Status Management Dropdown
  function renderTable() {
    if (!adminTableBody) return;

    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const filter = statusFilter ? statusFilter.value : "";
    const all = getServiceRequests();

    const filtered = all.filter((r) => {
      const matchQuery =
        !query ||
        r.id.toLowerCase().includes(query) ||
        r.name.toLowerCase().includes(query) ||
        r.applianceType.toLowerCase().includes(query) ||
        r.phone.includes(query);
      const matchStatus = !filter || r.status === filter;
      return matchQuery && matchStatus;
    });

    if (filtered.length === 0) {
      adminTableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center; padding:40px; color:var(--text-muted);">
            No matching service records found. Click <strong>"Load Demo Data"</strong> to add sample records.
          </td>
        </tr>
      `;
      return;
    }

    adminTableBody.innerHTML = filtered
      .map((req) => {
        // Build Status Options Dropdown
        const optionsHtml = STATUS_OPTIONS.map((opt) => {
          return `<option value="${opt}" ${req.status === opt ? "selected" : ""}>${opt}</option>`;
        }).join("");

        const imgTag = req.image
          ? `<img src="${req.image}" class="table-img" alt="Appliance" onclick="window.open('${req.image}')" style="cursor:pointer;" title="Click to view full">`
          : `<div class="table-img" style="background:#e2e8f0; display:flex; align-items:center; justify-content:center; font-size:0.7rem; color:#64748b;">No Img</div>`;

        return `
        <tr>
          <td><strong>${escapeHtml(req.id)}</strong></td>
          <td>${imgTag}</td>
          <td>
            <strong>${escapeHtml(req.name)}</strong><br>
            <span style="font-size:0.8rem; color:var(--text-muted);">${escapeHtml(req.phone)}</span>
          </td>
          <td>
            <strong>${escapeHtml(req.applianceType)}</strong><br>
            <span style="font-size:0.8rem; color:var(--text-muted);">${escapeHtml(req.brand)}</span>
          </td>
          <td style="max-width:200px; white-space:normal;">
            <span style="font-size:0.85rem;">${escapeHtml(req.problemType)}</span>
          </td>
          <td>
            <span style="font-size:0.85rem;">${escapeHtml(req.preferredDate)}</span>
          </td>
          <td>
            <select class="form-control" style="padding:4px 8px; font-size:0.85rem;" onchange="handleAdminStatusChange('${req.id}', this.value)">
              ${optionsHtml}
            </select>
          </td>
          <td>
            <div style="display:flex; gap:6px;">
              <a href="details.html?id=${encodeURIComponent(req.id)}" class="btn btn-secondary btn-sm" title="View Full Details">👁️</a>
              <button class="btn btn-danger btn-sm" onclick="handleAdminDelete('${req.id}')" title="Delete Record">🗑️</button>
            </div>
          </td>
        </tr>
      `;
      })
      .join("");
  }

  // 5 Sample Demo Records for Viva Presentation
  function loadDemoData() {
    const demoSamples = [
      {
        id: "SR-2026-001",
        name: "Rahul Sharma",
        email: "rahul.sharma@example.com",
        phone: "9876543210",
        address: "Flat 402, Green Avenue, Bangalore",
        applianceType: "Air Conditioner",
        brand: "Daikin",
        model: "FTKF50TV",
        problemType: "Not cooling",
        description: "Indoor blower runs but compressor outside does not start up. No cooling.",
        image: getDefaultApplianceImage(),
        preferredDate: "2026-09-23",
        preferredTime: "09:00 AM - 12:00 PM",
        notes: "Ring bell twice.",
        status: "Technician Assigned",
        createdAt: new Date().toISOString()
      },
      {
        id: "SR-2026-002",
        name: "Priya Patel",
        email: "priya.patel@example.com",
        phone: "9845012345",
        address: "12B Lake View Road, Chennai",
        applianceType: "Washing Machine",
        brand: "LG",
        model: "FHM1207ZDL",
        problemType: "Making unusual noise",
        description: "Heavy rattling sound during spin cycle. Drum shakes excessively.",
        image: getDefaultApplianceImage(),
        preferredDate: "2026-09-24",
        preferredTime: "12:00 PM - 03:00 PM",
        notes: "Ground floor apartment.",
        status: "Service in Progress",
        createdAt: new Date().toISOString()
      },
      {
        id: "SR-2026-003",
        name: "Amit Kumar",
        email: "amit.k@example.com",
        phone: "9123456789",
        address: "77 Palm Enclave, Pune",
        applianceType: "Refrigerator",
        brand: "Samsung",
        model: "RT28T3022SE",
        problemType: "Water leakage",
        description: "Water pools under vegetable tray every morning. Freezer works fine.",
        image: getDefaultApplianceImage(),
        preferredDate: "2026-09-25",
        preferredTime: "03:00 PM - 06:00 PM",
        notes: "Call 15 mins before arrival.",
        status: "Under Review",
        createdAt: new Date().toISOString()
      },
      {
        id: "SR-2026-004",
        name: "Sneha Reddy",
        email: "sneha.r@example.com",
        phone: "9988776655",
        address: "Villa 9, Jubilee Hills, Hyderabad",
        applianceType: "Microwave Oven",
        brand: "IFB",
        model: "30SC4",
        problemType: "Not turning on",
        description: "Power socket is fine, but microwave display is completely dead.",
        image: getDefaultApplianceImage(),
        preferredDate: "2026-09-22",
        preferredTime: "Flexible",
        notes: "Security gate permission arranged.",
        status: "Request Submitted",
        createdAt: new Date().toISOString()
      },
      {
        id: "SR-2026-005",
        name: "Vikas Verma",
        email: "vikas.v@example.com",
        phone: "9765432100",
        address: "45 Golf Links, New Delhi",
        applianceType: "Water Heater",
        brand: "Bajaj",
        model: "Popular Plus 25L",
        problemType: "Electrical problem",
        description: "Heating coil indicator not turning on. Tripping the MCB switch.",
        image: getDefaultApplianceImage(),
        preferredDate: "2026-09-20",
        preferredTime: "09:00 AM - 12:00 PM",
        notes: "Service completed successfully yesterday.",
        status: "Completed",
        createdAt: new Date().toISOString()
      }
    ];

    saveServiceRequests(demoSamples);
    localStorage.setItem(COUNTER_KEY, "5");
    refreshAdminDashboard();
    showToast("5 Sample Requests Loaded Successfully!", "success");
  }

  // Global triggers exposed for inline event handlers
  window.handleAdminStatusChange = function (id, newStatus) {
    if (updateServiceStatus(id, newStatus)) {
      updateStatistics();
      showToast(`Request ${id} status updated to "${newStatus}"`, "success");
    }
  };

  window.handleAdminDelete = function (id) {
    if (confirm(`Are you sure you want to permanently delete request ${id}?`)) {
      deleteServiceRequest(id);
      refreshAdminDashboard();
      showToast(`Request ${id} removed.`, "success");
    }
  };
});