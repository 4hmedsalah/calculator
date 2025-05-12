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

const calculateSquareRoot = (num) => {
    if (num < 0) return "Error"; // Can't take square root of negative number
    return Math.sqrt(num);
};

const calculatePercentage = (num1, num2, operator) => {
    const percentValue = num2 / 100;

    switch (operator) {
        case "+":
            return num1 + (num1 * percentValue);
        case "-":
            return num1 - (num1 * percentValue);
        case "*":
            return num1 * percentValue;
        case "/":
            return num1 / percentValue;
        default:
            // If no operator, just convert to percentage
            return percentValue;
    }
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
        } else if (value === "DEL") {
            // Delete last character from current input
            if (currentInput.length > 0) {
                currentInput = currentInput.slice(0, -1);
                updateDisplay(currentInput === "" ? "0" : currentInput);
            }
            return;
        } else if (value === "+" || value === "-" || value === "*" || value === "/") {
            // If there's a previous operation waiting to be completed
            if (currentOperator !== null && currentInput !== "" && firstOperand !== "") {
                // Calculate the intermediate result
                const result = operate(Number(firstOperand), Number(currentInput), currentOperator);
                firstOperand = result.toString();
                updateDisplay(result);
            }
            // If no current input but we have a result from previous operation, use that
            else if (currentInput === "" && firstOperand !== "") {
                // Continue with the previous result
                // firstOperand already contains the result, so do nothing
            } else if (currentInput === "") {
                // If no input at all, start with 0
                currentInput = "0";
                firstOperand = currentInput;
            } else {
                // Normal case: we have input, use it as first operand
                firstOperand = currentInput;
            }

            // Remove active class from all operator buttons
            clearActiveOperators();

            // Add active class to the clicked operator button
            button.classList.add('operator-active');

            currentOperator = value;
            shouldResetDisplay = true;
            // Clear currentInput when an operator is pressed
            currentInput = "";
            return;
        } else if (value === "√") {
            // Use currentInput if available, otherwise use firstOperand (for post-calculation)
            const numberForSquareRoot = currentInput !== "" ? currentInput : firstOperand;
            if (numberForSquareRoot === "") return;

            // Calculate square root directly, our function already handles negative values
            const result = calculateSquareRoot(Number(numberForSquareRoot));
            currentInput = result.toString();
            firstOperand = result.toString(); // Update firstOperand as well
            updateDisplay(currentInput);
            return;
        } else if (value === "%") {
            // Percentage operation
            if (currentInput === "") return;

            if (currentOperator && firstOperand) {
                // If we're in the middle of an operation, apply percentage in context
                const result = calculatePercentage(Number(firstOperand), Number(currentInput), currentOperator);
                currentInput = result.toString();
                // Execute the operation immediately
                firstOperand = currentInput;
                currentOperator = null;
                clearActiveOperators();
            } else {
                // Just convert to percentage if no operation is in progress
                currentInput = (Number(currentInput) / 100).toString();
            }

            updateDisplay(currentInput);
            return;
        } else if (value === "=") {
            // Skip if there's no operator
            if (currentOperator === null) return;

            // Handle case when firstOperand is empty (e.g., starting with operator)
            if (firstOperand === "") {
                firstOperand = "0";
            }

            // Check if we have a current input or a stored lastOperand
            if (currentInput === "" && lastOperand === "") {
                return; // Don't perform any calculation
            }

            // First equals press with a second operand entered
            if (currentInput !== "" && !shouldResetDisplay) {
                // Store the current input as lastOperand for repeated operations
                lastOperand = currentInput;
            } else if (currentInput === "") {
                // If currentInput is empty but we have a lastOperand from previous equals
                currentInput = lastOperand;
            }

            // Perform the calculation
            const result = operate(Number(firstOperand), Number(currentInput), currentOperator);

            // Update display and state for next calculation
            updateDisplay(result);
            clearActiveOperators();
            firstOperand = result.toString();
            currentInput = ""; // Clear current input so next equals press will use lastOperand
            shouldResetDisplay = true;
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