// Constants for admin login
const ADMIN_NUMBER = "917994160120";
const ADMIN_PASS = "hisham@123";

// State to hold member data
let members = JSON.parse(localStorage.getItem("members") || "[]");

// DOM references
const loginForm = document.getElementById("loginForm");
const dashboard = document.getElementById("dashboard");
const memberList = document.getElementById("memberList");
const addMemberForm = document.getElementById("addMemberForm");
const exportAllBtn = document.getElementById("exportAll");

function showLoginScreen() {
  loginForm.style.display = "block";
  dashboard.style.display = "none";
}

function showDashboard() {
  loginForm.style.display = "none";
  dashboard.style.display = "block";
  renderMemberList();
}

// Login handler
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const number = document.getElementById("number").value;
  const password = document.getElementById("password").value;

  if (number === ADMIN_NUMBER && password === ADMIN_PASS) {
    showDashboard();
  } else {
    document.body.innerHTML = "<h2 style='text-align:center; margin-top:20%;'>How are you 😊</h2>";
  }
});

// Add member handler
addMemberForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const plan = document.getElementById("plan").value;
  const fee = document.getElementById("fee").value;
  const paid = document.getElementById("paid").value;

  const newMember = {
    id: Date.now(),
    name,
    phone,
    plan,
    fee,
    paid,
    date: new Date().toLocaleDateString()
  };

  members.push(newMember);
  localStorage.setItem("members", JSON.stringify(members));
  renderMemberList();
  addMemberForm.reset();
});

// Render members
function renderMemberList() {
  memberList.innerHTML = "";
  members.forEach(member => {
    const div = document.createElement("div");
    div.className = "member-card";
    div.innerHTML = `
      <h3>${member.name}</h3>
      <p><strong>Phone:</strong> ${member.phone}</p>
      <p><strong>Plan:</strong> ${member.plan}</p>
      <p><strong>Fee:</strong> ₹${member.fee}</p>
      <p><strong>Paid:</strong> ₹${member.paid}</p>
      <p><strong>Date:</strong> ${member.date}</p>
      <button onclick="exportMemberPDF(${member.id})">Export PDF</button>
      <button onclick="deleteMember(${member.id})">Delete</button>
    `;
    memberList.appendChild(div);
  });
}

// Delete member
function deleteMember(id) {
  if (confirm("Are you sure to delete this member?")) {
    members = members.filter(m => m.id !== id);
    localStorage.setItem("members", JSON.stringify(members));
    renderMemberList();
  }
}

// Export one member to PDF
function exportMemberPDF(id) {
  const member = members.find(m => m.id === id);
  const doc = new jsPDF();
  doc.text("Member Details", 20, 20);
  doc.text(`Name: ${member.name}`, 20, 30);
  doc.text(`Phone: ${member.phone}`, 20, 40);
  doc.text(`Plan: ${member.plan}`, 20, 50);
  doc.text(`Fee: ₹${member.fee}`, 20, 60);
  doc.text(`Paid: ₹${member.paid}`, 20, 70);
  doc.text(`Date: ${member.date}`, 20, 80);
  doc.save(`${member.name}_member.pdf`);
}

// Export all members to PDF
exportAllBtn.addEventListener("click", function () {
  const doc = new jsPDF();
  doc.text("All Members", 20, 20);

  let y = 30;
  members.forEach((member, index) => {
    doc.text(`${index + 1}. ${member.name} - ${member.phone} - ₹${member.fee} - Paid: ₹${member.paid}`, 20, y);
    y += 10;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save("All_Members_List.pdf");
});

// Initial load
showLoginScreen();
