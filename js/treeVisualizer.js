// js/treeVisualizer.js

// Zoom and pan state
let zoomScale = 1.0;
let panX = 0;
let panY = 0;
let isPanning = false;
let startX = 0;
let startY = 0;

let treeViewport = null;
let svgElement = null;

// Initialize Zoom and Pan Event Listeners
export function initTreeControls() {
    svgElement = document.getElementById('tree-svg');
    treeViewport = document.getElementById('tree-viewport');
    const container = document.getElementById('tree-canvas-container');

    if (!svgElement || !treeViewport) return;

    // Mouse Drag Panning
    container.addEventListener('mousedown', (e) => {
        // Only left click drags
        if (e.button !== 0) return;
        isPanning = true;
        startX = e.clientX - panX;
        startY = e.clientY - panY;
        container.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        panX = e.clientX - startX;
        panY = e.clientY - startY;
        applyTransform();
    });

    window.addEventListener('mouseup', () => {
        if (isPanning) {
            isPanning = false;
            container.style.cursor = 'grab';
        }
    });

    // Scroll Wheel Zoom
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomIntensity = 0.05;
        const rect = svgElement.getBoundingClientRect();
        
        // Mouse coordinate relative to the SVG canvas
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Calculate zoom factor
        const wheel = e.deltaY < 0 ? 1 : -1;
        const zoomFactor = Math.exp(wheel * zoomIntensity);
        
        // Zooming centered on mouse pointer
        panX = mouseX - (mouseX - panX) * zoomFactor;
        panY = mouseY - (mouseY - panY) * zoomFactor;
        zoomScale *= zoomFactor;

        // Bound zoom
        zoomScale = Math.min(Math.max(zoomScale, 0.25), 4.0);

        applyTransform();
    }, { passive: false });

    // Button controls
    document.getElementById('btn-zoom-in').addEventListener('click', () => {
        zoomScale *= 1.2;
        zoomScale = Math.min(zoomScale, 4.0);
        applyTransform();
    });

    document.getElementById('btn-zoom-out').addEventListener('click', () => {
        zoomScale /= 1.2;
        zoomScale = Math.max(zoomScale, 0.25);
        applyTransform();
    });

    document.getElementById('btn-reset-zoom').addEventListener('click', () => {
        resetView();
    });
}

function applyTransform() {
    if (treeViewport) {
        treeViewport.setAttribute('transform', `translate(${panX}, ${panY}) scale(${zoomScale})`);
    }
}

function resetView() {
    if (!svgElement) return;
    const container = svgElement.parentElement;
    const width = container.clientWidth;
    
    zoomScale = 0.95;
    panX = (width - 1000 * zoomScale) / 2; // Center virtual width 1000
    panY = 40;
    
    applyTransform();
}

/**
 * Calculates coordinates for all nodes in the recursion tree
 */
function assignCoordinates(nodes) {
    if (nodes.length === 0) return;
    
    const root = nodes.find(n => n.parentId === null);
    if (!root) return;
    
    root.x = 500; // Center of the 1000px virtual width
    root.y = 50;   // Top margin
    
    const processChildren = (parentId) => {
        const parent = nodes.find(n => n.id === parentId);
        if (!parent) return;
        
        const children = nodes.filter(n => n.parentId === parentId);
        if (children.length === 0) return;
        
        const levelHeight = 85;
        // Exponential gap reduction to prevent overlapping child branches
        const horizontalGap = 240 / Math.pow(1.6, parent.level);
        
        if (children.length === 1) {
            // Single recursive branch (rare but possible in skewed splits)
            const child = children[0];
            child.x = parent.x;
            child.y = parent.y + levelHeight;
            processChildren(child.id);
        } else if (children.length === 2) {
            // Standard binary split
            const leftChild = children[0];
            leftChild.x = parent.x - horizontalGap;
            leftChild.y = parent.y + levelHeight;
            processChildren(leftChild.id);
            
            const rightChild = children[1];
            rightChild.x = parent.x + horizontalGap;
            rightChild.y = parent.y + levelHeight;
            processChildren(rightChild.id);
        }
    };
    
    processChildren(root.id);
}

/**
 * Renders the recursion tree inside the SVG
 */
export function drawRecursionTree(treeData, algorithmId) {
    const svg = document.getElementById('tree-svg');
    const viewport = document.getElementById('tree-viewport');
    const placeholder = document.getElementById('tree-placeholder');

    if (!svg || !viewport || !placeholder) return;

    // Check if algorithm uses recursion
    const isRecursive = ['quick-lomuto', 'quick-hoare', 'merge'].includes(algorithmId);
    
    if (!isRecursive) {
        svg.style.display = 'none';
        placeholder.classList.remove('hidden');
        return;
    } else {
        svg.style.display = 'block';
        placeholder.classList.add('hidden');
    }

    // Clear previous elements in the viewport
    viewport.innerHTML = '';

    if (!treeData || !treeData.nodes || treeData.nodes.length === 0) {
        // Draw initial single root waiting node if no steps started
        return;
    }

    const { nodes, edges, activeNodeId } = treeData;

    // Calculate layout coordinates
    assignCoordinates(nodes);

    // 1. Draw Edges (Lines) first so they render under the nodes
    edges.forEach(edge => {
        const parentNode = nodes.find(n => n.id === edge.parent);
        const childNode = nodes.find(n => n.id === edge.child);

        if (parentNode && childNode && parentNode.x !== undefined && childNode.x !== undefined) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', parentNode.x);
            line.setAttribute('y1', parentNode.y);
            line.setAttribute('x2', childNode.x);
            line.setAttribute('y2', childNode.y);
            
            // Set edge classes
            line.setAttribute('class', `tree-edge ${edge.status}`);
            
            // Highlight active path
            if (activeNodeId === childNode.id) {
                line.classList.add('active');
            } else if (childNode.status === 'completed') {
                line.classList.add('completed');
            }

            viewport.appendChild(line);
        }
    });

    // 2. Draw Nodes (Groups of circles + text labels)
    nodes.forEach(node => {
        if (node.x === undefined) return;

        const isNodeActive = activeNodeId === node.id;
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', `tree-node ${node.status}`);
        if (isNodeActive) g.classList.add('active');
        if (node.pivotVal !== null) g.classList.add('pivot-selected');

        // Circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', node.x);
        circle.setAttribute('cy', node.y);
        circle.setAttribute('r', 18);
        circle.setAttribute('class', 'tree-node-circle');
        g.appendChild(circle);

        // Text inside circle (Pivot or subarray size)
        const insideText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        insideText.setAttribute('x', node.x);
        insideText.setAttribute('y', node.y + 4);
        insideText.setAttribute('class', 'tree-node-text');
        
        const size = node.high - node.low + 1;
        if (node.pivotVal !== null) {
            insideText.textContent = `P:${node.pivotVal}`;
        } else {
            insideText.textContent = size > 0 ? size : '0';
        }
        g.appendChild(insideText);

        // Text label below circle showing index range [low - high]
        const rangeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        rangeText.setAttribute('x', node.x);
        rangeText.setAttribute('y', node.y + 30);
        rangeText.setAttribute('class', 'tree-node-range');
        rangeText.textContent = `[${node.low}..${node.high}]`;
        g.appendChild(rangeText);

        viewport.appendChild(g);
    });

    // Auto-adjust view on initial render or layout resets
    if (nodes.length === 1 && nodes[0].status === 'active' && activeNodeId === nodes[0].id) {
        resetView();
    }
}
