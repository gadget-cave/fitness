// Firebase setup
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

// Show login page on load
window.onload = () => {
  auth.onAuthStateChanged(user => {
    if (user) {
      document.getElementById("loginSection").style.display = "none";
      document.getElementById("mainApp").style.display = "block";
      loadMembers();
    } else {
      document.getElementById("loginSection").style.display = "block";
      document.getElementById("mainApp").style.display = "none";
    }
  });
};

// Login function
function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => Swal.fire("Success", "Logged in!", "success"))
    .catch(() => Swal.fire("Who are you?", "Invalid credentials!", "error"));
}

// Logout function
function logout() {
  auth.signOut();
}

// Add member
document.getElementById("addForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const number = document.getElementById("number").value;
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const fees = document.getElementById("fees").value;

  db.collection("members").add({
    name, number, startDate, endDate, fees
  }).then(() => {
    Swal.fire("Success", "Member added", "success");
    document.getElementById("addForm").reset();
    loadMembers();
  });
});

// Load members
function loadMembers() {
  const tbody = document.getElementById("memberTable");
  tbody.innerHTML = "";
  db.collection("members").get().then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      const expired = new Date(data.endDate) < new Date();
      const row = `
        <tr class="${expired ? 'expired' : ''}">
          <td>${data.name}</td>
          <td>${data.number}</td>
          <td>${data.startDate}</td>
          <td>${data.endDate}</td>
          <td>₹${data.fees}</td>
          <td>
            ${expired ? 'Expired' : 'Active'}
          </td>
          <td>
            <a href="https://wa.me/91${data.number}?text=Hi ${data.name}, your gym fee has expired on ${data.endDate}. Please renew." target="_blank" class="btn btn-sm btn-danger">WhatsApp</a>
          </td>
        </tr>
      `;
      tbody.innerHTML += row;
    });
  });
}

// Export to PDF
function exportToPDF() {
  const element = document.getElementById("exportSection");
  html2pdf().from(element).save("gym-members.pdf");
}
