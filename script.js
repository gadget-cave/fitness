// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBe_k7RxoQa2g_Vyw3niG_M74pIPw8Mz0U",
  authDomain: "gym-fees-5dbcf.firebaseapp.com",
  projectId: "gym-fees-5dbcf",
  storageBucket: "gym-fees-5dbcf.appspot.com",
  messagingSenderId: "423386853721",
  appId: "1:423386853721:web:fafd195e95e6b1cb091c48"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const loginContainer = document.getElementById("loginContainer");
const adminContainer = document.getElementById("adminContainer");
const membersTable = document.getElementById("membersTable");

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASS = "admin123";

function login() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
    loginContainer.classList.add("hidden");
    adminContainer.classList.remove("hidden");
    loadMembers();
  } else {
    document.getElementById("loginStatus").innerText = "Who are you?";
  }
}

function logout() {
  adminContainer.classList.add("hidden");
  loginContainer.classList.remove("hidden");
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";
}

function addMember() {
  const name = document.getElementById("memberName").value;
  const phone = document.getElementById("phone").value;
  const fees = document.getElementById("fees").value;
  const expiryDate = document.getElementById("expiryDate").value;

  if (!name || !phone || !fees || !expiryDate) {
    alert("Please fill all fields");
    return;
  }

  const newRef = db.ref("members").push();
  newRef.set({
    name,
    phone,
    fees,
    expiryDate
  });

  document.getElementById("memberName").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("fees").value = "";
  document.getElementById("expiryDate").value = "";
}

function loadMembers() {
  db.ref("members").on("value", (snapshot) => {
    membersTable.innerHTML = "";
    snapshot.forEach(child => {
      const data = child.val();
      const tr = document.createElement("tr");

      const today = new Date().toISOString().split("T")[0];
      const status = (data.expiryDate < today) ? "Expired" : "Active";
      const statusClass = (data.expiryDate < today) ? "expired" : "";

      tr.innerHTML = `
        <td>${data.name}</td>
        <td>${data.phone}</td>
        <td>₹${data.fees}</td>
        <td>${data.expiryDate}</td>
        <td class="${statusClass}">${status}</td>
        <td><a href="https://wa.me/91${data.phone}?text=Your+fees+of+₹${data.fees}+is+${status}" target="_blank">Chat</a></td>
      `;
      membersTable.appendChild(tr);
    });
  });
}
