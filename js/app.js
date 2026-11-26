// GoldWise Sample Gold Prices
const goldPrices = {
    24: 13000,
    22: 11917,
    18: 9750
};

const investments = [];

// Currency Formatter
function formatCurrency(value) {
    return "₹" + value.toLocaleString("en-IN", {
        maximumFractionDigits: 2
    });
}

// Gold Value Calculator
function calculateGold() {
    const weight = parseFloat(document.getElementById("weight").value);
    const purity = parseInt(document.getElementById("purity").value);
    const result = document.getElementById("result");

    if (!Number.isFinite(weight) || weight <= 0) {
        result.textContent = "Please enter a valid gold weight.";
        return;
    }

    result.textContent = "Estimated Value: " +
        formatCurrency(weight * goldPrices[purity]);
}

// Add Investment
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

    if (!Number.isFinite(weight) || weight <= 0 ||
        !Number.isFinite(purchasePrice) || purchasePrice <= 0 ||
        !goldPrices[purity]) {
        alert("Please enter valid investment details.");
        return;
    }

    investments.push({
        weight: weight,
        purity: purity,
        purchasePrice: purchasePrice
    });

    document.getElementById("purchaseWeight").value = "";
    document.getElementById("purchasePrice").value = "";

    updatePortfolio();
}

// Update Investment Portfolio
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
            `${index + 1}. ${item.weight}g of ${item.purity}K Gold`;

        const amounts = document.createElement("span");
        amounts.textContent =
            `Invested: ${formatCurrency(investment)} | Current: ${formatCurrency(current)}`;

        const performance = document.createElement("span");
        performance.className = difference >= 0 ? "profit" : "loss";
        performance.textContent =
            (difference >= 0 ? "+" : "") + formatCurrency(difference);

        row.append(details, amounts, performance);
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

    profitElement.className = profitLoss >= 0 ? "profit" : "loss";
}

// Gold Price Analytics Chart
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

console.log("GoldWise initialized successfully!");
