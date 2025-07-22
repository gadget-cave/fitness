// script.js

const members = JSON.parse(localStorage.getItem("members")) || [];
const admin = {
  mobile: "9744340057",
  password: "hisham@123"
};

function login() {
  const number = document.getElementById("login-number").value;
  const password = document.getElementById("login-password").value;
  if (number === admin.mobile && password === admin.password) {
    document.getElementById("login-page").style.display = "none";
    document.getElementById("app").style.display = "block";
    showMembers();
  } else {
    document.getElementById("login-error").textContent = "Invalid credentials";
  }
}

function logout() {
  document.getElementById("app").style.display = "none";
  document.getElementById("login-page").style.display = "block";
}

function addMember() {
  const name = document.getElementById("name").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const paidMonths = parseInt(document.getElementById("paidMonths").value);
  const startDate = new Date(document.getElementById("startDate").value);

  if (!name || !mobile || isNaN(paidMonths) || isNaN(startDate.getTime())) {
    alert("Please fill all fields correctly.");
    return;
  }

  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + paidMonths);

  const newMember = { name, mobile, paidMonths, startDate: startDate.toISOString(), endDate: endDate.toISOString() };
  members.push(newMember);
  localStorage.setItem("members", JSON.stringify(members));
  showMembers();
  document.getElementById("name").value = "";
  document.getElementById("mobile").value = "";
  document.getElementById("paidMonths").value = "";
  document.getElementById("startDate").value = "";
}

function showMembers() {
  const list = document.getElementById("members-list");
  list.innerHTML = "";
  members.forEach((member, index) => {
    const start = new Date(member.startDate);
    const end = new Date(member.endDate);
    const expired = new Date() > end;

    const memberDiv = document.createElement("div");
    memberDiv.className = `member-card ${expired ? "expired" : "active"}`;
    memberDiv.innerHTML = `
      <h3>${member.name}</h3>
      <p><strong>Mobile:</strong> ${member.mobile}</p>
      <p><strong>Paid Months:</strong> ${member.paidMonths}</p>
      <p><strong>Start Date:</strong> ${start.toDateString()}</p>
      <p><strong>End Date:</strong> ${end.toDateString()}</p>
      <p class="${expired ? "red" : "green"}">${expired ? "Expired" : "Active"}</p>
      <button onclick="exportToPDF(${index})">Export</button>
      <button onclick="deleteMember(${index})">Delete</button>
    `;
    list.appendChild(memberDiv);
  });
}

function deleteMember(index) {
  if (confirm("Are you sure you want to delete this member?")) {
    members.splice(index, 1);
    localStorage.setItem("members", JSON.stringify(members));
    showMembers();
  }
}

function exportToPDF(index) {
  const { jsPDF } = window.jspdf;
  const member = members[index];
  const doc = new jsPDF();
  doc.text(`Member Report`, 10, 10);
  doc.text(`Name: ${member.name}`, 10, 20);
  doc.text(`Mobile: ${member.mobile}`, 10, 30);
  doc.text(`Paid Months: ${member.paidMonths}`, 10, 40);
  doc.text(`Start Date: ${new Date(member.startDate).toDateString()}`, 10, 50);
  doc.text(`End Date: ${new Date(member.endDate).toDateString()}`, 10, 60);
  doc.save(`${member.name}_Report.pdf`);
}

function exportAllMembersToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 10;

  doc.text("All Members Report", 10, y);
  y += 10;

  members.forEach((member, i) => {
    doc.text(`Name: ${member.name}`, 10, y);
    doc.text(`Mobile: ${member.mobile}`, 10, y + 10);
    doc.text(`Paid Months: ${member.paidMonths}`, 10, y + 20);
    doc.text(`Start: ${new Date(member.startDate).toDateString()}`, 10, y + 30);
    doc.text(`End: ${new Date(member.endDate).toDateString()}`, 10, y + 40);
    y += 60;
    if (y > 270) {
      doc.addPage();
      y = 10;
    }
  });

  doc.save("All_Members_Report.pdf");
}

function searchMembers() {
  const searchInput = document.getElementById("searchInput").value.toLowerCase();
  const filtered = members.filter(
    (m) => m.name.toLowerCase().includes(searchInput) || m.mobile.includes(searchInput)
  );
  const list = document.getElementById("members-list");
  list.innerHTML = "";
  filtered.forEach((member, index) => {
    const start = new Date(member.startDate);
    const end = new Date(member.endDate);
    const expired = new Date() > end;

    const memberDiv = document.createElement("div");
    memberDiv.className = `member-card ${expired ? "expired" : "active"}`;
    memberDiv.innerHTML = `
      <h3>${member.name}</h3>
      <p><strong>Mobile:</strong> ${member.mobile}</p>
      <p><strong>Paid Months:</strong> ${member.paidMonths}</p>
      <p><strong>Start Date:</strong> ${start.toDateString()}</p>
      <p><strong>End Date:</strong> ${end.toDateString()}</p>
      <p class="${expired ? "red" : "green"}">${expired ? "Expired" : "Active"}</p>
      <button onclick="exportToPDF(${index})">Export</button>
      <button onclick="deleteMember(${index})">Delete</button>
    `;
    list.appendChild(memberDiv);
  });
}
