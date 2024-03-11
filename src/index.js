/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx) {

		const backendUrl = 'https://scraper.algo7.tools';

		try {
			// Attempt to fetch from the backend
			const backendResponse = await fetch(backendUrl, {
				method: 'HEAD', // Use a HEAD request for efficiency 
				headers: {
					"X-Source": "Cloudflare-Workers"
				}
			});

			const logs = {
				'Client IP': request.headers.get('cf-connecting-ip'),
				'Client Country': request.headers.get('cf-ipcountry'),
				'Client City': request.cf.city,
				'Client Region': request.cf.region,
				'Backend Status': backendResponse.status,
				'Time': new Date().toISOString(),
			};


			// Log to console
			console.log(logs);

			// Write to KV
			await env.MAINTENANCE_PAGE_LOGGING.put(`logs-${logs.Time}`, JSON.stringify(logs));



			// Backend is up
			if (backendResponse.ok) {
				return fetch(request); // Pass the request to the backend
			} else {
				// Backend is down
				return serveStatusPage();
			}

		} catch (error) {
			// Error contacting backend
			console.error(error);
			return serveStatusPage();
		}
	},


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
		headers: { 'Content-Type': 'text/html' }
	});
}