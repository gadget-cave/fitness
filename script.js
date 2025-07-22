const adminPhone = "9744340057";
const adminPass = "hisham@123";

function login() {
  const phone = document.getElementById("loginPhone").value.trim();
  const pass = document.getElementById("loginPassword").value.trim();
  if (phone === adminPhone && pass === adminPass) {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("mainContent").style.display = "block";
    loadMembers();
  } else {
    document.getElementById("loginError").textContent = "How are you?";
    document.getElementById("mainContent").style.display = "none";
  }
}

function addMember() {
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const joinDate = document.getElementById("joinDate").value;
  const duration = parseInt(document.getElementById("duration").value);

  if (!name || !phone || !joinDate || !duration) return alert("Please fill all fields");

  const expiry = new Date(joinDate);
  expiry.setDate(expiry.getDate() + duration);

  const member = {
    id: Date.now(),
    name,
    phone,
    joinDate,
    duration,
    expiry: expiry.toISOString().split("T")[0]
  };

  const members = getMembers();
  members.push(member);
  localStorage.setItem("gymMembers", JSON.stringify(members));

  loadMembers();
  clearForm();
}

function clearForm() {
  document.getElementById("name").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("joinDate").value = "";
  document.getElementById("duration").value = "";
}

function getMembers() {
  return JSON.parse(localStorage.getItem("gymMembers")) || [];
}

function deleteMember(id) {
  if (!confirm("Are you sure you want to delete this member?")) return;
  const members = getMembers().filter(m => m.id !== id);
  localStorage.setItem("gymMembers", JSON.stringify(members));
  loadMembers();
}

function exportMemberToPDF(member) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text(`Member Details`, 10, 10);
  doc.text(`Name: ${member.name}`, 10, 20);
  doc.text(`Phone: ${member.phone}`, 10, 30);
  doc.text(`Join Date: ${member.joinDate}`, 10, 40);
  doc.text(`Expiry: ${member.expiry}`, 10, 50);
  doc.save(`${member.name}_MemberDetails.pdf`);
}

function exportAllToPDF() {
  const members = getMembers();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(12);
  doc.text("Gym Members Report", 10, 10);

  let y = 20;
  members.forEach((m, index) => {
    doc.text(`Name: ${m.name}, Phone: ${m.phone}, Expiry: ${m.expiry}`, 10, y);
    y += 10;
    if (y > 270) {
      doc.addPage();
      y = 10;
    }
  });

  doc.save("All_Members.pdf");
}

function loadMembers() {
  const members = getMembers();
  const tbody = document.getElementById("memberBody");
  tbody.innerHTML = "";

  members.forEach(member => {
    const tr = document.createElement("tr");
    const now = new Date().toISOString().split("T")[0];
    const expired = now > member.expiry;

    tr.className = expired ? "expired" : "";
    tr.innerHTML = `
      <td>${member.name}</td>
      <td>${member.phone}</td>
      <td>${member.joinDate}</td>
      <td>${member.expiry}</td>
      <td>${expired ? "Expired" : "Active"}</td>
      <td>
        <button onclick="exportMemberToPDF(${JSON.stringify(member).replace(/"/g, '&quot;')})">Export</button>
        <button onclick="deleteMember(${member.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}
