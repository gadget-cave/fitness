const allowedNumber = "917994160120";
const allowedPassword = "hisham@123";

function checkLogin() {
  const num = document.getElementById("loginNumber").value.trim();
  const pass = document.getElementById("loginPassword").value.trim();

  if (num === allowedNumber && pass === allowedPassword) {
    document.getElementById("loginContainer").classList.add("hidden");
    document.getElementById("mainContainer").classList.remove("hidden");
    loadMembers();
  } else {
    document.getElementById("loginContainer").classList.add("hidden");
    document.getElementById("howAreYou").classList.remove("hidden");
  }
}

function addMember(e) {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const startDate = document.getElementById("startDate").value;
  const amount = parseInt(document.getElementById("amount").value);

  const member = { name, phone, startDate, amount };
  const members = getMembers();
  members.push(member);
  saveMembers(members);
  renderMembers();
  e.target.reset();
}

function getMembers() {
  return JSON.parse(localStorage.getItem("members") || "[]");
}

function saveMembers(members) {
  localStorage.setItem("members", JSON.stringify(members));
}

function calculateExpiry(startDate, amount) {
  const months = Math.floor(amount / 500);
  const start = new Date(startDate);
  start.setMonth(start.getMonth() + months);
  return start.toISOString().split("T")[0];
}

function renderMembers() {
  const tbody = document.getElementById("memberTableBody");
  tbody.innerHTML = "";

  const today = new Date().toISOString().split("T")[0];
  getMembers().forEach((m, index) => {
    const expiry = calculateExpiry(m.startDate, m.amount);
    const expired = expiry < today;

    const tr = document.createElement("tr");
    if (expired) tr.classList.add("expired");

    tr.innerHTML = `
      <td>${m.name}</td>
      <td>${m.phone}</td>
      <td>${m.startDate}</td>
      <td>₹${m.amount}</td>
      <td>${expiry}</td>
      <td>
        <button onclick="editMember(${index})">Edit</button>
        <button onclick="deleteMember(${index})">Delete</button>
        <button onclick="sendReminder('${m.phone}')">WhatsApp</button>
        <button onclick="exportToPDF(${index})">PDF</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function deleteMember(index) {
  if (confirm("Delete this member?")) {
    const members = getMembers();
    members.splice(index, 1);
    saveMembers(members);
    renderMembers();
  }
}

function editMember(index) {
  const members = getMembers();
  const m = members[index];
  document.getElementById("name").value = m.name;
  document.getElementById("phone").value = m.phone;
  document.getElementById("startDate").value = m.startDate;
  document.getElementById("amount").value = m.amount;
  deleteMember(index);
}

function sendReminder(phone) {
  const url = `https://wa.me/91${phone}?text=Your gym fee might be due. Please check and renew.`;
  window.open(url, "_blank");
}

function exportToPDF(index) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const m = getMembers()[index];
  const expiry = calculateExpiry(m.startDate, m.amount);

  doc.setFontSize(14);
  doc.text(`Gym Member Details`, 20, 20);
  doc.text(`Name: ${m.name}`, 20, 40);
  doc.text(`Phone: ${m.phone}`, 20, 50);
  doc.text(`Start Date: ${m.startDate}`, 20, 60);
  doc.text(`Amount Paid: ₹${m.amount}`, 20, 70);
  doc.text(`Expiry Date: ${expiry}`, 20, 80);
  doc.save(`${m.name}_details.pdf`);
}

function exportAllToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const members = getMembers();

  doc.setFontSize(16);
  doc.text("All Gym Members", 20, 20);

  let y = 40;
  members.forEach((m, i) => {
    const expiry = calculateExpiry(m.startDate, m.amount);
    doc.setFontSize(12);
    doc.text(`${i + 1}. ${m.name} | ${m.phone} | ₹${m.amount} | Start: ${m.startDate} | Expiry: ${expiry}`, 20, y);
    y += 10;
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save("all_members.pdf");
}

function loadMembers() {
  renderMembers();
}
