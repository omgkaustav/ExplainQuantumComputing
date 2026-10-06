// quantum-demos.js - Interactive Demos for Slides 12, 14, 15, 16 & Moth Settings Modal

// ========================================================
// Moth Quantum Settings Modal Controller
// ========================================================
window.initMothSettingsModal = function() {
  const btnSettings = document.getElementById('btnMothSettings');
  const modalBackdrop = document.getElementById('mothModalBackdrop');
  const btnClose = document.getElementById('btnCloseMothModal');
  const btnCancel = document.getElementById('btnCancelMothModal');
  const btnSave = document.getElementById('btnSaveMothModal');
  const apiKeyInput = document.getElementById('mothApiKeyInput');
  const endpointInput = document.getElementById('mothEndpointInput');
  const headerLabel = document.getElementById('mothHeaderLabel');
  const headerDot = document.getElementById('mothHeaderDot');
  const radioChoices = document.querySelectorAll('input[name="mothEngineChoice"]');

  if (!btnSettings || !modalBackdrop) return;

  function updateHeaderIndicator() {
    if (!window.mothAtlasClient) return;
    const info = window.mothAtlasClient.getStatusDescription();
    if (headerLabel) headerLabel.textContent = info.label;
    if (headerDot) {
      headerDot.className = 'moth-status-dot';
      if (info.source === 'local') headerDot.classList.add('dot-local');
      else if (window.mothAtlasClient.getMode() === 'qpu') headerDot.classList.add('dot-qpu');
      else headerDot.classList.add('dot-emu');
    }
  }

  function openModal() {
    if (!window.mothAtlasClient) return;
    const client = window.mothAtlasClient;
    if (apiKeyInput) apiKeyInput.value = client.getApiKey();
    if (endpointInput) endpointInput.value = client.getEndpoint();

    const currentMode = client.isPreferLocal() ? 'local' : client.getMode();
    radioChoices.forEach(r => {
      r.checked = (r.value === currentMode);
    });

    modalBackdrop.style.display = 'flex';
  }

  function closeModal() {
    modalBackdrop.style.display = 'none';
  }

  btnSettings.addEventListener('click', openModal);
  btnClose?.addEventListener('click', closeModal);
  btnCancel?.addEventListener('click', closeModal);

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  btnSave?.addEventListener('click', () => {
    if (!window.mothAtlasClient) return;
    const client = window.mothAtlasClient;

    let selectedChoice = 'local';
    radioChoices.forEach(r => {
      if (r.checked) selectedChoice = r.value;
    });

    if (apiKeyInput) client.setApiKey(apiKeyInput.value.trim());
    if (endpointInput && endpointInput.value.trim()) client.setEndpoint(endpointInput.value.trim());

    if (selectedChoice === 'local') {
      client.setPreferLocal(true);
    } else {
      client.setPreferLocal(false);
      client.setMode(selectedChoice); // 'emu' or 'qpu'
    }

    updateHeaderIndicator();
    closeModal();

    // Trigger update on active slide if on Slide 12 or 14
    if (window.refreshEntangleStatus) window.refreshEntangleStatus();
    if (window.refreshKetStatus) window.refreshKetStatus();
  });

  // Initial indicator update
  updateHeaderIndicator();
  window.updateMothHeaderIndicator = updateHeaderIndicator;
};


// ========================================================
// Slide 12: 2-Qubit Entanglement Lab (Separable vs Entangled)
// ========================================================
window.initEntanglementLab = function() {
  const btnCompare = document.getElementById('btnRunEntanglementCompare');
  const btnToggleEngine = document.getElementById('btnToggleEntangleEngine');
  const statusDot = document.getElementById('entangleStatusDot');
  const statusText = document.getElementById('entangleStatusText');
  const productBarsRow = document.getElementById('productBarsRow');
  const entangledBarsRow = document.getElementById('entangledBarsRow');
  const productMetric = document.getElementById('productMetricText');
  const entangledMetric = document.getElementById('entangledMetricText');

  if (!btnCompare || !productBarsRow || !entangledBarsRow) return;

  function updateStatusBanner(text, inProgress = false) {
    if (!statusText) return;
    if (text) {
      statusText.innerHTML = text;
    } else {
      const client = window.mothAtlasClient;
      const desc = client ? client.getStatusDescription() : { label: 'Local Simulator' };
      statusText.innerHTML = `<strong>Engine:</strong> ${desc.label} &bull; 1,024 repetitions per state`;
    }

    if (statusDot) {
      statusDot.className = 'status-dot-mini';
      if (inProgress) {
        statusDot.style.background = '#3b82f6';
      } else {
        const client = window.mothAtlasClient;
        if (!client || client.isPreferLocal()) statusDot.style.background = '#eab308';
        else if (client.getMode() === 'qpu') statusDot.style.background = '#a855f7';
        else statusDot.style.background = '#22c55e';
      }
    }
  }

  window.refreshEntangleStatus = () => updateStatusBanner();

  function render4Bars(container, counts, shots, isEntangled) {
    container.innerHTML = '';
    const states = ['00', '01', '10', '11'];
    const maxVal = Math.max(1, ...states.map(s => counts[s] || 0));

    states.forEach(s => {
      const count = counts[s] || 0;
      const pct = (count / shots) * 100;
      const heightPx = Math.max(6, (count / maxVal) * 95);

      const item = document.createElement('div');
      item.className = 'hist-bar-item';

      const countLabel = document.createElement('span');
      countLabel.className = 'hist-bar-count';
      countLabel.textContent = `${pct.toFixed(0)}% (${count})`;

      const barFill = document.createElement('div');
      barFill.className = 'hist-bar-fill';
      barFill.style.height = `${heightPx}px`;

      const barLabel = document.createElement('span');
      barLabel.className = 'hist-bar-label';
      barLabel.textContent = `|${s}⟩`;

      item.appendChild(countLabel);
      item.appendChild(barFill);
      item.appendChild(barLabel);
      container.appendChild(item);
    });
  }

  async function runCompare() {
    btnCompare.disabled = true;
    btnCompare.textContent = 'Running 1,024 repetitions on both... ⏳';

    updateStatusBanner('Preparing quantum circuits on engine...', true);

    try {
      const client = window.mothAtlasClient;
      let results;

      if (client) {
        results = await client.run2QubitEntanglement(1024, (msg) => {
          updateStatusBanner(msg, true);
        });
      } else {
        results = {
          separable: window.simulate2Qubit(false, 1024),
          entangled: window.simulate2Qubit(true, 1024),
          source: 'simulator'
        };
      }

      // Render Separable Bars
      render4Bars(productBarsRow, results.separable.counts, results.separable.shots, false);
      if (productMetric) {
        productMetric.textContent = `Correlation: ${results.separable.correlation >= 0 ? '+' : ''}${results.separable.correlation.toFixed(2)} (Independent)`;
      }

      // Render Entangled Bars
      render4Bars(entangledBarsRow, results.entangled.counts, results.entangled.shots, true);
      if (entangledMetric) {
        const agreePct = (results.entangled.edgeAgreement * 100).toFixed(0);
        entangledMetric.textContent = `Correlation: +${results.entangled.correlation.toFixed(2)} (${agreePct}% Edge Agreement)`;
      }

      const backendTag = results.source === 'atlas' 
        ? `Moth Atlas (${results.mode.toUpperCase()}) &bull; Job: ${results.entangled.jobId.slice(0, 8)}...`
        : 'Local Quantum Simulator';
      
      updateStatusBanner(`<strong>Completed:</strong> Sampled 1,024 times via ${backendTag}!`);
    } catch (err) {
      console.error('Entanglement compare error:', err);
      updateStatusBanner(`Error running jobs: ${err.message}. Showing local simulator fallback.`);
      const sep = window.simulate2Qubit(false, 1024);
      const ent = window.simulate2Qubit(true, 1024);
      render4Bars(productBarsRow, sep.counts, 1024, false);
      render4Bars(entangledBarsRow, ent.counts, 1024, true);
    } finally {
      btnCompare.disabled = false;
      btnCompare.textContent = 'Run 1,024 Times on Both ⚡';
    }
  }

  btnCompare.addEventListener('click', runCompare);
  btnToggleEngine?.addEventListener('click', () => {
    const btn = document.getElementById('btnMothSettings');
    if (btn) btn.click();
  });

  // Run initial default comparison
  updateStatusBanner();
  runCompare();
};


// ========================================================
// Slide 14: Ket Superposition Collapse (Multi-shot & Accumulation)
// ========================================================
window.initKetCollapse = function() {
  const btnMeasure = document.getElementById('btnKetMeasure');
  const btnAccumulate = document.getElementById('btnKetAccumulate');
  const btnReset = document.getElementById('btnKetReset');
  const btnEngineToggle = document.getElementById('btnKetEngineToggle');
  const ketDisplay = document.getElementById('ketStateDisplay');
  const collapseResult = document.getElementById('collapseReceipt');
  const histWrap = document.getElementById('ketHistogramWrap');
  const histTitle = document.getElementById('ketHistTitle');
  const fidelityVal = document.getElementById('ketFidelityVal');
  const barsRow = document.getElementById('ketBarsRow');
  const receiptMeta = document.getElementById('ketReceiptMeta');
  const statusDot = document.getElementById('ketStatusDot');
  const statusText = document.getElementById('ketStatusText');
  const shotsPillsContainer = document.getElementById('ketShotsPills');

  if (!btnMeasure || !ketDisplay) return;

  let currentShots = 8192;
  let accumulatedCounts = {};
  let accumulatedShots = 0;
  let lastBackend = 'Local Quantum Sim';

  function updateKetStatus(text, inProgress = false) {
    if (!statusText) return;
    if (text) {
      statusText.innerHTML = text;
    } else {
      const client = window.mothAtlasClient;
      const desc = client ? client.getStatusDescription() : { label: 'Local Simulator' };
      statusText.innerHTML = `<strong>Engine:</strong> ${desc.label} &bull; Ready for measurement`;
    }

    if (statusDot) {
      statusDot.className = 'status-dot-mini';
      if (inProgress) {
        statusDot.style.background = '#3b82f6';
      } else {
        const client = window.mothAtlasClient;
        if (!client || client.isPreferLocal()) statusDot.style.background = '#eab308';
        else if (client.getMode() === 'qpu') statusDot.style.background = '#a855f7';
        else statusDot.style.background = '#22c55e';
      }
    }
  }

  window.refreshKetStatus = () => updateKetStatus();

  function updateGuideCard(shots) {
    const s = Number(shots) || currentShots;
    const guideSumTag = document.getElementById('ketGuideSumTag');
    const cell1 = document.getElementById('guideCellPct1');
    const cell2 = document.getElementById('guideCellPct2');
    const cell3 = document.getElementById('guideCellPct3');
    const cell4 = document.getElementById('guideCellPct4');

    if (guideSumTag) {
      guideSumTag.innerHTML = `Total Probability $= 100\%$ (${s.toLocaleString()} runs)`;
    }
    if (cell1) {
      cell1.innerHTML = `28.125% <small>(${Math.round(s * (9 / 32)).toLocaleString()} runs each)</small>`;
    }
    if (cell2) {
      cell2.innerHTML = `9.375% <small>(${Math.round(s * (3 / 32)).toLocaleString()} runs each)</small>`;
    }
    if (cell3) {
      cell3.innerHTML = `9.375% <small>(${Math.round(s * (3 / 32)).toLocaleString()} runs each)</small>`;
    }
    if (cell4) {
      cell4.innerHTML = `3.125% <small>(${Math.round(s * (1 / 32)).toLocaleString()} runs each)</small>`;
    }
  }

  // Hook up shot selection pills
  if (shotsPillsContainer) {
    const pills = shotsPillsContainer.querySelectorAll('.shot-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentShots = parseInt(pill.dataset.shots, 10) || 8192;

        if (btnMeasure) {
          btnMeasure.textContent = `⚡ Measure State (Repeat ${currentShots.toLocaleString()} Times) ➔`;
        }
        if (btnAccumulate) {
          btnAccumulate.textContent = `➕ Accumulate +${currentShots.toLocaleString()} More Runs`;
        }
        updateGuideCard(accumulatedShots > 0 ? accumulatedShots : currentShots);
      });
    });
  }

  const THEORETICAL_3Q = {
    '000': { pct: 28.125, frac: 9 / 32, amp: '3/√32' },
    '001': { pct: 28.125, frac: 9 / 32, amp: '3/√32' },
    '010': { pct: 9.375, frac: 3 / 32, amp: '√3/√32' },
    '011': { pct: 9.375, frac: 3 / 32, amp: '√3/√32' },
    '100': { pct: 9.375, frac: 3 / 32, amp: '√3/√32' },
    '101': { pct: 9.375, frac: 3 / 32, amp: '√3/√32' },
    '110': { pct: 3.125, frac: 1 / 32, amp: '1/√32' },
    '111': { pct: 3.125, frac: 1 / 32, amp: '1/√32' }
  };

  function render8Bars(counts, shots, targetBitstring) {
    if (!barsRow) return;
    barsRow.innerHTML = '';

    const states = ['000', '001', '010', '011', '100', '101', '110', '111'];
    const maxVal = Math.max(1, ...states.map(s => counts[s] || 0));

    states.forEach(s => {
      const count = counts[s] || 0;
      const pct = (count / shots) * 100;
      const heightPx = Math.max(8, (count / maxVal) * 95);
      const isTarget = (s === targetBitstring);
      const theo = THEORETICAL_3Q[s] || { pct: 12.5, frac: 0.125 };
      const expectedRuns = Math.round(shots * theo.frac);

      const item = document.createElement('div');
      item.className = 'ket-bar-item' + (isTarget ? ' collapsed-target' : '');
      item.title = `State |${s}⟩: Observed ${count.toLocaleString()} / ${shots.toLocaleString()} (${pct.toFixed(2)}%), Expected ${expectedRuns.toLocaleString()} (${theo.pct}%)`;

      const countLabel = document.createElement('div');
      countLabel.className = 'ket-bar-count';
      countLabel.innerHTML = `
        <span class="bar-obs-pct">${pct.toFixed(1)}%</span>
        <span class="bar-obs-runs">${count.toLocaleString()}</span>
      `;

      const barFill = document.createElement('div');
      barFill.className = 'ket-bar-fill';
      barFill.style.height = `${heightPx}px`;

      const barLabel = document.createElement('div');
      barLabel.className = 'ket-bar-label';
      barLabel.innerHTML = `
        <span class="bar-ket-name">|${s}⟩</span>
        <span class="bar-theo-pct">~${theo.pct}%</span>
      `;

      item.appendChild(countLabel);
      item.appendChild(barFill);
      item.appendChild(barLabel);
      barsRow.appendChild(item);
    });
  }

  function calcFidelity(counts, shots) {
    if (typeof window.computeStateFidelity === 'function') {
      return window.computeStateFidelity(counts, shots);
    }
    let sum = 0;
    const n = Math.max(1, shots);
    for (const [k, theo] of Object.entries(THEORETICAL_3Q)) {
      const obs = (counts[k] || 0) / n;
      sum += Math.sqrt(obs * theo.frac);
    }
    return Math.min(1.0, sum);
  }

  async function handleMeasure() {
    btnMeasure.disabled = true;
    btnMeasure.textContent = `Measuring State (${currentShots.toLocaleString()} Runs)... ⏳`;
    updateKetStatus(`Submitting ${currentShots.toLocaleString()} measurement repetitions to quantum engine...`, true);

    try {
      const client = window.mothAtlasClient;
      let res;

      if (client) {
        res = await client.run3QubitCollapse(currentShots, (msg) => {
          updateKetStatus(msg, true);
        });
      } else {
        res = window.simulate3QubitSuperposition(currentShots);
      }

      // Initialize accumulated state
      accumulatedCounts = { ...res.counts };
      accumulatedShots = res.shots;
      lastBackend = res.source === 'atlas' ? `Moth Atlas (${res.mode.toUpperCase()})` : 'Local Quantum Sim';

      // 1. Fade the superposition formula
      ketDisplay.classList.add('collapsed-faded');

      // 2. Render Single Physical Collapse Receipt
      if (collapseResult) {
        collapseResult.style.display = 'flex';
        collapseResult.innerHTML = `
          <span class="receipt-icon">🧾</span>
          <div>
            <div>Measurement Collapse: <strong style="color: #15803d; font-size: 1.25rem;">|${res.collapsedBitstring}⟩</strong></div>
            <div class="receipt-note">Measuring once physically collapsed the entire superposition into |${res.collapsedBitstring}⟩! Below is the frequency distribution over ${accumulatedShots.toLocaleString()} repeated runs.</div>
          </div>
        `;
      }

      // 3. Render histogram
      if (histWrap) {
        histWrap.style.display = 'flex';
        render8Bars(accumulatedCounts, accumulatedShots, res.collapsedBitstring);
      }

      if (histTitle) {
        histTitle.textContent = `📊 Frequency Table of Outcomes (${accumulatedShots.toLocaleString()} Runs)`;
      }

      // 4. Update Fidelity badge
      const fidelity = calcFidelity(accumulatedCounts, accumulatedShots);
      if (fidelityVal) {
        fidelityVal.textContent = `${(fidelity * 100).toFixed(2)}%`;
      }

      // 5. Metadata footer
      if (receiptMeta) {
        receiptMeta.innerHTML = `
          <span>⚡ <strong>Backend:</strong> ${lastBackend}</span>
          <span>🎯 <strong>Total Repetitions:</strong> ${accumulatedShots.toLocaleString()} runs</span>
          <span>🎯 <strong>State Fidelity:</strong> ${(fidelity * 100).toFixed(2)}%</span>
          <span>🏷️ <strong>Job ID:</strong> ${res.jobId}</span>
          <span>👑 <strong>Dominant Term:</strong> |${res.dominantBitstring}⟩</span>
        `;
      }

      updateGuideCard(accumulatedShots);
      updateKetStatus(`Measurement complete! Collapsed into |${res.collapsedBitstring}⟩ with ${(fidelity * 100).toFixed(2)}% fidelity.`);

      // Update button visibility
      btnMeasure.style.display = 'none';
      if (btnAccumulate) {
        btnAccumulate.style.display = 'inline-flex';
        btnAccumulate.textContent = `➕ Accumulate +${currentShots.toLocaleString()} More Runs`;
      }
      if (btnReset) btnReset.style.display = 'inline-flex';
    } catch (err) {
      console.error('Slide 14 collapse error:', err);
      updateKetStatus(`Error measuring: ${err.message}. Showing local simulator fallback.`);
      const sim = window.simulate3QubitSuperposition(currentShots);
      accumulatedCounts = { ...sim.counts };
      accumulatedShots = sim.shots;
      lastBackend = 'Local Quantum Sim (Fallback)';

      ketDisplay.classList.add('collapsed-faded');
      if (collapseResult) {
        collapseResult.style.display = 'flex';
        collapseResult.innerHTML = `<span class="receipt-icon">🧾</span><div>Collapsed Outcome: <strong>|${sim.collapsedBitstring}⟩</strong></div>`;
      }
      if (histWrap) {
        histWrap.style.display = 'flex';
        render8Bars(accumulatedCounts, accumulatedShots, sim.collapsedBitstring);
      }
      if (histTitle) {
        histTitle.textContent = `📊 Frequency Table of Outcomes (${accumulatedShots.toLocaleString()} Runs)`;
      }
      const fidelity = calcFidelity(accumulatedCounts, accumulatedShots);
      if (fidelityVal) {
        fidelityVal.textContent = `${(fidelity * 100).toFixed(2)}%`;
      }

      btnMeasure.style.display = 'none';
      if (btnAccumulate) {
        btnAccumulate.style.display = 'inline-flex';
        btnAccumulate.textContent = `➕ Accumulate +${currentShots.toLocaleString()} More Runs`;
      }
      if (btnReset) btnReset.style.display = 'inline-flex';
    } finally {
      btnMeasure.disabled = false;
      btnMeasure.textContent = `⚡ Measure State (Repeat ${currentShots.toLocaleString()} Times) ➔`;
    }
  }

  async function handleAccumulate() {
    if (!btnAccumulate) return;
    btnAccumulate.disabled = true;
    btnAccumulate.textContent = `Adding +${currentShots.toLocaleString()} Runs... ⏳`;
    updateKetStatus(`Executing additional ${currentShots.toLocaleString()} runs to converge statistics...`, true);

    try {
      const client = window.mothAtlasClient;
      let res;

      if (client) {
        res = await client.run3QubitCollapse(currentShots, (msg) => {
          updateKetStatus(msg, true);
        });
      } else {
        res = window.simulate3QubitSuperposition(currentShots);
      }

      // Merge counts
      for (const [k, v] of Object.entries(res.counts)) {
        accumulatedCounts[k] = (accumulatedCounts[k] || 0) + v;
      }
      accumulatedShots += res.shots;

      if (collapseResult) {
        collapseResult.innerHTML = `
          <span class="receipt-icon">🧾</span>
          <div>
            <div>Latest Collapse: <strong style="color: #15803d; font-size: 1.25rem;">|${res.collapsedBitstring}⟩</strong> &bull; Total runs: <strong>${accumulatedShots.toLocaleString()}</strong></div>
            <div class="receipt-note">Accumulated ${res.shots.toLocaleString()} more runs! Statistical variance continues to decrease toward theoretical $|c|^2$.</div>
          </div>
        `;
      }

      render8Bars(accumulatedCounts, accumulatedShots, res.collapsedBitstring);

      if (histTitle) {
        histTitle.textContent = `📊 Frequency Table of Outcomes (${accumulatedShots.toLocaleString()} Runs Accumulated)`;
      }

      const fidelity = calcFidelity(accumulatedCounts, accumulatedShots);
      if (fidelityVal) {
        fidelityVal.textContent = `${(fidelity * 100).toFixed(2)}%`;
      }

      if (receiptMeta) {
        receiptMeta.innerHTML = `
          <span>⚡ <strong>Backend:</strong> ${lastBackend}</span>
          <span>🎯 <strong>Total Repetitions:</strong> ${accumulatedShots.toLocaleString()} runs</span>
          <span>🎯 <strong>State Fidelity:</strong> ${(fidelity * 100).toFixed(2)}%</span>
          <span>🏷️ <strong>Latest Job ID:</strong> ${res.jobId}</span>
          <span>👑 <strong>Dominant Term:</strong> |${res.dominantBitstring}⟩</span>
        `;
      }

      updateGuideCard(accumulatedShots);
      updateKetStatus(`Accumulated ${accumulatedShots.toLocaleString()} total runs! Fidelity: ${(fidelity * 100).toFixed(2)}%.`);
    } catch (err) {
      console.error('Slide 14 accumulation error:', err);
      updateKetStatus(`Error accumulating runs: ${err.message}`);
    } finally {
      btnAccumulate.disabled = false;
      btnAccumulate.textContent = `➕ Accumulate +${currentShots.toLocaleString()} More Runs`;
    }
  }

  btnMeasure.addEventListener('click', handleMeasure);
  btnAccumulate?.addEventListener('click', handleAccumulate);

  btnReset?.addEventListener('click', () => {
    ketDisplay.classList.remove('collapsed-faded');
    if (collapseResult) collapseResult.style.display = 'none';
    if (histWrap) histWrap.style.display = 'none';
    if (btnAccumulate) btnAccumulate.style.display = 'none';
    btnMeasure.style.display = 'inline-flex';
    btnReset.style.display = 'none';
    accumulatedCounts = {};
    accumulatedShots = 0;
    updateGuideCard(currentShots);
    updateKetStatus();
  });

  btnEngineToggle?.addEventListener('click', () => {
    const btn = document.getElementById('btnMothSettings');
    if (btn) btn.click();
  });

  // Ensure Slide 14 math is rendered cleanly
  if (typeof renderMathInElement === 'function' && ketDisplay) {
    try {
      renderMathInElement(ketDisplay.closest('.slide-content') || ketDisplay.parentElement, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false
      });
    } catch (_) {}
  }

  updateGuideCard(currentShots);
  updateKetStatus();
};


// ========================================================
// Slide 15: Grover Amplification Demo
// ========================================================
window.initGroverAmplification = function() {
  const barsContainer = document.getElementById('groverBarsContainer');
  const btnAmplify = document.getElementById('btnGroverStep');
  const btnReset = document.getElementById('btnGroverReset');
  const groverStepText = document.getElementById('groverStepText');

  if (!barsContainer) return;

  const numItems = 8;
  const targetIndex = 5; // |101⟩
  let step = 0;

  function getAmplitudes(s) {
    const theta = Math.asin(1 / Math.sqrt(numItems));
    const angle = (2 * s + 1) * theta;
    const targetAmp = Math.sin(angle);
    const otherAmp = Math.cos(angle) / Math.sqrt(numItems - 1);
    return { targetAmp, otherAmp };
  }

  function renderBars() {
    barsContainer.innerHTML = '';
    const { targetAmp, otherAmp } = getAmplitudes(step);

    for (let i = 0; i < numItems; i++) {
      const isTarget = (i === targetIndex);
      const amp = isTarget ? targetAmp : otherAmp;
      const prob = Math.min(1, Math.pow(amp, 2));

      const barWrap = document.createElement('div');
      barWrap.className = 'grover-bar-wrap' + (isTarget ? ' target-wrap' : '');

      const barFill = document.createElement('div');
      barFill.className = 'grover-bar-fill' + (isTarget ? ' target-fill' : '');
      barFill.style.height = `${Math.max(6, prob * 120)}px`;

      const label = document.createElement('span');
      label.className = 'grover-bar-label';
      label.textContent = `|${i.toString(2).padStart(3, '0')}⟩`;

      const pct = document.createElement('span');
      pct.className = 'grover-bar-pct';
      pct.textContent = `${(prob * 100).toFixed(0)}%`;

      barWrap.appendChild(pct);
      barWrap.appendChild(barFill);
      barWrap.appendChild(label);
      barsContainer.appendChild(barWrap);
    }

    if (groverStepText) {
      groverStepText.textContent = `Grover Iteration: Step ${step} / 2 (Target |101⟩ probability: ${(Math.pow(getAmplitudes(step).targetAmp, 2) * 100).toFixed(0)}%)`;
    }
  }

  btnAmplify?.addEventListener('click', () => {
    if (step < 2) step++;
    renderBars();
  });

  btnReset?.addEventListener('click', () => {
    step = 0;
    renderBars();
  });

  renderBars();
};


// ========================================================
// Slide 16: Cat Playing with High-Dimensional Shape & Stick Falling Flat
// ========================================================
window.initCatStick = function() {
  const btnReplay = document.getElementById('btnReplayCat');
  const stickArm = document.getElementById('stickPivotArm');
  const highDimOverlay = document.getElementById('stickHighDimOverlay');
  const outcomeLabel = document.getElementById('stickAngleLabel');

  if (!btnReplay || !stickArm || !highDimOverlay) return;

  function runFallAnimation() {
    // 1. Reset stick upright & restore high-dimensional overlay
    stickArm.style.transition = 'none';
    stickArm.style.transform = 'rotate(0deg)';
    highDimOverlay.style.transition = 'none';
    highDimOverlay.style.opacity = '0.85';
    if (outcomeLabel) outcomeLabel.innerHTML = 'Measuring collapse...';

    // 2. Trigger falling animation after short breath
    setTimeout(() => {
      // Pick falling fully flat to the LEFT (-90deg) or RIGHT (+90deg)
      const isRight = Math.random() < 0.5;
      const targetDeg = isRight ? 90 : -90;

      stickArm.style.transition = 'transform 0.78s cubic-bezier(0.2, 0.85, 0.35, 1.15)';
      stickArm.style.transform = `rotate(${targetDeg}deg)`;

      // High-dimensional shape smoothly becomes completely transparent as stick falls
      highDimOverlay.style.transition = 'opacity 0.7s ease-out';
      highDimOverlay.style.opacity = '0';

      // Update outcome label upon landing flat
      setTimeout(() => {
        if (outcomeLabel) {
          outcomeLabel.innerHTML = `Measurement complete: State collapsed into a single outcome.`;
        }
      }, 720);
    }, 150);
  }

  btnReplay.onclick = runFallAnimation;

  // Run automatically when reaching Slide 16
  runFallAnimation();
};
