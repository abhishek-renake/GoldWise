const goldPrices = {
    24: 13000,
    22: 11917,
    18: 9750
};

// Load saved investments
let investments = [];

try {
    const savedData = JSON.parse(
        localStorage.getItem("goldwiseInvestments")
    );

    investments = Array.isArray(savedData) ? savedData : [];
} catch (error) {
    investments = [];
}

// Currency formatter
function formatCurrency(value) {
    return "₹" + value.toLocaleString("en-IN", {
        maximumFractionDigits: 2
    });
}

// Save investments
function saveInvestments() {
    localStorage.setItem(
        "goldwiseInvestments",
        JSON.stringify(investments)
    );
}

// Gold calculator
function calculateGold() {
    const weight = parseFloat(
        document.getElementById("weight").value
    );

    const purity = parseInt(
        document.getElementById("purity").value
    );

    const result = document.getElementById("result");

    if (!Number.isFinite(weight) || weight <= 0) {
        result.textContent = "Please enter a valid weight.";
        return;
    }

    result.textContent =
        "Estimated Value: " +
        formatCurrency(weight * goldPrices[purity]);
}

// Add investment
function addInvestment() {
    const weight = parseFloat(
        document.getElementById("purchaseWeight").value
    );

    const purity = parseInt(
        document.getElementById("purchasePurity").value
    );

    const purchasePrice = parseFloat(
        document.getElementById("purchasePrice").value
    );

    if (
        !Number.isFinite(weight) || weight <= 0 ||
        !Number.isFinite(purchasePrice) || purchasePrice <= 0 ||
        !goldPrices[purity]
    ) {
        alert("Please enter valid investment details.");
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
    investments = investments.filter(
        item => item.id !== id
    );

    saveInvestments();
    updatePortfolio();
}

// Update portfolio
function updatePortfolio() {
    let totalInvestment = 0;
    let currentValue = 0;

    const list = document.getElementById("investmentList");
    list.innerHTML = "";

    investments.forEach((item, index) => {
        const investment = item.weight * item.purchasePrice;
        const current = item.weight * goldPrices[item.purity];

        const difference = current - investment;

        totalInvestment += investment;
        currentValue += current;

        const row = document.createElement("div");
        row.className = "investment-row";

        const details = document.createElement("span");
        details.textContent =
            `${index + 1}. ${item.weight}g ${item.purity}K Gold (${item.date})`;

        const amounts = document.createElement("span");
        amounts.textContent =
            `Invested: ${formatCurrency(investment)} | Current: ${formatCurrency(current)}`;

        const performance = document.createElement("span");
        performance.className = difference >= 0 ? "profit" : "loss";
        performance.textContent =
            (difference >= 0 ? "+" : "") + formatCurrency(difference);

        const removeButton = document.createElement("button");
        removeButton.textContent = "Delete";
        removeButton.addEventListener("click", () => {
            deleteInvestment(item.id);
        });

        row.append(details, amounts, performance, removeButton);
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

    const profitElement = document.getElementById("profitLoss");

    profitElement.textContent =
        (profitLoss >= 0 ? "+" : "") + formatCurrency(profitLoss);

    profitElement.className =
        profitLoss >= 0 ? "profit" : "loss";
}

// Gold price chart
const chartCanvas = document.getElementById("goldChart");

if (chartCanvas && typeof Chart !== "undefined") {
    new Chart(chartCanvas, {
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
                    labels: {
                        color: "#ffffff"
                    }
                }
            },

            scales: {
                x: {
                    ticks: { color: "#aaaaaa" }
                },

                y: {
                    ticks: { color: "#aaaaaa" }
                }
            }
        }
    });
}

// Restore saved investments on page load
updatePortfolio();

console.log("GoldWise initialized successfully!");
