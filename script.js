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
const auth = firebase.auth();

// Login Function
function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("login-section").style.display = "none";
      document.getElementById("main-section").style.display = "block";
      loadMembers();
    })
    .catch((error) => {
      document.getElementById("loginError").textContent = "Invalid credentials";
    });
}

// Logout
function logout() {
  auth.signOut().then(() => {
    location.reload();
  });
}

// Add Member
function addMember() {
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const amount = document.getElementById("amount").value.trim();
  const expiry = document.getElementById("expiry").value;

  if (!name || !phone || !amount || !expiry) {
    alert("Please fill all fields");
    return;
  }

  db.collection("members").add({
    name,
    phone,
    amount,
    expiry
  }).then(() => {
    clearForm();
  });
}

// Clear form fields
function clearForm() {
  document.getElementById("name").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("amount").value = "";
  document.getElementById("expiry").value = "";
}

// Load members
function loadMembers() {
  db.collection("members").onSnapshot(snapshot => {
    const tbody = document.getElementById("memberData");
    tbody.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const tr = document.createElement("tr");

      const today = new Date().toISOString().split("T")[0];
      const expired = data.expiry < today;

      tr.innerHTML = `
        <td>${data.name}</td>
        <td><a href="https://wa.me/91${data.phone}" target="_blank">${data.phone}</a></td>
        <td>₹${data.amount}</td>
        <td>${data.expiry}</td>
        <td class="${expired ? 'status-expired' : 'status-active'}">
          ${expired ? 'Expired' : 'Active'}
        </td>
      `;
      tbody.appendChild(tr);
    });
  });
}

// Export to PDF
function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Gym Members List", 14, 20);

  const headers = [["Name", "Phone", "Amount", "Expiry", "Status"]];
  const rows = [];

  const tableRows = document.querySelectorAll("#memberTable tbody tr");
  tableRows.forEach(row => {
    const cols = Array.from(row.children).map(td => td.innerText);
    rows.push(cols);
  });

  doc.autoTable({
    startY: 30,
    head: headers,
    body: rows,
  });

  doc.save("members.pdf");
}
