export const codeSnippets = {
    "quick-lomuto": {
        name: "Quick Sort (Lomuto Partition)",
        timeWorst: "O(N²)",
        timeAvg: "O(N log N)",
        timeBest: "O(N log N)",
        spaceWorst: "O(log N)",
        stable: "No",
        inplace: "Yes",
        code: `void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pIndex = partition(arr, low, high);
        quickSort(arr, low, pIndex - 1);
        quickSort(arr, pIndex + 1, high);
    }
}

int partition(int arr[], int low, int high) {
    int pivot = arr[high]; // Lomuto pivot is the last element
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i + 1], arr[high]);
    return i + 1;
}`,
        advantages: [
            "Highly efficient in practice with cache-friendly access patterns.",
            "Lomuto partition is easier to implement and conceptualize than Hoare's.",
            "Requires only O(log N) auxiliary space for the recursive call stack."
        ],
        drawbacks: [
            "Worst-case time complexity is O(N²) when the pivot choices are poor (e.g., already sorted array).",
            "Not stable: does not preserve the relative order of equal elements.",
            "Lomuto does more swaps on average than Hoare partition when elements are duplicates."
        ]
    },
    "quick-hoare": {
        name: "Quick Sort (Hoare Partition)",
        timeWorst: "O(N²)",
        timeAvg: "O(N log N)",
        timeBest: "O(N log N)",
        spaceWorst: "O(log N)",
        stable: "No",
        inplace: "Yes",
        code: `void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pIndex = partition(arr, low, high);
        quickSort(arr, low, pIndex);
        quickSort(arr, pIndex + 1, high);
    }
}

int partition(int arr[], int low, int high) {
    int pivot = arr[low]; // Hoare pivot is the first element
    int i = low - 1;
    int j = high + 1;
    while (true) {
        do { i++; } while (arr[i] < pivot);
        do { j--; } while (arr[j] > pivot);
        if (i >= j) return j;
        swap(arr[i], arr[j]);
    }
}`,
        advantages: [
            "Performs three times fewer swaps on average compared to Lomuto's partition.",
            "Efficient even when there are many duplicate values.",
            "In-place sorting with minimal auxiliary memory usage."
        ],
        drawbacks: [
            "More complex pointer loops, making it harder to implement without bugs.",
            "Unstable sort (does not preserve relative index of equal elements).",
            "Still suffers from O(N²) worst-case on already sorted or reverse-sorted inputs if pivot selection is naive."
        ]
    },
    "merge": {
        name: "Merge Sort",
        timeWorst: "O(N log N)",
        timeAvg: "O(N log N)",
        timeBest: "O(N log N)",
        spaceWorst: "O(N)",
        stable: "Yes",
        inplace: "No",
        code: `void mergeSort(int arr[], int l, int r) {
    if (l < r) {
        int m = l + (r - l) / 2;
        mergeSort(arr, l, m);
        mergeSort(arr, m + 1, r);
        merge(arr, l, m, r);
    }
}

void merge(int arr[], int l, int m, int r) {
    int n1 = m - l + 1;
    int n2 = r - m;
    int L[n1], R[n2];
    for(int i=0; i<n1; i++) L[i] = arr[l+i];
    for(int j=0; j<n2; j++) R[j] = arr[m+1+j];
    int i=0, j=0, k=l;
    while(i < n1 && j < n2) {
        if(L[i] <= R[j]) arr[k++] = L[i++];
        else arr[k++] = R[j++];
    }
    while(i < n1) arr[k++] = L[i++];
    while(j < n2) arr[k++] = R[j++];
}`,
        advantages: [
            "Guaranteed O(N log N) time complexity in the best, worst, and average cases.",
            "Stable sorting algorithm, preserving original ordering of equal keys.",
            "Excellent for sorting extremely large datasets (external sorting)."
        ],
        drawbacks: [
            "Requires O(N) additional auxiliary space to copy sub-arrays, making it memory intensive.",
            "Slower in practice for smaller, in-memory arrays compared to Quick Sort or Insertion Sort.",
            "Not an in-place sorting algorithm."
        ]
    },
    "heap": {
        name: "Heap Sort",
        timeWorst: "O(N log N)",
        timeAvg: "O(N log N)",
        timeBest: "O(N log N)",
        spaceWorst: "O(1)",
        stable: "No",
        inplace: "Yes",
        code: `void heapSort(int arr[], int n) {
    // Build max heap
    for (int i = n / 2 - 1; i >= 0; i--)
        heapify(arr, n, i);
    // Extract elements one by one
    for (int i = n - 1; i > 0; i--) {
        swap(arr[0], arr[i]);
        heapify(arr, i, 0); // heapify root
    }
}

void heapify(int arr[], int n, int i) {
    int largest = i;
    int l = 2 * i + 1; // left child
    int r = 2 * i + 2; // right child
    if (l < n && arr[l] > arr[largest]) largest = l;
    if (r < n && arr[r] > arr[largest]) largest = r;
    if (largest != i) {
        swap(arr[i], arr[largest]);
        heapify(arr, n, largest);
    }
}`,
        advantages: [
            "Guaranteed O(N log N) worst-case time with only O(1) auxiliary space (in-place).",
            "No overhead from recursive function calls compared to Quick Sort.",
            "Highly reliable for real-time systems where worst-case memory/time limits are strict."
        ],
        drawbacks: [
            "Poor cache locality: frequently jumps across elements (child node math), making it slower than Quick Sort on modern CPUs.",
            "Not stable: can shift equal elements unpredictably during heapify swaps.",
            "Harder to parallelize compared to Merge Sort."
        ]
    },
    "insertion": {
        name: "Insertion Sort",
        timeWorst: "O(N²)",
        timeAvg: "O(N²)",
        timeBest: "O(N)",
        spaceWorst: "O(1)",
        stable: "Yes",
        inplace: "Yes",
        code: `void insertionSort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j = j - 1;
        }
        arr[j + 1] = key;
    }
}`,
        advantages: [
            "Adaptive: runs in O(N) time when the array is already sorted or nearly sorted.",
            "Stable and in-place sorting.",
            "Extremely low overhead, making it faster than O(N log N) algorithms for very small arrays (N < 15)."
        ],
        drawbacks: [
            "Highly inefficient for large datasets as worst and average cases require O(N²) comparisons and writes.",
            "Requires many shifts/writes in memory when elements are out of order."
        ]
    },
    "bubble": {
        name: "Bubble Sort",
        timeWorst: "O(N²)",
        timeAvg: "O(N²)",
        timeBest: "O(N)",
        spaceWorst: "O(1)",
        stable: "Yes",
        inplace: "Yes",
        code: `void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) break; // Optimization
    }
}`,
        advantages: [
            "Very simple to explain, understand, and write.",
            "Requires only O(1) auxiliary space (in-place).",
            "Stable: elements with equal values retain their relative order."
        ],
        drawbacks: [
            "Severely slow: O(N²) average and worst-case time complexity makes it impractical for real-world scenarios.",
            "Performs excessive swaps (writes), which is memory-bus intensive."
        ]
    }
};
