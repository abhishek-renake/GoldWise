// GOLDWISE - SMART GOLD INTELLIGENCE PLATFORM

const STORAGE_KEY = "goldwiseInvestments";

let investments = [];
let goldPrices = {
    24: 13000,
    22: 11917,
    18: 9750
};

let goldChart = null;
let purityChart = null;
let portfolioChart = null;

let livePriceAvailable = false;

// Load saved investments
try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    investments = Array.isArray(saved) ? saved : [];
} catch {
    investments = [];
}

// Currency formatter
function formatCurrency(value) {
    return "₹" + Number(value).toLocaleString("en-IN", {
        maximumFractionDigits: 2
    });
}

// Save portfolio
function saveInvestments() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(investments));
}

// LIVE GOLD PRICE API
async function fetchGoldPrices() {
    const status = document.createElement("p");
    status.id = "liveStatus";
    status.style.cssText = "color:#d4af37;text-align:center;margin:15px;";

    const priceSection = document.querySelector("#prices");

    if (!document.getElementById("liveStatus")) {
        priceSection.appendChild(status);
    }

    status.textContent = "Fetching gold market prices...";

    try {
        const response = await fetch(
            "https://xaus.com/api/v1/spot?currency=INR&unit=gram"
        );

        if (!response.ok) {
            throw new Error("Gold API unavailable");
        }

        const data = await response.json();

        if (!Number.isFinite(data.xau?.price) ||
            data.xau.price <= 0) {
            throw new Error("Invalid gold price received");
        }

        const price24 = data.xau.price;

        // Calculate approximate purity-adjusted prices
        goldPrices[24] = price24;
        goldPrices[22] = price24 * (22 / 24);
        goldPrices[18] = price24 * (18 / 24);

        livePriceAvailable = true;

        updatePriceCards();
        updatePortfolio();

        const freshness = data.data_state?.status || "unknown";

        status.textContent =
            `● ${freshness.toUpperCase()} MARKET DATA | ` +
            `Updated: ${new Date(data.price_as_of || data.updated_at).toLocaleString("en-IN")} | Source: XAUS`;

        status.style.color =
            freshness === "fresh" ? "#4ade80" : "#fbbf24";

        await fetchHistoricalPrices();

    } catch (error) {
        livePriceAvailable = false;

        status.textContent =
            "Live prices unavailable. Showing illustrative sample prices.";

        status.style.color = "#f87171";

        console.error("Gold API error:", error);
    }
}

// Update gold price cards
function updatePriceCards() {
    const cards = document.querySelectorAll(".price-card");

    [24, 22, 18].forEach((purity, index) => {
        if (cards[index]) {
            cards[index].querySelector("h2").textContent =
                formatCurrency(goldPrices[purity]);
        }
    });
}

// GOLD VALUE CALCULATOR
function calculateGold() {
    const weight = Number(document.getElementById("weight").value);
    const purity = Number(document.getElementById("purity").value);
    const result = document.getElementById("result");

    if (!Number.isFinite(weight) || weight <= 0 ||
        !goldPrices[purity]) {
        result.textContent = "Enter valid weight and purity.";
        return;
    }

    result.textContent =
        "Estimated Value: " +
        formatCurrency(weight * goldPrices[purity]);
}

// ADD INVESTMENT
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

// DELETE INVESTMENT
function deleteInvestment(id) {
    investments = investments.filter(item => item.id !== id);

    saveInvestments();
    updatePortfolio();
}

// UPDATE PORTFOLIO
function updatePortfolio() {
    let totalInvestment = 0;
    let currentValue = 0;
    let totalWeight = 0;

    const list = document.getElementById("investmentList");

    if (!list) return;

    list.innerHTML = "";

    investments.forEach((item, index) => {
        const invested = item.weight * item.purchasePrice;
        const current = item.weight * goldPrices[item.purity];

        const difference = current - invested;

        totalInvestment += invested;
        currentValue += current;
        totalWeight += item.weight;

        const row = document.createElement("div");
        row.className = "investment-row";

        const details = document.createElement("span");
        details.textContent =
            `${index + 1}. ${item.weight}g ${item.purity}K (${item.date})`;

        const amounts = document.createElement("span");
        amounts.textContent =
            `Invested: ${formatCurrency(invested)} | Current: ${formatCurrency(current)}`;

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

    profitElement.className =
        profitLoss >= 0 ? "profit" : "loss";

    updatePortfolioCharts();
}

// PORTFOLIO CHARTS
function updatePortfolioCharts() {
    if (typeof Chart === "undefined") return;

    const purityTotals = {24: 0, 22: 0, 18: 0};

    let invested = 0;
    let current = 0;

    investments.forEach(item => {
        purityTotals[item.purity] += item.weight;
        invested += item.weight * item.purchasePrice;
        current += item.weight * goldPrices[item.purity];
    });

    if (purityChart) purityChart.destroy();
    if (portfolioChart) portfolioChart.destroy();

    const purityCanvas = document.getElementById("purityChart");
    const portfolioCanvas = document.getElementById("portfolioChart");

    if (!purityCanvas || !portfolioCanvas) return;

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
                backgroundColor: ["#d4af37", "#a88b35", "#6f5920"]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: { color: "white" }
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
                data: [invested, current],
                backgroundColor: ["#8c7229", "#d4af37"]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: "white" }
                }
            },
            scales: {
                x: {
                    ticks: { color: "#aaa" }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: "#aaa",
                        callback: value => "₹" + value.toLocaleString("en-IN")
                    }
                }
            }
        }
    });
}

// HISTORICAL GOLD PRICE API
async function fetchHistoricalPrices() {
    try {
        const response = await fetch(
            "https://xaus.com/api/v1/history"
        );

        if (!response.ok) throw new Error("History unavailable");

        const history = await response.json();

        if (!Array.isArray(history.points) ||
            history.points.length === 0) {
            throw new Error("No historical points");
        }

        const spot = await fetch(
            "https://xaus.com/api/v1/spot?currency=INR&unit=gram"
        );

        const spotData = await spot.json();

        const fxRate = Number(spotData.fx_rate);

        if (!Number.isFinite(fxRate) || fxRate <= 0) {
            throw new Error("Invalid exchange rate");
        }

        const points = history.points.slice(-30);

        if (goldChart) goldChart.destroy();

        goldChart = new Chart(
            document.getElementById("goldChart"),
            {
                type: "line",
                data: {
                    labels: points.map(point => point.d),
                    datasets: [{
                        label: "Gold Spot Price (₹/gram)",
                        data: points.map(point =>
                            Number(point.c) * fxRate / 31.1034768
                        ),
                        borderColor: "#d4af37",
                        backgroundColor: "rgba(212,175,55,0.15)",
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: { color: "white" }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: "#aaa" }
                        },
                        y: {
                            ticks: { color: "#aaa" }
                        }
                    }
                }
            }
        );

    } catch (error) {
        console.error("Historical chart error:", error);
    }
}

// INITIALIZE GOLDWISE
updatePortfolio();
fetchGoldPrices();

// Refresh prices every 60 seconds
setInterval(fetchGoldPrices, 60000);

console.log("GoldWise live integration initialized.");
