// ExplainQuantum Slideshow App (Slides 1 to 19 Orchestrator)

document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.slide-card');
  const slideNumEl = document.getElementById('slideNum');
  const totalSlidesEl = document.getElementById('totalSlides');
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const dotsContainer = document.getElementById('dotsContainer');
  const btnRestart = document.getElementById('btnRestart');

  let currentSlideIndex = 0;
  const total = slides.length;

  if (totalSlidesEl) totalSlidesEl.textContent = total;

  // Build dots navigation
  dotsContainer.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot-pill' + (i === 0 ? ' active' : '');
    dot.title = `Slide ${i + 1}`;
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  }

  // Robust LaTeX Math Renderer (KaTeX with semantic fallback)
  function renderAllMath() {
    if (typeof renderMathInElement === 'function') {
      try {
        renderMathInElement(document.body, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false }
          ],
          ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
          throwOnError: false
        });
        return;
      } catch (err) {
        console.warn('KaTeX auto-render error:', err);
      }
    }

    // High-fidelity fallback if KaTeX CDN is still downloading or offline:
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      if (walker.currentNode.nodeValue.includes('$')) {
        nodes.push(walker.currentNode);
      }
    }

    nodes.forEach(node => {
      const parent = node.parentNode;
      if (!parent || ['SCRIPT', 'STYLE', 'CODE', 'PRE'].includes(parent.tagName) || parent.classList.contains('katex')) return;
      const text = node.nodeValue;
      if (/\$([^$]+)\$/.test(text)) {
        const span = document.createElement('span');
        span.innerHTML = text.replace(/\$\$([^$]+)\$\$/g, '<span class="math-display"><em>$1</em></span>')
                             .replace(/\$([^$]+)\$/g, '<span class="math-inline"><em>$1</em></span>');
        parent.replaceChild(span, node);
      }
    });
  }

  function updateSlideUI() {
    slides.forEach((slide, idx) => {
      slide.classList.toggle('active', idx === currentSlideIndex);
    });

    if (slideNumEl) slideNumEl.textContent = currentSlideIndex + 1;

    const dots = dotsContainer.querySelectorAll('.dot-pill');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentSlideIndex);
    });

    btnPrev.disabled = (currentSlideIndex === 0);
    btnNext.disabled = (currentSlideIndex === total - 1);

    // Initialize modules when reaching specific slides (0-indexed)
    if (currentSlideIndex === 5 && window.initInteractiveWheel) {
      window.initInteractiveWheel();
    }
    if (currentSlideIndex === 6 && window.initTuringMachine) {
      setTimeout(() => window.initTuringMachine(), 50);
    }
    if (currentSlideIndex === 7 && window.initSatCircuit) {
      setTimeout(() => window.initSatCircuit(), 50);
    }
    if (currentSlideIndex === 10 && window.initQuantumSnake) {
      setTimeout(() => window.initQuantumSnake(), 50);
    }
    if (currentSlideIndex === 11 && window.initEntanglementLab) {
      setTimeout(() => window.initEntanglementLab(), 50);
    }
    if (currentSlideIndex === 13 && window.initKetCollapse) {
      setTimeout(() => window.initKetCollapse(), 50);
    }
    if (currentSlideIndex === 14 && window.initGroverAmplification) {
      setTimeout(() => window.initGroverAmplification(), 50);
    }
    if (currentSlideIndex === 15 && window.initCatStick) {
      setTimeout(() => window.initCatStick(), 50);
    }

    // Render math on slide switch if needed
    renderAllMath();
  }

  const SLIDES_DATA = [
    { num: 1, title: 'A Better Way to Think', tag: 'Intro', desc: 'Debunking the parallel worlds myth & introducing state vectors' },
    { num: 2, title: 'The Parallel Worlds Myth', tag: 'The Myth', desc: 'Quantum computers do NOT simply try all possibilities in parallel' },
    { num: 3, title: 'The Degrees of Freedom', tag: 'Reality Check', desc: 'Classical state vectors vs the exponential state vector' },
    { num: 4, title: 'Wild Physics vs Computation', tag: 'Wild Physics', desc: 'Mysterious quantum phenomena alone do not imply speedups' },
    { num: 5, title: 'Rotating Angles & Continuous States', tag: 'Continuous', desc: 'Interactive wheel: Infinite continuous states exist classically too' },
    { num: 6, title: 'The Classical Turing Machine', tag: 'Foundation', desc: 'Interactive ticker tape: Classical computation moves sequentially' },
    { num: 7, title: 'The 3-SAT Problem Blueprint', tag: '3-SAT', desc: 'Boolean satisfiability & the blueprint of classical NP hardness' },
    { num: 8, title: 'Interactive Logic Gates Circuit', tag: 'Logic Circuit', desc: 'Live circuit schematic with toggle switches, AND, OR, NOT, NAND' },
    { num: 9, title: 'The 2ⁿ Combinations Truth Table', tag: 'Truth Table', desc: 'Full truth table across all 2ⁿ variable assignments' },
    { num: 10, title: 'The Classical Imaginary Ghost', tag: 'Imaginary Ghost', desc: 'Classical paths are hypothetical: the 2³⁰⁰ tree is merely an imaginary ghost' },
    { num: 11, title: 'Quantum Reality: 2ⁿ Vector is Real', tag: 'Quantum Reality', desc: 'Entangled qubits maintain a physically real 2ⁿ complex amplitude vector' },
    { num: 12, title: 'Entanglement Lab: Bell State', tag: 'Entanglement Lab', desc: 'Live 1,024-run test: Separable product state vs Entangled Bell state' },
    { num: 13, title: 'Archimedes Lever on 2³⁰⁰ Space', tag: 'Physical Control', desc: 'Physical gates manipulate a colossal mathematical state vector' },
    { num: 14, title: 'Measurement Collapse (3 Qubits)', tag: 'The Catch', desc: 'Normalized fractions state vector & 1,024-run frequency table' },
    { num: 15, title: 'Grover Amplification & 3Blue1Brown', tag: 'Grover Algorithm', desc: 'Rotating amplitudes so the correct answer surges to ~100%' },
    { num: 16, title: 'Cat & High-Dimensional Stick', tag: 'Fun Metaphor', desc: 'A cat playing on its back and watching a stick collapse left/right' },
    { num: 17, title: 'Why Not Classical Probabilities?', tag: 'Sign Problem', desc: 'Negative and complex interference cancels error paths' },
    { num: 18, title: 'The Better Mental Model', tag: 'Key Takeaways', desc: 'Summary of the real distinction between classical and quantum' },
    { num: 19, title: 'Conclusion & Thank You', tag: 'Thank You', desc: 'Wrap-up and restart' }
  ];

  function goToSlide(index) {
    if (index >= 0 && index < total) {
      currentSlideIndex = index;
      updateSlideUI();
    }
  }
  window.goToSlide = goToSlide;

  // Slide Navigator Modal Implementation
  const btnSlideMenu = document.getElementById('btnSlideNavigator');
  const btnFooterJump = document.getElementById('btnFooterJump');
  const slideNavBackdrop = document.getElementById('slideNavBackdrop');
  const btnCloseSlideNav = document.getElementById('btnCloseSlideNav');
  const slideNavFilter = document.getElementById('slideNavFilter');
  const slideNavGrid = document.getElementById('slideNavGrid');

  function openSlideNav() {
    if (!slideNavBackdrop) return;
    renderSlideNavGrid();
    slideNavBackdrop.style.display = 'flex';
    if (slideNavFilter) {
      slideNavFilter.value = '';
      setTimeout(() => slideNavFilter.focus(), 60);
    }
  }

  function closeSlideNav() {
    if (!slideNavBackdrop) return;
    slideNavBackdrop.style.display = 'none';
  }

  function renderSlideNavGrid(filterQuery = '') {
    if (!slideNavGrid) return;
    slideNavGrid.innerHTML = '';
    const q = filterQuery.trim().toLowerCase();

    const filtered = SLIDES_DATA.filter(item => {
      if (!q) return true;
      const numStr = String(item.num);
      return numStr.includes(q) ||
             item.title.toLowerCase().includes(q) ||
             item.tag.toLowerCase().includes(q) ||
             item.desc.toLowerCase().includes(q);
    });

    if (filtered.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.style.gridColumn = '1 / -1';
      emptyMsg.style.textAlign = 'center';
      emptyMsg.style.padding = '36px 12px';
      emptyMsg.style.color = '#64748b';
      emptyMsg.innerHTML = `No slides matching "<strong>${filterQuery}</strong>". Try searching "Bell", "Grover", "Turing", or slide number.`;
      slideNavGrid.appendChild(emptyMsg);
      return;
    }

    filtered.forEach(item => {
      const card = document.createElement('div');
      const isActive = (item.num - 1 === currentSlideIndex);
      card.className = 'slide-nav-card' + (isActive ? ' active' : '');
      card.title = `Jump to Slide ${item.num}: ${item.title}`;

      const padNum = String(item.num).padStart(2, '0');
      card.innerHTML = `
        <div class="nav-card-top">
          <span class="nav-card-num">${padNum}</span>
          <span class="nav-card-tag">${item.tag}</span>
        </div>
        <div class="nav-card-title">${item.title}</div>
        <p class="nav-card-desc">${item.desc}</p>
      `;

      card.addEventListener('click', () => {
        goToSlide(item.num - 1);
        closeSlideNav();
      });

      slideNavGrid.appendChild(card);
    });
  }

  if (btnSlideMenu) btnSlideMenu.addEventListener('click', openSlideNav);
  if (btnFooterJump) btnFooterJump.addEventListener('click', openSlideNav);
  if (btnCloseSlideNav) btnCloseSlideNav.addEventListener('click', closeSlideNav);

  slideNavBackdrop?.addEventListener('click', (e) => {
    if (e.target === slideNavBackdrop) closeSlideNav();
  });

  slideNavFilter?.addEventListener('input', (e) => {
    renderSlideNavGrid(e.target.value);
  });

  slideNavFilter?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const firstCard = slideNavGrid?.querySelector('.slide-nav-card');
      if (firstCard) firstCard.click();
    }
  });

  btnPrev.addEventListener('click', () => {
    if (currentSlideIndex > 0) goToSlide(currentSlideIndex - 1);
  });

  btnNext.addEventListener('click', () => {
    if (currentSlideIndex < total - 1) goToSlide(currentSlideIndex + 1);
  });

  btnRestart?.addEventListener('click', () => {
    goToSlide(0);
  });

  // Keyboard navigation & Shortcuts
  window.addEventListener('keydown', (e) => {
    const isModalOpen = (slideNavBackdrop && slideNavBackdrop.style.display !== 'none') ||
                        (document.getElementById('mothModalBackdrop')?.style.display !== 'none');
    const isInputFocused = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);

    if (e.key === 'Escape') {
      if (slideNavBackdrop && slideNavBackdrop.style.display !== 'none') {
        closeSlideNav();
        return;
      }
    }

    // Press 's' or 'S' to toggle Slide Navigator (when not typing in an input field)
    if ((e.key === 's' || e.key === 'S') && !isInputFocused) {
      e.preventDefault();
      if (slideNavBackdrop && slideNavBackdrop.style.display !== 'none') {
        closeSlideNav();
      } else {
        openSlideNav();
      }
      return;
    }

    if (isModalOpen) return; // Prevent background slide transitions while modal is open

    if (e.key === 'ArrowRight' || e.key === ' ') {
      if (currentSlideIndex < total - 1) goToSlide(currentSlideIndex + 1);
    } else if (e.key === 'ArrowLeft') {
      if (currentSlideIndex > 0) goToSlide(currentSlideIndex - 1);
    }
  });

  // Initialize Moth settings modal
  if (window.initMothSettingsModal) window.initMothSettingsModal();

  // Initial trigger
  updateSlideUI();
  if (window.initInteractiveWheel) window.initInteractiveWheel();
  if (window.initTuringMachine) window.initTuringMachine();
  if (window.initSatCircuit) window.initSatCircuit();
  if (window.initQuantumSnake) window.initQuantumSnake();
  if (window.initEntanglementLab) window.initEntanglementLab();
  if (window.initKetCollapse) window.initKetCollapse();
  if (window.initGroverAmplification) window.initGroverAmplification();
  if (window.initCatStick) window.initCatStick();

  // Try math render immediately and on full window load
  renderAllMath();
  window.addEventListener('load', renderAllMath);
});
