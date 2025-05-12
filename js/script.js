const buttons = document.querySelectorAll(".btn");
const display = document.querySelector(".result-display");

display.textContent = "0";

// Calculator State Variables
let currentInput = "";
let firstOperand = "";
let lastOperand = "";  // For storing the second operand in repeat operations
let currentOperator = null;
let shouldResetDisplay = false;

const clearActiveOperators = () => {
    document.querySelectorAll('.operator').forEach(op => {
        op.classList.remove('operator-active');
    });
};

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
        if (value === "AC") {
            // All Clear functionality - reset everything
            currentInput = "";
            firstOperand = "";
            lastOperand = "";
            currentOperator = null;
            clearActiveOperators();
            updateDisplay("0");
            return;
        } else if (value === "+" || value === "-" || value === "*" || value === "/") {
            // Skip if there's no input
            if (currentInput === "") return;

            // Remove active class from all operator buttons
            clearActiveOperators();

            // Add active class to the clicked operator button
            button.classList.add('operator-active');

            firstOperand = currentInput;
            currentOperator = value;
            shouldResetDisplay = true;
            return;
        } else if (value === "=") {
            // Skip if there's no input or operator
            if (firstOperand === "" || currentOperator === null) return;

            // If currentInput is empty or we're repeating =, use lastOperand
            if (currentInput === "" || shouldResetDisplay) {
                // For first equals press with empty second operand
                if (lastOperand === "") {
                    lastOperand = firstOperand; // Use first operand as second
                }
                currentInput = lastOperand; // Use stored value
            } else {
                // Normal operation - store the second operand
                lastOperand = currentInput;
            }

            // Perform the calculation
            const result = operate(Number(firstOperand), Number(currentInput), currentOperator);

            // Store result and update display
            firstOperand = result.toString();
            currentInput = result.toString();
            shouldResetDisplay = true;
            clearActiveOperators();
            updateDisplay(currentInput);
            return;
        }
        // Check if we need to reset display before adding new input
        if (shouldResetDisplay) {
            currentInput = "";
            shouldResetDisplay = false;

            // Remove operator active state when user starts entering second number
            clearActiveOperators();
        }
        currentInput += value;
        updateDisplay(currentInput);
    });
});