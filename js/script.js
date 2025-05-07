const buttons = document.querySelectorAll(".btn");
const display = document.querySelector(".result-display");

display.textContent = "0";

// Calculator State Variables
let firstOperand = '';
let currentOperator = null;
let shouldResetDisplay = false;