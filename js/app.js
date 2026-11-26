// GoldWise illustrative sample prices (INR per gram)
const goldPrices = {
    24: 13000,
    22: 11917,
    18: 9750
};

const STORAGE_KEY = "goldwiseInvestments";

let investments = [];

try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    investments = Array.isArray(saved) ? saved : [];
} catch (error) {
    investments = [];
}

// Currency formatting
function formatCurrency(value) {
    return "₹" + value.toLocaleString("en-IN", {
        maximumFractionDigits: 2
    });
}

// Save portfolio
function saveInvestments() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(investments)
    );
}

// Gold calculator
function calculateGold() {
    const weight = Number(document.getElementById("weight").value);
    const purity = Number(document.getElementById("purity").value);
    const result = document.getElementById("result");

    if (!Number.isFinite(weight) || weight <= 0 ||
        !goldPrices[purity]) {
        result.textContent = "Please enter valid details.";
        return;
    }

    result.textContent = "Estimated Value: " +
        formatCurrency(weight * goldPrices[purity]);
}

// Add investment
function addInvestment() {
    const weight = Number(
        document.getElementById("purchaseWeight").value
    );

    const purity = Number(
        document.getElementById("purchasePurity").value
    );

    const purchasePrice = Number(
        document.getElementById("purchasePrice").value
    );

    if (!Number.isFinite(weight) || weight <= 0 ||
        !Number.isFinite(purchasePrice) || purchasePrice <= 0 ||
        !goldPrices[purity]) {
        alert("Enter valid investment details.");
        return;
    }

    investments.push({
        id: Date.now() + Math.random(),
        weight,
        purity,
        purchasePrice,
        date: new Date().toLocaleDateString("en-IN")
    });

    saveInvestments();

    document.getElementById("purchaseWeight").value = "";
    document.getElementById("purchasePrice").value = "";

    updatePortfolio();
}

// Delete investment
function deleteInvestment(id) {
    investments = investments.filter(item => item.id !== id);
    saveInvestments();
    updatePortfolio();
}

// Portfolio charts
let purityChart = null;
let portfolioChart = null;

function updateCharts() {
    if (typeof Chart === "undefined") return;

    const purityTotals = {24: 0, 22: 0, 18: 0};

    let totalInvestment = 0;
    let currentValue = 0;

    investments.forEach(item => {
        purityTotals[item.purity] += item.weight;
        totalInvestment += item.weight * item.purchasePrice;
        currentValue += item.weight * goldPrices[item.purity];
    });

    const purityCanvas = document.getElementById("purityChart");
    const portfolioCanvas = document.getElementById("portfolioChart");

    if (!purityCanvas || !portfolioCanvas) return;

    if (purityChart) purityChart.destroy();
    if (portfolioChart) portfolioChart.destroy();

    purityChart = new Chart(purityCanvas, {
        type: "doughnut",
        data: {
            labels: ["24K", "22K", "18K"],
            datasets: [{
                data: [
                    purityTotals[24],
                    purityTotals[22],
                    purityTotals[18]
                ],
                backgroundColor: ["#d4af37", "#a88b35", "#6f5920"],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: { color: "#ffffff" }
                }
            }
        }
    });

    portfolioChart = new Chart(portfolioCanvas, {
        type: "bar",
        data: {
            labels: ["Investment", "Current Value"],
            datasets: [{
                label: "Portfolio Value (₹)",
                data: [totalInvestment, currentValue],
                backgroundColor: ["#8c7229", "#d4af37"],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: "#ffffff" }
                }
            },
            scales: {
                x: {
                    ticks: { color: "#aaaaaa" },
                    grid: { color: "#292929" }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: "#aaaaaa",
                        callback: value => "₹" + value.toLocaleString("en-IN")
                    },
                    grid: { color: "#292929" }
                }
            }
        }
    });
}

// Update portfolio dashboard
function updatePortfolio() {
    let totalInvestment = 0;
    let currentValue = 0;
    let totalWeight = 0;

    const list = document.getElementById("investmentList");
    list.innerHTML = "";

    investments.forEach((item, index) => {
        const investment = item.weight * item.purchasePrice;
        const current = item.weight * goldPrices[item.purity];
        const difference = current - investment;

        totalInvestment += investment;
        currentValue += current;
        totalWeight += item.weight;

        const row = document.createElement("div");
        row.className = "investment-row";

        const details = document.createElement("span");
        details.textContent =
            `${index + 1}. ${item.weight}g ${item.purity}K (${item.date})`;

        const amounts = document.createElement("span");
        amounts.textContent =
            `Invested: ${formatCurrency(investment)} | Current: ${formatCurrency(current)}`;

        const performance = document.createElement("span");
        performance.className = difference >= 0 ? "profit" : "loss";
        performance.textContent =
            (difference >= 0 ? "+" : "") + formatCurrency(difference);

        const remove = document.createElement("button");
        remove.textContent = "Delete";
        remove.addEventListener("click", () => deleteInvestment(item.id));

        row.append(details, amounts, performance, remove);
        list.appendChild(row);
    });

    if (investments.length === 0) {
        list.textContent = "No investments added yet.";
    }

    const profitLoss = currentValue - totalInvestment;

    document.getElementById("totalInvestment").textContent =
        formatCurrency(totalInvestment);

    document.getElementById("currentValue").textContent =
        formatCurrency(currentValue);

    document.getElementById("totalWeight").textContent =
        totalWeight.toFixed(2) + " g";

    const profitElement = document.getElementById("profitLoss");

    profitElement.textContent =
        (profitLoss >= 0 ? "+" : "") + formatCurrency(profitLoss);

    profitElement.className = profitLoss >= 0 ? "profit" : "loss";

    updateCharts();
}

// Historical sample price chart
const goldCanvas = document.getElementById("goldChart");

if (goldCanvas && typeof Chart !== "undefined") {
    new Chart(goldCanvas, {
        type: "line",
        data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            datasets: [{
                label: "24K Gold Price (₹/gram)",
                data: [11800, 12000, 11900, 12300, 12600, 13000],
                borderColor: "#d4af37",
                backgroundColor: "rgba(212,175,55,0.15)",
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: "#ffffff" }
                }
            },
            scales: {
                x: {
                    ticks: { color: "#aaaaaa" },
                    grid: { color: "#292929" }
                },
                y: {
                    ticks: { color: "#aaaaaa" },
                    grid: { color: "#292929" }
                }
            }
        }
    });
}

// Restore saved portfolio
updatePortfolio();

console.log("GoldWise Advanced Analytics initialized.");
