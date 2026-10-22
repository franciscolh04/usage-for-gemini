(() => {
  if (window.__ufgContent) return;
  window.__ufgContent = true;

  const STORAGE_KEY = "ufg:snapshot";
  const USAGE_REFRESH_MS = 5 * 60 * 1000;
  const STOP_SELECTOR = [
    'button[aria-label*="stop" i]',
    'button[aria-label*="parar" i]',
    'button[aria-label*="detener" i]',
    'button[aria-label*="arrêter" i]',
    'button[aria-label*="stopper" i]',
    'button[aria-label*="停止" i]',
    '[data-testid*="stop" i]',
    'mat-icon[fonticon="stop"]',
    'gem-icon[name="stop"]',
    '[class*="stop-button" i]',
  ].join(",");
  const DEMO =
    new URLSearchParams(location.search).has("ufg_demo") ||
    localStorage.getItem("ufg:demo") === "1";

  const i18n = window.__ufgI18n || {
    resolve: () => "en",
    get: () => ({
      locale: "en",
      rtl: false,
      usage: "Usage limits",
      session: "Current usage",
      weekly: "Weekly limit",
      resetAt: "Resets at {time}",
      resetOn: "Resets on {date} at {time}",
      used: "{value} used",
      aria: "Gemini usage: {value}",
    }),
  };

  let locale = i18n.resolve(document.documentElement.lang || navigator.language);
  let L = i18n.get(locale);

  let snapshot = null;
  let snapshotAccount = "0";
  let demo = null;
  let composer = null;
  let composerInput = null;
  let chipHost = null;
  let panelHost = null;
  let chipUI = null;
  let panelUI = null;
  let isOpen = false;
  let closeTimer = 0;
  let lastHref = location.href;
  let raf = 0;
  let mountTimer = 0;
  let themeTimer = 0;
  let warned = false;
  let usageTimer = 0;
  let usageInFlight = null;
  let usageQueued = false;
  let lastUsageFetch = 0;
  let wasGenerating = false;

  const account = () => (location.pathname.match(/\/u\/(\d+)/) || [])[1] || "0";

  function createDemo() {
    const now = Date.now();
    return {
      session: { pct: 100, resetsAt: now + 245 * 60000 },
      weekly: { pct: 13, resetsAt: now + 7460 * 60000 },
      plan: "Pro",
      demo: true,
    };
  }

  function current() {
    if (snapshot) return snapshot;
    if (DEMO) {
      if (!demo) demo = createDemo();
      return demo;
    }
    return null;
  }

  function usagePaths() {
    const id = account();
    return id === "0" ? ["/usage"] : [`/u/${id}/usage`, "/usage"];
  }

  function toEpoch(value) {
    if (typeof value === "number") return value < 1e12 ? value * 1000 : value;
    const parsed = Date.parse(value || "");
    return Number.isFinite(parsed) ? parsed : null;
  }

  function planFromTier(tier) {
    if (!tier) return "";
    const value = String(tier).toUpperCase();
    if (value === "TIER2" || value === "TIER_NEON" || value.includes("ULTRA")) return "ULTRA";
    if (value === "TIER_HELIUM" || value.includes("PLUS")) return "PLUS";
    if (value === "TIER1" || value.includes("PRO") || value.includes("PREMIUM")) return "PRO";
    if (value.includes("FREE") || value.includes("BASIC")) return "FREE";
    return "";
  }

  function poolWindow(pool) {
    const pct = Math.max(0, Math.min(100, Math.round(pool.percentageUsed * 100)));
    const resetsAt = toEpoch(pool.gxu?.windowRefreshesAt);
    return resetsAt ? { pct, resetsAt } : { pct };
  }

  function poolsToUsage(state) {
    const session = state.pools.find((pool) => pool.poolType === "GXU_FIVE_HOURLY");
    const weekly = state.pools.find((pool) => pool.poolType === "GXU_WEEKLY");
    if (!session && !weekly) return null;
    const usage = {};
    if (session) usage.session = poolWindow(session);
    if (weekly) usage.weekly = poolWindow(weekly);
    const plan = planFromTier(state.tier);
    if (plan) usage.plan = plan;
    return usage;
  }

  function collectUsageData(value, state, depth = 0) {
    if (!value || depth > 24) return;
    if (typeof value === "string") {
      if (value.length > 1 && value.length < 2000000 && value.includes("percentageUsed")) {
        try {
          collectUsageData(JSON.parse(value), state, depth + 1);
        } catch {}
      }
      return;
    }
    if (Array.isArray(value)) {
      for (const item of value) collectUsageData(item, state, depth + 1);
      return;
    }
    if (typeof value !== "object") return;
    if (typeof value.subscriptionTier === "string" && !state.tier) {
      state.tier = value.subscriptionTier;
    }
    if (
      value.poolType &&
      typeof value.percentageUsed === "number" &&
      !state.pools.some((pool) => pool.poolType === value.poolType)
    ) {
      state.pools.push(value);
    }
    for (const key of Object.keys(value)) {
      collectUsageData(value[key], state, depth + 1);
    }
  }

  function extractUsageFromHtml(html) {
    if (!html.includes("percentageUsed")) return null;
    let doc;
    try {
      doc = new DOMParser().parseFromString(html, "text/html");
    } catch {
      return null;
    }
    const state = { pools: [], tier: "" };
    for (const script of doc.querySelectorAll("script[data-bg3-relay-preload]")) {
      let data;
      try {
        data = JSON.parse(script.textContent);
      } catch {
        continue;
      }
      collectUsageData(data, state);
      if (state.pools.length >= 2) break;
    }
    return poolsToUsage(state);
  }

  function toAsciiDigits(text) {
    return text.replace(/\p{Nd}/gu, (char) => {
      const code = char.codePointAt(0);
      let zero = code;
      while (zero > 0 && /\p{Nd}/u.test(String.fromCodePoint(zero - 1))) zero--;
      return String(code - zero);
    });
  }

  function parsePercentText(text) {
    const match = toAsciiDigits(String(text)).match(/(\d+(?:[.,]\d+)?)\s*[%٪]/);
    if (!match) return null;
    const value = Number(match[1].replace(",", "."));
    if (!Number.isFinite(value)) return null;
    return Math.max(0, Math.min(100, Math.round(value)));
  }

  function sectionUsage(doc, testId) {
    const section = doc.querySelector(`[data-testid="${testId}"]`);
    if (!section) return null;
    const texts = [...section.querySelectorAll("*")]
      .filter((element) => !element.children.length && element.textContent.trim())
      .map((element) => element.textContent.trim());
    const pctText = texts.find((text) => parsePercentText(text) !== null);
    if (!pctText) return null;
    const pct = parsePercentText(pctText);
    const resetText =
      texts
        .filter((text) => parsePercentText(text) === null && /\p{Nd}/u.test(text))
        .pop() || "";
    return resetText ? { pct, resetText } : { pct };
  }

  function extractUsageFromDocument(doc) {
    const session = sectionUsage(doc, "current-usage");
    const weekly = sectionUsage(doc, "weekly-usage");
    if (!session && !weekly) return null;
    return {
      ...(session ? { session } : {}),
      ...(weekly ? { weekly } : {}),
    };
  }

  function loadUsageFramePath(path) {
    return new Promise((resolve) => {
      if (!document.body) {
        resolve(null);
        return;
      }
      const frame = document.createElement("iframe");
      frame.src = `${path}${path.includes("?") ? "&" : "?"}t=${Date.now()}`;
      frame.tabIndex = -1;
      frame.setAttribute("aria-hidden", "true");
      Object.assign(frame.style, {
        position: "fixed",
        left: "-10000px",
        top: "0",
        width: "1px",
        height: "1px",
        border: "0",
        opacity: "0",
        pointerEvents: "none",
      });
      let done = false;
      let attempts = 0;
      let poll = 0;
      let timeout = 0;
      const finish = (result) => {
        if (done) return;
        done = true;
        clearInterval(poll);
        clearTimeout(timeout);
        frame.remove();
        resolve(result);
      };
      const check = () => {
        let doc;
        try {
          doc = frame.contentDocument;
        } catch {
          finish(null);
          return;
        }
        if (!doc || doc.readyState === "loading") return;
        const usage = extractUsageFromDocument(doc);
        if (usage) {
          finish(usage);
          return;
        }
        if (++attempts >= 34) finish(null);
      };
      frame.addEventListener("load", check);
      document.body.append(frame);
      poll = setInterval(check, 300);
      timeout = setTimeout(() => finish(null), 11000);
    });
  }

  async function loadUsageFrame() {
    for (const path of usagePaths()) {
      const usage = await loadUsageFramePath(path);
      if (usage) return usage;
    }
    return null;
  }

  async function fetchUsageFromPage() {
    for (const path of usagePaths()) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        let response;
        try {
          response = await fetch(`${path}${path.includes("?") ? "&" : "?"}t=${Date.now()}`, {
            credentials: "same-origin",
            cache: "no-store",
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeout);
        }
        if (!response || !response.ok) continue;
        const usage = extractUsageFromHtml(await response.text());
        if (usage) return usage;
      } catch {}
    }
    return null;
  }

  function applyUsage(usage) {
    const previous = snapshot || {};
    snapshot = {
      ...previous,
      ...usage,
      session: usage.session || previous.session,
      weekly: usage.weekly || previous.weekly,
      plan: usage.plan || previous.plan || "",
    };
    snapshotAccount = account();
    try {
      chrome.storage.local.set({
        [STORAGE_KEY]: { ...snapshot, account: snapshotAccount },
      });
    } catch {}
    if (!chipHost || !chipUI || !panelHost) ensureMounted();
    else render();
  }

  function requestUsageRefresh(delay = 0) {
    if (DEMO) return;
    clearTimeout(usageTimer);
    const elapsed = lastUsageFetch ? Date.now() - lastUsageFetch : Infinity;
    const wait = Math.max(delay, elapsed < 15000 ? 15000 - elapsed : 0);
    usageTimer = setTimeout(refreshUsage, wait);
  }

  function refreshUsage() {
    if (DEMO) return Promise.resolve();
    if (usageInFlight) {
      usageQueued = true;
      return usageInFlight;
    }
    usageInFlight = (async () => {
      lastUsageFetch = Date.now();
      let usage = await fetchUsageFromPage();
      if (!usage) usage = await loadUsageFrame();
      if (usage) {
        applyUsage(usage);
        return;
      }
      if (!snapshot) requestUsageRefresh(30000);
    })()
      .catch(() => {})
      .finally(() => {
        usageInFlight = null;
        if (usageQueued) {
          usageQueued = false;
          requestUsageRefresh(1500);
        }
      });
    return usageInFlight;
  }

  function isGenerating() {
    try {
      return [...document.querySelectorAll(STOP_SELECTOR)].some(isVisible);
    } catch {
      return false;
    }
  }

  function checkGeneration() {
    const generating = isGenerating();
    if (wasGenerating && !generating) requestUsageRefresh(1200);
    wasGenerating = generating;
  }

  const formatCache = new Map();

  function numberFormat(options) {
    const key = `${locale}:${JSON.stringify(options)}`;
    let formatter = formatCache.get(key);
    if (!formatter) {
      try {
        formatter = new Intl.NumberFormat(locale, options);
      } catch {
        formatter = new Intl.NumberFormat("en", options);
      }
      formatCache.set(key, formatter);
    }
    return formatter;
  }

  function formatPercent(pct) {
    return numberFormat({ style: "percent", maximumFractionDigits: 0 }).format((pct || 0) / 100);
  }

  const dateTimeCache = new Map();

  function dateTimeFormat(options) {
    const key = `${locale}:${JSON.stringify(options)}`;
    let formatter = dateTimeCache.get(key);
    if (!formatter) {
      try {
        formatter = new Intl.DateTimeFormat(locale, options);
      } catch {
        formatter = new Intl.DateTimeFormat("en", options);
      }
      dateTimeCache.set(key, formatter);
    }
    return formatter;
  }

  function formatTime(timestamp) {
    return dateTimeFormat({ hour: "numeric", minute: "2-digit" }).format(timestamp);
  }

  function formatDate(timestamp) {
    return dateTimeFormat({ day: "2-digit", month: "2-digit" }).format(timestamp);
  }

  function applyLanguage() {
    if (!chipUI || !panelUI) return;
    panelUI.panel.lang = L.locale;
    panelUI.panel.dir = L.rtl ? "rtl" : "ltr";
    panelUI.panel.setAttribute("aria-label", L.usage);
    panelUI.title.textContent = L.usage;
    panelUI.session.label.textContent = L.session;
    panelUI.weekly.label.textContent = L.weekly;
    chipUI.chip.lang = L.locale;
    render();
  }

  function setLanguage(tag) {
    const next = i18n.resolve(tag);
    if (next === locale) return;
    locale = next;
    L = i18n.get(locale);
    applyLanguage();
  }

  function level(pct) {
    if (pct >= 85) return "high";
    if (pct >= 60) return "mid";
    return "low";
  }

  function setBar(element, pct) {
    element.style.width = `${Math.max(0, Math.min(100, pct))}%`;
    element.dataset.level = level(pct);
  }

  function detectTheme() {
    const anchor =
      composerInput && composerInput.isConnected
        ? composerInput
        : composer && composer.isConnected
          ? composer
          : document.body;
    let node = anchor;
    while (node) {
      const background = getComputedStyle(node).backgroundColor;
      const parts = background && background.match(/[\d.]+/g);
      if (parts && parts.length >= 3) {
        const [r, g, b, alpha] = parts.map(Number);
        if (parts.length >= 4 && alpha < 0.1) {
          node = node.parentElement;
          continue;
        }
        const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        return luminance < 0.5 ? "dark" : "light";
      }
      node = node.parentElement;
    }
    const scheme = getComputedStyle(document.documentElement).colorScheme || "";
    if (scheme.includes("dark") && !scheme.includes("light")) return "dark";
    if (scheme.includes("light") && !scheme.includes("dark")) return "light";
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme() {
    if (!chipHost) return;
    const next = detectTheme();
    if (chipHost.dataset.theme !== next) chipHost.dataset.theme = next;
    if (panelHost && panelHost.dataset.theme !== next) panelHost.dataset.theme = next;
  }

  function isVisible(element) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function deepQueryAll(selector, root = document) {
    const found = [];
    const queue = [root];
    while (queue.length) {
      const node = queue.shift();
      if (!node.querySelectorAll) continue;
      found.push(...node.querySelectorAll(selector));
      for (const element of node.querySelectorAll("*")) {
        if (element.shadowRoot) queue.push(element.shadowRoot);
      }
    }
    return found;
  }

  function findComposer() {
    const selector = 'rich-textarea, div[contenteditable="true"], textarea';
    let elements = [...document.querySelectorAll(selector)];
    if (!elements.some(isVisible)) elements = deepQueryAll(selector);
    const element = elements.find(isVisible) || elements[0];
    if (!element) return null;
    composerInput = element;
    return element.closest("form") || element;
  }

  const PICKER_SELECTOR =
    'button, [role="button"], [role="combobox"], [aria-haspopup="menu"], [aria-haspopup="listbox"]';

  function findModelPicker(mic) {
    if (!mic) return null;
    const micRect = mic.getBoundingClientRect();
    let candidates = [...document.querySelectorAll(PICKER_SELECTOR)];
    if (!candidates.some(isVisible)) candidates = deepQueryAll(PICKER_SELECTOR);

    let best = null;
    let bestScore = -Infinity;
    for (const element of candidates) {
      if (element === mic || element.contains(mic) || !isVisible(element)) continue;
      const text = (element.textContent || "").replace(/\s+/g, " ").trim();
      if (!text.length || text.length > 28) continue;
      if (!/\b(pro|flash|ultra|advanced|auto)\b/i.test(text)) continue;
      if (/upgrade|subscri|plan|google one|settings/i.test(text)) continue;

      const rect = element.getBoundingClientRect();
      const overlap = Math.min(rect.bottom, micRect.bottom) - Math.max(rect.top, micRect.top);
      if (overlap < Math.min(rect.height, micRect.height) * 0.5) continue;
      if (rect.left >= micRect.left) continue;

      let score = Math.max(0, 60 - Math.abs(rect.right - micRect.left));
      if (element.getAttribute("aria-haspopup")) score += 30;
      if (element.hasAttribute("aria-expanded")) score += 10;
      if (/^(gemini\s*)?\d*(\.\d+)?\s*(pro|flash|ultra|advanced|auto)$/i.test(text)) score += 40;
      if (text.length <= 14) score += 10;
      if (score > bestScore) {
        best = element;
        bestScore = score;
      }
    }
    return best;
  }

  function findMic() {
    const selector = [
      '[aria-label*="micro" i]',
      '[aria-label*="voice" i]',
      '[aria-label*="voz" i]',
      '[aria-label*="ditado" i]',
      '[aria-label*="dictat" i]',
      '[aria-label*="enviar" i]',
      '[aria-label*="send" i]',
      '[aria-label*="parar" i]',
      '[aria-label*="stop" i]',
      '[title*="micro" i]',
      '[title*="voice" i]',
      '[title*="voz" i]',
      '[mattooltip*="micro" i]',
      '[mattooltip*="voice" i]',
      '[mattooltip*="voz" i]',
      '[data-test-id*="mic" i]',
      '[data-testid*="mic" i]',
      '[data-test-id*="voice" i]',
      '[data-testid*="voice" i]',
      '[data-test-id*="audio" i]',
      '[data-testid*="audio" i]',
    ].join(",");

    let candidates = [...document.querySelectorAll(selector)];
    if (!candidates.some(isVisible)) candidates = deepQueryAll(selector);

    const anchor = composerInput && composerInput.isConnected ? composerInput : composer;
    const composerRect = anchor ? anchor.getBoundingClientRect() : null;
    let best = null;
    let bestDist = Infinity;
    for (const element of candidates) {
      if (!isVisible(element)) continue;
      if (!composerRect) return element;
      const rect = element.getBoundingClientRect();
      const dx = Math.max(0, composerRect.left - rect.right, rect.left - composerRect.right);
      const dy = Math.max(0, composerRect.top - rect.bottom, rect.top - composerRect.bottom);
      if (dx > 480 || dy > 280) continue;
      const dist = dx + dy;
      if (dist < bestDist) {
        best = element;
        bestDist = dist;
      }
    }
    if (best) return best;
    const fallback = findFallbackMic();
    if (fallback) warn("microphone button not found; using nearest control");
    return fallback;
  }

  function findFallbackMic() {
    const start = composerInput && composerInput.isConnected ? composerInput : composer;
    if (!start) return null;
    let node = start;
    for (let depth = 0; node && depth < 7; depth++, node = node.parentElement) {
      const buttons = [...node.querySelectorAll('button, [role="button"]')]
        .filter((element) => isVisible(element) && element.querySelector("svg, mat-icon"))
        .sort(
          (a, b) => b.getBoundingClientRect().right - a.getBoundingClientRect().right,
        );
      if (buttons.length >= 2) return buttons[0];
    }
    return null;
  }

  function findControlRow(mic) {
    let node = mic.parentElement;
    while (node && node !== document.body) {
      const style = getComputedStyle(node);
      if (/flex|grid/.test(style.display)) {
        const rect = node.getBoundingClientRect();
        if (rect.height <= 72) return node;
      }
      node = node.parentElement;
    }
    return mic.parentElement;
  }

  function childOf(row, node) {
    let child = node;
    while (child && child.parentElement !== row) child = child.parentElement;
    return child;
  }

  function hideChip() {
    if (chipHost) chipHost.style.display = "none";
  }

  function warn(message) {
    if (warned) return;
    warned = true;
    console.warn("[usage-for-gemini]", message);
  }

  function insertInline(row, micChild) {
    const rowRect = row.getBoundingClientRect();
    const size = rowRect.height && rowRect.height < 28 ? 24 : 32;
    chipHost.dataset.mode = "inline";
    chipHost.style.left = "";
    chipHost.style.top = "";
    chipHost.style.setProperty("--ufg-size", `${size}px`);
    if (micChild.previousElementSibling !== chipHost) micChild.before(chipHost);
    chipHost.style.display = "";
  }

  function positionFixed(model, mic) {
    const a = model.getBoundingClientRect();
    const b = mic.getBoundingClientRect();
    const centerA = a.top + a.height / 2;
    const centerB = b.top + b.height / 2;
    const gap = b.left - a.right;
    if (Math.abs(centerA - centerB) > 12 || b.left <= a.right) {
      hideChip();
      return;
    }
    if (gap < 24) {
      hideChip();
      return;
    }
    const size = gap >= 38 ? 32 : gap >= 34 ? 30 : gap >= 30 ? 28 : gap >= 26 ? 26 : 24;
    const centerX = a.right + gap / 2;
    const centerY = (centerA + centerB) / 2;
    chipHost.dataset.mode = "fixed";
    chipHost.style.setProperty("--ufg-size", `${size}px`);
    chipHost.style.left = `${Math.round(centerX - size / 2)}px`;
    chipHost.style.top = `${Math.round(centerY - size / 2)}px`;
    if (chipHost.parentElement !== document.body) document.body.append(chipHost);
    chipHost.style.display = "";
  }

  function positionChip() {
    if (!chipHost) return;
    if (!composer || !composer.isConnected) composer = findComposer();
    if (!composer) {
      hideChip();
      return;
    }

    const mic = findMic();
    if (!mic) {
      hideChip();
      warn("microphone button not found");
      return;
    }

    const model = findModelPicker(mic);
    let row = findControlRow(mic);

    if (model) {
      let candidate = mic.parentElement;
      while (candidate && !candidate.contains(model)) candidate = candidate.parentElement;
      if (candidate) {
        const rect = candidate.getBoundingClientRect();
        if (rect.height <= 100) row = candidate;
      }
    }

    const micChild = childOf(row, mic);
    if (micChild) {
      insertInline(row, micChild);
      return;
    }

    if (model) positionFixed(model, mic);
    else hideChip();
  }

  function row(wrap, name) {
    const element = wrap.querySelector(`[data-row="${name}"]`);
    return {
      label: element.querySelector(".ufg-row-label"),
      val: element.querySelector(".ufg-row-val"),
      fill: element.querySelector(".ufg-fill"),
      reset: element.querySelector(".ufg-reset"),
    };
  }

  function build() {
    let href;
    try {
      href = chrome.runtime.getURL("src/ui.css");
    } catch {
      return;
    }

    chipHost = document.createElement("div");
    chipHost.id = "ufg-chip-host";
    chipHost.dataset.kind = "chip";
    chipHost.style.display = "none";
    const chipRoot = chipHost.attachShadow({ mode: "open" });
    const chipLink = document.createElement("link");
    chipLink.rel = "stylesheet";
    chipLink.href = href;
    chipRoot.append(chipLink);

    const chipWrap = document.createElement("div");
    chipWrap.className = "ufg";
    chipWrap.innerHTML = `
      <button class="ufg-chip" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="ufg-panel">
        <svg class="ufg-ring" viewBox="0 0 28 28" aria-hidden="true">
          <circle class="ufg-ring-track" cx="14" cy="14" r="11.5"></circle>
          <circle class="ufg-ring-fill" cx="14" cy="14" r="11.5"></circle>
        </svg>
        <span class="ufg-pct" dir="ltr">0%</span>
      </button>`;
    chipRoot.append(chipWrap);

    chipUI = {
      wrap: chipWrap,
      chip: chipWrap.querySelector(".ufg-chip"),
      chipFill: chipWrap.querySelector(".ufg-ring-fill"),
      chipPct: chipWrap.querySelector(".ufg-pct"),
    };

    panelHost = document.createElement("div");
    panelHost.id = "ufg-panel-host";
    panelHost.dataset.kind = "panel";
    panelHost.style.display = "none";
    const panelRoot = panelHost.attachShadow({ mode: "open" });
    const panelLink = document.createElement("link");
    panelLink.rel = "stylesheet";
    panelLink.href = href;
    panelRoot.append(panelLink);

    const panelWrap = document.createElement("div");
    panelWrap.className = "ufg";
    panelWrap.innerHTML = `
      <div class="ufg-panel" id="ufg-panel" role="dialog" tabindex="-1" lang="${L.locale}" dir="${L.rtl ? "rtl" : "ltr"}" aria-label="${L.usage}">
        <div class="ufg-head">
          <span class="ufg-title">${L.usage}</span>
          <span class="ufg-plan"></span>
        </div>
        <div class="ufg-row" data-row="session">
          <div class="ufg-row-head">
            <span class="ufg-row-label">${L.session}</span>
            <span class="ufg-row-val" dir="ltr">0%</span>
          </div>
          <div class="ufg-bar ufg-bar-lg"><span class="ufg-fill"></span></div>
          <div class="ufg-reset"></div>
        </div>
        <div class="ufg-row" data-row="weekly">
          <div class="ufg-row-head">
            <span class="ufg-row-label">${L.weekly}</span>
            <span class="ufg-row-val" dir="ltr">0%</span>
          </div>
          <div class="ufg-bar ufg-bar-lg"><span class="ufg-fill"></span></div>
          <div class="ufg-reset"></div>
        </div>
      </div>`;
    panelRoot.append(panelWrap);

    panelUI = {
      wrap: panelWrap,
      panel: panelWrap.querySelector(".ufg-panel"),
      title: panelWrap.querySelector(".ufg-title"),
      plan: panelWrap.querySelector(".ufg-plan"),
      session: row(panelWrap, "session"),
      weekly: row(panelWrap, "weekly"),
    };

    chipUI.chip.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
    });
    chipUI.chip.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      setOpen(!isOpen, event.detail === 0 ? "keyboard" : "toggle");
    });

    document.addEventListener("pointerdown", (event) => {
      if (!isOpen) return;
      const path = event.composedPath();
      if (!path.includes(chipHost) && !path.includes(panelHost)) {
        setOpen(false, "outside");
      }
    });

    document.addEventListener("focusin", (event) => {
      if (!isOpen) return;
      const path = event.composedPath();
      if (!path.includes(chipHost) && !path.includes(panelHost)) {
        setOpen(false, "focusout");
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isOpen) {
        event.preventDefault();
        setOpen(false, "escape");
      }
    });

    addEventListener("blur", () => {
      if (isOpen) setOpen(false, "blur");
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden && isOpen) setOpen(false, "hidden");
    });

    document.body.append(chipHost);
  }

  function positionPanel() {
    if (!isOpen || !chipHost || !panelHost || !panelUI) return;
    const rect = chipHost.getBoundingClientRect();
    if (!rect.width) return;
    const panelRect = panelUI.panel.getBoundingClientRect();
    const gap = 8;
    const margin = 12;
    const spaceAbove = rect.top - margin;
    const spaceBelow = innerHeight - rect.bottom - margin;
    const fitsBelow = spaceBelow >= panelRect.height + gap;
    const fitsAbove = spaceAbove >= panelRect.height + gap;
    const down = fitsBelow || (!fitsAbove && spaceBelow >= spaceAbove);
    let right = Math.max(margin, Math.round(innerWidth - rect.right));
    if (innerWidth - right - panelRect.width < margin) {
      right = Math.max(margin, Math.round(innerWidth - panelRect.width - margin));
    }
    panelHost.style.right = `${right}px`;
    panelHost.style.left = "auto";
    if (down) {
      const top = Math.min(
        Math.round(rect.bottom + gap),
        Math.max(margin, innerHeight - panelRect.height - margin)
      );
      panelHost.style.top = `${top}px`;
      panelHost.style.bottom = "auto";
    } else {
      panelHost.style.bottom = `${Math.max(margin, Math.round(innerHeight - rect.top + gap))}px`;
      panelHost.style.top = "auto";
    }
    panelUI.wrap.classList.toggle("ufg--down", down);
  }

  function hidePanel() {
    closeTimer = 0;
    if (panelUI) panelUI.wrap.classList.remove("ufg--closing");
    if (panelHost) panelHost.style.display = "none";
  }

  function setOpen(value, reason = "") {
    if (value && !(current() && current().plan)) return;
    if (!chipUI || !panelHost) {
      isOpen = value;
      return;
    }
    if (value === isOpen) {
      if (value) positionPanel();
      return;
    }
    isOpen = value;
    chipUI.chip.setAttribute("aria-expanded", String(value));
    clearTimeout(closeTimer);
    closeTimer = 0;
    if (value) {
      if (Date.now() - lastUsageFetch > 60000) requestUsageRefresh(0);
      panelUI.wrap.classList.remove("ufg--closing");
      if (!panelHost.isConnected) document.body.append(panelHost);
      panelHost.style.display = "block";
      positionPanel();
      if (reason === "keyboard") {
        try {
          panelUI.panel.focus({ preventScroll: true });
        } catch {
          panelUI.panel.focus();
        }
      }
      return;
    }

    if (reason === "escape") {
      try {
        chipUI.chip.focus({ preventScroll: true });
      } catch {
        chipUI.chip.focus();
      }
    }
    if (panelHost.style.display === "none" || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      hidePanel();
      return;
    }
    panelUI.wrap.classList.add("ufg--closing");
    closeTimer = setTimeout(hidePanel, 90);
  }

  function tick() {
    const data = current();
    if (!data || !panelUI) return;
    const sessionReset = data.session?.resetsAt;
    const weeklyReset = data.weekly?.resetsAt;
    panelUI.session.reset.textContent =
      data.session?.resetText ||
      (sessionReset ? L.resetAt.replace("{time}", formatTime(sessionReset)) : "");
    panelUI.weekly.reset.textContent =
      data.weekly?.resetText ||
      (weeklyReset
        ? L.resetOn
            .replace("{date}", formatDate(weeklyReset))
            .replace("{time}", formatTime(weeklyReset))
        : "");
  }

  function render() {
    const data = current();
    if (!data || !data.plan) {
      if (chipHost) chipHost.style.display = "none";
      if (isOpen) setOpen(false);
      return;
    }
    if (!chipHost) build();
    if (!chipUI) return;

    applyTheme();

    const session = data.session || {};
    const weekly = data.weekly || {};
    const sessionPct = Math.round(session.pct || 0);
    const weeklyPct = Math.round(weekly.pct || 0);
    const sessionValue = formatPercent(sessionPct);
    const weeklyValue = formatPercent(weeklyPct);

    chipUI.chipPct.textContent = sessionValue;
    chipUI.chipPct.classList.toggle("ufg-pct--small", sessionPct >= 100);
    chipUI.chip.setAttribute("aria-label", L.aria.replace("{value}", sessionValue));
    const circumference = 2 * Math.PI * 11.5;
    chipUI.chipFill.style.strokeDasharray = `${circumference}`;
    chipUI.chipFill.style.strokeDashoffset = `${circumference * (1 - Math.min(100, sessionPct) / 100)}`;
    chipUI.chipFill.dataset.level = level(sessionPct);

    panelUI.plan.textContent = data.plan || "";
    panelUI.session.val.textContent = L.used.replace("{value}", sessionValue);
    panelUI.weekly.val.textContent = L.used.replace("{value}", weeklyValue);
    setBar(panelUI.session.fill, sessionPct);
    setBar(panelUI.weekly.fill, weeklyPct);

    positionChip();
    tick();
    positionPanel();
  }

  function schedulePosition() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      positionChip();
      positionPanel();
    });
  }

  function ensureMounted() {
    if (!current() || !current().plan) {
      if (chipHost) chipHost.style.display = "none";
      return;
    }
    if (!chipHost || !panelHost) build();
    composer = findComposer();
    render();
  }

  function loadSaved() {
    try {
      chrome.storage.local
        .get(STORAGE_KEY)
        .then((result) => {
          const saved = result && result[STORAGE_KEY];
          if (saved && saved.account === account() && !snapshot) {
            snapshot = saved;
            snapshotAccount = saved.account;
            render();
          }
        })
        .catch(() => {});
    } catch {}
  }

  const observer = new MutationObserver(() => {
    clearTimeout(mountTimer);
    mountTimer = setTimeout(() => {
      checkGeneration();
      if (!current() || !current().plan) {
        if (chipHost) chipHost.style.display = "none";
        return;
      }
      if (!chipHost) {
        ensureMounted();
        return;
      }
      schedulePosition();
    }, 180);
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });

  const languageObserver = new MutationObserver(() => {
    if (document.documentElement.lang) setLanguage(document.documentElement.lang);
  });

  languageObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["lang"],
  });

  const themeObserver = new MutationObserver((mutations) => {
    const anchor = composerInput || composer;
    let relevant = false;
    for (const mutation of mutations) {
      const target = mutation.target;
      if (
        target === document.documentElement ||
        target === document.body ||
        (anchor && target.nodeType === 1 && target.contains(anchor))
      ) {
        relevant = true;
        break;
      }
    }
    if (!relevant) return;
    clearTimeout(themeTimer);
    themeTimer = setTimeout(applyTheme, 80);
  });

  themeObserver.observe(document.documentElement, {
    attributes: true,
    subtree: true,
    attributeFilter: ["class", "style", "data-theme", "data-color-scheme"],
  });

  try {
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme);
  } catch {
    matchMedia("(prefers-color-scheme: dark)").addListener(applyTheme);
  }

  addEventListener("resize", schedulePosition);
  addEventListener("scroll", schedulePosition, true);

  setInterval(() => {
    if (location.href !== lastHref) {
      lastHref = location.href;
      if (snapshot && snapshotAccount !== account()) snapshot = null;
      composer = findComposer();
      render();
      loadSaved();
      if (!snapshot) requestUsageRefresh(500);
    }
    checkGeneration();
    applyTheme();
    if (isOpen) tick();
  }, 1000);

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && Date.now() - lastUsageFetch > 60000) requestUsageRefresh(0);
  });

  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== "local" || !changes[STORAGE_KEY]) return;
      const next = changes[STORAGE_KEY].newValue;
      if (next && next.account === account()) {
        snapshot = next;
        snapshotAccount = next.account;
        render();
      }
    });
  } catch {}

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureMounted, { once: true });
  } else {
    ensureMounted();
  }
  loadSaved();
  requestUsageRefresh(400);
  setInterval(() => requestUsageRefresh(0), USAGE_REFRESH_MS);
})();
