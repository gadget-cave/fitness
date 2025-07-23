// Firebase configuration - replaced with your actual config
const firebaseConfig = {
    apiKey: "AIzaSyBe_k7RxoQa2g_Vyw3niG_M74pIPw8Mz0U",
    authDomain: "gym-fees-5dbcf.firebaseapp.com",
    databaseURL: "https://gym-fees-5dbcf-default-rtdb.firebaseio.com", // Ensure databaseURL is present
    projectId: "gym-fees-5dbcf",
    storageBucket: "gym-fees-5dbcf.firebasestorage.app",
    messagingSenderId: "423386853721",
    appId: "1:423386853721:web:fafd195e95e6b1cb091c48"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

// DOM elements
const loginContainer = document.getElementById('login-container');
const dashboardContainer = document.getElementById('dashboard-container');
const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');
const logoutBtn = document.getElementById('logout-btn');
const memberForm = document.getElementById('member-form');
const membersList = document.getElementById('members-list');
const currentDateDisplay = document.getElementById('current-date');
const statusCards = document.getElementById('status-cards'); // Get reference to status cards container

// Show today's date
const today = new Date();
currentDateDisplay.textContent = `Today: ${today.toLocaleDateString()}`;

// Login functionality
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Simple hardcoded auth for demo (replace with Firebase Auth in production)
    if (username === 'hisham' && password === '12345') {
        loginContainer.classList.add('hidden');
        dashboardContainer.classList.remove('hidden');
        loadMembers();
        setDefaultDate();
        updateTimestamp(); // Initial update of timestamp on login
    } else {
        errorMessage.textContent = 'Who are you? Unauthorized access attempted.';
        errorMessage.classList.remove('hidden');
    }
});

// Logout functionality
logoutBtn.addEventListener('click', () => {
    loginContainer.classList.remove('hidden');
    dashboardContainer.classList.add('hidden');
    loginForm.reset();
    errorMessage.classList.add('hidden');
});

// Default to today's date in the form
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('start-date').value = today;
}

// Add new member
memberForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('member-name').value;
    const mobile = document.getElementById('mobile-number').value;
    const fee = document.getElementById('fee-amount').value;
    const startDate = document.getElementById('start-date').value;
    
    // Calculate end date (30 days from start)
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(startDateObj);
    endDateObj.setDate(startDateObj.getDate() + 30);
    
    const member = {
        name: name,
        mobile: mobile,
        fee: fee,
        startDate: startDate,
        endDate: endDateObj.toISOString().split('T')[0],
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };
    
    // Push to Firebase
    database.ref('members').push(member)
        .then(() => {
            memberForm.reset();
            setDefaultDate();
        })
        .catch(error => {
            console.error("Error adding member: ", error);
        });
});

// Live status counters
function updateStatusCounts(membersData) {
    let activeCount = 0;
    let expiredCount = 0;
    let totalIncome = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to start of day

    for (const key in membersData) {
        const member = membersData[key];
        const endDate = new Date(member.endDate);
        endDate.setHours(0, 0, 0, 0); // Normalize end date to start of day
        
        if (today <= endDate) {
            activeCount++;
            totalIncome += parseFloat(member.fee);
        } else {
            expiredCount++;
        }
    }
    
    statusCards.innerHTML = `
        <div class="bg-green-50 p-4 rounded-lg border border-green-200">
            <div class="text-green-800 font-bold text-2xl">${activeCount}</div>
            <div class="text-green-600">Active Members</div>
        </div>
        <div class="bg-red-50 p-4 rounded-lg border border-red-200">
            <div class="text-red-800 font-bold text-2xl">${expiredCount}</div>
            <div class="text-red-600">Expired Members</div>
        </div>
        <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div class="text-blue-800 font-bold text-2xl">${activeCount + expiredCount}</div>
            <div class="text-blue-600">Total Members</div>
        </div>
        <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div class="text-yellow-800 font-bold text-2xl">₹${totalIncome.toLocaleString()}</div>
            <div class="text-yellow-600">Total Active Income</div>
        </div>
    `;
}

// Load members from Firebase
function loadMembers() {
    database.ref('members').on('value', (snapshot) => {
        membersList.innerHTML = '';
        const membersData = snapshot.val();
        if (membersData) {
            Object.keys(membersData).forEach((key) => {
                const member = membersData[key];
                addMemberToTable(member, key);
            });
            updateStatusCounts(membersData);
        } else {
            updateStatusCounts({}); // If no members, update counts to zero
        }
        updateTimestamp();
    });
}

// Add member to the table with edit functionality
function addMemberToTable(member, key) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to start of day
    const endDate = new Date(member.endDate);
    endDate.setHours(0, 0, 0, 0); // Normalize end date to start of day
    const isExpired = today > endDate;
    
    const row = document.createElement('tr');
    if (isExpired) {
        row.classList.add('expired');
    }
    
    row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap">${member.name}</td>
        <td class="px-6 py-4 whitespace-nowrap">${member.mobile}</td>
        <td class="px-6 py-4 whitespace-nowrap">
            <input type="number" value="${member.fee}" class="border rounded px-2 py-1 w-20 fee-input" data-key="${key}">
            <button class="ml-2 bg-blue-500 text-white px-2 py-1 rounded save-btn hidden" data-key="${key}">Save</button>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">${formatDate(member.startDate)}</td>
        <td class="px-6 py-4 whitespace-nowrap">${formatDate(member.endDate)}</td>
        <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                ${isExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">
                ${isExpired ? 'Expired' : 'Active'}
            </span>
        </td>
    `;
    
    membersList.appendChild(row);
}

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// PDF Export Functionality
document.getElementById('export-pdf').addEventListener('click', () => {
    const doc = new jspdf.jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text('Gym Member Database', 15, 20);
    
    // Export Date
    doc.setFontSize(10);
    doc.text(`Exported: ${new Date().toLocaleString()}`, 15, 30);
    
    // Table data
    const tableData = [];
    const tableRows = document.querySelectorAll('#members-list tr');
    
    tableRows.forEach(row => {
        const rowData = Array.from(row.cells).map(cell => 
            cell.querySelector('.fee-input') ? cell.querySelector('.fee-input').value : cell.textContent.trim()
        );
        tableData.push(rowData);
    });
    
    doc.autoTable({
        head: [['Name', 'Mobile', 'Fee (₹)', 'Start Date', 'End Date', 'Status']],
        body: tableData,
        startY: 40,
        styles: {
            fontSize: 9,
            cellPadding: 1,
            overflow: 'linebreak'
        },
        didParseCell: function(data) {
            if (data.column.index === 5 && data.cell.raw) { // Status column
                const statusText = data.cell.raw.textContent.trim();
                if (statusText === 'Expired') {
                    data.cell.styles.textColor = [239, 68, 68]; // Tailwind red-500 equivalent
                } else if (statusText === 'Active') {
                    data.cell.styles.textColor = [34, 197, 94]; // Tailwind green-500 equivalent
                }
            }
        }
    });
    
    doc.save(`gym-members-${new Date().toISOString().slice(0,10)}.pdf`);
});

// Real-time update timestamp
function updateTimestamp() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    document.getElementById('last-updated').textContent = `Last updated: ${timeString}`;
}

// Initialize
setDefaultDate();

// Set up real-time updates for timestamp
setInterval(() => {
    if (!dashboardContainer.classList.contains('hidden')) { // Only update if dashboard is visible
        updateTimestamp();
    }
}, 1000 * 60); // Update every minute

// Real-time fee editing
document.addEventListener('change', (e) => {
    if (e.target.classList.contains('fee-input')) {
        const saveBtn = document.querySelector(`.save-btn[data-key="${e.target.dataset.key}"]`);
        if (saveBtn) { // Ensure button exists
            saveBtn.classList.remove('hidden');
        }
    }
});

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('save-btn')) {
        const key = e.target.dataset.key;
        const feeInput = document.querySelector(`.fee-input[data-key="${key}"]`);
        const newFee = feeInput.value;
        
        // Update in Firebase
        database.ref(`members/${key}/fee`).set(newFee)
            .then(() => {
                e.target.classList.add('hidden');
            })
            .catch(error => {
                console.error("Error updating fee:", error);
            });
    }
});
