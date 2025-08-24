const daysContainer = document.querySelector(".days");
const currentMonth = document.getElementById("currentMonth");
const currentYear = document.getElementById("currentYear");
const wageInput = document.getElementById("wage");
const totalHoursSpan = document.getElementById("totalHours");
const totalEarningsSpan = document.getElementById("totalEarnings");
const overtimeBtn = document.getElementById("overtimeToggle");

let currentDate = new Date();
let hoursLogged = {};
let overtimeEnabled = false;

const savePercentInput = document.getElementById("savePercent");
const savedAmountSpan = document.getElementById("savedAmount");
const usedAmountSpan = document.getElementById("usedAmount");

function saveToLocalStorage() {
    localStorage.setItem("wage", wageInput.value);
    localStorage.setItem("overtime", JSON.stringify(overtimeEnabled));
    localStorage.setItem("hoursLogged", JSON.stringify(hoursLogged));
    localStorage.setItem("savePercent", savePercentInput.value);
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    currentMonth.textContent = currentDate.toLocaleString('default', { month: 'long' });
    currentYear.textContent = year;

    daysContainer.innerHTML = "";

    const firstDay = new Date(year, month, 1).getDay(); 
    const offset = (firstDay + 6) % 7; 

    for (let i = 0; i < offset; i++) {
        const empty = document.createElement("li");
        empty.style.visibility = "hidden";
        daysContainer.appendChild(empty);
    }

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const li = document.createElement("li");
        li.textContent = day;

        const dateKey = `${year}-${month + 1}-${day}`;
        if (hoursLogged[dateKey]) {
            li.style.backgroundColor = "#b2f7ef";
        }

        li.addEventListener("click", () => {
            let hours = parseFloat(prompt(`Enter hours worked on ${month + 1}/${day}/${year}:`, hoursLogged[dateKey] || "0"));
            if (!isNaN(hours)) {
                hoursLogged[dateKey] = hours;
                li.style.backgroundColor = "#b2f7ef";
                updateSummary();
                saveToLocalStorage();
            }
        });

        daysContainer.appendChild(li);
    }
}

function updateSummary() {
    let totalHours = 0;
    let totalEarnings = 0;
    const wage = parseFloat(wageInput.value) || 0;
    const savePercent = parseFloat(savePercentInput.value) || 0;

    for (let date in hoursLogged) {
        let h = hoursLogged[date];
        if (overtimeEnabled && h > 8) {
            totalEarnings += 8 * wage + (h - 8) * wage * 1.5;
        } else {
            totalEarnings += h * wage;
        }
        totalHours += h;
    }

    const saved = totalEarnings * (savePercent / 100);
    const used = totalEarnings - saved;

    totalHoursSpan.textContent = totalHours.toFixed(1);
    totalEarningsSpan.textContent = totalEarnings.toFixed(2);
    savedAmountSpan.textContent = saved.toFixed(2);
    usedAmountSpan.textContent = used.toFixed(2);

    // 🔹 Auto-update totals
    calculateTotals();
}

function calculateTotals() {
    const wage = parseFloat(wageInput.value) || 0;
    let monthlyHours = 0, monthlyEarnings = 0;
    let yearlyHours = 0, yearlyEarnings = 0;
    let overallHours = 0, overallEarnings = 0;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // 1-based

    for (let date in hoursLogged) {
        let [y, m, d] = date.split("-").map(Number);
        let h = hoursLogged[date];
        let earnings = 0;

        if (overtimeEnabled && h > 8) {
            earnings = 8 * wage + (h - 8) * wage * 1.5;
        } else {
            earnings = h * wage;
        }

        overallHours += h;
        overallEarnings += earnings;

        if (y === year) {
            yearlyHours += h;
            yearlyEarnings += earnings;
            if (m === month) {
                monthlyHours += h;
                monthlyEarnings += earnings;
            }
        }
    }

    document.getElementById("monthlyHours").textContent = monthlyHours.toFixed(1);
    document.getElementById("monthlyEarnings").textContent = monthlyEarnings.toFixed(2);
    document.getElementById("yearlyHours").textContent = yearlyHours.toFixed(1);
    document.getElementById("yearlyEarnings").textContent = yearlyEarnings.toFixed(2);
    document.getElementById("overallHours").textContent = overallHours.toFixed(1);
    document.getElementById("overallEarnings").textContent = overallEarnings.toFixed(2);

    document.getElementById("totalsOutput").style.display = "block";
}

document.querySelector(".prev").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
    updateSummary();
});
document.querySelector(".next").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
    updateSummary();
});

overtimeBtn.addEventListener("click", () => {
    overtimeEnabled = !overtimeEnabled;
    overtimeBtn.textContent = `Overtime: ${overtimeEnabled ? 'On' : 'Off'}`;
    updateSummary();
    saveToLocalStorage();
});

wageInput.addEventListener("input", () => {
    updateSummary();
    saveToLocalStorage();
});

savePercentInput.addEventListener("input", () => {
    updateSummary();
    saveToLocalStorage();
});

document.getElementById("resetButton").addEventListener("click", () => {
    if (confirm("Are you sure you want to reset all data?")) {
        localStorage.removeItem("wage");
        localStorage.removeItem("overtime");
        localStorage.removeItem("hoursLogged");
        localStorage.removeItem("savePercent");

        wageInput.value = "";
        overtimeEnabled = false;
        hoursLogged = {};
        overtimeBtn.textContent = "Overtime: Off";
        updateSummary();
        renderCalendar();
    }
});

window.addEventListener("DOMContentLoaded", () => {
    const storedWage = localStorage.getItem("wage");
    const storedOvertime = localStorage.getItem("overtime");
    const storedHours = localStorage.getItem("hoursLogged");
    const storedSavePercent = localStorage.getItem("savePercent"); 

    if (storedWage) wageInput.value = storedWage;
    if (storedOvertime) {
        overtimeEnabled = JSON.parse(storedOvertime);
        overtimeBtn.textContent = `Overtime: ${overtimeEnabled ? 'On' : 'Off'}`;
    }
    if (storedHours) hoursLogged = JSON.parse(storedHours);
    if (storedSavePercent) savePercentInput.value = storedSavePercent;

    renderCalendar();
    updateSummary();
});
