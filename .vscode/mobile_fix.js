/* ============================================================
   VENDHAN INFOTECT PORTAL — MOBILE SIDEBAR JAVASCRIPT
   Add this file to your project and link it in every page
   ============================================================ */

(function () {

  // ── CREATE OVERLAY DIV
  var overlay = document.createElement('div');
  overlay.className = 'mobile-overlay';
  overlay.id = 'mobileOverlay';
  document.body.appendChild(overlay);

  // ── TOGGLE SIDEBAR ON MOBILE
  // Override the existing toggleSidebar for mobile behaviour
  window.toggleSidebar = function () {
    var sidebar  = document.getElementById('sidebar');
    var isMobile = window.innerWidth <= 768;

    if (isMobile) {
      // On mobile — slide sidebar in/out as overlay
      sidebar.classList.toggle('mobile-open');
      overlay.classList.toggle('open');
    } else {
      // On desktop — collapse/expand as before
      var topbar  = document.getElementById('topbar');
      var main    = document.getElementById('mainContent');
      var chat    = document.getElementById('chatWrapper');
      sidebar.classList.toggle('collapsed');
      if (topbar) topbar.classList.toggle('collapsed');
      if (main)   main.classList.toggle('collapsed');
      if (chat)   chat.classList.toggle('collapsed');
    }
  };

  // ── CLOSE SIDEBAR WHEN OVERLAY IS CLICKED
  overlay.addEventListener('click', function () {
    var sidebar = document.getElementById('sidebar');
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('open');
  });

  // ── CLOSE SIDEBAR ON NAV ITEM CLICK (MOBILE)
  document.addEventListener('click', function (e) {
    if (window.innerWidth > 768) return;
    var navItem = e.target.closest('.nav-item');
    if (navItem) {
      var sidebar = document.getElementById('sidebar');
      sidebar.classList.remove('mobile-open');
      overlay.classList.remove('open');
    }
  });

  // ── ON RESIZE — RESET SIDEBAR STATE
  window.addEventListener('resize', function () {
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('mobileOverlay');
    if (window.innerWidth > 768) {
      sidebar.classList.remove('mobile-open');
      if (overlay) overlay.classList.remove('open');
    }
  });

})();