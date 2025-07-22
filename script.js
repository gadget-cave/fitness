// Paste your Firebase config here ↓↓↓↓↓↓
const firebaseConfig = {
  apiKey: "AIzaSyDf7i6GDLSTKNI8UDPTw3-cLY5XkozSdx8",
  authDomain: "gym-fee-tracker-ecc75.firebaseapp.com",
  projectId: "gym-fee-tracker-ecc75",
  storageBucket: "gym-fee-tracker-ecc75.firebasestorage.app",
  messagingSenderId: "1051044340053",
  appId: "1:1051044340053:web:7abd5a48e2f5428d8a8fdc",
  measurementId: "G-RTX4JWF8EJ"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

function login() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, pass)
    .then(() => {
      document.getElementById("auth-section").style.display = "none";
      document.getElementById("app-section").style.display = "block";
      loadMembers();
    })
    .catch(err => alert("Login Failed: " + err.message));
}

function logout() {
  auth.signOut().then(() => {
    document.getElementById("auth-section").style.display = "block";
    document.getElementById("app-section").style.display = "none";
  });
}

function addMember() {
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const fee = document.getElementById("fee").value;

  const newRef = db.ref("members").push();
  newRef.set({ name, phone, fee });

  document.getElementById("name").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("fee").value = "";
}

function loadMembers() {
  db.ref("members").on("value", (snapshot) => {
    const members = snapshot.val();
    const memberList = document.getElementById("memberList");
    memberList.innerHTML = "";

    for (let id in members) {
      const { name, phone, fee } = members[id];
      const row = `<tr><td>${name}</td><td>${phone}</td><td>${fee}</td></tr>`;
      memberList.innerHTML += row;
    }
  });
}
