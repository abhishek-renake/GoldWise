// GoldWise Gold Price Data (Illustrative Sample Values)
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

    const pricePerGram = goldPrices[purity];

    const totalValue = weight * pricePerGram;

    result.textContent =
        "Estimated Value: ₹" +
        totalValue.toLocaleString("en-IN", {
            maximumFractionDigits: 2
        });
}

// Initialize GoldWise
console.log("GoldWise initialized successfully!");
