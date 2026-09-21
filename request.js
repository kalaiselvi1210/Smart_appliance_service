/**
 * SMART APPLIANCE SERVICE REQUEST SYSTEM
 * Request Form Submission & Client Image Upload Script
 */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("serviceForm");
  const imageInput = document.getElementById("applianceImage");
  const uploadArea = document.getElementById("uploadDropZone");
  const previewWrapper = document.getElementById("previewWrapper");
  const previewImage = document.getElementById("previewImage");
  const previewFileName = document.getElementById("previewFileName");
  const previewFileSize = document.getElementById("previewFileSize");
  const removeImageBtn = document.getElementById("removeImageBtn");
  const imageError = document.getElementById("imageError");

  let currentBase64Image = "";

  // Make the dropzone trigger the hidden file input
  if (uploadArea && imageInput) {
    uploadArea.addEventListener("click", () => imageInput.click());
  }

  // Handle Image Selection and Validation
  if (imageInput) {
    imageInput.addEventListener("change", function () {
      const file = this.files[0];
      handleImageSelection(file);
    });
  }

  // Remove Selected Image
  if (removeImageBtn) {
    removeImageBtn.addEventListener("click", () => {
      resetImageState();
    });
  }

  function resetImageState() {
    currentBase64Image = "";
    if (imageInput) imageInput.value = "";
    if (previewWrapper) previewWrapper.style.display = "none";
    if (uploadArea) uploadArea.style.display = "block";
    hideError(imageError);
  }

  function handleImageSelection(file) {
    if (!file) return;

    // Validate File Type (JPG, JPEG, PNG)
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      showError(imageError, "Invalid format! Only JPG, JPEG, and PNG images are allowed.");
      resetImageState();
      return;
    }

    // Validate Size (Limit: 2MB to ensure safe LocalStorage storage)
    const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSizeInBytes) {
      showError(imageError, "Image size too large! Please upload an image under 2MB.");
      resetImageState();
      return;
    }

    hideError(imageError);

    // Read File via HTML5 FileReader
    const reader = new FileReader();
    reader.onload = function (e) {
      currentBase64Image = e.target.result;
      previewImage.src = currentBase64Image;
      previewFileName.textContent = file.name;
      previewFileSize.textContent = (file.size / 1024).toFixed(1) + " KB";
      uploadArea.style.display = "none";
      previewWrapper.style.display = "block";
    };
    reader.onerror = function () {
      showError(imageError, "Error reading image file from disk.");
      resetImageState();
    };
    reader.readAsDataURL(file);
  }

  // Form Validation & Submission
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      let isValid = true;

      // Extract Form Elements
      const fullName = document.getElementById("fullName");
      const email = document.getElementById("email");
      const phone = document.getElementById("phone");
      const address = document.getElementById("address");
      const applianceType = document.getElementById("applianceType");
      const brand = document.getElementById("brand");
      const model = document.getElementById("model");
      const problemType = document.getElementById("problemType");
      const description = document.getElementById("description");
      const preferredDate = document.getElementById("preferredDate");
      const preferredTime = document.getElementById("preferredTime");
      const notes = document.getElementById("notes");

      // Validate Full Name
      if (!fullName.value.trim()) {
        showFieldError("fullNameError", "Please enter your full name.");
        isValid = false;
      } else {
        hideFieldError("fullNameError");
      }

      // Validate Email
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email.value.trim())) {
        showFieldError("emailError", "Please enter a valid email address.");
        isValid = false;
      } else {
        hideFieldError("emailError");
      }

      // Validate Phone Number (min 10 digits)
      const phoneClean = phone.value.replace(/[^0-9]/g, "");
      if (phoneClean.length < 10) {
        showFieldError("phoneError", "Enter a valid 10-digit phone number.");
        isValid = false;
      } else {
        hideFieldError("phoneError");
      }

      // Validate Address
      if (!address.value.trim()) {
        showFieldError("addressError", "Service address cannot be empty.");
        isValid = false;
      } else {
        hideFieldError("addressError");
      }

      // Validate Appliance Type Dropdown
      if (!applianceType.value) {
        showFieldError("applianceTypeError", "Please select your appliance type.");
        isValid = false;
      } else {
        hideFieldError("applianceTypeError");
      }

      // Validate Problem Type Dropdown
      if (!problemType.value) {
        showFieldError("problemTypeError", "Please select the observed problem.");
        isValid = false;
      } else {
        hideFieldError("problemTypeError");
      }

      // Validate Problem Description
      if (description.value.trim().length < 10) {
        showFieldError("descriptionError", "Please provide a clear description (min 10 characters).");
        isValid = false;
      } else {
        hideFieldError("descriptionError");
      }

      // Validate Preferred Date
      if (!preferredDate.value) {
        showFieldError("preferredDateError", "Please select a preferred service date.");
        isValid = false;
      } else {
        hideFieldError("preferredDateError");
      }

      // Validate Image Requirement
      if (!currentBase64Image) {
        showError(imageError, "Please upload an image of the appliance problem.");
        isValid = false;
      } else {
        hideError(imageError);
      }

      if (!isValid) {
        showToast("Please correct the errors in the form.", "error");
        return;
      }

      // Construct New Request Object
      const requestId = generateServiceRequestId();
      const newRequest = {
        id: requestId,
        name: fullName.value.trim(),
        email: email.value.trim(),
        phone: phone.value.trim(),
        address: address.value.trim(),
        applianceType: applianceType.value,
        brand: brand.value.trim() || "Unspecified",
        model: model.value.trim() || "N/A",
        problemType: problemType.value,
        description: description.value.trim(),
        image: currentBase64Image || getDefaultApplianceImage(),
        preferredDate: preferredDate.value,
        preferredTime: preferredTime.value || "Anytime",
        notes: notes.value.trim() || "None",
        status: "Request Submitted",
        createdAt: new Date().toISOString()
      };

      // Store in LocalStorage
      addServiceRequest(newRequest);

      // Show confirmation dialog with generated ID
      alert(`Service Request Submitted Successfully!\n\nYour Unique Request ID: ${requestId}\n\nYou can track this request on the 'Track Requests' page.`);

      // Redirect user directly to view the created ticket details
      window.location.href = `details.html?id=${encodeURIComponent(requestId)}`;
    });
  }

  function showFieldError(elementId, msg) {
    const el = document.getElementById(elementId);
    if (el) {
      el.textContent = msg;
      el.classList.add("visible");
    }
  }

  function hideFieldError(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
      el.textContent = "";
      el.classList.remove("visible");
    }
  }

  function showError(element, msg) {
    if (element) {
      element.textContent = msg;
      element.classList.add("visible");
    }
  }

  function hideError(element) {
    if (element) {
      element.textContent = "";
      element.classList.remove("visible");
    }
  }
});