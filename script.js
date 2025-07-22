const allowedNumber = "917994160120";
const allowedPassword = "hisham@123";

function login() {
  const number = document.getElementById("loginNumber").value.trim();
  const pass = document.getElementById("loginPassword").value.trim();

  if (number === allowedNumber && pass === allowedPassword) {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("mainContainer").style.display = "block";
    loadMembers();
  } else {
    document.getElementById("unauth").style.display = "block";
    document.getElementById("loginBox").style.display = "none";
  }
}

function addMember() {
  const name = document.getElementById("memberName").value.trim();
  const number = document.getElementById("memberNumber").value.trim();
  const plan = document.getElementById("memberPlan").value.trim();
  const startDate = document.getElementById("startDate").value;

  if (!name || !number || !plan || !startDate) {
    alert("Fill all fields");
    return;
  }

  const members = JSON.parse(localStorage.getItem("members") || "[]");
  members.push({ name, number, plan, startDate });
  localStorage.setItem("members", JSON.stringify(members));
  loadMembers();

  document.getElementById("memberName").value = "";
  document.getElementById("memberNumber").value = "";
  document.getElementById("memberPlan").value = "";
  document.getElementById("startDate").value = "";
}

function loadMembers() {
  const members = JSON.parse(localStorage.getItem("members") || "[]");
  const list = document.getElementById("memberList");
  list.innerHTML = "";

  members.forEach((member, index) => {
    const box = document.createElement("div");
    box.className = "member-box";

    const expireDate = new Date(member.startDate);
    expireDate.setDate(expireDate.getDate() + 30);
    const today = new Date();

    const expired = today > expireDate;
    if (expired) box.classList.add("expired");

    box.innerHTML = `
      <h3>${member.name}</h3>
      <p>📞 ${member.number}</p>
      <p>💳 Plan: ${member.plan}</p>
      <p>📅 Start: ${member.startDate}</p>
      <p>⏳ Expires: ${expireDate.toISOString().slice(0,10)}</p>
      <button onclick="exportSingle(${index})">Export PDF</button>
    `;
    list.appendChild(box);
  });
}

function exportAll() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const members = JSON.parse(localStorage.getItem("members") || "[]");

  if (members.length === 0) {
    alert("No members to export.");
    return;
  }

  let y = 10;
  doc.setFontSize(12);
  members.forEach((m, i) => {
    const expire = new Date(m.startDate);
    expire.setDate(expire.getDate() + 30);

    doc.text(`Name: ${m.name}`, 10, y);
    doc.text(`Number: ${m.number}`, 10, y + 7);
    doc.text(`Plan: ${m.plan}`, 10, y + 14);
    doc.text(`Start: ${m.startDate}`, 10, y + 21);
    doc.text(`Expires: ${expire.toISOString().slice(0,10)}`, 10, y + 28);
    y += 40;
  });

  doc.save("all_members.pdf");
}

function exportSingle(index) {
  const { jsPDF } = window.jspdf;
  const members = JSON.parse(localStorage.getItem("members") || "[]");
  const m = members[index];
  const expire = new Date(m.startDate);
  expire.setDate(expire.getDate() + 30);

  const doc = new jsPDF();
  doc.text(`Name: ${m.name}`, 10, 10);
  doc.text(`Number: ${m.number}`, 10, 17);
  doc.text(`Plan: ${m.plan}`, 10, 24);
  doc.text(`Start: ${m.startDate}`, 10, 31);
  doc.text(`Expires: ${expire.toISOString().slice(0,10)}`, 10, 38);
  doc.save(`${m.name}_details.pdf`);
}
