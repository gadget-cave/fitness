const firebaseConfig = {
  apiKey: "AIzaSyDf7i6GDLSTKNI8UDPTw3-cLY5XkozSdx8",
  authDomain: "gym-fee-tracker-ecc75.firebaseapp.com",
  projectId: "gym-fee-tracker-ecc75",
  storageBucket: "gym-fee-tracker-ecc75.appspot.com",
  messagingSenderId: "1051044340053",
  appId: "1:1051044340053:web:7abd5a48e2f5428d8a8fdc"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

// DOM elements
const memberForm = document.getElementById("memberForm");
const membersTable = document.getElementById("membersTable");
const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");
const adminSection = document.getElementById("adminSection");
const loginSection = document.getElementById("loginSection");

// Handle Login
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = loginForm["email"].value;
    const password = loginForm["password"].value;

    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        loginForm.reset();
      })
      .catch((err) => alert("Login Failed: " + err.message));
  });
}

// Handle Logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    auth.signOut();
  });
}

// Auth state
auth.onAuthStateChanged(user => {
  if (user) {
    loginSection.style.display = "none";
    adminSection.style.display = "block";
    fetchMembers();
  } else {
    loginSection.style.display = "block";
    adminSection.style.display = "none";
  }
});

// Add new member
if (memberForm) {
  memberForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = memberForm["name"].value;
    const phone = memberForm["phone"].value;
    const plan = memberForm["plan"].value;
    const date = memberForm["date"].value;
    const amount = memberForm["amount"].value;

    const newRef = db.ref("members").push();
    newRef.set({
      name,
      phone,
      plan,
      date,
      amount
    });

    memberForm.reset();
  });
}

// Fetch and display all members
function fetchMembers() {
  db.ref("members").on("value", (snapshot) => {
    membersTable.innerHTML = `
      <tr>
        <th>Name</th>
        <th>Phone</th>
        <th>Plan</th>
        <th>Date</th>
        <th>Amount</th>
      </tr>
    `;
    snapshot.forEach(child => {
      const data = child.val();
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${data.name}</td>
        <td>${data.phone}</td>
        <td>${data.plan}</td>
        <td>${data.date}</td>
        <td>${data.amount}</td>
      `;
      membersTable.appendChild(row);
    });
  });
}
