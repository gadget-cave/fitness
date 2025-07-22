// ------------------------
// Firebase Configuration
// ------------------------
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
const auth = firebase.auth();
const db = firebase.firestore();

// ------------------------
// Authentication
// ------------------------

// Check if user is logged in
auth.onAuthStateChanged(user => {
  if (!user) {
    alert("Who are you?");
    window.location.href = "login.html";
  } else {
    loadMembers(); // Load member data after successful login
  }
});

// Logout functionality
document.getElementById("logoutBtn").addEventListener("click", () => {
  auth.signOut().then(() => {
    window.location.href = "login.html";
  });
});

// ------------------------
// Add Member
// ------------------------
document.getElementById("memberForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const fee = document.getElementById("fee").value.trim();
  const days = parseInt(document.getElementById("days").value);

  if (!name || !phone || !fee || isNaN(days)) {
    alert("Please fill in all fields correctly.");
    return;
  }

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + days);

  await db.collection("members").add({
    name,
    phone,
    fee,
    start: firebase.firestore.Timestamp.fromDate(startDate),
    end: firebase.firestore.Timestamp.fromDate(endDate),
  });

  document.getElementById("memberForm").reset();
});

// ------------------------
// Load Members
// ------------------------
function loadMembers() {
  db.collection("members").orderBy("end", "asc").onSnapshot(snapshot => {
    const list = document.getElementById("memberList");
    list.innerHTML = "";

    snapshot.forEach(doc => {
      const data = doc.data();
      const start = data.start.toDate();
      const end = data.end.toDate();
      const today = new Date();
      const isActive = end >= today;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${data.name}</td>
        <td>${data.phone}</td>
        <td>₹${data.fee}</td>
        <td>${start.toLocaleDateString()}</td>
        <td>${end.toLocaleDateString()}</td>
        <td style="color:${isActive ? 'green' : 'red'}">${isActive ? 'Active' : 'Expired'}</td>
        <td><button onclick="deleteMember('${doc.id}')">🗑️</button></td>
      `;
      list.appendChild(tr);
    });
  });
}

// ------------------------
// Delete Member
// ------------------------
function deleteMember(id) {
  if (confirm("Are you sure you want to delete this member?")) {
    db.collection("members").doc(id).delete();
  }
}

// ------------------------
// Export to PDF
// ------------------------
document.getElementById("exportBtn").addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.autoTable({ html: '#membersTable' });
  doc.save("gym_members.pdf");
});
