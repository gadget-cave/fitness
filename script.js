let adminData = {
  phone: "9744340057",
  password: "hisham@123"
};

let members = JSON.parse(localStorage.getItem("gymMembers")) || [];

function login() {
  const phone = document.getElementById("adminPhone").value.trim();
  const pass = document.getElementById("adminPass").value.trim();

  if (phone === adminData.phone && pass === adminData.password) {
    document.getElementById("login-section").classList.add("hidden");
    document.getElementById("main-section").classList.remove("hidden");
    renderTable();
  } else {
    alert("How are you?");
    document.body.innerHTML = "<h1 style='text-align:center; padding-top:200px;'>How are you?</h1>";
  }
}

function logout() {
  location.reload();
}

function addMember() {
  const name = document.getElementById("memberName").value.trim();
  const phone = document.getElementById("memberPhone").value.trim();
  const fee = document.getElementById("feeAmount").value.trim();
  const date = document.getElementById("paymentDate").value;

  if (name && phone && fee && date) {
    members.push({ name, phone, fee, date });
    localStorage.setItem("gymMembers", JSON.stringify(members));
    renderTable();
    clearForm();
  } else {
    alert("Please fill all fields.");
  }
}

function clearForm() {
  document.getElementById("memberName").value = "";
  document.getElementById("memberPhone").value = "";
  document.getElementById("feeAmount").value = "";
  document.getElementById("paymentDate").value = "";
}

function renderTable() {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  members.forEach((member, index) => {
    const tr = document.createElement("tr");

    const paidDate = new Date(member.date);
    const today = new Date();
    const days = Math.floor((today - paidDate) / (1000 * 60 * 60 * 24));

    tr.innerHTML = `
      <td>${member.name}</td>
      <td>${member.phone}</td>
      <td>₹${member.fee}</td>
      <td>${member.date}</td>
      <td>${days > 30 ? "<span style='color:red;'>Expired</span>" : "Active"}</td>
      <td><button onclick="exportMemberPDF(${index})">PDF</button></td>
      <td><button onclick="confirmDelete(${index})">❌</button></td>
    `;

    if (days > 30) tr.classList.add("expired");

    tbody.appendChild(tr);
  });
}

function confirmDelete(index) {
  if (confirm("Are you sure you want to delete this member?")) {
    members.splice(index, 1);
    localStorage.setItem("gymMembers", JSON.stringify(members));
    renderTable();
  }
}

function exportMemberPDF(index) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const m = members[index];
  doc.text("Gym Member Details", 20, 20);
  doc.text(`Name: ${m.name}`, 20, 40);
  doc.text(`Phone: ${m.phone}`, 20, 50);
  doc.text(`Fee: ₹${m.fee}`, 20, 60);
  doc.text(`Payment Date: ${m.date}`, 20, 70);
  doc.save(`${m.name}_details.pdf`);
}

function exportAllPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("All Gym Members", 20, 20);
  let y = 40;

  members.forEach((m, i) => {
    doc.text(`${i + 1}. ${m.name}, ${m.phone}, ₹${m.fee}, ${m.date}`, 20, y);
    y += 10;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save("All_Members.pdf");
}
