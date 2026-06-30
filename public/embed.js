/*
 * Lightning Tips — embed loader
 * ------------------------------------------------------------------
 * Drop this on any website to render the tipping widget:
 *
 *   <div id="lightning-tip"></div>
 *   <script src="https://YOUR-APP.vercel.app/embed.js" async></script>
 *
 * Optional config via data-attributes on the script tag:
 *   data-target="lightning-tip"   (id of the mount element)
 *   data-height="760"             (iframe height in px)
 *   data-width="380"              (iframe max width in px)
 */
(function () {
  var script =
    document.currentScript ||
    (function () {
      var s = document.getElementsByTagName("script");
      return s[s.length - 1];
    })();

  // Derive the app origin from where this script was served.
  var origin = new URL(script.src).origin;
  var targetId = script.getAttribute("data-target") || "lightning-tip";
  var height = script.getAttribute("data-height") || "760";
  var width = script.getAttribute("data-width") || "380";

  function mount() {
    var host = document.getElementById(targetId);
    if (!host) {
      // Fallback: insert right after the script tag.
      host = document.createElement("div");
      script.parentNode.insertBefore(host, script.nextSibling);
    }

    var iframe = document.createElement("iframe");
    iframe.src = origin + "/embed";
    iframe.title = "Lightning Tips";
    iframe.loading = "lazy";
    iframe.style.border = "0";
    iframe.style.width = "100%";
    iframe.style.maxWidth = width + "px";
    iframe.style.height = height + "px";
    iframe.style.colorScheme = "normal";
    iframe.setAttribute("scrolling", "no");
    iframe.allow = "clipboard-write";

    host.innerHTML = "";
    host.appendChild(iframe);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
