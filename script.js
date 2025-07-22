const firebaseConfig = {
  apiKey: "AIzaSyBe_k7RxoQa2g_Vyw3niG_M74pIPw8Mz0U",
  authDomain: "gym-fees-5dbcf.firebaseapp.com",
  projectId: "gym-fees-5dbcf",
  storageBucket: "gym-fees-5dbcf.appspot.com",
  messagingSenderId: "423386853721",
  appId: "1:423386853721:web:fafd195e95e6b1cb091c48"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const memberForm = document.getElementById('memberForm');
const memberList = document.getElementById('memberList');
const exportBtn = document.getElementById('exportBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Add member
memberForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const fee = parseFloat(document.getElementById('fee').value.trim());
  const days = parseInt(document.getElementById('days').value.trim());

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + days);

  await db.collection("members").add({
    name,
    phone,
    fee,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  });

  memberForm.reset();
  fetchMembers();
});

// Fetch members
async function fetchMembers() {
  memberList.innerHTML = "";
  const snapshot = await db.collection("members").get();

  snapshot.forEach(doc => {
    const data = doc.data();
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const today = new Date();
    const status = end < today ? "Expired" : "Active";
    const color = end < today ? "red" : "green";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${data.name}</td>
      <td>${data.phone}</td>
      <td>₹${data.fee}</td>
      <td>${start.toLocaleDateString()}</td>
      <td>${end.toLocaleDateString()}</td>
      <td style="color: ${color}; font-weight: bold;">${status}</td>
      <td><button class="delete-btn" onclick="deleteMember('${doc.id}')">Delete</button></td>
    `;
    memberList.appendChild(row);
  });
}

// Delete member
async function deleteMember(id) {
  if (confirm("Are you sure?")) {
    await db.collection("members").doc(id).delete();
    fetchMembers();
  }
}

// Export to PDF
exportBtn.addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("Gym Members", 10, 10);
  const rows = [];
  const table = document.querySelectorAll("#membersTable tbody tr");

  table.forEach(tr => {
    const cols = tr.querySelectorAll("td");
    const row = Array.from(cols).slice(0, 6).map(td => td.textContent);
    rows.push(row);
  });

  doc.autoTable({
    head: [["Name", "Phone", "Fee", "Start", "End", "Status"]],
    body: rows,
    startY: 20
  });

  doc.save("gym_members.pdf");
});

// Logout
logoutBtn.addEventListener("click", () => {
  alert("Logged out!");
  location.reload();
});

fetchMembers();
