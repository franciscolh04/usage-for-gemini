(() => {
  if (window.__ufgInterceptor) return;
  window.__ufgInterceptor = true;

  const SOURCE = "usage-for-gemini";
  const MAX = 200000;
  const DEBUG = localStorage.getItem("ufg:debug") !== "0";

  window.__ufg = window.__ufg || { captures: [] };
  const store = window.__ufg;

  const RELEVANT_URL = /batchexecute|usage|quota|limit/i;
  const RELEVANT_BODY = /usage|quota|limit|reset|remaining|consum|limite|utiliza|restante/i;

  function relevant(url) {
    try {
      const parsed = new URL(url, location.href);
      if (parsed.origin !== location.origin) return false;
      return RELEVANT_URL.test(parsed.pathname + parsed.search);
    } catch {
      return false;
    }
  }

  function capture(url, text) {
    if (typeof text !== "string" || !text.length || text.length > MAX) return;
    store.captures.push({ url, body: text, at: Date.now() });
    if (store.captures.length > 20) store.captures.shift();
    if (!RELEVANT_BODY.test(text)) return;
    window.postMessage({ source: SOURCE, kind: "capture", url, body: text }, location.origin);
    if (DEBUG) console.log("[usage-for-gemini]", url, text.slice(0, 2000));
  }

  function responseText(res) {
    const type = (res.headers.get("content-type") || "").toLowerCase();
    if (type.includes("event-stream")) return null;
    if (!type.includes("json") && !type.includes("text")) return null;
    return res.clone().text();
  }

  const originalFetch = window.fetch;
  window.fetch = function (...args) {
    const result = originalFetch.apply(this, args);
    try {
      const request = args[0];
      const url =
        typeof request === "string"
          ? request
          : request instanceof URL
            ? request.href
            : request && request.url;
      if (url && relevant(url)) {
        result
          .then((res) => {
            const body = responseText(res);
            if (!body) return;
            body
              .then((text) => capture(res.url || url, text))
              .catch(() => {});
          })
          .catch(() => {});
      }
    } catch {}
    return result;
  };

  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this.__ufgURL = url;
    return originalOpen.call(this, method, url, ...rest);
  };

  XMLHttpRequest.prototype.send = function (...args) {
    this.addEventListener("load", () => {
      try {
        const url = this.__ufgURL;
        if (!url || !relevant(url)) return;
        const type = this.responseType;
        if (type && type !== "text" && type !== "json") return;
        const text = type === "json" ? JSON.stringify(this.response) : this.responseText;
        if (text) capture(url, text);
      } catch {}
    });
    return originalSend.apply(this, args);
  };
})();
