# 🦋 ExplainQuantumComputing

> **A Better Way to Think About Quantum Computers**  
> *An interactive, visual, and mathematical explainer for understanding the true magic of quantum computation — without the misleading "parallel universes" myth.*

Built for **Moth Quantum Hackathon (MothHack)** using the **Moth Quantum Atlas API** (`graph-v1`) and deployed on **Vercel**.

---

## 🌟 The Core Premise

Popular science often explains quantum computers with the classic line:
> *"A classical computer checks one answer at a time, but a quantum computer tries all possibilities simultaneously in parallel worlds!"*

**This explanation is misleading and sets up the wrong mental model.** If quantum computers simply evaluated all inputs in parallel, measurement would randomly spit out a useless random guess among $2^n$ candidates.

**ExplainQuantumComputing** walks through the actual physical and mathematical reality:
1. **Classical state vectors:** A classical 300-bit computer operates on a tiny list of 300 voltages. The $2^{300}$ combinations tree is merely an *imaginary ghost*.
2. **Quantum reality:** A 300-qubit entangled quantum computer physically maintains and manipulates a colossal **$2^{300}$ complex state vector**.
3. **Physical control:** Quantum gates physically rotate and alter this exponential state vector like an Archimedes lever.
4. **The Catch (Measurement Collapse):** You cannot peek inside the state vector directly. A measurement collapses the superposition into a single classical outcome.
5. **The Real Algorithm Strategy:** Algorithms like **Grover's Algorithm** use destructive interference and amplitude rotation to concentrate almost 100% of the probability weight onto the correct answer before measuring!

---

## 🚀 Interactive Highlights Across 19 Slides

| Slide | Topic | Interactive Feature |
| :---: | :--- | :--- |
| **01–04** | **The Myth vs Reality** | Interactive Mascot & foundational concepts |
| **05** | **Continuous States** | Interactive angle wheel showing classical continuous degrees of freedom |
| **06** | **Classical Turing Machine** | Animated infinite ticker tape & sequential finite-state automaton |
| **07–09** | **Classical 3-SAT & Circuit** | Logic circuit schematic with interactive switches (AND, OR, NOT, NAND) & 2ⁿ truth table |
| **10** | **The Classical Imaginary Ghost** | Floating ghost actor showing why $2^n$ search space is hypothetical |
| **11** | **Quantum Reality** | Visualizing the physically active $2^n$ complex state vector |
| **12** | **Entanglement Lab** | **Powered by Moth Quantum:** Live 1,024-run comparison between Unentangled Product State and Entangled Bell State |
| **13** | **Archimedes Lever** | 300 physical knobs tilting a giant $2^{300}$ state vector earth |
| **14** | **Measurement Collapse** | **Powered by Moth Quantum:** Normalized fractions state vector with a fully complex term and 1,024-run frequency table |
| **15** | **Amplitude Amplification** | Interactive Grover amplification demo & 3Blue1Brown visual guide link |
| **16** | **High-Dimensional Metaphor** | Cute animated stick-figure cat watching a high-dimensional stick collapse |
| **17–19** | **Takeaways & Navigator** | Complete mental model summary & keyboard-accessible Slide Navigator |

---

## 🦋 Moth Quantum Atlas API Integration

ExplainQuantumComputing integrates directly with **Moth Quantum's Atlas Engine API**:

- **Engine:** `graph-v1` (graph Hamiltonian evolution & quantum measurements).
- **Entanglement Verification (Slide 12):** Executes 1,024 runs on an unentangled product state vs a coupled Bell state ($|\Phi^+\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$), demonstrating instant state correlation.
- **Superposition Measurement (Slide 14):** Submits a 3-qubit state vector:
  $$|\psi\rangle = \tfrac{1}{2}|000\rangle - \tfrac{1}{2}|001\rangle + \left(\tfrac{1}{4} + \tfrac{1}{4}i\right)|010\rangle + \tfrac{1}{\sqrt{8}}|011\rangle + \tfrac{1}{4}|100\rangle - \tfrac{1}{4}|101\rangle + \tfrac{i}{4}|110\rangle + \tfrac{1}{4}|111\rangle$$
  and observes the collapsed frequency table across 1,024 runs matching the exact probabilities:
  - $|000\rangle, |001\rangle \to 25.0\%$ (256 runs)
  - $|010\rangle \to 12.5\%$ (128 runs) — *[Fully complex amplitude: $\frac{1}{4} + \frac{1}{4}i$]*
  - $|011\rangle \to 12.5\%$ (128 runs)
  - $|100\rangle..|111\rangle \to 6.25\%$ (64 runs each)
- **Zero-Key Fallback:** If no Moth API key is provided, a built-in offline quantum simulator powered by Mulberry32 PRNG executes realistic multinomial quantum distributions.
- **Hardware Targets:** Support for Local Simulator, Moth Cloud Emulator (`emu`), and Real IBM Quantum Hardware (`qpu`).

---

## ⚡ Vercel Deployment & CORS Edge Proxy

To prevent browser CORS blocks when contacting `api.mothquantum.com`, the project includes a **Vercel Edge Proxy**:

- `api/[...path].js`: Runs on Vercel's global Edge network with 0ms cold starts.
- Forwards requests from `/api/v1/*` to `https://api.mothquantum.com/api/v1/*` while preserving `Authorization: Bearer <moth_key>` headers and injecting open CORS headers.
- When running on `*.vercel.app`, the client in `js/atlas.js` automatically routes through `/api/v1` with zero configuration needed.

---

## ⌨️ Controls & Navigation

- **Next Slide:** <kbd>→</kbd> or <kbd>Space</kbd> or click **Next →**
- **Previous Slide:** <kbd>←</kbd> or click **← Back**
- **Slide Navigator:** Press <kbd>S</kbd> or click **📑 1 / 19 ▾** in the header or **📑 All Slides** in the footer to open the searchable slide drawer.
- **Search Slides:** Type keywords (e.g. `Bell`, `Grover`, `Cat`, `Turing`) in the navigator.
- **Moth Settings:** Click the butterfly pill **🦋 Moth** in the header to enter an API key or switch execution targets (`local`, `emu`, `qpu`).

---

## 🛠️ Local Development

To run locally without Vercel:

```bash
# Clone the repository
git clone https://github.com/omgkaustav/ExplainQuantumComputing.git
cd ExplainQuantumComputing

# Run any static web server
python3 -m http.server 3000
# or
npx serve .
```

Open `http://localhost:3000` in any browser!

---

## 📜 Credits & License

- Created for **Moth Quantum Hackathon (MothHack)**.
- KaTeX for LaTeX mathematical typesetting.
- Inspired by quantum complexity theory and educational animations by 3Blue1Brown and Scott Aaronson.
- MIT License.
