/**
 * SMART APPLIANCE SERVICE REQUEST SYSTEM
 * Request Details & Interactive 5-Step Timeline Script
 */

document.addEventListener("DOMContentLoaded", () => {
  const contentArea = document.getElementById("detailsContent");

  // Parse Query Parameters (?id=SR-2026-001)
  const urlParams = new URLSearchParams(window.location.search);
  const requestId = urlParams.get("id");

  if (!requestId) {
    renderNotFound("No Request ID provided in the URL.");
    return;
  }

  const req = getServiceRequestById(requestId);
  if (!req) {
    renderNotFound(`No request record found for ID: "${escapeHtml(requestId)}"`);
    return;
  }

  renderRequestDetails(req);

  function renderNotFound(msg) {
    if (!contentArea) return;
    contentArea.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">❌</div>
        <h3>Request Not Found</h3>
        <p>${escapeHtml(msg)}</p>
        <div style="margin-top:20px;">
          <a href="requests.html" class="btn btn-primary">Return to Requests List</a>
        </div>
      </div>
    `;
  }

  function renderRequestDetails(data) {
    const badge = getStatusBadgeHtml(data.status);
    const timelineHtml = buildTimelineHtml(data.status);
    const formattedDate = data.createdAt ? new Date(data.createdAt).toLocaleString() : "N/A";

    contentArea.innerHTML = `
      <!-- Header Bar -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px; margin-bottom:25px;">
        <div>
          <a href="requests.html" style="text-decoration:none; color:var(--text-muted); font-size:0.9rem;">&larr; Back to Requests</a>
          <h2 style="color:var(--secondary); margin-top:5px;">Service Request: ${escapeHtml(data.id)}</h2>
          <span style="font-size:0.85rem; color:var(--text-muted);">Logged on: ${formattedDate}</span>
        </div>
        <div>${badge}</div>
      </div>

      <!-- Live Dynamic Status Timeline -->
      <div class="details-card">
        <h3 style="margin-bottom: 10px; color:var(--secondary);">Service Lifecycle Status</h3>
        ${timelineHtml}
      </div>

      <!-- Detailed Information Grid -->
      <div class="details-layout">
        <!-- Left: Customer, Appliance & Problem Info -->
        <div>
          <!-- Customer Details -->
          <div class="details-card">
            <h3 style="margin-bottom:15px; color:var(--secondary);">Customer Information</h3>
            <table class="details-table">
              <tr><th>Customer Name</th><td>${escapeHtml(data.name)}</td></tr>
              <tr><th>Email Address</th><td>${escapeHtml(data.email)}</td></tr>
              <tr><th>Phone Number</th><td>${escapeHtml(data.phone)}</td></tr>
              <tr><th>Service Address</th><td>${escapeHtml(data.address)}</td></tr>
            </table>
          </div>

          <!-- Appliance & Problem Details -->
          <div class="details-card">
            <h3 style="margin-bottom:15px; color:var(--secondary);">Appliance & Problem Details</h3>
            <table class="details-table">
              <tr><th>Appliance</th><td>${escapeHtml(data.applianceType)}</td></tr>
              <tr><th>Brand</th><td>${escapeHtml(data.brand)}</td></tr>
              <tr><th>Model</th><td>${escapeHtml(data.model)}</td></tr>
              <tr><th>Reported Issue</th><td>${escapeHtml(data.problemType)}</td></tr>
              <tr><th>Description</th><td>${escapeHtml(data.description)}</td></tr>
              <tr><th>Preferred Date</th><td>${escapeHtml(data.preferredDate)}</td></tr>
              <tr><th>Preferred Slot</th><td>${escapeHtml(data.preferredTime)}</td></tr>
              <tr><th>Special Notes</th><td>${escapeHtml(data.notes)}</td></tr>
            </table>
          </div>
        </div>

        <!-- Right: Uploaded Photo Display -->
        <div>
          <div class="details-card" style="text-align:center;">
            <h3 style="margin-bottom:15px; color:var(--secondary); text-align:left;">Appliance Photo</h3>
            <img src="${data.image || getDefaultApplianceImage()}" alt="Appliance Photo" style="width:100%; max-height:340px; object-fit:cover; border-radius:var(--radius-sm); border:1px solid var(--border);">
            <p style="margin-top:10px; font-size:0.8rem; color:var(--text-muted);">Client Upload (Base64 Encoded locally)</p>
          </div>

          <!-- Quick Action Card -->
          <div class="details-card">
            <h4 style="margin-bottom:10px; color:var(--secondary);">Need Assistance?</h4>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:15px;">Quote Request ID <strong>${escapeHtml(data.id)}</strong> if contacting support.</p>
            <a href="request.html" class="btn btn-secondary btn-sm" style="width:100%;">Create Another Request</a>
          </div>
        </div>
      </div>
    `;
  }

  // Constructs the 5-step dynamic status timeline
  function buildTimelineHtml(currentStatus) {
    if (currentStatus === "Cancelled") {
      return `
        <div style="background-color:var(--danger-bg); color:var(--danger); padding:15px; border-radius:var(--radius-sm); text-align:center; font-weight:600;">
          ⚠️ This service request has been CANCELLED by the administration or customer.
        </div>
      `;
    }

    const steps = [
      { key: "Request Submitted", label: "Submitted" },
      { key: "Under Review", label: "Review" },
      { key: "Technician Assigned", label: "Technician Assigned" },
      { key: "Service in Progress", label: "In Progress" },
      { key: "Completed", label: "Completed" }
    ];

    const activeIndex = steps.findIndex((s) => s.key === currentStatus);
    const currentIndex = activeIndex === -1 ? 0 : activeIndex;

    const stepsMarkup = steps
      .map((step, idx) => {
        let stateClass = "";
        let symbol = idx + 1;

        if (idx < currentIndex) {
          stateClass = "done";
          symbol = "✓";
        } else if (idx === currentIndex) {
          stateClass = "active";
          symbol = "●";
        }

        return `
        <div class="timeline-step ${stateClass}">
          <div class="timeline-dot">${symbol}</div>
          <div class="timeline-label">${step.label}</div>
        </div>
      `;
      })
      .join("");

    return `<div class="timeline">${stepsMarkup}</div>`;
  }
});