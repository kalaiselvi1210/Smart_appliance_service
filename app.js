/**
 * SMART APPLIANCE SERVICE REQUEST SYSTEM
 * Core Application File (Shared Utilities & LocalStorage CRUD)
 */

// Storage Keys
const STORAGE_KEY = "smart_appliance_requests";
const COUNTER_KEY = "smart_appliance_counter";

// Pre-defined Allowed Statuses
const STATUS_OPTIONS = [
  "Request Submitted",
  "Under Review",
  "Technician Assigned",
  "Service in Progress",
  "Completed",
  "Cancelled"
];

// Helper: Get requests array from LocalStorage
function getServiceRequests() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Failed to read from LocalStorage:", err);
    return [];
  }
}

// Helper: Save requests array to LocalStorage
function saveServiceRequests(requests) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  } catch (err) {
    console.error("Failed to write to LocalStorage:", err);
    showToast("Storage quota exceeded or storage unavailable!", "error");
  }
}

// Helper: Get a single request by its ID
function getServiceRequestById(id) {
  const requests = getServiceRequests();
  return requests.find((req) => req.id.trim() === id.trim()) || null;
}

// Helper: Auto-increment sequence ID (e.g. SR-2026-001)
function generateServiceRequestId() {
  const currentYear = new Date().getFullYear();
  let counter = parseInt(localStorage.getItem(COUNTER_KEY), 10);
  if (isNaN(counter) || counter <= 0) {
    counter = 1;
  } else {
    counter += 1;
  }
  localStorage.setItem(COUNTER_KEY, counter.toString());
  const paddedCounter = String(counter).padStart(3, "0");
  return `SR-${currentYear}-${paddedCounter}`;
}

// Helper: Add a new request record
function addServiceRequest(requestObject) {
  const requests = getServiceRequests();
  requests.unshift(requestObject); // insert at start
  saveServiceRequests(requests);
  return requestObject;
}

// Helper: Update request status
function updateServiceStatus(id, newStatus) {
  const requests = getServiceRequests();
  const index = requests.findIndex((r) => r.id === id);
  if (index !== -1) {
    requests[index].status = newStatus;
    saveServiceRequests(requests);
    return true;
  }
  return false;
}

// Helper: Delete request
function deleteServiceRequest(id) {
  const requests = getServiceRequests();
  const filtered = requests.filter((r) => r.id !== id);
  saveServiceRequests(filtered);
}

// Helper: Render status badge with CSS styling
function getStatusBadgeHtml(status) {
  let badgeClass = "badge-submitted";
  switch (status) {
    case "Under Review":
      badgeClass = "badge-review";
      break;
    case "Technician Assigned":
      badgeClass = "badge-assigned";
      break;
    case "Service in Progress":
      badgeClass = "badge-progress";
      break;
    case "Completed":
      badgeClass = "badge-completed";
      break;
    case "Cancelled":
      badgeClass = "badge-cancelled";
      break;
    default:
      badgeClass = "badge-submitted";
  }
  return `<span class="badge ${badgeClass}">${escapeHtml(status)}</span>`;
}

// Helper: Fallback image SVG if user doesn't upload or thumbnail placeholder
function getDefaultApplianceImage() {
  return "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22200%22%20viewBox%3D%220%200%20300%20200%22%3E%3Crect%20fill%3D%22%23e2e8f0%22%20width%3D%22300%22%20height%3D%22200%22%2F%3E%3Ctext%20fill%3D%22%2394a3b8%22%20font-family%3D%22sans-serif%22%20font-size%3D%2218%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3ENo%20Image%20Uploaded%3C%2Ftext%3E%3C%2Fsvg%3E";
}

// Helper: Sanitize Strings for Safe HTML injection
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Helper: Global Toast Notification
function showToast(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${escapeHtml(message)}</span>
    <span style="cursor:pointer; font-weight:bold; margin-left:10px;" onclick="this.parentElement.remove()">&times;</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Initialize Mobile Navbar Navigation
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.querySelector(".mobile-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });
  }
});