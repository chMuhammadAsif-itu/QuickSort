# VisualSort Pro ⚡

An interactive, high-performance web-based visualization workspace for sorting algorithms. Focuses on **Quick Sort** (Lomuto and Hoare partitioning schemes) and **Recursion Trees**, while supporting other standard sorting algorithms like **Merge Sort, Heap Sort, Insertion Sort, and Bubble Sort**.

## 🚀 Live Demo
Once deployed to GitHub Pages, the project can be accessed live:
**👉 [View Live Demo Placeholder](https://your-github-username.github.io/QuickSort/)** *(Update this link with your username after creating the repository!)*

---

## 🎨 Visual States Color Legend
- 🟣 **Purple / White Border**: Active pivot value chosen for partitioning.
- 🔵 **Cyan / Blue Glow**: Elements currently being compared.
- 🔴 **Hot Pink / Red Glow**: Elements currently swapping or writing to memory.
- 🟢 **Emerald Green / Green Glow**: Elements confirmed to be in their final sorted positions.

---

## ✨ Features
1. **Interactive Recursion Tree**:
   - SVG-based recursion tree for Quick Sort and Merge Sort.
   - Shows size/pivots and index bounds (e.g. `[low..high]`) at each stack frame.
   - Highlights the currently active stack frame and completed branches dynamically.
   - Supports **smooth drag-to-pan** and **mouse-wheel zoom-in/out** directly on the canvas, plus quick control buttons.
2. **C++ Line-by-Line Trace**:
   - Side-by-side formatted C++ execution panel.
   - Highlights the exact lines of code executing in synchronization with the array bars.
3. **Live Variable Tracker**:
   - Displays real-time values of indices (`low`, `high`, `i`, `j`) and current `pivot` inside memory.
4. **Playback Controls**:
   - Step forward, step backward, play, pause, and speed adjustments.
   - Custom size sliders (5 to 50 items) and speed parameters.
5. **Custom Arrays Input**:
   - Provide a custom comma-separated list of integers to visualize specific test cases.
6. **Detailed Complexities**:
   - View worst, average, and best time complexities, space constraints, stability parameters, advantages, and drawbacks on the fly.

---

## 💻 Running Locally

Since this project uses modern JavaScript ES Modules (`type="module"`), standard web browsers block direct loading of modules over the local file protocol (`file://`) due to CORS security policies. You should run a simple local web server to run the project.

Here are a few quick ways to do it (pick one):

### Option A: Using Python (Pre-installed on most OS)
Open your terminal inside the directory and run:
```bash
python -m http.server 8000
```
Then visit **[http://localhost:8000](http://localhost:8000)** in your web browser.

### Option B: Using Node.js (npm)
If you have Node.js installed, run:
```bash
npx http-server
```
or
```bash
npx live-server
```
Then visit the URL displayed in your terminal (usually `http://127.0.0.1:8080`).

---

## 🌐 How to Create a GitHub Repository & Deploy (GitHub Pages)

Follow these steps to upload the code to GitHub and host it live online:

### Step 1: Initialize Git and Commit Code
Open your terminal in the `QuickSort` directory:
```bash
# 1. Initialize local git repository
git init

# 2. Add all project files
git add .

# 3. Create initial commit
git commit -m "feat: initial release of VisualSort Pro"
```

### Step 2: Create a Repository on GitHub
1. Go to [github.com](https://github.com/) and log in.
2. Click the **"New"** button in the top left to create a repository.
3. Name it `QuickSort` (or any name you prefer).
4. Set the visibility to **Public** (important for free hosting!).
5. Do **NOT** initialize the repository with a README, `.gitignore`, or license (we already created them).
6. Click **"Create repository"**.

### Step 3: Link Local Git to GitHub and Push
Copy the commands shown in the repository setup page under "or push an existing repository from the command line" and run them:
```bash
# Link the local repository to your new GitHub repository
git remote add origin https://github.com/<your-username>/QuickSort.git

# Rename default branch to main
git branch -M main

# Push the code to GitHub
git push -u origin main
```

### Step 4: Enable GitHub Pages
1. Go to your repository on github.com.
2. Click on the **Settings** tab (gear icon at the top).
3. Scroll down the left sidebar and click on **Pages**.
4. Under **Build and deployment**, set:
   - **Source**: Deploy from a branch
   - **Branch**: `main` (or `master`)
   - **Folder**: `/ (root)`
5. Click **Save**.
6. Wait 1-2 minutes. Refresh the page, and you will see a banner at the top of the Pages section saying:
   > "Your site is live at: `https://<your-username>.github.io/QuickSort/`"

Copy that link, update the **Live Demo** section at the top of this `README.md`, commit, and push again! 🎉
