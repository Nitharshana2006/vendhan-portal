// ── SESSION PROTECTION ──
// Redirect to login if not logged in as employee
if (!localStorage.getItem('userRole') || localStorage.getItem('userRole') !== 'employee') {
  window.location.replace('../index.html');
}

// ── LOADER HIDE ──
window.addEventListener('load', function () {
  setTimeout(function () {
    var loader = document.getElementById('pageLoader');
    if (loader) loader.style.display = 'none';
  }, 500);
});