// js/algorithms.js

// Deep copy helper for the array
function copyArray(arr) {
    return [...arr];
}

// Global class/helper to build steps with recursion tree trace
class TraceBuilder {
    constructor(initialArray) {
        this.steps = [];
        this.nodeIdCounter = 0;
        this.treeNodes = [];
        this.treeEdges = [];
        // Stack of active tree node IDs
        this.activeNodeStack = [];
    }

    addStep({ array, states = {}, highlightLines = [], variables = {}, log = "" }) {
        this.steps.push({
            array: copyArray(array),
            states: { ...states },
            highlightLines: [...highlightLines],
            variables: { ...variables },
            log,
            // Deep copy of tree nodes and edges to prevent reference issues during playback scrubbing
            tree: {
                nodes: this.treeNodes.map(n => ({ ...n })),
                edges: this.treeEdges.map(e => ({ ...e })),
                activeNodeId: this.activeNodeStack[this.activeNodeStack.length - 1] || null
            }
        });
    }

    createTreeNode(low, high, parentId = null) {
        const id = ++this.nodeIdCounter;
        const level = parentId !== null ? this.treeNodes.find(n => n.id === parentId).level + 1 : 0;
        const node = {
            id,
            low,
            high,
            parentId,
            level,
            status: 'active', // active, completed, waiting
            pivotVal: null
        };
        this.treeNodes.push(node);
        this.activeNodeStack.push(id);

        if (parentId !== null) {
            this.treeEdges.push({
                parent: parentId,
                child: id,
                status: 'active'
            });
        }
        return id;
    }

    setPivotOnActiveNode(pivotVal) {
        if (this.activeNodeStack.length > 0) {
            const currentId = this.activeNodeStack[this.activeNodeStack.length - 1];
            const node = this.treeNodes.find(n => n.id === currentId);
            if (node) node.pivotVal = pivotVal;
        }
    }

    exitActiveNode() {
        if (this.activeNodeStack.length > 0) {
            const currentId = this.activeNodeStack.pop();
            const node = this.treeNodes.find(n => n.id === currentId);
            if (node) node.status = 'completed';

            // Mark edge to parent as completed as well
            if (node.parentId !== null) {
                const edge = this.treeEdges.find(e => e.parent === node.parentId && e.child === currentId);
                if (edge) edge.status = 'completed';
            }
        }
    }
}

/**
 * QUICK SORT - LOMUTO PARTITION
 */
export function generateQuickLomutoSteps(arr) {
    const builder = new TraceBuilder(arr);
    let workingArr = copyArray(arr);

    function qSort(low, high, parentNodeId = null) {
        // Step: Enter quickSort function
        const nodeId = builder.createTreeNode(low, high, parentNodeId);
        
        builder.addStep({
            array: workingArr,
            highlightLines: [1, 2],
            variables: { low, high, pivot: "-", i: "-", j: "-" },
            log: `Called quickSort(arr, low = ${low}, high = ${high}). Checking base case: low < high.`
        });

        if (low < high) {
            // Step: partition call
            builder.addStep({
                array: workingArr,
                highlightLines: [3],
                variables: { low, high, pivot: "-", i: "-", j: "-" },
                log: `Base case passed (${low} < ${high}). Calling partition(arr, low = ${low}, high = ${high}).`
            });

            const pIndex = partition(low, high);

            // Step: Return from partition
            builder.addStep({
                array: workingArr,
                highlightLines: [3],
                variables: { low, high, pivot: workingArr[pIndex], i: "-", j: "-", pIndex },
                log: `Partition returned pivot index = ${pIndex}. Pivot value is ${workingArr[pIndex]}.`
            });

            // Step: Recursion on left sub-array
            builder.addStep({
                array: workingArr,
                highlightLines: [4],
                variables: { low, high, pivot: "-", i: "-", j: "-", pIndex },
                log: `Calling left recursion: quickSort(arr, low = ${low}, high = ${pIndex - 1}).`
            });
            qSort(low, pIndex - 1, nodeId);

            // Step: Recursion on right sub-array
            builder.addStep({
                array: workingArr,
                highlightLines: [5],
                variables: { low, high, pivot: "-", i: "-", j: "-", pIndex },
                log: `Calling right recursion: quickSort(arr, low = ${pIndex + 1}, high = ${high}).`
            });
            qSort(pIndex + 1, high, nodeId);
        } else {
            // Base case hit
            builder.addStep({
                array: workingArr,
                highlightLines: [2],
                variables: { low, high, pivot: "-", i: "-", j: "-" },
                log: `Base case failed (low = ${low} is not < high = ${high}). Recursive branch terminates.`
            });
        }

        // Mark recursion node completed
        builder.exitActiveNode();
    }

    function partition(low, high) {
        // Line 10: pivot choice
        const pivot = workingArr[high];
        builder.setPivotOnActiveNode(pivot);

        const states = {};
        states[high] = 'pivot';

        builder.addStep({
            array: workingArr,
            states,
            highlightLines: [9, 10],
            variables: { low, high, pivot, i: "-", j: "-" },
            log: `Partition: Choosing pivot element. Selected arr[high] = ${pivot} at index ${high}.`
        });

        // Line 11: i = low - 1
        let i = low - 1;
        builder.addStep({
            array: workingArr,
            states,
            highlightLines: [11],
            variables: { low, high, pivot, i, j: "-" },
            log: `Partition: Set index pointer i = low - 1 = ${i}.`
        });

        // Line 12: Loop header
        for (let j = low; j < high; j++) {
            const loopStates = { ...states };
            loopStates[j] = 'compare';
            if (i >= low) loopStates[i] = 'compare'; // Highlight i pointer position if valid

            builder.addStep({
                array: workingArr,
                states: loopStates,
                highlightLines: [12, 13],
                variables: { low, high, pivot, i, j },
                log: `Partition loop: Comparing arr[j] (${workingArr[j]}) with pivot (${pivot}).`
            });

            if (workingArr[j] < pivot) {
                // Line 14: i++
                i++;
                const swapStates = { ...states };
                swapStates[i] = 'swap';
                swapStates[j] = 'swap';

                builder.addStep({
                    array: workingArr,
                    states: swapStates,
                    highlightLines: [14],
                    variables: { low, high, pivot, i, j },
                    log: `arr[j] (${workingArr[j]}) < pivot (${pivot}). Incrementing i. New i = ${i}.`
                });

                // Line 15: Swap
                const temp = workingArr[i];
                workingArr[i] = workingArr[j];
                workingArr[j] = temp;

                builder.addStep({
                    array: workingArr,
                    states: swapStates,
                    highlightLines: [15],
                    variables: { low, high, pivot, i, j },
                    log: `Swapping arr[i] (${workingArr[i]}) and arr[j] (${workingArr[j]}).`
                });
            } else {
                builder.addStep({
                    array: workingArr,
                    states: loopStates,
                    highlightLines: [13],
                    variables: { low, high, pivot, i, j },
                    log: `arr[j] (${workingArr[j]}) is not less than pivot. Moving on.`
                });
            }
        }

        // Line 18: Swap pivot to its correct place
        const finalStates = { ...states };
        finalStates[i + 1] = 'swap';
        finalStates[high] = 'swap';

        builder.addStep({
            array: workingArr,
            states: finalStates,
            highlightLines: [18],
            variables: { low, high, pivot, i, j: high },
            log: `Loop complete. Swapping arr[i+1] (${workingArr[i + 1]}) with pivot (${pivot}) at index ${high}.`
        });

        const temp = workingArr[i + 1];
        workingArr[i + 1] = workingArr[high];
        workingArr[high] = temp;

        // Line 19: Return i + 1
        const returnStates = {};
        returnStates[i + 1] = 'sorted';

        builder.addStep({
            array: workingArr,
            states: returnStates,
            highlightLines: [19],
            variables: { low, high, pivot, i, j: high, pIndex: i + 1 },
            log: `Pivot placed at index ${i + 1}. Returning pivot index.`
        });

        return i + 1;
    }

    qSort(0, workingArr.length - 1);

    // Final state: mark all elements as sorted
    const sortedStates = {};
    for (let k = 0; k < workingArr.length; k++) sortedStates[k] = 'sorted';
    builder.addStep({
        array: workingArr,
        states: sortedStates,
        highlightLines: [1],
        variables: {},
        log: "Quick Sort Complete! The entire array is now sorted."
    });

    return builder.steps;
}

/**
 * QUICK SORT - HOARE PARTITION
 */
export function generateQuickHoareSteps(arr) {
    const builder = new TraceBuilder(arr);
    let workingArr = copyArray(arr);

    function qSort(low, high, parentNodeId = null) {
        const nodeId = builder.createTreeNode(low, high, parentNodeId);

        builder.addStep({
            array: workingArr,
            highlightLines: [1, 2],
            variables: { low, high, pivot: "-", i: "-", j: "-" },
            log: `Called quickSort(arr, low = ${low}, high = ${high}) [Hoare]. Checking low < high.`
        });

        if (low < high) {
            builder.addStep({
                array: workingArr,
                highlightLines: [3],
                variables: { low, high, pivot: "-", i: "-", j: "-" },
                log: `Base case passed. Calling partition(arr, low = ${low}, high = ${high}).`
            });

            const pIndex = partition(low, high);

            builder.addStep({
                array: workingArr,
                highlightLines: [3],
                variables: { low, high, pivot: "-", i: "-", j: "-", pIndex },
                log: `Partition returned split index j = ${pIndex}. Sub-arrays split at index <= ${pIndex} and > ${pIndex}.`
            });

            // Left call
            builder.addStep({
                array: workingArr,
                highlightLines: [4],
                variables: { low, high, pivot: "-", i: "-", j: "-", pIndex },
                log: `Calling left recursion: quickSort(arr, low = ${low}, high = ${pIndex}).`
            });
            qSort(low, pIndex, nodeId);

            // Right call
            builder.addStep({
                array: workingArr,
                highlightLines: [5],
                variables: { low, high, pivot: "-", i: "-", j: "-", pIndex },
                log: `Calling right recursion: quickSort(arr, low = ${pIndex + 1}, high = ${high}).`
            });
            qSort(pIndex + 1, high, nodeId);
        } else {
            builder.addStep({
                array: workingArr,
                highlightLines: [2],
                variables: { low, high, pivot: "-", i: "-", j: "-" },
                log: `Base case failed (low = ${low} is not < high = ${high}). Branch terminates.`
            });
        }

        builder.exitActiveNode();
    }

    function partition(low, high) {
        const pivot = workingArr[low]; // Hoare pivot is the first element
        builder.setPivotOnActiveNode(pivot);

        const states = {};
        states[low] = 'pivot';

        builder.addStep({
            array: workingArr,
            states,
            highlightLines: [9, 10],
            variables: { low, high, pivot, i: "-", j: "-" },
            log: `Partition: Selecting pivot arr[low] = ${pivot} at index ${low}.`
        });

        let i = low - 1;
        let j = high + 1;

        builder.addStep({
            array: workingArr,
            states,
            highlightLines: [11, 12],
            variables: { low, high, pivot, i, j },
            log: `Partition: Set pointer i = low - 1 = ${i}, and pointer j = high + 1 = ${j}.`
        });

        while (true) {
            // Find leftmost element >= pivot
            i++;
            states[i] = 'compare';
            builder.addStep({
                array: workingArr,
                states,
                highlightLines: [15],
                variables: { low, high, pivot, i, j },
                log: `Incrementing i to ${i}. Checking if arr[i] (${workingArr[i]}) < pivot (${pivot}).`
            });
            while (workingArr[i] < pivot) {
                i++;
                states[i] = 'compare';
                builder.addStep({
                    array: workingArr,
                    states,
                    highlightLines: [15],
                    variables: { low, high, pivot, i, j },
                    log: `arr[i] < pivot. Incrementing i to ${i}. Checking arr[i] (${workingArr[i]}) < pivot.`
                });
            }

            // Find rightmost element <= pivot
            j--;
            states[j] = 'compare';
            builder.addStep({
                array: workingArr,
                states,
                highlightLines: [16],
                variables: { low, high, pivot, i, j },
                log: `Decrementing j to ${j}. Checking if arr[j] (${workingArr[j]}) > pivot (${pivot}).`
            });
            while (workingArr[j] > pivot) {
                j--;
                states[j] = 'compare';
                builder.addStep({
                    array: workingArr,
                    states,
                    highlightLines: [16],
                    variables: { low, high, pivot, i, j },
                    log: `arr[j] > pivot. Decrementing j to ${j}. Checking arr[j] (${workingArr[j]}) > pivot.`
                });
            }

            // If pointers meet
            if (i >= j) {
                const returnStates = {};
                returnStates[j] = 'sorted'; // Split point
                builder.addStep({
                    array: workingArr,
                    states: returnStates,
                    highlightLines: [17],
                    variables: { low, high, pivot, i, j },
                    log: `Pointers crossed (i = ${i} >= j = ${j}). Returning split boundary index j = ${j}.`
                });
                return j;
            }

            // Swap out of order elements
            const swapStates = { ...states };
            swapStates[i] = 'swap';
            swapStates[j] = 'swap';
            builder.addStep({
                array: workingArr,
                states: swapStates,
                highlightLines: [18],
                variables: { low, high, pivot, i, j },
                log: `Swapping arr[i] (${workingArr[i]}) and arr[j] (${workingArr[j]}) which were on incorrect sides of pivot.`
            });

            const temp = workingArr[i];
            workingArr[i] = workingArr[j];
            workingArr[j] = temp;

            // Reset states except pivot
            for (let k = 0; k < workingArr.length; k++) {
                if (k === low) states[k] = 'pivot';
                else delete states[k];
            }
        }
    }

    qSort(0, workingArr.length - 1);

    const sortedStates = {};
    for (let k = 0; k < workingArr.length; k++) sortedStates[k] = 'sorted';
    builder.addStep({
        array: workingArr,
        states: sortedStates,
        highlightLines: [1],
        variables: {},
        log: "Hoare Quick Sort Complete! The entire array is now sorted."
    });

    return builder.steps;
}

/**
 * MERGE SORT
 */
export function generateMergeSteps(arr) {
    const builder = new TraceBuilder(arr);
    let workingArr = copyArray(arr);

    function mSort(l, r, parentNodeId = null) {
        const nodeId = builder.createTreeNode(l, r, parentNodeId);

        builder.addStep({
            array: workingArr,
            highlightLines: [1, 2],
            variables: { l, r, m: "-" },
            log: `Called mergeSort(arr, l = ${l}, r = ${r}). Checking if l < r.`
        });

        if (l < r) {
            const m = l + Math.floor((r - l) / 2);
            builder.addStep({
                array: workingArr,
                highlightLines: [3],
                variables: { l, r, m },
                log: `Calculated middle index m = l + (r - l)/2 = ${m}.`
            });

            // Left branch
            builder.addStep({
                array: workingArr,
                highlightLines: [4],
                variables: { l, r, m },
                log: `Calling left recursion: mergeSort(arr, l = ${l}, m = ${m}).`
            });
            mSort(l, m, nodeId);

            // Right branch
            builder.addStep({
                array: workingArr,
                highlightLines: [5],
                variables: { l, r, m },
                log: `Calling right recursion: mergeSort(arr, m + 1 = ${m + 1}, r = ${r}).`
            });
            mSort(m + 1, r, nodeId);

            // Merge
            builder.addStep({
                array: workingArr,
                highlightLines: [6],
                variables: { l, r, m },
                log: `Merging sub-arrays: [${l}...${m}] and [${m + 1}...${r}].`
            });
            merge(l, m, r);
        } else {
            builder.addStep({
                array: workingArr,
                highlightLines: [2],
                variables: { l, r, m: "-" },
                log: `Base case failed: l = ${l} is not < r = ${r}. Leaf reached.`
            });
        }

        builder.exitActiveNode();
    }

    function merge(l, m, r) {
        const n1 = m - l + 1;
        const n2 = r - m;
        
        // Copy elements
        const L = workingArr.slice(l, m + 1);
        const R = workingArr.slice(m + 1, r + 1);

        builder.addStep({
            array: workingArr,
            highlightLines: [10, 11, 12, 13, 14],
            variables: { l, m, r, n1, n2 },
            log: `Merge: Copying sub-arrays to L[${n1}] and R[${n2}]. L: [${L.join(', ')}], R: [${R.join(', ')}]`
        });

        let i = 0, j = 0, k = l;
        
        while (i < n1 && j < n2) {
            const compareStates = {};
            compareStates[l + i] = 'compare';
            compareStates[m + 1 + j] = 'compare';

            builder.addStep({
                array: workingArr,
                states: compareStates,
                highlightLines: [16, 17],
                variables: { l, m, r, i, j, k },
                log: `Merge comparison: Comparing L[i] (${L[i]}) and R[j] (${R[j]}).`
            });

            if (L[i] <= R[j]) {
                workingArr[k] = L[i];
                const writeStates = {};
                writeStates[k] = 'swap';

                builder.addStep({
                    array: workingArr,
                    states: writeStates,
                    highlightLines: [17],
                    variables: { l, m, r, i, j, k },
                    log: `L[i] (${L[i]}) <= R[j] (${R[j]}). Writing L[i] to index k = ${k}.`
                });
                i++;
            } else {
                workingArr[k] = R[j];
                const writeStates = {};
                writeStates[k] = 'swap';

                builder.addStep({
                    array: workingArr,
                    states: writeStates,
                    highlightLines: [18],
                    variables: { l, m, r, i, j, k },
                    log: `L[i] (${L[i]}) > R[j] (${R[j]}). Writing R[j] to index k = ${k}.`
                });
                j++;
            }
            k++;
        }

        // Copy remaining elements
        while (i < n1) {
            workingArr[k] = L[i];
            const writeStates = {};
            writeStates[k] = 'swap';

            builder.addStep({
                array: workingArr,
                states: writeStates,
                highlightLines: [20, 21],
                variables: { l, m, r, i, j, k },
                log: `Copying remaining element from L: L[i] (${L[i]}) to index k = ${k}.`
            });
            i++;
            k++;
        }

        while (j < n2) {
            workingArr[k] = R[j];
            const writeStates = {};
            writeStates[k] = 'swap';

            builder.addStep({
                array: workingArr,
                states: writeStates,
                highlightLines: [22, 23],
                variables: { l, m, r, i, j, k },
                log: `Copying remaining element from R: R[j] (${R[j]}) to index k = ${k}.`
            });
            j++;
            k++;
        }

        // Mark merged block as partially sorted
        const highlightStates = {};
        for (let idx = l; idx <= r; idx++) {
            highlightStates[idx] = 'sorted';
        }
        builder.addStep({
            array: workingArr,
            states: highlightStates,
            highlightLines: [24],
            variables: { l, m, r },
            log: `Successfully merged and sorted segment from index ${l} to ${r}.`
        });
    }

    mSort(0, workingArr.length - 1);

    // Final sweep
    const sortedStates = {};
    for (let k = 0; k < workingArr.length; k++) sortedStates[k] = 'sorted';
    builder.addStep({
        array: workingArr,
        states: sortedStates,
        highlightLines: [1],
        variables: {},
        log: "Merge Sort Complete! All elements sorted."
    });

    return builder.steps;
}

/**
 * HEAP SORT
 */
export function generateHeapSteps(arr) {
    const builder = new TraceBuilder(arr);
    let workingArr = copyArray(arr);
    const n = workingArr.length;

    // Phase 1: Build max heap
    builder.addStep({
        array: workingArr,
        highlightLines: [1, 2, 3, 4],
        variables: { n, i: "-" },
        log: `Heap Sort: Initializing Heapify loop. Building initial max heap.`
    });

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        builder.addStep({
            array: workingArr,
            highlightLines: [4],
            variables: { n, i },
            log: `Heap Sort: Calling heapify on parent node at index i = ${i}.`
        });
        heapify(n, i);
    }

    builder.addStep({
        array: workingArr,
        highlightLines: [5, 6],
        variables: { n, i: "-" },
        log: `Max heap built! Starting element extraction. We will repeatedly swap the largest element at root (index 0) to the end.`
    });

    // Phase 2: Extract elements
    for (let i = n - 1; i > 0; i--) {
        const swapStates = {};
        swapStates[0] = 'swap';
        swapStates[i] = 'swap';

        builder.addStep({
            array: workingArr,
            states: swapStates,
            highlightLines: [7],
            variables: { n: i, i },
            log: `Heap extraction: Swapping root arr[0] (${workingArr[0]}) with arr[i] (${workingArr[i]}) at index ${i}.`
        });

        // Swap
        const temp = workingArr[0];
        workingArr[0] = workingArr[i];
        workingArr[i] = temp;

        const postSwapStates = {};
        postSwapStates[i] = 'sorted'; // Kept in place!

        builder.addStep({
            array: workingArr,
            states: postSwapStates,
            highlightLines: [7],
            variables: { n: i, i },
            log: `Swapped! Index ${i} has its final sorted value: ${workingArr[i]}.`
        });

        builder.addStep({
            array: workingArr,
            states: postSwapStates,
            highlightLines: [8],
            variables: { n: i, i },
            log: `Heap size reduced. Re-heapifying root (index 0) with heap size = ${i}.`
        });
        heapify(i, 0, postSwapStates);
    }

    const sortedStates = {};
    for (let k = 0; k < workingArr.length; k++) sortedStates[k] = 'sorted';
    builder.addStep({
        array: workingArr,
        states: sortedStates,
        highlightLines: [1],
        variables: {},
        log: "Heap Sort Complete! The entire array is sorted."
    });

    return builder.steps;

    function heapify(heapSize, rootIdx, persistentStates = {}) {
        let largest = rootIdx;
        const l = 2 * rootIdx + 1;
        const r = 2 * rootIdx + 2;

        const compareStates = { ...persistentStates };
        compareStates[rootIdx] = 'compare';
        if (l < heapSize) compareStates[l] = 'compare';
        if (r < heapSize) compareStates[r] = 'compare';

        builder.addStep({
            array: workingArr,
            states: compareStates,
            highlightLines: [12, 13, 14, 15],
            variables: { n: heapSize, i: rootIdx, largest, l, r },
            log: `Heapify(index = ${rootIdx}): Checking left child (index ${l}) and right child (index ${r}) for values larger than parent (${workingArr[rootIdx]}).`
        });

        if (l < heapSize && workingArr[l] > workingArr[largest]) {
            largest = l;
        }
        if (r < heapSize && workingArr[r] > workingArr[largest]) {
            largest = r;
        }

        if (largest !== rootIdx) {
            const swapStates = { ...persistentStates };
            swapStates[rootIdx] = 'swap';
            swapStates[largest] = 'swap';

            builder.addStep({
                array: workingArr,
                states: swapStates,
                highlightLines: [16, 17],
                variables: { n: heapSize, i: rootIdx, largest, l, r },
                log: `Largest value is at index ${largest} (${workingArr[largest]}). Swapping arr[i] (${workingArr[rootIdx]}) with arr[largest] (${workingArr[largest]}).`
            });

            // Swap
            const temp = workingArr[rootIdx];
            workingArr[rootIdx] = workingArr[largest];
            workingArr[largest] = temp;

            builder.addStep({
                array: workingArr,
                states: swapStates,
                highlightLines: [18],
                variables: { n: heapSize, i: rootIdx, largest },
                log: `Swapped parent and child. Calling heapify recursively on child branch at index ${largest}.`
            });

            heapify(heapSize, largest, persistentStates);
        } else {
            builder.addStep({
                array: workingArr,
                states: persistentStates,
                highlightLines: [16],
                variables: { n: heapSize, i: rootIdx, largest },
                log: `Parent at index ${rootIdx} is already the largest. No swaps needed. Heap structure is valid.`
            });
        }
    }
}

/**
 * INSERTION SORT
 */
export function generateInsertionSteps(arr) {
    const builder = new TraceBuilder(arr);
    let workingArr = copyArray(arr);
    const n = workingArr.length;

    builder.addStep({
        array: workingArr,
        highlightLines: [1, 2],
        variables: { n, i: "-", key: "-", j: "-" },
        log: "Insertion Sort: Initializing sorting loop from index i = 1 to N-1."
    });

    for (let i = 1; i < n; i++) {
        const key = workingArr[i];
        let j = i - 1;

        const activeStates = {};
        activeStates[i] = 'pivot'; // Highlight current key element
        if (j >= 0) activeStates[j] = 'compare';

        builder.addStep({
            array: workingArr,
            states: activeStates,
            highlightLines: [3, 4],
            variables: { n, i, key, j },
            log: `Insertion Sort loop i = ${i}: Selected key = arr[i] = ${key}. Comparing key with arr[j] (${workingArr[j]}) at index j = ${j}.`
        });

        while (j >= 0 && workingArr[j] > key) {
            // Line 5: Shift element
            const shiftStates = {};
            shiftStates[j] = 'swap';
            shiftStates[j + 1] = 'swap';

            builder.addStep({
                array: workingArr,
                states: shiftStates,
                highlightLines: [5, 6],
                variables: { n, i, key, j },
                log: `arr[j] (${workingArr[j]}) > key (${key}). Shifting arr[j] right to index ${j + 1}.`
            });

            workingArr[j + 1] = workingArr[j];
            j = j - 1;

            const postShiftStates = {};
            if (j >= 0) postShiftStates[j] = 'compare';
            postShiftStates[j + 1] = 'pivot'; // key virtual location indicator

            builder.addStep({
                array: workingArr,
                states: postShiftStates,
                highlightLines: [7],
                variables: { n, i, key, j },
                log: `Shifted. Decremented j to ${j}. Checking next element.`
            });
        }

        // Write key back in place
        workingArr[j + 1] = key;
        const insertStates = {};
        insertStates[j + 1] = 'sorted';

        builder.addStep({
            array: workingArr,
            states: insertStates,
            highlightLines: [9],
            variables: { n, i, key, j },
            log: `Found insertion point. Inserting key (${key}) at arr[j+1] (index ${j + 1}).`
        });
    }

    const sortedStates = {};
    for (let k = 0; k < workingArr.length; k++) sortedStates[k] = 'sorted';
    builder.addStep({
        array: workingArr,
        states: sortedStates,
        highlightLines: [1],
        variables: {},
        log: "Insertion Sort Complete! Array is sorted."
    });

    return builder.steps;
}

/**
 * BUBBLE SORT
 */
export function generateBubbleSteps(arr) {
    const builder = new TraceBuilder(arr);
    let workingArr = copyArray(arr);
    const n = workingArr.length;

    builder.addStep({
        array: workingArr,
        highlightLines: [1, 2],
        variables: { n, i: "-", j: "-", swapped: "-" },
        log: "Bubble Sort: Initializing sorting pass loop."
    });

    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        builder.addStep({
            array: workingArr,
            highlightLines: [3, 4],
            variables: { n, i, j: "-", swapped },
            log: `Bubble Sort pass i = ${i}: Initialized swapped = false. Starting inner comparison loop.`
        });

        for (let j = 0; j < n - i - 1; j++) {
            const compareStates = {};
            compareStates[j] = 'compare';
            compareStates[j + 1] = 'compare';

            builder.addStep({
                array: workingArr,
                states: compareStates,
                highlightLines: [5, 6],
                variables: { n, i, j, swapped },
                log: `Inner loop j = ${j}: Comparing arr[j] (${workingArr[j]}) and arr[j+1] (${workingArr[j + 1]}).`
            });

            if (workingArr[j] > workingArr[j + 1]) {
                const swapStates = {};
                swapStates[j] = 'swap';
                swapStates[j + 1] = 'swap';

                builder.addStep({
                    array: workingArr,
                    states: swapStates,
                    highlightLines: [6, 7],
                    variables: { n, i, j, swapped },
                    log: `arr[j] (${workingArr[j]}) > arr[j+1] (${workingArr[j + 1]}). Swapping them.`
                });

                // Swap
                const temp = workingArr[j];
                workingArr[j] = workingArr[j + 1];
                workingArr[j + 1] = temp;
                swapped = true;

                builder.addStep({
                    array: workingArr,
                    states: swapStates,
                    highlightLines: [8],
                    variables: { n, i, j, swapped },
                    log: `Swapped! Set swapped = true.`
                });
            } else {
                builder.addStep({
                    array: workingArr,
                    states: compareStates,
                    highlightLines: [5],
                    variables: { n, i, j, swapped },
                    log: `arr[j] is not greater than arr[j+1]. No swap needed.`
                });
            }
        }

        // After each pass, the last element is guaranteed sorted
        const sortedIndex = n - i - 1;
        const passStates = {};
        passStates[sortedIndex] = 'sorted';

        builder.addStep({
            array: workingArr,
            states: passStates,
            highlightLines: [11],
            variables: { n, i, j: "-", swapped },
            log: `Pass i = ${i} complete. Element at index ${sortedIndex} (${workingArr[sortedIndex]}) is now in its final sorted position.`
        });

        if (!swapped) {
            builder.addStep({
                array: workingArr,
                highlightLines: [11, 12],
                variables: { n, i, j: "-", swapped },
                log: `Optimization triggered: no swaps occurred in this entire pass. Array is fully sorted!`
            });
            break;
        }
    }

    const sortedStates = {};
    for (let k = 0; k < workingArr.length; k++) sortedStates[k] = 'sorted';
    builder.addStep({
        array: workingArr,
        states: sortedStates,
        highlightLines: [1],
        variables: {},
        log: "Bubble Sort Complete! The entire array is sorted."
    });

    return builder.steps;
}
