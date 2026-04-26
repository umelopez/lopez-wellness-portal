/**
 * Lopez Wellness Portal — Shared Sidebar Navigation
 * 
 * HOW TO USE:
 * 1. Upload this file (lopez-wellness-nav.js) to your GitHub repo
 * 2. In EACH html page, replace the entire <nav> / sidebar section
 *    with the single line:  <div id="sidebar-root"></div>
 * 3. Before </body> in EACH page, add:
 *    <script src="lopez-wellness-nav.js"></script>
 *    <script>LWNav.init();</script>
 *
 * To add new pages later, just add them to the PAGES array below.
 */

const LWNav = (() => {

  // ── PAGE REGISTRY ──────────────────────────────────────────────────
  // Add every page here. "id" must match the <body id="..."> on that file.
  const SECTIONS = [
    {
      label: "Overview",
      items: [
        { id: "dashboard",  label: "Dashboard",        icon: "📊", file: "lopez-wellness-dashboard.html" },
      ]
    },
    {
      label: "Operations",
      items: [
        { id: "branches",   label: "Branches",          icon: "🏢", file: "lopez-wellness-branches.html" },
        { id: "therapists", label: "Therapists",        icon: "👤", file: "lopez-wellness-therapists.html" },
        { id: "sales",      label: "Sales",             icon: "💰", file: "lopez-wellness-sales.html" },
        { id: "expenses",   label: "Expenses",          icon: "📑", file: "lopez-wellness-expenses.html" },
      ]
    },
    {
      label: "Management",
      items: [
        { id: "payroll",    label: "Payroll",           icon: "💵", file: "lopez-wellness-payroll.html",     comingSoon: true },
        { id: "reports",    label: "Reports",           icon: "📈", file: "lopez-wellness-reports.html",     comingSoon: true },
        { id: "staff",      label: "Staff & Access",    icon: "🔐", file: "lopez-wellness-staff.html",       comingSoon: true },
        { id: "settings",   label: "Settings",          icon: "⚙️", file: "lopez-wellness-settings.html",   comingSoon: true },
      ]
    }
  ];

  // ── DETECT CURRENT PAGE ────────────────────────────────────────────
  function currentPageId() {
    // Try <body id="..."> first, then fall back to filename
    if (document.body.id) return document.body.id;
    const filename = window.location.pathname.split("/").pop();
    for (const section of SECTIONS) {
      for (const item of section.items) {
        if (item.file === filename) return item.id;
      }
    }
    return "";
  }

  // ── BUILD STYLES ───────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById("lw-nav-styles")) return;
    const style = document.createElement("style");
    style.id = "lw-nav-styles";
    style.textContent = `
      /* ── Reset sidebar root ── */
      #sidebar-root { position: fixed; top: 0; left: 0; height: 100vh; width: 240px; z-index: 100; }

      /* ── Sidebar shell ── */
      .lw-sidebar {
        display: flex; flex-direction: column; height: 100%;
        background: #0f172a; color: #e2e8f0;
        font-family: 'DM Sans', sans-serif;
        border-right: 1px solid #1e293b;
        overflow-y: auto; overflow-x: hidden;
        transition: width 0.2s ease;
        width: 240px;
      }
      .lw-sidebar.collapsed { width: 64px; }
      .lw-sidebar.collapsed .lw-nav-label,
      .lw-sidebar.collapsed .lw-section-label,
      .lw-sidebar.collapsed .lw-badge,
      .lw-sidebar.collapsed .lw-logo-text,
      .lw-sidebar.collapsed .lw-user-info { display: none; }

      /* ── Logo ── */
      .lw-logo {
        display: flex; align-items: center; gap: 10px;
        padding: 20px 16px 14px;
        border-bottom: 1px solid #1e293b;
        text-decoration: none;
      }
      .lw-logo-icon {
        width: 36px; height: 36px; border-radius: 8px;
        background: #2563eb; display: flex; align-items: center;
        justify-content: center; font-size: 18px; flex-shrink: 0;
      }
      .lw-logo-text { line-height: 1.2; }
      .lw-logo-text strong { display: block; font-size: 13px; font-weight: 700; color: #f1f5f9; }
      .lw-logo-text span { font-size: 11px; color: #64748b; }

      /* ── Toggle button ── */
      .lw-toggle {
        margin: 8px auto 0; width: 32px; height: 32px; border-radius: 6px;
        background: transparent; border: 1px solid #1e293b;
        color: #64748b; cursor: pointer; display: flex;
        align-items: center; justify-content: center; font-size: 14px;
        transition: background 0.15s, color 0.15s;
      }
      .lw-toggle:hover { background: #1e293b; color: #e2e8f0; }

      /* ── Nav sections ── */
      .lw-nav { flex: 1; padding: 8px 0; }
      .lw-section-label {
        padding: 14px 16px 4px; font-size: 10px; font-weight: 700;
        letter-spacing: 0.08em; text-transform: uppercase; color: #475569;
      }

      /* ── Nav items ── */
      .lw-nav-item {
        display: flex; align-items: center; gap: 10px;
        padding: 8px 16px; margin: 1px 8px; border-radius: 6px;
        text-decoration: none; color: #94a3b8; font-size: 13.5px;
        cursor: pointer; transition: background 0.15s, color 0.15s;
        position: relative; white-space: nowrap;
      }
      .lw-nav-item:hover:not(.disabled) { background: #1e293b; color: #e2e8f0; }
      .lw-nav-item.active { background: #1d4ed8; color: #ffffff; font-weight: 600; }
      .lw-nav-item.disabled { opacity: 0.45; cursor: default; }
      .lw-nav-item .lw-icon { font-size: 16px; flex-shrink: 0; width: 20px; text-align: center; }
      .lw-badge {
        margin-left: auto; font-size: 9px; font-weight: 700;
        background: #334155; color: #64748b; padding: 2px 6px;
        border-radius: 4px; text-transform: uppercase; letter-spacing: 0.04em;
      }

      /* ── Tooltip when collapsed ── */
      .lw-sidebar.collapsed .lw-nav-item { justify-content: center; padding: 10px; }
      .lw-sidebar.collapsed .lw-nav-item .lw-icon { width: auto; }
      .lw-nav-item .lw-tooltip {
        display: none; position: absolute; left: calc(100% + 8px);
        background: #0f172a; color: #e2e8f0; font-size: 12px;
        padding: 4px 10px; border-radius: 6px; white-space: nowrap;
        border: 1px solid #1e293b; pointer-events: none; z-index: 999;
      }
      .lw-sidebar.collapsed .lw-nav-item:hover .lw-tooltip { display: block; }

      /* ── User profile at bottom ── */
      .lw-user {
        display: flex; align-items: center; gap: 10px;
        padding: 14px 16px; border-top: 1px solid #1e293b;
      }
      .lw-avatar {
        width: 32px; height: 32px; border-radius: 50%;
        background: #2563eb; display: flex; align-items: center;
        justify-content: center; font-size: 14px; font-weight: 700;
        color: #fff; flex-shrink: 0;
      }
      .lw-user-info strong { display: block; font-size: 12px; color: #f1f5f9; }
      .lw-user-info span { font-size: 11px; color: #64748b; }
      .lw-logout {
        margin: 0 8px 12px; padding: 8px 12px; border-radius: 6px;
        background: transparent; border: 1px solid #1e293b;
        color: #64748b; font-size: 12px; font-family: 'DM Sans', sans-serif;
        cursor: pointer; width: calc(100% - 16px); text-align: left;
        transition: background 0.15s, color 0.15s;
      }
      .lw-logout:hover { background: #dc2626; border-color: #dc2626; color: #fff; }

      /* ── Push page content right ── */
      body { margin-left: 240px !important; transition: margin-left 0.2s ease; }
      body.lw-collapsed { margin-left: 64px !important; }
    `;
    document.head.appendChild(style);
  }

  // ── BUILD HTML ─────────────────────────────────────────────────────
  function buildSidebar(activeId) {
    let navHTML = "";
    for (const section of SECTIONS) {
      navHTML += `<div class="lw-section-label">${section.label}</div>`;
      for (const item of section.items) {
        const isActive = item.id === activeId;
        const isDisabled = item.comingSoon && !isActive;
        const classes = ["lw-nav-item", isActive ? "active" : "", isDisabled ? "disabled" : ""].filter(Boolean).join(" ");
        const badge = item.comingSoon ? `<span class="lw-badge">Soon</span>` : "";
        const tooltip = `<span class="lw-tooltip">${item.label}${item.comingSoon ? " (Coming Soon)" : ""}</span>`;
        const href = isDisabled ? "#" : item.file;
        navHTML += `
          <a class="${classes}" href="${href}" ${isDisabled ? 'onclick="return false;"' : ''}>
            <span class="lw-icon">${item.icon}</span>
            <span class="lw-nav-label">${item.label}</span>
            ${badge}
            ${tooltip}
          </a>`;
      }
    }

    return `
      <div class="lw-sidebar" id="lw-sidebar">
        <a class="lw-logo" href="lopez-wellness-dashboard.html">
          <div class="lw-logo-icon">🏥</div>
          <div class="lw-logo-text">
            <strong>Motherstouch</strong>
            <span>Lopez Wellness Inc.</span>
          </div>
        </a>
        <button class="lw-toggle" id="lw-toggle-btn" title="Toggle sidebar">☰</button>
        <nav class="lw-nav">${navHTML}</nav>
        <div class="lw-user">
          <div class="lw-avatar">J</div>
          <div class="lw-user-info">
            <strong>Jerome</strong>
            <span>Administrator</span>
          </div>
        </div>
        <button class="lw-logout" onclick="alert('Logout coming soon')">🚪 Logout</button>
      </div>`;
  }

  // ── INIT ───────────────────────────────────────────────────────────
  function init() {
    injectStyles();

    const root = document.getElementById("sidebar-root");
    if (!root) {
      console.warn("LWNav: No #sidebar-root element found. Add <div id=\"sidebar-root\"></div> to your page.");
      return;
    }

    const activeId = currentPageId();
    root.innerHTML = buildSidebar(activeId);

    // Collapse toggle
    const sidebar = document.getElementById("lw-sidebar");
    const toggleBtn = document.getElementById("lw-toggle-btn");
    let collapsed = localStorage.getItem("lw-nav-collapsed") === "true";

    function applyCollapse() {
      sidebar.classList.toggle("collapsed", collapsed);
      document.body.classList.toggle("lw-collapsed", collapsed);
      toggleBtn.textContent = collapsed ? "»" : "☰";
      localStorage.setItem("lw-nav-collapsed", collapsed);
    }

    applyCollapse(); // restore state on load

    toggleBtn.addEventListener("click", () => {
      collapsed = !collapsed;
      applyCollapse();
    });
  }

  return { init };
})();
