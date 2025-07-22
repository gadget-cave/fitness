const firebaseConfig = {
  apiKey: "AIzaSyBe_k7RxoQa2g_Vyw3niG_M74pIPw8Mz0U",
  authDomain: "gym-fees-5dbcf.firebaseapp.com",
  projectId: "gym-fees-5dbcf",
  storageBucket: "gym-fees-5dbcf.firebasestorage.app",
  messagingSenderId: "423386853721",
  appId: "1:423386853721:web:fafd195e95e6b1cb091c48"
};


firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Elements
const memberForm = document.getElementById('memberForm');
const logoutBtn = document.getElementById('logoutBtn');
const exportBtn = document.getElementById('exportBtn');
const memberList = document.getElementById('memberList');

// Add member
memberForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const fee = document.getElementById('fee').value;
  const days = parseInt(document.getElementById('days').value);
  const start = new Date();
  const end = new Date();
  end.setDate(start.getDate() + days);

  db.collection('members').add({
    name, phone, fee,
    start: start.toISOString(),
    end: end.toISOString()
  }).then(() => {
    alert("Member added!");
    memberForm.reset();
    loadMembers();
  });
});

// Load members
function loadMembers() {
  const now = new Date();
  db.collection('members').get().then(snapshot => {
    memberList.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const start = new Date(data.start);
      const end = new Date(data.end);
      const expired = end < now;

      const row = document.createElement('tr');
      if (expired) row.classList.add('expired');

      row.innerHTML = `
        <td>${data.name}</td>
        <td>${data.phone}</td>
        <td>₹${data.fee}</td>
        <td>${start.toLocaleDateString()}</td>
        <td>${end.toLocaleDateString()}</td>
        <td>${expired ? "Expired" : "Active"}</td>
        <td><a href="https://wa.me/91${data.phone}" target="_blank">WhatsApp</a></td>
      `;
      memberList.appendChild(row);
    });
  });
}

// Export to PDF
exportBtn.addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 10;

  db.collection('members').get().then(snapshot => {
    doc.text("Gym Members Report", 10, y);
    y += 10;

    snapshot.forEach(docSnap => {
      const m = docSnap.data();
      doc.text(`Name: ${m.name}, Phone: ${m.phone}, Fee: ₹${m.fee}`, 10, y);
      y += 10;
    });

    doc.save("gym-members.pdf");
  });
});

// Logout
logoutBtn.addEventListener('click', () => {
  alert('Logged out (dummy)');
  // Hook in real auth logic if needed
});

// Initial load
loadMembers();
