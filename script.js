// Firebase Configuration
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

const loginSection = document.getElementById('loginSection');
const appSection = document.getElementById('appSection');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const addMemberBtn = document.getElementById('addMemberBtn');
const exportBtn = document.getElementById('exportBtn');

loginBtn.addEventListener('click', () => {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      loginSection.style.display = 'none';
      appSection.style.display = 'block';
      fetchMembers();
    })
    .catch(() => {
      alert("Who are you?");
    });
});

logoutBtn.addEventListener('click', () => {
  auth.signOut().then(() => {
    loginSection.style.display = 'block';
    appSection.style.display = 'none';
  });
});

addMemberBtn.addEventListener('click', () => {
  const name = document.getElementById('memberName').value.trim();
  const fee = document.getElementById('memberFee').value.trim();
  const expiry = document.getElementById('memberExpiry').value.trim();
  const phone = document.getElementById('memberPhone').value.trim();

  if (!name || !fee || !expiry || !phone) {
    alert("Fill all fields");
    return;
  }

  db.collection("members").add({
    name: name,
    fee: fee,
    expiry: expiry,
    phone: phone,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    document.getElementById('memberName').value = '';
    document.getElementById('memberFee').value = '';
    document.getElementById('memberExpiry').value = '';
    document.getElementById('memberPhone').value = '';
    fetchMembers();
  });
});

function fetchMembers() {
  const table = document.getElementById('membersTable');
  table.innerHTML = `
    <tr>
      <th>Name</th>
      <th>Fee</th>
      <th>Expiry</th>
      <th>Phone</th>
      <th>Status</th>
    </tr>`;

  db.collection("members").orderBy("timestamp", "desc").get().then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      const whatsappMsg = `https://wa.me/91${data.phone}?text=Hi ${data.name}, your gym fee of ₹${data.fee} has expired on ${data.expiry}. Please renew now.`;

      const row = `
        <tr>
          <td>${data.name}</td>
          <td>₹${data.fee}</td>
          <td>${data.expiry}</td>
          <td>${data.phone}</td>
          <td><a href="${whatsappMsg}" target="_blank" class="btn">WhatsApp</a></td>
        </tr>`;
      table.innerHTML += row;
    });
  });
}

// Export to PDF
exportBtn.addEventListener('click', () => {
  const element = document.getElementById('membersTable');
  const opt = {
    margin:       0.5,
    filename:     'members_list.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };
  html2pdf().from(element).set(opt).save();
});

// Auth state
auth.onAuthStateChanged(user => {
  if (user) {
    loginSection.style.display = 'none';
    appSection.style.display = 'block';
    fetchMembers();
  } else {
    loginSection.style.display = 'block';
    appSection.style.display = 'none';
  }
});
