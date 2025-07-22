// Firebase config
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

// DOM elements
const loginSection = document.getElementById("login-section");
const mainSection = document.getElementById("main-section");
const loginForm = document.getElementById("login-form");
const logoutBtn = document.getElementById("logout-btn");
const addMemberForm = document.getElementById("add-member-form");
const membersList = document.getElementById("members-list");

// Auth state listener
auth.onAuthStateChanged(user => {
  if (user) {
    showMainUI();
    loadMembers();
  } else {
    showLoginUI();
  }
});

// Show login UI
function showLoginUI() {
  loginSection.style.display = "block";
  mainSection.style.display = "none";
}

// Show main UI
function showMainUI() {
  loginSection.style.display = "none";
  mainSection.style.display = "block";
}

// Login
loginForm.addEventListener("submit", e => {
  e.preventDefault();
  const email = loginForm.email.value;
  const password = loginForm.password.value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      loginForm.reset();
    })
    .catch(error => {
      alert("Login failed: " + error.message);
    });
});

// Logout
logoutBtn.addEventListener("click", () => {
  auth.signOut().then(() => {
    alert("Logged out successfully.");
  });
});

// Add Member
addMemberForm.addEventListener("submit", e => {
  e.preventDefault();

  const name = addMemberForm.name.value;
  const phone = addMemberForm.phone.value;
  const plan = addMemberForm.plan.value;

  if (name && phone && plan) {
    db.collection("members").add({
      name,
      phone,
      plan,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      addMemberForm.reset();
      alert("Member added successfully!");
    }).catch(error => {
      alert("Error adding member: " + error.message);
    });
  } else {
    alert("Please fill all fields.");
  }
});

// Load Members
function loadMembers() {
  db.collection("members").orderBy("timestamp", "desc")
    .onSnapshot(snapshot => {
      membersList.innerHTML = "";

      snapshot.forEach(doc => {
        const member = doc.data();
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${member.name}</strong><br>
          📞 ${member.phone}<br>
          🏋️ Plan: ${member.plan}<br><hr>
        `;
        membersList.appendChild(li);
      });
    });
}
