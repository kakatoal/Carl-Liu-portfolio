// Flip book: each leaf holds two pages (front/back) and turns around the spine
const book = document.querySelector('.book');

if (book) {
  const leaves = [...book.querySelectorAll('.leaf')];
  // Content pages only: the back cover is not counted
  const pageCount = book.querySelectorAll('.page:not(.page--back-cover)').length;
  const count = document.querySelector('.book-count');
  let turned = 0; // leaves already turned to the left

  function render() {
    leaves.forEach((leaf, i) => {
      const isTurned = i < turned;
      leaf.classList.toggle('is-turned', isTurned);
      // Turned leaves stack left (last on top), the rest stack right (first on top)
      leaf.style.zIndex = isTurned ? i + 1 : leaves.length - i;
    });
    book.classList.toggle('is-closed', turned === 0);
    book.classList.toggle('is-end', turned === leaves.length);

    const left = turned * 2;
    if (turned === 0) count.textContent = 'Cover';
    else if (turned === leaves.length) count.textContent = 'Back cover';
    else count.textContent = `Pages ${left}–${left + 1} / ${pageCount}`;
  }

  function go(step) {
    turned = Math.min(leaves.length, Math.max(0, turned + step));
    render();
  }

  // Click the right half to turn forward, the left half to turn back
  book.addEventListener('click', (e) => {
    const r = book.getBoundingClientRect();
    go(e.clientX > r.left + r.width / 2 ? 1 : -1);
  });
  document.querySelectorAll('.book-btn').forEach((btn) => {
    btn.addEventListener('click', () => go(Number(btn.dataset.step)));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  });

  render();
}
