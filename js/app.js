// GoldWise Sample Gold Prices
const goldPrices = {
    24: 13000,
    22: 11917,
    18: 9750
};

// Gold Value Calculator
function calculateGold() {

    const weight = parseFloat(document.getElementById("weight").value);
    const purity = parseInt(document.getElementById("purity").value);
    const result = document.getElementById("result");

    if (isNaN(weight) || weight <= 0) {
        result.textContent = "Please enter a valid gold weight.";
        return;
    }

    const totalValue = weight * goldPrices[purity];

    result.textContent = "Estimated Value: ₹" +
        totalValue.toLocaleString("en-IN", {
            maximumFractionDigits: 2
        });
}

// Gold Price Analytics
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
