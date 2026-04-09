/**
 * Google Analytics (GA4) + CMS data loader
 * Include on every page: <script src="js/analytics.js" defer></script>
 */
(function() {
  // Use shared CMS promise if cms.js already set it, or create one
  window.__pbCmsPromise = window.__pbCmsPromise ||
    fetch('https://api.paperbook.app/api/public/website')
      .then(function(r) { return r.ok ? r.json() : null })
      .catch(function() { return null });

  window.__pbCmsPromise.then(function(data) {
    var gaId = data && data.seo && data.seo.gaTrackingId;
    if (gaId && gaId.startsWith('G-')) {
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + gaId;
      document.head.appendChild(s);
      s.onload = function() {
        window.dataLayer = window.dataLayer || [];
        function gtag(){ dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', gaId);
      };
    }
  });
})();
