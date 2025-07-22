import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, onSnapshot, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth, signInWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBe_k7RxoQa2g_Vyw3niG_M74pIPw8Mz0U",
  authDomain: "gym-fees-5dbcf.firebaseapp.com",
  projectId: "gym-fees-5dbcf",
  storageBucket: "gym-fees-5dbcf.appspot.com",
  messagingSenderId: "423386853721",
  appId: "1:423386853721:web:fafd195e95e6b1cb091c48"
};

// Initialize
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const membersCollection = collection(db, "members");

// Elements
const loginSection = document.getElementById("loginSection");
const mainSection = document.getElementById("mainSection");
const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");
const memberForm = document.getElementById("memberForm");
const memberTableBody = document.querySelector("#memberTable tbody");

// Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = loginForm.email.value;
  const password = loginForm.password.value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginSection.style.display = "none";
    mainSection.style.display = "block";
  } catch (error) {
    alert("Who are you?");
  }
});

// Logout
logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => {
    loginSection.style.display = "block";
    mainSection.style.display = "none";
  });
});

// Add Member
memberForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = memberForm.name.value;
  const phone = memberForm.phone.value;
  const fee = memberForm.fee.value;
  const date = memberForm.date.value;

  try {
    await addDoc(membersCollection, {
      name,
      phone,
      fee,
      date
    });
    memberForm.reset();
  } catch (err) {
    alert("Error adding member.");
  }
});

// Load and Display Members
function loadMembers() {
  onSnapshot(query(membersCollection, orderBy("date", "desc")), (snapshot) => {
    memberTableBody.innerHTML = "";
    snapshot.forEach((doc) => {
      const data = doc.data();
      const tr = document.createElement("tr");

      const currentDate = new Date();
      const joinedDate = new Date(data.date);
      const expireDate = new Date(joinedDate);
      expireDate.setDate(expireDate.getDate() + 30);

      const isExpired = currentDate > expireDate;
      const status = isExpired ? "Expired" : "Active";

      const whatsappMsg = `Hello ${data.name}, your gym fee status is ${status}. Please renew if expired.`;
      const whatsappLink = `https://wa.me/91${data.phone}?text=${encodeURIComponent(whatsappMsg)}`;

      tr.innerHTML = `
        <td>${data.name}</td>
        <td>${data.phone}</td>
        <td>₹${data.fee}</td>
        <td>${data.date}</td>
        <td style="color:${isExpired ? 'red' : 'green'}">${status}</td>
        <td>${expireDate.toISOString().split('T')[0]}</td>
        <td><a href="${whatsappLink}" target="_blank">Chat</a></td>
      `;

      memberTableBody.appendChild(tr);
    });
  });
}

loadMembers();
