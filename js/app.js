// js/app.js
import { SortingVisualizer } from './visualizer.js';
import { codeSnippets } from './codeSnippets.js';
import { initTreeControls } from './treeVisualizer.js';
import {
    generateQuickLomutoSteps,
    generateQuickHoareSteps,
    generateMergeSteps,
    generateHeapSteps,
    generateInsertionSteps,
    generateBubbleSteps
} from './algorithms.js';

// Application State
let currentArray = [];
let currentAlgorithm = 'quick-lomuto';
let activeDetailTab = 'pros'; // pros or cons

const visualizer = new SortingVisualizer();

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Tree Zoom/Pan Event Listeners
    initTreeControls();

    // 2. Load default C++ Code and Info details
    updateAlgorithmDetails(currentAlgorithm);

    // 3. Generate initial array
    const initialSize = parseInt(document.getElementById('size-slider').value, 10);
    generateNewArray(initialSize);

    // 4. Setup all UI event handlers
    setupEventHandlers();
});

// Generate random array
function generateNewArray(size) {
    currentArray = [];
    for (let i = 0; i < size; i++) {
        // Generate random height value between 10 and 99
        const val = Math.floor(Math.random() * 85) + 10;
        currentArray.push(val);
    }
    recalculateSteps();
}

// Compute algorithm steps and load them into the visualizer timeline
function recalculateSteps() {
    let steps = [];
    visualizer.currentAlgorithm = currentAlgorithm;
    
    switch (currentAlgorithm) {
        case 'quick-lomuto':
            steps = generateQuickLomutoSteps(currentArray);
            break;
        case 'quick-hoare':
            steps = generateQuickHoareSteps(currentArray);
            break;
        case 'merge':
            steps = generateMergeSteps(currentArray);
            break;
        case 'heap':
            steps = generateHeapSteps(currentArray);
            break;
        case 'insertion':
            steps = generateInsertionSteps(currentArray);
            break;
        case 'bubble':
            steps = generateBubbleSteps(currentArray);
            break;
        default:
            steps = generateQuickLomutoSteps(currentArray);
    }

    visualizer.setSteps(steps, currentArray);
}

// Update the sidebar complexity tables and details lists
function updateAlgorithmDetails(algoId) {
    const snippet = codeSnippets[algoId];
    if (!snippet) return;

    // Load C++ code
    visualizer.loadCodeSnippet(algoId);

    // Update table info
    document.getElementById('comp-worst-time').textContent = snippet.timeWorst;
    document.getElementById('comp-avg-time').textContent = snippet.timeAvg;
    document.getElementById('comp-best-time').textContent = snippet.timeBest;
    document.getElementById('comp-space').textContent = snippet.spaceWorst;
    
    const stableSpan = document.getElementById('comp-stable');
    stableSpan.textContent = snippet.stable;
    if (snippet.stable.toLowerCase() === 'yes') {
        stableSpan.style.color = 'var(--success)';
    } else {
        stableSpan.style.color = 'var(--danger)';
    }

    // Refresh advantages/drawbacks text block
    renderDetailsList(snippet);
}

function renderDetailsList(snippet) {
    const listContainer = document.getElementById('details-list');
    listContainer.innerHTML = '';

    const items = activeDetailTab === 'pros' ? snippet.advantages : snippet.drawbacks;
    items.forEach(text => {
        const li = document.createElement('li');
        li.textContent = text;
        listContainer.appendChild(li);
    });
}

// Attach listeners to all control elements
function setupEventHandlers() {
    // Dropdown change
    const algoSelect = document.getElementById('algorithm-select');
    algoSelect.addEventListener('change', (e) => {
        currentAlgorithm = e.target.value;
        visualizer.pause();
        updateAlgorithmDetails(currentAlgorithm);
        recalculateSteps();
    });

    // Size Slider
    const sizeSlider = document.getElementById('size-slider');
    const sizeVal = document.getElementById('size-val');
    sizeSlider.addEventListener('input', (e) => {
        const size = parseInt(e.target.value, 10);
        sizeVal.textContent = size;
        visualizer.pause();
        generateNewArray(size);
    });

    // Speed Slider
    const speedSlider = document.getElementById('speed-slider');
    const speedVal = document.getElementById('speed-val');
    
    const updateSpeedLabel = (value) => {
        if (value < 200) speedVal.textContent = "Very Fast";
        else if (value < 500) speedVal.textContent = "Fast";
        else if (value < 1000) speedVal.textContent = "Normal";
        else if (value < 1500) speedVal.textContent = "Slow";
        else speedVal.textContent = "Very Slow";
    };

    speedSlider.addEventListener('input', (e) => {
        const speed = parseInt(e.target.value, 10);
        updateSpeedLabel(speed);
        visualizer.setSpeed(speed);
    });
    // Set initial speed slider state
    visualizer.setSpeed(parseInt(speedSlider.value, 10));
    updateSpeedLabel(parseInt(speedSlider.value, 10));

    // Player Buttons
    document.getElementById('btn-play').addEventListener('click', () => {
        if (visualizer.isPlaying) {
            visualizer.pause();
        } else {
            visualizer.play();
        }
    });

    document.getElementById('btn-prev').addEventListener('click', () => {
        visualizer.stepBackward();
    });

    document.getElementById('btn-next').addEventListener('click', () => {
        visualizer.stepForward();
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
        visualizer.reset();
    });

    // Generate Random Array Button
    document.getElementById('btn-random').addEventListener('click', () => {
        visualizer.pause();
        const size = parseInt(sizeSlider.value, 10);
        generateNewArray(size);
    });

    // Hook playback end to toggle play icon
    visualizer.onPlaybackFinished = () => {
        const playBtn = document.getElementById('btn-play');
        if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    };

    // Main section tabs (Array visualizer vs Recursion Tree)
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const contentId = tab.getAttribute('data-tab');
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(contentId).classList.add('active');

            // Force center the tree layout viewport if tree view was loaded
            if (contentId === 'tree-view') {
                // Trigger button click to center fit the SVG
                document.getElementById('btn-reset-zoom').click();
            }
        });
    });

    // Details tabs (Pros vs Cons)
    const prosTab = document.getElementById('tab-pros');
    const consTab = document.getElementById('tab-cons');

    prosTab.addEventListener('click', () => {
        prosTab.classList.add('active');
        consTab.classList.remove('active');
        activeDetailTab = 'pros';
        renderDetailsList(codeSnippets[currentAlgorithm]);
    });

    consTab.addEventListener('click', () => {
        consTab.classList.add('active');
        prosTab.classList.remove('active');
        activeDetailTab = 'cons';
        renderDetailsList(codeSnippets[currentAlgorithm]);
    });

    // ==========================================
    // Custom Array Modal Handlers
    // ==========================================
    const customBtn = document.getElementById('btn-custom');
    const modal = document.getElementById('custom-modal');
    const closeModalBtn = document.getElementById('btn-close-modal');
    const cancelModalBtn = document.getElementById('btn-cancel-modal');
    const applyModalBtn = document.getElementById('btn-apply-modal');
    const modalInput = document.getElementById('custom-array-input');
    const modalError = document.getElementById('modal-error');

    customBtn.addEventListener('click', () => {
        visualizer.pause();
        modalInput.value = currentArray.join(', ');
        modalError.classList.add('hidden');
        modal.classList.remove('hidden');
        modalInput.focus();
    });

    const hideModal = () => {
        modal.classList.add('hidden');
    };

    closeModalBtn.addEventListener('click', hideModal);
    cancelModalBtn.addEventListener('click', hideModal);

    // Apply custom array
    applyModalBtn.addEventListener('click', () => {
        const valStr = modalInput.value.trim();
        if (!valStr) {
            modalError.textContent = "Please enter some numbers.";
            modalError.classList.remove('hidden');
            return;
        }

        // Parse numbers
        const tokens = valStr.split(',');
        const parsedNums = [];
        
        for (let token of tokens) {
            const num = parseInt(token.trim(), 10);
            if (isNaN(num)) {
                modalError.textContent = `Invalid entry: "${token}". Please enter integers only.`;
                modalError.classList.remove('hidden');
                return;
            }
            if (num < 5 || num > 100) {
                modalError.textContent = "All values must be between 5 and 100.";
                modalError.classList.remove('hidden');
                return;
            }
            parsedNums.push(num);
        }

        if (parsedNums.length < 3) {
            modalError.textContent = "Please enter at least 3 elements.";
            modalError.classList.remove('hidden');
            return;
        }

        if (parsedNums.length > 50) {
            modalError.textContent = "Maximum elements size is 50.";
            modalError.classList.remove('hidden');
            return;
        }

        // Apply new values
        currentArray = parsedNums;
        
        // Update sliders if size changes
        sizeSlider.value = currentArray.length;
        sizeVal.textContent = currentArray.length;

        hideModal();
        recalculateSteps();
    });
}
