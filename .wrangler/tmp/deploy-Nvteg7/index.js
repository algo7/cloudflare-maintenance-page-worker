// src/index.js
var src_default = {
  async fetch(request, env, ctx) {
    const backendUrl = "https://scraper.algo7.tools";
    try {
      const backendResponse = await fetch(backendUrl, {
        method: "HEAD",
        // Use a HEAD request for efficiency 
        headers: {
          "X-Source": "Cloudflare-Workers"
        }
      });
      const logs = {
        "Client IP": request.headers.get("cf-connecting-ip"),
        "Client Country": request.headers.get("cf-ipcountry"),
        "Client City": request.cf.city,
        "Client Region": request.cf.region,
        "Backend Status": backendResponse.status,
        "Time": (/* @__PURE__ */ new Date()).toISOString()
      };
      console.log(logs);
      await env.MAINTENANCE_PAGE_LOGGING.put("logs", JSON.stringify(logs));
      if (backendResponse.ok) {
        return fetch(request);
      } else {
        return serveStatusPage();
      }
    } catch (error) {
      console.error(error);
      return serveStatusPage();
    }
  }
};
function serveStatusPage() {
  return new Response(`
	<!doctype html>
	<title>Site Maintenance</title>
	<style>
	  body { text-align: center; padding: 150px; }
	  h1 { font-size: 50px; }
	  body { font: 20px Helvetica, sans-serif; color: #333; }
	  article { display: block; text-align: left; width: 650px; margin: 0 auto; }
	  a { color: #dc8100; text-decoration: none; }
	  a:hover { color: #333; text-decoration: none; }
	</style>
	
	<article>
		<h1>We&rsquo;ll be back soon!</h1>
		<div>
			<p>Sorry for the inconvenience but we&rsquo;re performing some maintenance at the moment. If you need to you can always <a href="mailto:support@algo7.tools">contact me</a>, otherwise we&rsquo;ll be back online shortly!</p>
			<p>&mdash; Algo7</p>
		</div>
	</article>
	`, {
    status: 503,
    headers: { "Content-Type": "text/html" }
  });
}
export {
  src_default as default
};
//# sourceMappingURL=index.js.map
