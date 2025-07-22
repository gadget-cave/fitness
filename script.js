const firebaseConfig = {
  apiKey: "AIzaSyDf7i6GDLSTKNI8UDPTw3-cLY5XkozSdx8",
  authDomain: "gym-fee-tracker-ecc75.firebaseapp.com",
  projectId: "gym-fee-tracker-ecc75",
  storageBucket: "gym-fee-tracker-ecc75.appspot.com",
  messagingSenderId: "1051044340053",
  appId: "1:1051044340053:web:7abd5a48e2f5428d8a8fdc"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Add member to Firestore
function addMember() {
  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const fee = document.getElementById('fee').value;
  const days = parseInt(document.getElementById('days').value);

  if (!name || !phone || !fee || !days) {
    alert("Fill all fields!");
    return;
  }

  const start = new Date();
  const end = new Date();
  end.setDate(start.getDate() + days);

  db.collection("members").add({
    name,
    phone,
    fee,
    start: start.toISOString(),
    end: end.toISOString(),
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    alert("Member added!");
    document.getElementById('name').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('fee').value = '';
    document.getElementById('days').value = '';
  });
}

// Load members with live updates
db.collection("members").orderBy("timestamp", "desc")
  .onSnapshot(snapshot => {
    const now = new Date();
    const tbody = document.getElementById("memberList");
    tbody.innerHTML = "";

    snapshot.forEach(doc => {
      const data = doc.data();
      const start = new Date(data.start);
      const end = new Date(data.end);
      const expired = end < now;

      const tr = document.createElement("tr");
      if (expired) tr.classList.add("expired");

      tr.innerHTML = `
        <td>${data.name}</td>
        <td>${data.phone}</td>
        <td>₹${data.fee}</td>
        <td>${start.toLocaleDateString()}</td>
        <td>${end.toLocaleDateString()}</td>
        <td>${expired ? "Expired" : "Active"}</td>
        <td>
          <a href="https://wa.me/91${data.phone}" target="_blank">WhatsApp</a><br>
          <button onclick="exportMember('${doc.id}')">PDF</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  });

// Export all members to PDF
function exportToPDF() {
  import('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js').then(jsPDF => {
    const { jsPDF: PDF } = jsPDF;
    const doc = new PDF();
    let y = 10;

    doc.text("Gym Member List", 10, y);
    y += 10;

    db.collection("members").get().then(snapshot => {
      snapshot.forEach(docSnap => {
        const m = docSnap.data();
        doc.text(`Name: ${m.name}, Phone: ${m.phone}, Fee: ₹${m.fee}`, 10, y);
        y += 10;
      });
      doc.save("gym-members.pdf");
    });
  });
}

// Export individual member
function exportMember(id) {
  db.collection("members").doc(id).get().then(docSnap => {
    if (docSnap.exists) {
      const m = docSnap.data();
      import('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js').then(jsPDF => {
        const { jsPDF: PDF } = jsPDF;
        const doc = new PDF();
        doc.text("Gym Member Details", 10, 10);
        doc.text(`Name: ${m.name}`, 10, 20);
        doc.text(`Phone: ${m.phone}`, 10, 30);
        doc.text(`Fee: ₹${m.fee}`, 10, 40);
        doc.text(`Start: ${new Date(m.start).toLocaleDateString()}`, 10, 50);
        doc.text(`End: ${new Date(m.end).toLocaleDateString()}`, 10, 60);
        doc.save(`${m.name}_details.pdf`);
      });
    }
  });
}
