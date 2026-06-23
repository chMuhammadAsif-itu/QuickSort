// js/visualizer.js
import { codeSnippets } from './codeSnippets.js';
import { drawRecursionTree } from './treeVisualizer.js';

// Custom syntax highlighter for C++ code traces
function syntaxHighlightCPP(code) {
    const keywords = ["if", "else", "for", "while", "return", "true", "false", "do", "break"];
    const datatypes = ["void", "int", "bool"];
    const funcs = ["swap", "partition", "heapify", "quickSort", "mergeSort", "merge", "bubbleSort", "insertionSort", "heapSort"];

    return code.split('\n').map((line, idx) => {
        let content = line;
        
        // 1. Escape HTML characters to avoid browser tag issues
        content = content
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // 2. Format Comments
        if (content.includes('//')) {
            const commentIndex = content.indexOf('//');
            const codePart = content.substring(0, commentIndex);
            const commentPart = content.substring(commentIndex);
            content = codePart + `<span class="c-comment">${commentPart}</span>`;
        }

        // 3. Format Numbers (only outside comment tags)
        // We look for digits that are not inside HTML tags
        content = content.replace(/\b(\d+)\b(?![^<]*>)/g, '<span class="c-number">$1</span>');

        // 4. Format Types & Keywords (only outside comment tags)
        keywords.forEach(kw => {
            const regex = new RegExp(`\\b${kw}\\b(?![^<]*>)`, 'g');
            content = content.replace(regex, `<span class="c-keyword">${kw}</span>`);
        });

        datatypes.forEach(dt => {
            const regex = new RegExp(`\\b${dt}\\b(?![^<]*>)`, 'g');
            content = content.replace(regex, `<span class="c-type">${dt}</span>`);
        });

        funcs.forEach(fn => {
            const regex = new RegExp(`\\b${fn}\\b(?![^<]*>)`, 'g');
            content = content.replace(regex, `<span class="c-func">${fn}</span>`);
        });

        return {
            lineNum: idx + 1,
            html: content
        };
    });
}

export class SortingVisualizer {
    constructor() {
        // DOM Elements
        this.arrayContainer = document.getElementById('array-container');
        this.codeTraceBlock = document.getElementById('code-trace-block');
        this.statusText = document.getElementById('status-text');
        
        // Variables variables-container
        this.varLow = document.getElementById('var-low');
        this.varHigh = document.getElementById('var-high');
        this.varPivot = document.getElementById('var-pivot');
        this.varI = document.getElementById('var-i');
        this.varJ = document.getElementById('var-j');

        // State trackers
        this.steps = [];
        this.currentStepIndex = 0;
        this.isPlaying = false;
        this.playTimeout = null;
        this.speed = 500; // ms
        
        // Active algorithm variables
        this.currentAlgorithm = 'quick-lomuto';
        this.originalArray = [];
        this.onPlaybackFinished = null;
    }

    // Load C++ code into panel with line-by-line spans
    loadCodeSnippet(algoId) {
        const snippet = codeSnippets[algoId];
        if (!snippet) return;
        
        const highlightedLines = syntaxHighlightCPP(snippet.code);
        this.codeTraceBlock.innerHTML = highlightedLines
            .map(line => `
                <div class="code-line" data-line="${line.lineNum}">
                    <span class="code-line-num">${line.lineNum}</span>
                    <span class="code-line-content">${line.html}</span>
                </div>
            `).join('');
    }

    setSpeed(speedMs) {
        this.speed = speedMs;
    }

    // Initialize with precomputed steps
    setSteps(steps, originalArray) {
        this.pause();
        this.steps = steps;
        this.originalArray = [...originalArray];
        this.currentStepIndex = 0;
        this.renderCurrentStep();
    }

    // Render single step in visualizer
    renderCurrentStep() {
        if (this.steps.length === 0) return;
        const step = this.steps[this.currentStepIndex];
        
        // 1. Render Array Bars
        this.renderArray(step.array, step.states);

        // 2. Render Code Highlight
        this.highlightCodeLines(step.highlightLines);

        // 3. Render Variables
        this.updateVariables(step.variables);

        // 4. Render logs
        this.statusText.textContent = step.log;

        // 5. Draw Recursion Tree
        drawRecursionTree(step.tree, this.currentAlgorithm);
    }

    renderArray(array, states) {
        this.arrayContainer.innerHTML = '';
        const maxVal = Math.max(...array, 1);
        const showLabels = array.length <= 25;

        array.forEach((val, idx) => {
            const bar = document.createElement('div');
            bar.className = 'array-bar';
            
            // Apply states colors
            if (states[idx]) {
                bar.classList.add(states[idx]);
            }
            
            // Set Height
            const heightPercentage = (val / maxVal) * 90; // scale to 90% max
            bar.style.height = `${Math.max(heightPercentage, 8)}%`;
            
            // Set value labels
            if (showLabels) {
                bar.textContent = val;
            }

            // Small visual detail: tooltip for bars
            bar.title = `Index: ${idx}, Value: ${val}`;

            this.arrayContainer.appendChild(bar);
        });
    }

    highlightCodeLines(linesToHighlight) {
        const lines = this.codeTraceBlock.querySelectorAll('.code-line');
        lines.forEach(line => {
            const lineNum = parseInt(line.getAttribute('data-line'), 10);
            if (linesToHighlight.includes(lineNum)) {
                line.classList.add('active');
            } else {
                line.classList.remove('active');
            }
        });

        // Auto scroll active lines into view if needed
        const firstActive = this.codeTraceBlock.querySelector('.code-line.active');
        if (firstActive) {
            const cardBody = firstActive.closest('.code-body');
            const offsetTop = firstActive.offsetTop;
            const viewHeight = cardBody.clientHeight;
            
            if (offsetTop < cardBody.scrollTop || offsetTop > cardBody.scrollTop + viewHeight - 40) {
                cardBody.scrollTop = offsetTop - (viewHeight / 2);
            }
        }
    }

    updateVariables(vars) {
        this.varLow.textContent = vars.low !== undefined ? vars.low : '-';
        this.varHigh.textContent = vars.high !== undefined ? vars.high : '-';
        this.varPivot.textContent = vars.pivot !== undefined ? vars.pivot : '-';
        this.varI.textContent = vars.i !== undefined ? vars.i : '-';
        this.varJ.textContent = vars.j !== undefined ? vars.j : '-';
    }

    // Playback loop controller
    play() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        
        const playBtn = document.getElementById('btn-play');
        if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';

        const runLoop = () => {
            if (!this.isPlaying) return;
            if (this.currentStepIndex < this.steps.length - 1) {
                this.currentStepIndex++;
                this.renderCurrentStep();
                this.playTimeout = setTimeout(runLoop, this.speed);
            } else {
                this.pause();
                if (this.onPlaybackFinished) {
                    this.onPlaybackFinished();
                }
            }
        };

        runLoop();
    }

    pause() {
        this.isPlaying = false;
        if (this.playTimeout) {
            clearTimeout(this.playTimeout);
            this.playTimeout = null;
        }
        const playBtn = document.getElementById('btn-play');
        if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    }

    stepForward() {
        this.pause();
        if (this.currentStepIndex < this.steps.length - 1) {
            this.currentStepIndex++;
            this.renderCurrentStep();
        }
    }

    stepBackward() {
        this.pause();
        if (this.currentStepIndex > 0) {
            this.currentStepIndex--;
            this.renderCurrentStep();
        }
    }

    reset() {
        this.pause();
        this.currentStepIndex = 0;
        this.renderCurrentStep();
    }
}
