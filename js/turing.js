// Cute Infinite Animated Turing Machine Engine: Binary Incrementer (+1 Adder)

window.initTuringMachine = function() {
  const tapeViewport = document.querySelector('.tm-tape-viewport');
  const tapeTrack = document.getElementById('tmTapeTrack');
  const btnStep = document.getElementById('btnTmStep');
  const btnAuto = document.getElementById('btnTmAuto');
  const btnReset = document.getElementById('btnTmReset');
  const stateText = document.getElementById('tmStateText');

  if (!tapeTrack || !tapeViewport) return;

  // 4-bit binary number stored at indices 0, 1, 2, 3
  // Initial number: binary 0 1 0 1 = 5
  const initialSymbols = {
    '-3': '0',
    '-2': '0',
    '-1': '0',
    '0': '0',
    '1': '1',
    '2': '0',
    '3': '1',
    '4': '0',
    '5': '0',
    '6': '0'
  };

  let tapeMap = { ...initialSymbols };
  let headIdx = 0;
  let isRunning = false;
  let isAnimating = false;
  let timerId = null;

  // Turing Machine States for Binary Incrementer:
  // 'q_seek_lsb': moves RIGHT across bits 0..3 to find the least significant bit (cell 3)
  // 'q_add_carry': moves LEFT carrying 1. If '1' -> write '0' & move left; if '0' -> write '1' & switch to q_return
  // 'q_return': moves RIGHT back to start cell 0
  let currentState = 'q_seek_lsb';
  let lastActionMsg = "Starting binary incrementer: 0101₂ (5)";

  const cellWidth = 52;
  const cellGap = 8;
  const stepDistance = cellWidth + cellGap; // 60px
  const windowRadius = 8;

  function getSymbol(idx) {
    return tapeMap[idx] !== undefined ? tapeMap[idx] : '0';
  }

  function getBinaryVal() {
    const b0 = getSymbol(0);
    const b1 = getSymbol(1);
    const b2 = getSymbol(2);
    const b3 = getSymbol(3);
    const str = `${b0}${b1}${b2}${b3}`;
    const val = parseInt(str, 2);
    return { str, val };
  }

  function renderCells() {
    tapeTrack.style.transition = 'none';
    tapeTrack.style.transform = 'translateX(0)';
    tapeTrack.innerHTML = '';

    // Left infinity indicator
    const leftInf = document.createElement('div');
    leftInf.className = 'tape-infinity-edge';
    leftInf.textContent = '... -∞';
    tapeTrack.appendChild(leftInf);

    // Render cells from (headIdx - windowRadius) to (headIdx + windowRadius)
    for (let i = headIdx - windowRadius; i <= headIdx + windowRadius; i++) {
      const cell = document.createElement('div');
      const isHead = (i === headIdx);
      const isWordBit = (i >= 0 && i <= 3);
      cell.className = 'tape-block' + (isHead ? ' active-head' : '') + (isWordBit ? ' in-word' : '');
      cell.setAttribute('data-idx', i);
      cell.innerHTML = `
        <span class="tape-val">${getSymbol(i)}</span>
        <span class="tape-block-idx">#${i}</span>
      `;
      tapeTrack.appendChild(cell);
    }

    // Right infinity indicator
    const rightInf = document.createElement('div');
    rightInf.className = 'tape-infinity-edge';
    rightInf.textContent = '+∞ ...';
    tapeTrack.appendChild(rightInf);

    if (stateText) {
      const { str, val } = getBinaryVal();
      stateText.innerHTML = `
        <span class="tm-status-pill">State: <strong>${currentState}</strong></span>
        <span>Word: <code>${str}₂</code> (<strong>${val}</strong>)</span> &bull; 
        <span>Head at <strong>#${headIdx}</strong></span> &bull;
        <span class="tm-hint-note">${lastActionMsg}</span>
      `;
    }
  }

  // Execute one step of the Turing Machine transition table
  function step(onComplete) {
    if (isAnimating) return;
    isAnimating = true;

    const curSymbol = getSymbol(headIdx);
    let nextMove = 'R'; // 'R' or 'L'
    let writeVal = curSymbol;

    if (currentState === 'q_seek_lsb') {
      if (headIdx < 3) {
        // Move right towards LSB
        nextMove = 'R';
        lastActionMsg = `Scanning right towards LSB at cell #3 ➔`;
      } else {
        // At LSB (cell 3), start addition!
        currentState = 'q_add_carry';
        if (curSymbol === '1') {
          writeVal = '0';
          nextMove = 'L';
          lastActionMsg = `LSB is 1 ➔ Write 0, Carry 1 left ⬅`;
        } else {
          writeVal = '1';
          currentState = 'q_return';
          nextMove = 'L';
          lastActionMsg = `LSB is 0 ➔ Write 1, Carry resolved! ✅`;
        }
      }
    } else if (currentState === 'q_add_carry') {
      if (curSymbol === '1') {
        writeVal = '0';
        nextMove = 'L';
        lastActionMsg = `Carry bit: 1+1=0, write 0, keep carrying left ⬅`;
      } else {
        writeVal = '1';
        currentState = 'q_return';
        nextMove = (headIdx < 0) ? 'R' : 'R';
        lastActionMsg = `Carry absorbed: 0+1=1, write 1! Moving to return ➔`;
      }
    } else if (currentState === 'q_return') {
      if (headIdx > 0) {
        nextMove = 'L';
        lastActionMsg = `Rewinding left to start cell #0 ⬅`;
      } else if (headIdx < 0) {
        nextMove = 'R';
        lastActionMsg = `Returning right to start cell #0 ➔`;
      } else {
        // Returned to cell 0! Addition cycle complete. Ready for next increment.
        currentState = 'q_seek_lsb';
        nextMove = 'R';
        const { str, val } = getBinaryVal();
        lastActionMsg = `🎉 Increment complete! Counter is now ${str}₂ (${val}). Next: scan right!`;
      }
    }

    tapeMap[headIdx] = writeVal;

    // Update active cell visual value immediately
    const activeCell = tapeTrack.querySelector('.tape-block.active-head .tape-val');
    if (activeCell) activeCell.textContent = writeVal;

    // Tape slides opposite to head direction so head stays centered!
    const translateOffset = (nextMove === 'R') ? -stepDistance : stepDistance;

    tapeTrack.style.transition = 'transform 0.28s cubic-bezier(0.25, 1, 0.5, 1)';
    tapeTrack.style.transform = `translateX(${translateOffset}px)`;

    setTimeout(() => {
      headIdx = (nextMove === 'R') ? headIdx + 1 : headIdx - 1;
      renderCells();
      isAnimating = false;
      if (onComplete) onComplete();
    }, 280);
  }

  function toggleAuto() {
    if (isRunning) {
      clearInterval(timerId);
      isRunning = false;
      btnAuto.textContent = 'Auto Play ▶';
      btnAuto.classList.remove('primary');
      btnAuto.classList.add('secondary');
    } else {
      isRunning = true;
      btnAuto.textContent = 'Pause ⏸';
      btnAuto.classList.remove('secondary');
      btnAuto.classList.add('primary');

      const runLoop = () => {
        if (!isRunning) return;
        step(() => {
          if (isRunning) {
            timerId = setTimeout(runLoop, 220); // 280ms slide + 220ms pause
          }
        });
      };
      runLoop();
    }
  }

  function reset() {
    if (isRunning) {
      clearInterval(timerId);
      isRunning = false;
      btnAuto.textContent = 'Auto Play ▶';
      btnAuto.classList.remove('primary');
      btnAuto.classList.add('secondary');
    }
    tapeMap = { ...initialSymbols };
    headIdx = 0;
    currentState = 'q_seek_lsb';
    lastActionMsg = "Reset counter to 0101₂ (5). Ready to increment!";
    isAnimating = false;
    renderCells();
  }

  btnStep?.addEventListener('click', () => {
    if (isRunning) toggleAuto();
    step();
  });

  btnAuto?.addEventListener('click', toggleAuto);
  btnReset?.addEventListener('click', reset);

  // Initial render
  renderCells();
};
