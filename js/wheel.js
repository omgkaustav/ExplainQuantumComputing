// Interactive Rotatable Wheel Engine for Slide 6

window.initInteractiveWheel = function() {
  const wheel = document.getElementById('interactiveWheel');
  if (!wheel) return;

  let currentAngle = 0;
  let isDragging = false;
  let lastMouseAngle = 0;
  let angularVelocity = 0;
  let rafId = null;

  function getAngle(e) {
    const rect = wheel.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
  }

  function startDrag(e) {
    isDragging = true;
    lastMouseAngle = getAngle(e);
    angularVelocity = 0;
    if (rafId) cancelAnimationFrame(rafId);
  }

  function onDrag(e) {
    if (!isDragging) return;
    const newAngle = getAngle(e);
    let delta = newAngle - lastMouseAngle;

    // Handle 180/-180 wrap
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    currentAngle += delta;
    angularVelocity = delta * 0.8;
    lastMouseAngle = newAngle;

    wheel.style.transform = `rotate(${currentAngle}deg)`;
  }

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    applyInertia();
  }

  function applyInertia() {
    if (Math.abs(angularVelocity) > 0.1) {
      currentAngle += angularVelocity;
      angularVelocity *= 0.95; // friction decay
      wheel.style.transform = `rotate(${currentAngle}deg)`;
      rafId = requestAnimationFrame(applyInertia);
    }
  }

  // Pointer events
  wheel.addEventListener('mousedown', startDrag);
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', endDrag);

  wheel.addEventListener('touchstart', startDrag, { passive: true });
  window.addEventListener('touchmove', onDrag, { passive: true });
  window.addEventListener('touchend', endDrag);

  // Initial gentle spin nudge
  angularVelocity = 3;
  applyInertia();
};
