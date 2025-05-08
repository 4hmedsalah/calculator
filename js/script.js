const buttons = document.querySelectorAll(".btn");
const display = document.querySelector(".result-display");

display.textContent = "0";

// Calculator State Variables
let firstOperand = '';
let currentOperator = null;
let shouldResetDisplay = false;

const updateDisplay = (value) => {
    let displayValue = value.toString();
    // Limit display length for readability
    if (displayValue.length > 14) {
        displayValue = parseFloat(displayValue).toPrecision(10); // Use precision for long numbers
    }
    // Handle potential "Infinity" or "NaN"
    if (displayValue === "Infinity" || displayValue === "-Infinity" || displayValue === "NaN") {
        displayValue = "Error";
    }
    display.textContent = displayValue;
};

const add = (num1, num2) => num1 + num2;

const subtract = (num1, num2) => num1 - num2;

const multiply = (num1, num2) => num1 * num2;

const divide = (num1, num2) => {
    if (num2 === 0) {
        return "Error"; // Handle division by zero
    }
    return num1 / num2;
};