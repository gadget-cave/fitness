// script.js (optional shared logic)

// Function to calculate expiry date from join date
function calculateExpiry(joinDateStr) {
  let joinDate = new Date(joinDateStr);
  let expiryDate = new Date(joinDate);
  expiryDate.setDate(expiryDate.getDate() + 30);
  return expiryDate;
}

// Function to calculate days left
function daysLeft(expiryDate) {
  let today = new Date();
  let timeDiff = expiryDate - today;
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

// Function to send WhatsApp reminder (not used directly here but usable globally)
function sendWhatsAppReminder(name, phone) {
  let msg = `Hi ${name}, your gym fee of ₹500 has expired. Please renew it today to continue your membership. Thank you! – Fit Boys Gym 💪`;
  let url = `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}
