const buttons = document.querySelectorAll(".btn");
const display = document.querySelector(".result-display");

display.textContent = "0";

// Calculator State Variables
let currentInput = "";
let firstOperand = "";
let lastOperand = "";  // For storing the second operand in repeat operations
let currentOperator = null;
let shouldResetDisplay = false;
let memoryValue = 0;
let mrcPressed = false;  // Track if MRC was pressed once (to differentiate between recall and clear)

// Function to update the MRC button visual state based on memory value
const updateMemoryButtonState = () => {
    const mrcButton = document.querySelector("button[data-value=\"MRC\"]");
    if (mrcButton) {
        // If memory has a value, highlight the MRC button
        if (memoryValue !== 0) {
            mrcButton.classList.add("memory-active");
        } else {
            mrcButton.classList.remove("memory-active");
        }
    }
};

const clearActiveOperators = () => {
    document.querySelectorAll('.operator').forEach(op => {
        op.classList.remove('operator-active');
    });
};

const updateDisplay = (value) => {
    let displayValue = value.toString();

    // Remove leading zeros if the value is a number with digits after the zeros
    if (displayValue !== "" && displayValue !== "0" && !displayValue.startsWith("0.")) {
        // Check if it's a numeric string with leading zeros followed by other digits
        if (/^0+[1-9]/.test(displayValue)) {
            displayValue = displayValue.replace(/^0+/, '');
        }
    }

    // Handle potential "Infinity" or "NaN"
    if (displayValue === "Infinity" || displayValue === "-Infinity" || displayValue === "NaN") {
        displayValue = "Error";
    }

    // Switch to scientific notation if display digits reach 11 or more
    if (displayValue !== "Error" && !isNaN(parseFloat(displayValue))) {
        // Remove commas, minus, and dot for digit count
        const digitCount = displayValue.replace(/[,.-]/g, "").length;
        if (digitCount >= 11) {
            // Use 5 significant digits for compactness
            displayValue = Number(value).toExponential(5);
        } else {
            // Add thousands separators for better readability
            const parts = displayValue.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            displayValue = parts.join('.');
        }
    }

    display.textContent = displayValue;

    const fontSizeConfig = {
        maxSize: 50,
        minSize: 42,
        reductionRate: 4,
        thresholdLength: 8
    };

    const displayTextLength = displayValue.length;
    const fontSize = Math.max(
        fontSizeConfig.minSize,
        fontSizeConfig.maxSize - fontSizeConfig.reductionRate * Math.max(0, displayTextLength - fontSizeConfig.thresholdLength)
    );

    display.style.fontSize = `${fontSize}px`;
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
            memoryValue = 0;
            mrcPressed = false;
            clearActiveOperators();
            updateDisplay("0");
            updateMemoryButtonState();
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
        } else if (value === "M+") {
            // Add current display value to memory
            if (currentInput !== "") {
                memoryValue += Number(currentInput);
            } else if (firstOperand !== "") {
                memoryValue += Number(firstOperand);
            }

            // Set flag to reset display on next number input
            shouldResetDisplay = true;
            updateMemoryButtonState();
            return;
        } else if (value === "M-") {
            // Subtract current display value from memory
            if (currentInput !== "") {
                memoryValue -= Number(currentInput);
            } else if (firstOperand !== "") {
                memoryValue -= Number(firstOperand);
            }

            // Set flag to reset display on next number input
            shouldResetDisplay = true;
            updateMemoryButtonState();
            return;
        } else if (value === "MRC") {
            // MRC button handles memory recall and clear
            if (mrcPressed) {
                // Second press of MRC clears the memory
                memoryValue = 0;
                mrcPressed = false;
                shouldResetDisplay = true;
                // Update the MRC button visual state when memory is cleared
                updateMemoryButtonState();
            } else {
                // First press of MRC recalls the memory but only if memory has a value
                if (memoryValue !== 0) {
                    currentInput = memoryValue.toString();
                    updateDisplay(currentInput);
                    mrcPressed = true;
                }
            }
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
            mrcPressed = false;
        }

        // Prevent multiple decimal points in a number
        if (value === "." && currentInput.includes(".")) {
            return; // Skip adding another decimal point
        }

        // Handle decimal point after initial zero
        if (value === "." && (currentInput === "0" || currentInput === "")) {
            currentInput = currentInput === "" ? "0" : currentInput;
            currentInput += value;
            updateDisplay(currentInput);
            return;
        }

        // Prevent adding multiple zeros at the beginning
        if (value === "0" && (currentInput === "0" || currentInput === "")) {
            currentInput = "0";
            updateDisplay(currentInput);
            return;
        }

        // Handle non-zero digit after initial zero (replace the zero)
        if (currentInput === "0" && value !== "0" && value !== ".") {
            currentInput = value;
            updateDisplay(currentInput);
            return;
        }

        // Check total digits (excluding decimal points)
        const countWithoutDecimals = currentInput.replace(/\./g, "").length;

        // Enforce 10-character limit
        if (countWithoutDecimals >= 10) {
            // Don't add more digits or decimal point if already at max limit
            return;
        }

        currentInput += value;
        updateDisplay(currentInput);
    });
});

// Prevent double-tap zoom
document.addEventListener(
    "dblclick",
    function (event) {
        event.preventDefault();
    },
    { passive: false }
);

// Add keyboard support
document.addEventListener("keydown", (event) => {
    const key = event.key;

    // Handle number keys (0-9)
    if (/^[0-9]$/.test(key)) {
        simulateButtonClick(key);
        return;
    }

    // Prevent spacebar and tab from causing unwanted behavior
    if (key === " " || key === "Tab") {
        event.preventDefault();
        return;
    }

    // Handle operators and other calculator functions
    switch (key) {
        // Basic operators
        case "+":
            simulateButtonClick("+");
            break;
        case "-":
            simulateButtonClick("-");
            break;
        case "*":
            simulateButtonClick("*");
            break;
        case "/":
            simulateButtonClick("/");
            break;

        // Special operations
        case "Enter":
        case "=":
            event.preventDefault();
            simulateButtonClick("=");
            break;
        case ".":
            simulateButtonClick(".");
            break;
        case "%":
            simulateButtonClick("%");
            break;
        case "Backspace":
            simulateButtonClick("DEL");
            break;
        case "Delete":
        case "Escape":
            simulateButtonClick("AC");
            break;
        case "s":
            simulateButtonClick("√");
            break;
    }
});

// Helper function to simulate a button click
function simulateButtonClick(dataValue) {
    const button = document.querySelector(`button[data-value="${dataValue}"]`);
    if (button) {
        button.click();
    }
}