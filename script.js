const year = new Date().getFullYear();
document.getElementById('year').textContent = year;
const yearRange = document.getElementById('year-range');
if (yearRange) yearRange.textContent = `2024—${year}`;

// Grid toggle (G key)
const GRID_KEY = 'grid-hidden';

try {
  if (localStorage.getItem(GRID_KEY) === '1') document.body.classList.add('grid-hidden');
} catch (e) {}

function toggleGrid() {
  const hidden = document.body.classList.toggle('grid-hidden');
  try {
    localStorage.setItem(GRID_KEY, hidden ? '1' : '0');
  } catch (e) {}
}

document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey) toggleGrid();
});
