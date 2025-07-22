// Initialize Firebase
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

// Form and Table Elements
const memberForm = document.getElementById('memberForm');
const memberList = document.getElementById('memberList');
const exportBtn = document.getElementById('exportBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Add Member
memberForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const fee = parseFloat(document.getElementById('fee').value.trim());
  const days = parseInt(document.getElementById('days').value.trim());

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + days);

  if (!name || !phone || isNaN(fee) || isNaN(days)) {
    alert("Please fill all fields correctly.");
    return;
  }

  await db.collection("members").add({
    name,
    phone,
    fee,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  });

  memberForm.reset();
  alert("Member added successfully!");
  fetchMembers();
});

// Fetch Members and Populate Table
async function fetchMembers() {
  memberList.innerHTML = "";
  const snapshot = await db.collection("members").get();

  snapshot.forEach(doc => {
    const data = doc.data();
    const row = document.createElement("tr");

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const today = new Date();

    const isExpired = end < today;
    const status = isExpired ? "Expired" : "Active";
    const statusColor = isExpired ? "red" : "green";

    row.innerHTML = `
      <td>${data.name}</td>
      <td>${data.phone}</td>
      <td>₹${data.fee}</td>
      <td>${start.toLocaleDateString()}</td>
      <td>${end.toLocaleDateString()}</td>
      <td style="color: ${statusColor}; font-weight: bold;">${status}</td>
      <td><button onclick="deleteMember('${doc.id}')">Delete</button></td>
    `;

    memberList.appendChild(row);
  });
}

// Delete Member
async function deleteMember(id) {
  if (confirm("Are you sure you want to delete this member?")) {
    await db.collection("members").doc(id).delete();
    alert("Member deleted.");
    fetchMembers();
  }
}

// Export All to PDF
exportBtn.addEventListener('click', () => {
  import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
    .then(jsPDF => {
      const { jsPDF: JSPDF } = jsPDF;
      const doc = new JSPDF();

      doc.text("Gym Member Report", 10, 10);
      const rows = [];
      const headers = ["Name", "Phone", "Fee", "Start", "End", "Status"];

      const table = document.querySelectorAll("#membersTable tbody tr");
      table.forEach(tr => {
        const cols = tr.querySelectorAll("td");
        const row = Array.from(cols).slice(0, 6).map(td => td.textContent);
        rows.push(row);
      });

      doc.autoTable({
        head: [headers],
        body: rows,
        startY: 20
      });

      doc.save("Gym_Members.pdf");
    });
});

// Logout Function (Dummy - Can extend to real auth)
logoutBtn.addEventListener('click', () => {
  alert("Logged out successfully!");
  window.location.reload();
});

// Initial fetch
fetchMembers();
