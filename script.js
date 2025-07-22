// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBe_k7RxoQa2g_Vyw3niG_M74pIPw8Mz0U",
  authDomain: "gym-fees-5dbcf.firebaseapp.com",
  projectId: "gym-fees-5dbcf",
  storageBucket: "gym-fees-5dbcf.appspot.com",
  messagingSenderId: "423386853721",
  appId: "1:423386853721:web:fafd195e95e6b1cb091c48"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Add member
document.getElementById("memberForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  const fee = feeInput.value.trim();
  const days = parseInt(daysInput.value.trim());

  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + days);

  await db.collection("members").add({
    name, phone, fee,
    start: firebase.firestore.Timestamp.fromDate(start),
    end: firebase.firestore.Timestamp.fromDate(end),
  });

  memberForm.reset();
  loadMembers();
});

// Load members
async function loadMembers() {
  const snapshot = await db.collection("members").orderBy("start", "desc").get();
  memberList.innerHTML = "";

  const now = new Date();

  snapshot.forEach(doc => {
    const data = doc.data();
    const start = data.start.toDate();
    const end = data.end.toDate();

    const isActive = end > now;
    const statusClass = isActive ? "status-active" : "status-expired";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.name}</td>
      <td>${data.phone}</td>
      <td>${data.fee}</td>
      <td>${start.toLocaleDateString()}</td>
      <td>${end.toLocaleDateString()}</td>
      <td class="${statusClass}">${isActive ? "Active" : "Expired"}</td>
      <td><button onclick="deleteMember('${doc.id}')">Delete</button></td>
    `;
    memberList.appendChild(tr);
  });
}

// Delete member
async function deleteMember(id) {
  await db.collection("members").doc(id).delete();
  loadMembers();
}

// Export to PDF
document.getElementById("exportBtn").addEventListener("click", async () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const snapshot = await db.collection("members").get();

  doc.text("Gym Members Report", 20, 10);
  let y = 20;

  snapshot.forEach((docSnap, i) => {
    const data = docSnap.data();
    const start = data.start.toDate().toLocaleDateString();
    const end = data.end.toDate().toLocaleDateString();
    const line = `${i + 1}. ${data.name} - ${data.phone} - ₹${data.fee} - ${start} to ${end}`;
    doc.text(line, 10, y);
    y += 10;
  });

  doc.save("gym_members.pdf");
});

// Dummy logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  alert("Logged out!");
  // You can redirect to login.html if using login system
});

// Load members on start
loadMembers();
