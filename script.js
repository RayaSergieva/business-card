const card = document.getElementById('card');
const hint = document.getElementById('hinttext');
const stage = document.querySelector('.stage');

let angle = 0;        // current Y rotation (degrees)
let target = 0;       // 0 = front, 180 = back
let tiltX = 0, tiltY = 0;
let animating = false;

function applyFace(){
  const a = ((angle % 360) + 360) % 360;
  const showBack = a > 90 && a < 270;   // back is visible once we pass edge-on
  card.classList.toggle('is-back', showBack);
}

function paint(){
  card.style.transform = `rotateY(${angle + tiltY}deg) rotateX(${tiltX}deg)`;
  applyFace();
}

function tween(){
  animating = true;
  let t0 = performance.now(), startAngle = angle, startTarget = target;
  const dur = 700;
  const ease = p => p < 0.5 ? 4*p*p*p : 1 - Math.pow(-2*p+2,3)/2; // easeInOutCubic
  function step(now){
    // if the user clicked again mid-flip, rebase toward the new target
    if(target !== startTarget){ startAngle = angle; startTarget = target; t0 = now; }
    const p = Math.min(1, (now - t0)/dur);
    angle = startAngle + (target - startAngle) * ease(p);
    paint();
    if(p < 1 || angle !== target){ requestAnimationFrame(step); }
    else { angle = target; animating = false; paint(); }
  }
  requestAnimationFrame(step);
}

function flip(){
  target = (target === 0) ? 180 : 0;
  hint.textContent = (target === 180) ? 'Click to see the front' : 'Click the card to flip';
  if(!animating) tween();
}

card.addEventListener('click', flip);
card.addEventListener('keydown', (e) => {
  if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); flip(); }
});

// gentle parallax tilt while idle
let raf = null;
stage.addEventListener('pointermove', (e) => {
  if(animating) return;
  const r = stage.getBoundingClientRect();
  tiltY = ((e.clientX - r.left)/r.width - .5) * 6;
  tiltX = -((e.clientY - r.top)/r.height - .5) * 6;
  if(!raf) raf = requestAnimationFrame(() => { paint(); raf = null; });
});
stage.addEventListener('pointerleave', () => {
  if(!animating){ tiltX = 0; tiltY = 0; paint(); }
});

paint();
