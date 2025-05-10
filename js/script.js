const buttons = document.querySelectorAll(".btn");
const display = document.querySelector(".result-display");

display.textContent = "0";

// Calculator State Variables
let currentInput = "";
let firstOperand = "";
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

// Perform arithmetic operations based on the provided operator
const operate = (num1, num2, operator) => {
    switch (operator) {
        case "+":
            return add(num1, num2);
        case "-":
            return subtract(num1, num2);
        case "*":
            return multiply(num1, num2);
        case "/":
            return divide(num1, num2);
        default:
            return null; // Return null for invalid operators
    }
};

buttons.forEach((button) => {
    button.addEventListener("click", () => {
        const value = button.getAttribute('data-value');
        if (value === "C") {
            currentInput = "";
            firstOperand = "";
            currentOperator = null;
            updateDisplay("0");
            return;
        } else if (value === "+" || value === "-" || value === "*" || value === "/") {
            // Skip if there's no input
            if (currentInput === "") return;

            firstOperand = currentInput;
            currentOperator = value;
            shouldResetDisplay = true;
            return;
        }
        currentInput += value;
        updateDisplay(currentInput);
    });
});