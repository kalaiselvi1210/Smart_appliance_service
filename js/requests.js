/**
 * SMART APPLIANCE SERVICE REQUEST SYSTEM
 * Customer Requests Listing & Real-time Filter Script
 */

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("requestsGrid");
  const searchInput = document.getElementById("searchInput");
  const applianceFilter = document.getElementById("applianceFilter");
  const statusFilter = document.getElementById("statusFilter");
  const resetBtn = document.getElementById("resetFiltersBtn");

  // Load and render initial list
  renderCustomerRequests();

  // Search Input Event
  if (searchInput) {
    searchInput.addEventListener("input", () => renderCustomerRequests());
  }

  // Filter Dropdowns
  if (applianceFilter) {
    applianceFilter.addEventListener("change", () => renderCustomerRequests());
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", () => renderCustomerRequests());
  }

  // Reset Filters
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (applianceFilter) applianceFilter.value = "";
      if (statusFilter) statusFilter.value = "";
      renderCustomerRequests();
    });
  }

  function renderCustomerRequests() {
    if (!container) return;

    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const selectedAppliance = applianceFilter ? applianceFilter.value : "";
    const selectedStatus = statusFilter ? statusFilter.value : "";

    const allRequests = getServiceRequests();

    // Filter array
    const filtered = allRequests.filter((req) => {
      // Search matches Request ID, Customer Name, Brand or Appliance
      const matchesSearch =
        !query ||
        req.id.toLowerCase().includes(query) ||
        req.name.toLowerCase().includes(query) ||
        req.applianceType.toLowerCase().includes(query) ||
        req.brand.toLowerCase().includes(query);

      const matchesAppliance = !selectedAppliance || req.applianceType === selectedAppliance;
      const matchesStatus = !selectedStatus || req.status === selectedStatus;

      return matchesSearch && matchesAppliance && matchesStatus;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <h3>No Service Requests Found</h3>
          <p>Try clearing your filters or create a new appliance service request.</p>
          <div style="margin-top: 15px;">
            <a href="request.html" class="btn btn-primary btn-sm">Book New Service</a>
          </div>
        </div>
      `;
      return;
    }

    // Build Cards HTML
    container.innerHTML = filtered
      .map((req) => {
        const badge = getStatusBadgeHtml(req.status);
        const imageSrc = req.image || getDefaultApplianceImage();

        return `
        <div class="request-card">
          <div class="request-card-img-wrap">
            <img src="${imageSrc}" alt="${escapeHtml(req.applianceType)}" class="request-card-img">
            <div class="request-card-badge">${badge}</div>
          </div>
          <div class="request-card-body">
            <div class="request-card-id">${escapeHtml(req.id)}</div>
            <h3 class="request-card-title">${escapeHtml(req.brand)} ${escapeHtml(req.applianceType)}</h3>
            <div class="request-meta-item">
              <strong>Problem:</strong> ${escapeHtml(req.problemType)}
            </div>
            <div class="request-meta-item">
              <strong>Slot:</strong> ${escapeHtml(req.preferredDate)} (${escapeHtml(req.preferredTime)})
            </div>
            <div class="request-meta-item" style="margin-top:auto;">
              <strong>Customer:</strong> ${escapeHtml(req.name)}
            </div>
          </div>
          <div class="request-card-footer">
            <a href="details.html?id=${encodeURIComponent(req.id)}" class="btn btn-secondary btn-sm" style="width:100%;">
              View Full Details & Status Timeline &rarr;
            </a>
          </div>
        </div>
      `;
      })
      .join("");
  }
});