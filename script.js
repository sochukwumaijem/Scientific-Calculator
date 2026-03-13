let currentExpression = '';
let isRad = true;

const inputDisplay = document.getElementById('input');
const historyDisplay = document.getElementById('history');
const degRadBtn = document.getElementById('deg-rad-btn');

// Override math.js trig functions to support DEG/RAD dynamically
math.import({
    sin: (x) => isRad ? Math.sin(x) : Math.sin(x * Math.PI / 180),
    cos: (x) => isRad ? Math.cos(x) : Math.cos(x * Math.PI / 180),
    tan: (x) => isRad ? Math.tan(x) : Math.tan(x * Math.PI / 180),
    asin: (x) => isRad ? Math.asin(x) : Math.asin(x) * 180 / Math.PI,
    acos: (x) => isRad ? Math.acos(x) : Math.acos(x) * 180 / Math.PI,
    atan: (x) => isRad ? Math.atan(x) : Math.atan(x) * 180 / Math.PI
}, { override: true });

document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-val');
        if (val) handleInput(val);
    });
});

document.getElementById('clear').addEventListener('click', () => {
    currentExpression = '';
    historyDisplay.innerText = '';
    updateDisplay();
});

document.getElementById('delete').addEventListener('click', () => {
    currentExpression = currentExpression.toString().slice(0, -1);
    updateDisplay();
});

document.getElementById('equals').addEventListener('click', evaluateExpression);

degRadBtn.addEventListener('click', () => {
    isRad = !isRad;
    degRadBtn.innerText = isRad ? 'RAD' : 'DEG';
    
    if (isRad) {
        degRadBtn.classList.remove('active');
    } else {
        degRadBtn.classList.add('active');
    }
});

function handleInput(val) {
    if (historyDisplay.innerText.endsWith('=') && val.match(/[0-9a-zA-Z]/) && val !== 'pi' && val !== 'e' && !val.includes('(')) {
        currentExpression = val;
        historyDisplay.innerText = '';
    } else if (historyDisplay.innerText.endsWith('=')) {
        historyDisplay.innerText = '';
        currentExpression += val;
    } else {
        currentExpression += val;
    }
    
    updateDisplay();
}

function updateDisplay() {
    if (currentExpression === '') {
        inputDisplay.innerText = '0';
    } else {
        let displayStr = currentExpression.toString()
            .replace(/\*/g, '×')
            .replace(/\//g, '÷')
            .replace(/pi/g, 'π')
            .replace(/sqrt\(/g, '√(');
        inputDisplay.innerText = displayStr;
    }
    
    const inputContainer = document.querySelector('.input-container');
    if (inputContainer) {
        inputContainer.scrollLeft = inputContainer.scrollWidth;
    }
}

function evaluateExpression() {
    if (!currentExpression) return;
    
    try {
        let evalExpr = currentExpression;
        
        const openParenCount = (evalExpr.match(/\(/g) || []).length;
        const closeParenCount = (evalExpr.match(/\)/g) || []).length;
        if (openParenCount > closeParenCount) {
             evalExpr += ')'.repeat(openParenCount - closeParenCount);
        }
        
        const result = math.evaluate(evalExpr);
        
        if (result === undefined) return;

        let formattedResult = math.format(result, { precision: 14 });
        
        let displayExpr = evalExpr
            .replace(/\*/g, '×')
            .replace(/\//g, '÷')
            .replace(/pi/g, 'π')
            .replace(/sqrt\(/g, '√(');
            
        historyDisplay.innerText = displayExpr + ' =';
        currentExpression = formattedResult.toString();
        
        updateDisplay();
    } catch (error) {
        inputDisplay.innerText = 'Error';
        setTimeout(() => {
            updateDisplay();
        }, 1500);
    }
}

document.addEventListener('keydown', (event) => {
    const key = event.key;
    
    if (/[0-9\.\+\-\*\/\%\(\)\^]/.test(key)) {
        event.preventDefault();
        handleInput(key);
    } else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        evaluateExpression();
    } else if (key === 'Backspace') {
        event.preventDefault();
        currentExpression = currentExpression.toString().slice(0, -1);
        updateDisplay();
    } else if (key === 'Escape') {
        event.preventDefault();
        currentExpression = '';
        historyDisplay.innerText = '';
        updateDisplay();
    }
});
