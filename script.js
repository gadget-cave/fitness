const form = document.getElementById("memberForm");
const table = document.getElementById("memberTable");
const localKey = "gym_members";

// Load from localStorage
let members = JSON.parse(localStorage.getItem(localKey)) || [];

function saveMembers() {
  localStorage.setItem(localKey, JSON.stringify(members));
  renderTable();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = form.name.value.trim();
  const phone = form.phone.value.trim();
  const paidAmount = parseInt(form.paidAmount.value.trim());
  const startDate = new Date(form.startDate.value);

  const months = Math.floor(paidAmount / 500);
  const validTill = new Date(startDate);
  validTill.setDate(validTill.getDate() + 30 * months);

  members.push({ name, phone, paidAmount, startDate, validTill });
  saveMembers();
  form.reset();
});

function renderTable() {
  table.innerHTML = "";
  const now = new Date();

  members.forEach((member, index) => {
    const validTill = new Date(member.validTill);
    const status = validTill >= now ? "Valid" : "Expired";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${member.name}</td>
      <td>${member.phone}</td>
      <td>₹${member.paidAmount}</td>
      <td>${new Date(member.startDate).toLocaleDateString()}</td>
      <td>${validTill.toLocaleDateString()}</td>
      <td class="${status === 'Expired' ? 'expired' : 'valid'}">${status}</td>
      <td>
        <button onclick="sendReminder(${index})">💬 WhatsApp</button>
        <button onclick="exportSingle(${index})">📄 PDF</button>
        <button onclick="deleteMember(${index})">🗑️</button>
      </td>
    `;
    table.appendChild(tr);
  });
}

function deleteMember(index) {
  if (confirm("Delete this member?")) {
    members.splice(index, 1);
    saveMembers();
  }
}

function sendReminder(index) {
  const member = members[index];
  const msg = `Hi ${member.name}, your gym fee of ₹${member.paidAmount} (starting from ${new Date(member.startDate).toLocaleDateString()}) has expired or is due. Kindly renew it.`;
  const url = `https://wa.me/91${member.phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}

function exportAllToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Gym Members Report", 10, 10);

  let y = 20;
  members.forEach((m, i) => {
    doc.text(`${i + 1}. ${m.name} | ₹${m.paidAmount} | Valid Till: ${new Date(m.validTill).toLocaleDateString()}`, 10, y);
    y += 10;
  });

  doc.save("Gym_Members_Report.pdf");
}

function exportSingle(index) {
  const { jsPDF } = window.jspdf;
  const m = members[index];
  const doc = new jsPDF();
  doc.text(`Member: ${m.name}`, 10, 10);
  doc.text(`Phone: ${m.phone}`, 10, 20);
  doc.text(`Amount: ₹${m.paidAmount}`, 10, 30);
  doc.text(`Start Date: ${new Date(m.startDate).toLocaleDateString()}`, 10, 40);
  doc.text(`Valid Till: ${new Date(m.validTill).toLocaleDateString()}`, 10, 50);
  doc.save(`${m.name}_Gym_Fee.pdf`);
}

renderTable();
