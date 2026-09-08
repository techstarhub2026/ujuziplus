/**
 * UjuziPlus branding layer for the Open Knowledge mirror.
 *
 * Injected into every HTML page the mirror serves (see the
 * `/api/open-knowledge` route). Kept as strings rather than files because the
 * mirror is gitignored and must stay byte-identical to its source archive.
 */

const BRAND = "rgb(243 146 35)";
const BRAND_DARK = "rgb(203 116 18)";
const BRAND_PALE = "rgb(253 240 224)";

/**
 * The upstream palette, hardcoded throughout the mirror's stylesheet and its
 * inline `style` attributes: primary green, its hover shade, and the pale tint
 * used for section backgrounds.
 */
const UPSTREAM_PALETTE: ReadonlyArray<readonly [RegExp, string]> = [
  [/#04aa6d\b/gi, BRAND],
  [/#059862\b/gi, BRAND_DARK],
  [/#d9eee1\b/gi, BRAND_PALE],
];

/** Swaps the upstream palette for ours anywhere it appears in a stylesheet. */
export function recolorCss(css: string) {
  return UPSTREAM_PALETTE.reduce(
    (out, [pattern, replacement]) => out.replace(pattern, replacement),
    css,
  );
}

/**
 * Hides the upstream identity and recolours the chrome.
 *
 * Marked `!important` throughout because the mirror sets most of these inline
 * or late in its own stylesheet.
 */
export const BRAND_STYLE = `<style id="ujuziplus-brand">
  /* Upstream logo glyph, account and commercial entry points. */
  .fa-logo, .fa-logow3,
  #w3loginbtn, #loginactioncontainer, #mypagediv,
  #cert_navbtn, .topnavmain_pro,
  a[href*="profile.w3schools.com"],
  a[href*="shop.w3schools.com"],
  a[href*="my-learning"],
  a[href*="/spaces/"],
  a[href*="spaces/index.html"],
  a[href*="/pro/"],
  a[href*="codegame"],
  a[title*="Spaces"],
  /* W3.CSS is the upstream's own CSS framework. It is branding rather than
     general reference material, and renaming it would misname a real library,
     so the entry points to it are dropped instead. */
  #topnav a[href*="w3css"],
  a[href*="/w3css/"] {
    display: none !important;
  }

  /* Our wordmark, in the slot the glyph vacated. The bar clips overflow, so
     the mark must not be allowed to wrap onto a second line. */
  #ujuziplus-mark {
    display: inline-flex !important;
    align-items: center;
    flex: 0 0 auto;
    font-family: "Source Sans Pro", system-ui, sans-serif;
    font-size: 24px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.01em;
    /* The bar is dark on some pages and light on others, so the mark takes its
       colour from the bar's own text rather than assuming white. */
    color: inherit;
    text-decoration: none !important;
    white-space: nowrap !important;
    word-break: keep-all;
    padding: 0 14px 0 4px;
  }
  #ujuziplus-mark span {
    color: ${BRAND} !important;
    white-space: nowrap !important;
  }

  /* The link wrapping the old glyph is sized for a 42px icon and clips its
     overflow, which would cut our longer wordmark in half. */
  .ujuziplus-mark-host {
    width: auto !important;
    min-width: 150px !important;
    overflow: visible !important;
    padding-left: 12px !important;
    padding-right: 12px !important;
  }

  /* Upstream green -> UjuziPlus orange. */
  .ws-green, .w3-green, .ws-btn-green,
  .w3-bar-item.w3-green, .ws-bg-green,
  .ws-btn, .w3-btn.ws-green, .nextprev a,
  button.w3-green, input[type="submit"].w3-green {
    background-color: ${BRAND} !important;
  }
  .ws-text-green, .w3-text-green, a.ws-text-green,
  .ws-text-green a, .w3-text-green a {
    color: ${BRAND} !important;
  }
  .ws-border-green, .w3-border-green { border-color: ${BRAND} !important; }
  .ws-hover-green:hover, .w3-hover-green:hover,
  .ws-btn:hover, .w3-btn:hover {
    background-color: ${BRAND_DARK} !important;
  }
  .ws-pale-green, .w3-pale-green { background-color: ${BRAND_PALE} !important; }
  #sidenav a:hover, #leftmenuinnerinner a:hover { color: ${BRAND} !important; }
  #leftmenuinnerinner a.active, #leftmenuinnerinner a:active {
    background-color: ${BRAND} !important;
    color: #fff !important;
  }

  /* The hero's decorative wave is drawn as a green SVG/background. */
  .ws-pale-green svg, svg .ws-shape-green { fill: ${BRAND_PALE} !important; }

  ::selection { background: ${BRAND}; color: #fff; }
</style>`;

/**
 * Rewrites text and links after parse.
 *
 * Runs at `</body>`, so the DOM above it already exists; a MutationObserver
 * covers the nodes the mirror's own scripts add afterwards.
 */
export const BRAND_SCRIPT = `<script id="ujuziplus-brand-script">
(function () {
  var BRAND_HOST = /(^|\\.)w3schools\\.com$/i;

  function insertMark() {
    if (document.getElementById("ujuziplus-mark")) return;
    var glyph = document.querySelector(".fa-logo");
    if (!glyph || !glyph.parentNode) return;
    var mark = document.createElement("a");
    mark.id = "ujuziplus-mark";
    mark.href = "/open-knowledge";
    mark.target = "_top";
    mark.innerHTML = "Ujuzi<span>Plus</span>";
    glyph.parentNode.insertBefore(mark, glyph);

    var host = glyph.closest ? glyph.closest("a, .w3-bar-item") : null;
    if (host) host.classList.add("ujuziplus-mark-host");
  }

  /** Renames the source in visible copy, preserving the original casing. */
  function renameText(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var parent = node.parentNode;
        if (!parent) return NodeFilter.FILTER_REJECT;
        var tag = parent.nodeName;
        if (tag === "SCRIPT" || tag === "STYLE" || tag === "TEXTAREA" || tag === "PRE" || tag === "CODE") {
          return NodeFilter.FILTER_REJECT;
        }
        return /w3schools/i.test(node.nodeValue || "")
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      }
    });

    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(function (node) {
      node.nodeValue = node.nodeValue
        .replace(/W3Schools/g, "UjuziPlus")
        .replace(/w3schools/g, "UjuziPlus")
        .replace(/W3SCHOOLS/g, "UJUZIPLUS");
    });
  }

  /** Keeps navigation inside the proxy; drops links that leave the mirror. */
  function rewriteLinks(root) {
    var anchors = root.querySelectorAll ? root.querySelectorAll("a[href]") : [];
    Array.prototype.forEach.call(anchors, function (a) {
      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#" || /^(javascript|mailto|tel):/i.test(href)) return;

      var url;
      try {
        url = new URL(href, window.location.href);
      } catch (err) {
        return;
      }

      if (url.origin === window.location.origin) {
        a.removeAttribute("target");
        return;
      }

      if (BRAND_HOST.test(url.hostname)) {
        a.setAttribute("href", "/api/open-knowledge" + url.pathname + url.search);
        a.removeAttribute("target");
        return;
      }

      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    });
  }

  function apply(root) {
    insertMark();
    renameText(root);
    rewriteLinks(root);
  }

  apply(document.body);

  if (/w3schools/i.test(document.title)) {
    document.title = document.title.replace(/w3schools/gi, "UjuziPlus");
  }

  var pending = false;
  new MutationObserver(function () {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () {
      pending = false;
      apply(document.body);
    });
  }).observe(document.body, { childList: true, subtree: true });
})();
</script>`;
