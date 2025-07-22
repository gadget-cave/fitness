const form = document.getElementById('memberForm');
const tableBody = document.querySelector('#membersTable tbody');
const totalFeesEl = document.getElementById('totalFees');
let members = [];

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN');
}

function getExpiryDate(months) {
  const now = new Date();
  now.setMonth(now.getMonth() + months);
  return now;
}

function isExpired(expiryDate) {
  return new Date() > new Date(expiryDate);
}

function updateTable() {
  tableBody.innerHTML = '';
  let total = 0;

  members.forEach(member => {
    const tr = document.createElement('tr');
    const expired = isExpired(member.expiryDate);

    tr.className = expired ? 'expired' : '';
    total += member.months * 500;

    tr.innerHTML = `
      <td>${member.name}</td>
      <td>${member.phone}</td>
      <td>${formatDate(member.expiryDate)}</td>
      <td>${expired ? 'Expired ❌' : 'Active ✅'}</td>
      <td>
        <a class="whatsapp" target="_blank"
           href="https://wa.me/91${member.phone}?text=${encodeURIComponent(`Hi ${member.name}, your gym membership expired on ${formatDate(member.expiryDate)}. Please pay ₹${member.months * 500} to renew.`)}">
          Remind 💬
        </a>
      </td>
    `;

    tableBody.appendChild(tr);
  });

  totalFeesEl.textContent = `Total Collected Fees: ₹${total}`;
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const name = form.name.value.trim();
  const phone = form.phone.value.trim();
  const months = parseInt(form.months.value);

  if (!name || !phone || !months || months <= 0) return;

  const expiryDate = getExpiryDate(months);

  members.push({ name, phone, months, expiryDate });
  updateTable();
  form.reset();
});
