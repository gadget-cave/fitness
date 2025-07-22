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

// UI references
const loginSection = document.getElementById("login-section");
const mainSection = document.getElementById("main-section");
const membersTable = document.querySelector("#members tbody");
const addMemberForm = document.getElementById("add-member-form");
const logoutBtn = document.getElementById("logout-btn");
const loginForm = document.getElementById("login-form");

// Login functionality
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    await auth.signInWithEmailAndPassword(email, password);
    loginSection.style.display = "none";
    mainSection.style.display = "block";
  } catch (err) {
    alert("Who are you? Incorrect credentials!");
  }
});

// Logout functionality
logoutBtn.addEventListener("click", async () => {
  await auth.signOut();
  loginSection.style.display = "block";
  mainSection.style.display = "none";
});

// Add member to Firestore
addMemberForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("member-name").value;
  const phone = document.getElementById("member-phone").value;
  const fee = document.getElementById("member-fee").value;
  const expiry = document.getElementById("member-expiry").value;

  if (!name || !phone || !fee || !expiry) {
    alert("All fields required");
    return;
  }

  await db.collection("members").add({
    name,
    phone,
    fee,
    expiry,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  addMemberForm.reset();
});

// Real-time display of members
function renderMemberTable() {
  db.collection("members").orderBy("createdAt", "desc").onSnapshot(snapshot => {
    membersTable.innerHTML = ""; // Clear table
    snapshot.forEach(doc => {
      const data = doc.data();
      const tr = document.createElement("tr");

      const status = isExpired(data.expiry) ? "❌ Expired" : "✅ Active";
      const whatsappUrl = `https://wa.me/91${data.phone}?text=Your gym fee of ₹${data.fee} expired on ${data.expiry}. Please renew.`;

      tr.innerHTML = `
        <td>${data.name}</td>
        <td>${data.phone}</td>
        <td>₹${data.fee}</td>
        <td>${data.expiry}</td>
        <td>${status}</td>
        <td><a href="${whatsappUrl}" target="_blank">📱 Chat</a></td>
      `;
      membersTable.appendChild(tr);
    });
  });
}

// Utility: check if date is expired
function isExpired(dateStr) {
  const today = new Date().setHours(0,0,0,0);
  const expiry = new Date(dateStr).setHours(0,0,0,0);
  return expiry < today;
}

// Auth state check
auth.onAuthStateChanged(user => {
  if (user) {
    loginSection.style.display = "none";
    mainSection.style.display = "block";
    renderMemberTable();
  } else {
    loginSection.style.display = "block";
    mainSection.style.display = "none";
  }
});
