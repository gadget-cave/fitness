const form = document.getElementById("memberForm");
const tableBody = document.querySelector("#membersTable tbody");
const totalAmountDiv = document.getElementById("totalAmount");

let members = JSON.parse(localStorage.getItem("gymMembers")) || [];

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const paidAmount = parseInt(document.getElementById("paidAmount").value);
  const startDate = document.getElementById("startDate").value;

  if (!name || !phone || !startDate || !paidAmount) return;

  const monthsPaid = Math.floor(paidAmount / 500);
  const expiryDate = new Date(startDate);
  expiryDate.setDate(expiryDate.getDate() + monthsPaid * 30);

  members.push({ name, phone, paidAmount, startDate, expiryDate });
  saveAndRender();
  form.reset();
});

function saveAndRender() {
  localStorage.setItem("gymMembers", JSON.stringify(members));
  renderTable();
}

function renderTable() {
  tableBody.innerHTML = "";
  let total = 0;

  members.forEach((member, index) => {
    const tr = document.createElement("tr");
    const expiry = new Date(member.expiryDate);
    const expired = expiry < new Date();

    if (expired) tr.classList.add("expired");

    const whatsappMsg = `Hi ${member.name}, your gym membership has expired. Please pay ₹500 to renew.`;

    tr.innerHTML = `
      <td>${member.name}</td>
      <td>${member.phone}</td>
      <td>₹${member.paidAmount}</td>
      <td>${member.startDate}</td>
      <td>${expiry.toISOString().split("T")[0]}</td>
      <td>${expired ? "Expired" : "Active"}</td>
      <td><a href="https://wa.me/91${member.phone}?text=${encodeURIComponent(whatsappMsg)}" target="_blank">Remind</a></td>
      <td><button onclick="editMember(${index})">Edit</button></td>
    `;

    tableBody.appendChild(tr);
    total += member.paidAmount;
  });

  totalAmountDiv.textContent = `Total Collected: ₹${total}`;
}

function editMember(index) {
  const member = members[index];
  const name = prompt("Name", member.name);
  const phone = prompt("Phone", member.phone);
  const paid = prompt("Paid Amount", member.paidAmount);
  const startDate = prompt("Start Date (YYYY-MM-DD)", member.startDate);

  if (!name || !phone || !paid || !startDate) return;

  const monthsPaid = Math.floor(parseInt(paid) / 500);
  const expiryDate = new Date(startDate);
  expiryDate.setDate(expiryDate.getDate() + monthsPaid * 30);

  members[index] = { name, phone, paidAmount: parseInt(paid), startDate, expiryDate };
  saveAndRender();
}

renderTable();
