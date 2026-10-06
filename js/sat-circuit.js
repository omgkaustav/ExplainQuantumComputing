// Slide 8 & 9: Real Logic Circuit Schematic with Physical Switches & Full Truth Table Engine

window.initSatCircuit = function() {
  const switchEls = document.querySelectorAll('.sat-switch-btn');
  const lightbulb = document.getElementById('satLightbulb');
  const tallyTested = document.getElementById('satTallyTested');
  const tallyCount = document.getElementById('satTallyCount');
  const btnCycle = document.getElementById('btnSatCycle');
  const btnStep = document.getElementById('btnSatStep');
  const btnReset = document.getElementById('btnSatReset');

  // Exact boolean logic for the circuit:
  // Gate 1 (AND): A = x0 AND x1
  // Gate 2 (XOR): B = x2 XOR x3
  // Gate 3 (NOT): C = NOT x4
  // Gate 4 (OR):  D = A OR B
  // Gate 5 (AND): OUT = D AND C
  function evaluateCircuit(val) {
    const x0 = (val >> 4) & 1;
    const x1 = (val >> 3) & 1;
    const x2 = (val >> 2) & 1;
    const x3 = (val >> 1) & 1;
    const x4 = val & 1;

    const A = (x0 & x1);
    const B = (x2 ^ x3);
    const C = (x4 === 0 ? 1 : 0);
    const D = (A | B);
    const OUT = (D & C);

    return { x0, x1, x2, x3, x4, A, B, C, D, OUT };
  }

  window.evaluateSatCircuit = evaluateCircuit;

  // --- Render Slide 9 Full Truth Table (All 32 Rows) ---
  const ttContainer = document.getElementById('fullTruthTableContainer');
  if (ttContainer && ttContainer.children.length === 0) {
    // Split into 2 columns: Column 1 (rows 0..15), Column 2 (rows 16..31)
    for (let col = 0; col < 2; col++) {
      const colEl = document.createElement('div');
      colEl.className = 'tt-column';

      const tableEl = document.createElement('table');
      tableEl.className = 'tt-table';
      tableEl.innerHTML = `
        <thead>
          <tr>
            <th>#</th>
            <th>x₀ x₁ x₂ x₃ x₄</th>
            <th>OUT</th>
          </tr>
        </thead>
        <tbody></tbody>
      `;
      const tbody = tableEl.querySelector('tbody');

      const startIdx = col * 16;
      const endIdx = startIdx + 16;

      for (let i = startIdx; i < endIdx; i++) {
        const res = evaluateCircuit(i);
        const binStr = `${res.x0} ${res.x1} ${res.x2} ${res.x3} ${res.x4}`;
        const isOne = (res.OUT === 1);

        const tr = document.createElement('tr');
        tr.className = isOne ? 'row-one' : 'row-zero';
        tr.innerHTML = `
          <td class="col-idx">${String(i).padStart(2, '0')}</td>
          <td class="col-bits">${binStr}</td>
          <td class="col-out"><span class="out-badge ${isOne ? 'badge-one' : 'badge-zero'}">${res.OUT}</span></td>
        `;
        tbody.appendChild(tr);
      }

      colEl.appendChild(tableEl);
      ttContainer.appendChild(colEl);
    }
  }

  // --- Slide 8 Circuit Interactive Logic ---
  if (!tallyTested) return;

  let currentVal = 0; // 0 to 31
  let isCycling = false;
  let cycleTimer = null;
  let testedSet = new Set();
  let totalOnCount = 0;

  const yCoords = [35, 75, 115, 155, 205];

  function updateKnifeSwitch(idx, val) {
    const y = yCoords[idx];
    const blade = document.getElementById(`sw-blade-${idx}`);
    const knob = document.getElementById(`sw-knob-${idx}`);
    const badge = document.getElementById(`sw-badge-${idx}`);

    if (blade && knob) {
      if (val === 1) {
        // Closed / ON
        blade.setAttribute('d', `M 48 ${y} L 95 ${y}`);
        blade.classList.add('blade-closed');
        blade.classList.remove('blade-open');
        knob.setAttribute('cx', '92');
        knob.setAttribute('cy', `${y}`);
        knob.classList.add('knob-on');
      } else {
        // Open / OFF (tilted up blade)
        blade.setAttribute('d', `M 48 ${y} L 85 ${y - 20}`);
        blade.classList.remove('blade-closed');
        blade.classList.add('blade-open');
        knob.setAttribute('cx', '85');
        knob.setAttribute('cy', `${y - 20}`);
        knob.classList.remove('knob-on');
      }
    }

    if (badge) {
      badge.textContent = val === 1 ? 'ON (1)' : 'OFF (0)';
      badge.classList.toggle('badge-on', val === 1);
    }
  }

  function updateWire(id, val) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('wire-on', val === 1);
    el.classList.toggle('wire-off', val === 0);
  }

  function updateGate(id, val) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('gate-on', val === 1);
  }

  function renderCircuit(val) {
    const state = evaluateCircuit(val);
    const bits = [state.x0, state.x1, state.x2, state.x3, state.x4];

    // Update switch UI buttons & SVG knife-switches
    bits.forEach((b, idx) => {
      if (switchEls[idx]) {
        switchEls[idx].textContent = b;
        switchEls[idx].classList.toggle('active', b === 1);
      }
      updateKnifeSwitch(idx, b);
    });

    // Update wire highlights
    updateWire('wire-in-x0', state.x0);
    updateWire('wire-in-x1', state.x1);
    updateWire('wire-in-x2', state.x2);
    updateWire('wire-in-x3', state.x3);
    updateWire('wire-in-x4', state.x4);

    updateWire('wire-and-out', state.A);
    updateWire('wire-xor-out', state.B);
    updateWire('wire-not-out', state.C);
    updateWire('wire-or-out', state.D);
    updateWire('wire-final-out', state.OUT);

    // Update gate highlights
    updateGate('gate-and-shape', state.A);
    updateGate('gate-xor-shape', state.B);
    updateGate('gate-not-shape', state.C);
    updateGate('gate-or-shape', state.D);
    updateGate('gate-final-shape', state.OUT);

    // Update output lightbulb
    if (lightbulb) {
      lightbulb.classList.toggle('lit', state.OUT === 1);
      lightbulb.innerHTML = state.OUT === 1 ? '💡 Output: <strong>1</strong>' : '⚪ Output: <strong>0</strong>';
    }

    // Tally accounting
    if (!testedSet.has(val)) {
      testedSet.add(val);
      if (state.OUT === 1) totalOnCount++;
    }

    tallyTested.textContent = `${testedSet.size} / 32`;
    tallyCount.textContent = totalOnCount;
  }

  function stepCircuit() {
    currentVal = (currentVal + 1) % 32;
    renderCircuit(currentVal);
  }

  function toggleCycle() {
    if (isCycling) {
      clearInterval(cycleTimer);
      isCycling = false;
      btnCycle.textContent = 'Auto Cycle ▶';
      btnCycle.classList.remove('primary');
      btnCycle.classList.add('secondary');
    } else {
      isCycling = true;
      btnCycle.textContent = 'Pause ⏸';
      btnCycle.classList.remove('secondary');
      btnCycle.classList.add('primary');
      cycleTimer = setInterval(stepCircuit, 300);
    }
  }

  function resetCircuit() {
    if (isCycling) toggleCycle();
    currentVal = 0;
    testedSet.clear();
    totalOnCount = 0;
    renderCircuit(currentVal);
  }

  btnStep?.addEventListener('click', () => {
    if (isCycling) toggleCycle();
    stepCircuit();
  });

  btnCycle?.addEventListener('click', toggleCycle);
  btnReset?.addEventListener('click', resetCircuit);

  // Allow clicking on switch buttons
  switchEls.forEach((sw, idx) => {
    sw.addEventListener('click', () => {
      if (isCycling) toggleCycle();
      const shift = 4 - idx;
      currentVal ^= (1 << shift);
      renderCircuit(currentVal);
    });
  });

  // Allow clicking directly on the SVG knife-switches!
  document.querySelectorAll('.svg-switch-unit').forEach(unit => {
    unit.addEventListener('click', () => {
      if (isCycling) toggleCycle();
      const idx = parseInt(unit.getAttribute('data-idx'), 10);
      const shift = 4 - idx;
      currentVal ^= (1 << shift);
      renderCircuit(currentVal);
    });
  });

  // Initial render
  renderCircuit(currentVal);
};
