// Firebase configuration - replaced with your actual config
const firebaseConfig = {
    apiKey: "AIzaSyBe_k7RxoQa2g_Vyw3niG_M74pIPw8Mz0U",
    authDomain: "gym-fees-5dbcf.firebaseapp.com",
    databaseURL: "https://gym-fees-5dbcf-default-rtdb.firebaseio.com", 
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
const statusCards = document.getElementById('status-cards'); 

// Confirmation Modal elements
const confirmModal = document.getElementById('confirm-modal');
const memberNameToDeleteSpan = document.getElementById('member-name-to-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

let memberKeyToDelete = null; // To store the key of the member being deleted

// Show today's date
const today = new Date();
currentDateDisplay.textContent = `Today: ${today.toLocaleDateString()}`;

// --- Login Functionality ---
// Clear username and password fields on page load
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'admin' && password === '7860') {
        loginContainer.classList.add('hidden');
        dashboardContainer.classList.remove('hidden');
        loadMembers();
        setDefaultDate();
        updateTimestamp(); 
    } else {
        errorMessage.textContent = 'Who are you? Unauthorized access attempted.';
        errorMessage.classList.remove('hidden');
    }
});

logoutBtn.addEventListener('click', () => {
    loginContainer.classList.remove('hidden');
    dashboardContainer.classList.add('hidden');
    loginForm.reset();
    errorMessage.classList.add('hidden');
    // Clear the username and password fields again on logout
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
});

// Default to today's date in the form
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('start-date').value = today;
}

// --- Add New Member ---
memberForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('member-name').value;
    const mobile = document.getElementById('mobile-number').value;
    const fee = document.getElementById('fee-amount').value;
    const startDate = document.getElementById('start-date').value;
    
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(startDateObj);
    endDateObj.setDate(startDateObj.getDate() + 30); // 30 days validity
    
    const member = {
        name: name,
        mobile: mobile,
        fee: fee,
        startDate: startDate,
        endDate: endDateObj.toISOString().split('T')[0],
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };
    
    database.ref('members').push(member)
        .then(() => {
            memberForm.reset();
            setDefaultDate();
        })
        .catch(error => {
            console.error("Error adding member: ", error);
        });
});

// --- Live Status Counters ---
function updateStatusCounts(membersData) {
    let activeCount = 0;
    let expiredCount = 0;
    let totalIncome = 0; 
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    for (const key in membersData) {
        const member = membersData[key];
        const endDate = new Date(member.endDate);
        endDate.setHours(0, 0, 0, 0); 
        
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

// --- Load Members from Firebase ---
function loadMembers() {
    database.ref('members').on('value', (snapshot) => {
        membersList.innerHTML = ''; 
        const membersData = snapshot.val();
        if (membersData) {
            const sortedMembers = Object.keys(membersData).map(key => ({
                key,
                ...membersData[key]
            })).sort((a, b) => b.timestamp - a.timestamp); 

            sortedMembers.forEach((member) => {
                addMemberToTable(member, member.key);
            });
            updateStatusCounts(membersData);
        } else {
            updateStatusCounts({}); 
        }
        updateTimestamp();
    });
}

// Function to generate WhatsApp URL with a reminder message
function getWhatsAppReminderUrl(member) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(member.endDate);
    endDate.setHours(0, 0, 0, 0);
    const isExpired = today > endDate;

    let message = `Hello ${member.name},\n\n`;

    if (isExpired) {
        message += `Your gym membership expired on ${formatDate(member.endDate)}.\n`;
        message += `Please renew your membership of ₹${member.fee} to continue enjoying our services.`;
    } else {
        message += `This is a friendly reminder for your gym membership renewal.\n`;
        message += `Your current membership is valid until ${formatDate(member.endDate)}.\n`;
        message += `Please prepare for the renewal payment of ₹${member.fee}.`;
    }
    message += `\n\nThank you,\n${encodeURIComponent('Gym Management')}`; 

    const mobileNumberClean = member.mobile.replace(/\D/g, ''); 
    const countryCode = '91'; // Assuming India, change if needed
    const fullMobileNumber = countryCode + mobileNumberClean;

    return `https://wa.me/${fullMobileNumber}?text=${encodeURIComponent(message)}`;
}

// --- Add Member to the Table (with Edit & Delete) ---
function addMemberToTable(member, key) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const endDate = new Date(member.endDate);
    endDate.setHours(0, 0, 0, 0); 
    const isExpired = today > endDate;
    
    const row = document.createElement('tr');
    row.dataset.key = key; // Store Firebase key on the row
    if (isExpired) {
        row.classList.add('expired');
    }
    
    row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap member-name" data-field="name">${member.name}</td>
        <td class="px-6 py-4 whitespace-nowrap member-mobile" data-field="mobile">${member.mobile}</td>
        <td class="px-6 py-4 whitespace-nowrap member-fee" data-field="fee">
            <span class="fee-display">₹${member.fee}</span>
            <input type="number" value="${member.fee}" class="border rounded px-2 py-1 w-20 fee-input hidden">
        </td>
        <td class="px-6 py-4 whitespace-nowrap member-start-date" data-field="startDate">${formatDate(member.startDate)}</td>
        <td class="px-6 py-4 whitespace-nowrap member-end-date" data-field="endDate">${formatDate(member.endDate)}</td>
        <td class="px-6 py-4 whitespace-nowrap member-status">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                ${isExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">
                ${isExpired ? 'Expired' : 'Active'}
            </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center space-x-2">
                <button class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm edit-btn">
                    Edit
                </button>
                <button class="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm save-btn hidden">
                    Save
                </button>
                <button class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm delete-btn" data-name="${member.name}">
                    Delete
                </button>
                <a href="${getWhatsAppReminderUrl(member)}" target="_blank" 
                   class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm whatsapp-btn">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" class="inline-block h-4 w-4 mr-1">
                    Remind
                </a>
            </div>
        </td>
    `;
    
    membersList.appendChild(row);
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    try {
        const date = new Date(dateString);
        // Check for "Invalid Date"
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        return date.toLocaleDateString(undefined, options);
    } catch (e) {
        console.error("Error formatting date:", e);
        return 'Invalid Date';
    }
}

// --- Edit & Save Functionality for table cells ---
membersList.addEventListener('click', (e) => {
    const target = e.target;
    const row = target.closest('tr');
    if (!row) return; // Not inside a table row

    const key = row.dataset.key;

    if (target.classList.contains('edit-btn')) {
        // Hide edit, show save
        target.classList.add('hidden');
        row.querySelector('.save-btn').classList.remove('hidden');
        row.querySelector('.delete-btn').classList.add('hidden'); // Hide delete during edit
        row.querySelector('.whatsapp-btn').classList.add('hidden'); // Hide whatsapp during edit

        // Make Name and Mobile editable
        const nameCell = row.querySelector('.member-name');
        const mobileCell = row.querySelector('.member-mobile');
        
        nameCell.innerHTML = `<input type="text" value="${nameCell.textContent}" class="w-full border rounded px-2 py-1 edit-input" data-field="name">`;
        mobileCell.innerHTML = `<input type="tel" value="${mobileCell.textContent}" class="w-full border rounded px-2 py-1 edit-input" data-field="mobile">`;
        
        // Make Fee editable (toggle input visibility)
        row.querySelector('.fee-display').classList.add('hidden');
        row.querySelector('.fee-input').classList.remove('hidden');

        // Make Start Date editable (convert to input type="date")
        const startDateCell = row.querySelector('.member-start-date');
        const currentStartDateText = startDateCell.textContent; // e.g., "Jul 23, 2025"
        let currentStartDateIso = '';

        // Try to parse the displayed date back into YYYY-MM-DD
        try {
            const parsedDate = new Date(currentStartDateText);
            if (!isNaN(parsedDate.getTime())) {
                currentStartDateIso = parsedDate.toISOString().split('T')[0];
            }
        } catch (error) {
            console.error("Error parsing start date for edit:", error);
        }
        startDateCell.innerHTML = `<input type="date" value="${currentStartDateIso}" class="w-full border rounded px-2 py-1 edit-input" data-field="startDate">`;

    } else if (target.classList.contains('save-btn')) {
        const updatedMember = {};
        let needsDateRecalculation = false;

        // Get updated Name and Mobile
        const nameInput = row.querySelector('.member-name input');
        const mobileInput = row.querySelector('.member-mobile input');
        if (nameInput) updatedMember.name = nameInput.value;
        if (mobileInput) updatedMember.mobile = mobileInput.value;

        // Get updated Fee
        const feeInput = row.querySelector('.fee-input');
        if (feeInput) updatedMember.fee = feeInput.value;

        // Get updated Start Date
        const startDateInput = row.querySelector('.member-start-date input');
        if (startDateInput) {
            updatedMember.startDate = startDateInput.value;
            needsDateRecalculation = true; // Recalculate end date if start date changes
        }

        // Fetch current member data to preserve untouched fields
        database.ref('members/' + key).once('value', (snapshot) => {
            const currentMemberData = snapshot.val();
            let finalUpdate = { ...currentMemberData, ...updatedMember };

            // If start date changed or was empty, recalculate end date
            if (needsDateRecalculation && updatedMember.startDate) {
                const newStartDateObj = new Date(updatedMember.startDate);
                const newEndDateObj = new Date(newStartDateObj);
                newEndDateObj.setDate(newStartDateObj.getDate() + 30);
                finalUpdate.endDate = newEndDateObj.toISOString().split('T')[0];
            } else if (!updatedMember.startDate && needsDateRecalculation) {
                 // Handle case where start date is cleared, perhaps set end date to N/A or default
                 finalUpdate.endDate = null; // Or some default like today + 30 days
            }

            // Update Firebase
            database.ref('members/' + key).set(finalUpdate)
                .then(() => {
                    console.log('Member updated successfully!');
                    // The Firebase listener will automatically re-render the row
                    // No need to manually update the DOM here.
                })
                .catch(error => {
                    console.error("Error updating member: ", error);
                });
        });

    } else if (target.classList.contains('delete-btn')) {
        const memberName = target.dataset.name;
        memberKeyToDelete = key; // Store the key globally
        memberNameToDeleteSpan.textContent = memberName; // Display name in modal
        confirmModal.classList.remove('hidden'); // Show modal
    }
});

// --- Confirmation Modal Button Listeners ---
cancelDeleteBtn.addEventListener('click', () => {
    confirmModal.classList.add('hidden');
    memberKeyToDelete = null; // Reset
});

confirmDeleteBtn.addEventListener('click', () => {
    if (memberKeyToDelete) {
        database.ref('members/' + memberKeyToDelete).remove()
            .then(() => {
                console.log('Member deleted successfully!');
                confirmModal.classList.add('hidden');
                memberKeyToDelete = null; // Reset
            })
            .catch(error => {
                console.error("Error deleting member: ", error);
                confirmModal.classList.add('hidden');
                memberKeyToDelete = null; // Reset even on error
            });
    }
});


// --- PDF Export Functionality Fix ---
document.getElementById('export-pdf').addEventListener('click', () => {
    const doc = new jspdf.jsPDF();
    
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text('Gym Member Database', 15, 20);
    
    doc.setFontSize(10);
    doc.text(`Exported: ${new Date().toLocaleString()}`, 15, 30);
    
    const tableData = [];
    const tableHeaders = ['Name', 'Mobile', 'Fee (₹)', 'Start Date', 'End Date', 'Status']; // Exclude 'Actions' for PDF
    
    // Iterate directly over Firebase data to ensure consistency and avoid DOM parsing issues
    // We need to fetch data again or use the cached data from loadMembers
    database.ref('members').once('value', (snapshot) => {
        const membersData = snapshot.val();
        if (membersData) {
            const sortedMembers = Object.keys(membersData).map(key => ({
                key,
                ...membersData[key]
            })).sort((a, b) => b.timestamp - a.timestamp); 

            sortedMembers.forEach(member => {
                const todayForStatus = new Date();
                todayForStatus.setHours(0, 0, 0, 0);
                const endDateForStatus = new Date(member.endDate);
                endDateForStatus.setHours(0, 0, 0, 0);
                const status = (todayForStatus > endDateForStatus) ? 'Expired' : 'Active';

                tableData.push([
                    member.name,
                    member.mobile,
                    `₹${member.fee}`, // Format fee for PDF
                    formatDate(member.startDate),
                    formatDate(member.endDate),
                    status
                ]);
            });
        }
        
        doc.autoTable({
            head: [tableHeaders],
            body: tableData,
            startY: 40,
            styles: {
                fontSize: 9,
                cellPadding: 1,
                overflow: 'linebreak'
            },
            didParseCell: function(data) {
                if (data.column.index === 5 && data.cell.raw) { // Status column
                    const statusText = data.cell.raw; // raw is the actual value from tableData
                    if (statusText === 'Expired') {
                        data.cell.styles.textColor = [239, 68, 68]; 
                    } else if (statusText === 'Active') {
                        data.cell.styles.textColor = [34, 197, 94]; 
                    }
                }
            }
        });
        
        doc.save(`gym-members-${new Date().toISOString().slice(0,10)}.pdf`);
    });
});

// Real-time update timestamp
function updateTimestamp() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    document.getElementById('last-updated').textContent = `Last updated: ${timeString}`;
}

// --- Initialize and Event Listeners ---
setDefaultDate();

setInterval(() => {
    if (!dashboardContainer.classList.contains('hidden')) { 
        updateTimestamp();
    }
}, 1000 * 60); 

// Event delegation for edit/save/delete buttons
// We don't need a separate 'change' listener for fee-input anymore
// The 'edit-btn' will reveal all inputs and 'save-btn' will handle saving them.
