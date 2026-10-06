// Slide 11: 5-Qubit Circuit & Gray Code Snake Grid Engine

window.initQuantumSnake = function() {
  const gridContainer = document.getElementById('snakeGridContainer');
  const tooltip = document.getElementById('snakeCellTooltip');

  if (!gridContainer) return;

  // Generate 5-bit Gray code sequence for 32 states
  const grayCodes = [];
  for (let i = 0; i < 32; i++) {
    const grayInt = i ^ (i >> 1);
    const binStr = grayInt.toString(2).padStart(5, '0');
    grayCodes.push({ index: i, grayInt, binStr });
  }

  // Pre-generate smooth pseudo-amplitudes and phases simulating an entangled 5-qubit state
  const stateData = grayCodes.map((item, idx) => {
    // Some states have high amplitude, some low, representing entangled probability weights
    const rawAmp = Math.sin((idx / 32) * Math.PI * 3 + 0.5) * 0.5 + 0.5;
    const ampSquared = Math.pow(rawAmp, 2) * 0.15; // normalized feel
    const phaseRad = ((idx * 47) % 360) * (Math.PI / 180); // phase 0 to 2pi
    const hue = Math.round((phaseRad / (Math.PI * 2)) * 360); // color mapped to phase
    return {
      ...item,
      ampSquared,
      phaseRad,
      hue
    };
  });

  // Render 8 columns x 4 rows snake grid
  gridContainer.innerHTML = '';

  // 4 rows
  for (let row = 0; row < 4; row++) {
    const rowEl = document.createElement('div');
    rowEl.className = 'snake-row' + (row % 2 === 1 ? ' reverse-row' : '');

    for (let col = 0; col < 8; col++) {
      const idx = row * 8 + col;
      const data = stateData[idx];

      const cell = document.createElement('div');
      cell.className = 'snake-cell';

      // Background color: HSL with hue = phase, saturation = 75%, lightness varied by amplitude
      // High amplitude -> vibrant glowing cell, low amplitude -> faint pastel cell
      const opacity = 0.25 + (data.ampSquared / 0.15) * 0.75;
      cell.style.backgroundColor = `hsla(${data.hue}, 80%, 65%, ${opacity.toFixed(2)})`;
      cell.style.borderColor = `hsl(${data.hue}, 70%, 45%)`;

      cell.innerHTML = `
        <span class="cell-bits">${data.binStr}</span>
        <span class="cell-idx">#${data.grayInt}</span>
      `;

      // Hover interaction
      cell.addEventListener('mouseenter', () => {
        if (tooltip) {
          const phaseDeg = Math.round((data.phaseRad * 180) / Math.PI);
          tooltip.innerHTML = `
            <strong>|${data.binStr}⟩</strong> (Gray index: #${data.grayInt}) &bull; 
            Amplitude: <code>${Math.sqrt(data.ampSquared).toFixed(3)}</code> (Weight: ${(data.ampSquared * 100).toFixed(1)}%) &bull; 
            Phase: <span style="color: hsl(${data.hue}, 80%, 40%)">● ${phaseDeg}° (${(data.phaseRad / Math.PI).toFixed(2)}π)</span>
          `;
        }
      });

      rowEl.appendChild(cell);
    }

    gridContainer.appendChild(rowEl);
  }
};
