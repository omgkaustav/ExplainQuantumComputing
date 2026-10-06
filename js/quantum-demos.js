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
// Slide 14: Ket Superposition Collapse (3 Qubits x 1024 Shots)
// ========================================================
window.initKetCollapse = function() {
  const btnMeasure = document.getElementById('btnKetMeasure');
  const btnReset = document.getElementById('btnKetReset');
  const btnEngineToggle = document.getElementById('btnKetEngineToggle');
  const ketDisplay = document.getElementById('ketStateDisplay');
  const collapseResult = document.getElementById('collapseReceipt');
  const histWrap = document.getElementById('ketHistogramWrap');
  const barsRow = document.getElementById('ketBarsRow');
  const receiptMeta = document.getElementById('ketReceiptMeta');
  const statusDot = document.getElementById('ketStatusDot');
  const statusText = document.getElementById('ketStatusText');

  if (!btnMeasure || !ketDisplay) return;

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

  const THEORETICAL_3Q = {
    '000': { pct: 25.0, runs: 256, amp: '1/2' },
    '001': { pct: 25.0, runs: 256, amp: '-1/2' },
    '010': { pct: 12.5, runs: 128, amp: '1/4 + 1/4i' },
    '011': { pct: 12.5, runs: 128, amp: '1/√8' },
    '100': { pct: 6.25, runs: 64, amp: '1/4' },
    '101': { pct: 6.25, runs: 64, amp: '-1/4' },
    '110': { pct: 6.25, runs: 64, amp: 'i/4' },
    '111': { pct: 6.25, runs: 64, amp: '1/4' }
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
      const theo = THEORETICAL_3Q[s] || { pct: 12.5, runs: 128 };

      const item = document.createElement('div');
      item.className = 'ket-bar-item' + (isTarget ? ' collapsed-target' : '');
      item.title = `State |${s}⟩: Observed ${count} / ${shots} (${pct.toFixed(2)}%), Expected ${theo.runs} (${theo.pct}%)`;

      const countLabel = document.createElement('div');
      countLabel.className = 'ket-bar-count';
      countLabel.innerHTML = `
        <span class="bar-obs-pct">${pct.toFixed(1)}%</span>
        <span class="bar-obs-runs">${count}</span>
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

  async function handleMeasure() {
    btnMeasure.disabled = true;
    btnMeasure.textContent = 'Measuring State... ⏳';
    updateKetStatus('Sending measurement operator to quantum engine...', true);

    try {
      const client = window.mothAtlasClient;
      let res;

      if (client) {
        res = await client.run3QubitCollapse(1024, (msg) => {
          updateKetStatus(msg, true);
        });
      } else {
        res = window.simulate3QubitSuperposition(1024);
      }

      // 1. Fade the superposition formula
      ketDisplay.classList.add('collapsed-faded');

      // 2. Render Single Physical Collapse Receipt
      if (collapseResult) {
        collapseResult.style.display = 'flex';
        collapseResult.innerHTML = `
          <span class="receipt-icon">🧾</span>
          <div>
            <div>Measurement Collapse: <strong style="color: #15803d; font-size: 1.25rem;">|${res.collapsedBitstring}⟩</strong></div>
            <div class="receipt-note">Measuring once collapsed the entire superposition into this single classical outcome!</div>
          </div>
        `;
      }

      // 3. Render 1024-shot histogram
      if (histWrap) {
        histWrap.style.display = 'flex';
        render8Bars(res.counts, res.shots, res.collapsedBitstring);
      }

      // 4. Metadata footer
      if (receiptMeta) {
        const modeLabel = res.source === 'atlas' ? `Moth Atlas (${res.mode.toUpperCase()})` : 'Local Quantum Sim';
        receiptMeta.innerHTML = `
          <span>⚡ <strong>Backend:</strong> ${modeLabel}</span>
          <span>🎯 <strong>Repetitions:</strong> 1,024 runs</span>
          <span>🏷️ <strong>Job ID:</strong> ${res.jobId}</span>
          <span>👑 <strong>Dominant Term:</strong> |${res.dominantBitstring}⟩</span>
        `;
      }

      updateKetStatus(`Measurement complete! Collapsed into |${res.collapsedBitstring}⟩.`);

      btnMeasure.style.display = 'none';
      if (btnReset) btnReset.style.display = 'inline-flex';
    } catch (err) {
      console.error('Slide 14 collapse error:', err);
      updateKetStatus(`Error measuring: ${err.message}. Showing local simulator fallback.`);
      const sim = window.simulate3QubitSuperposition(1024);
      ketDisplay.classList.add('collapsed-faded');
      if (collapseResult) {
        collapseResult.style.display = 'flex';
        collapseResult.innerHTML = `<span class="receipt-icon">🧾</span><div>Collapsed Outcome: <strong>|${sim.collapsedBitstring}⟩</strong></div>`;
      }
      if (histWrap) {
        histWrap.style.display = 'flex';
        render8Bars(sim.counts, 1024, sim.collapsedBitstring);
      }
      btnMeasure.style.display = 'none';
      if (btnReset) btnReset.style.display = 'inline-flex';
    } finally {
      btnMeasure.disabled = false;
      btnMeasure.textContent = '⚡ Measure State (Repeat 1,024 Times) ➔';
    }
  }

  btnMeasure.addEventListener('click', handleMeasure);

  btnReset?.addEventListener('click', () => {
    ketDisplay.classList.remove('collapsed-faded');
    if (collapseResult) collapseResult.style.display = 'none';
    if (histWrap) histWrap.style.display = 'none';
    btnMeasure.style.display = 'inline-flex';
    btnReset.style.display = 'none';
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
