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

		try {
			// Attempt to fetch from the backend
			const backendResponse = await fetch(env.BACKEND_URL, {
				method: 'HEAD', // Use a HEAD request for efficiency 
				headers: {
					"X-Source": "Cloudflare-Workers"
				}
			});

			// Create a log object
			const logs = {
				'Client IP': request.headers.get('cf-connecting-ip'),
				'Client Country': request.headers.get('cf-ipcountry'),
				'Client City': request.cf.city,
				'Client Region': request.cf.region,
				'Backend Status': backendResponse.status,
				'Request URL': request.url,
				'Time': new Date().toISOString(),
			};


			// Log to console
			console.log(logs);

			// Write to KV. Even if the write fails, the request will still be passed to the backend
			try {
				await env.MAINTENANCE_PAGE_LOGGING.put(`logs-${logs.Time}`, JSON.stringify(logs));
			} catch (kvError) {
				console.error('KV Put failed:', kvError);
			}


			// Backend is up
			if (backendResponse.ok) {
				return fetch(request); // Pass the request to the backend
			} else {
				// Backend is down
				return serveStatusPage(env.CONTACT_EMAIL);
			}

		} catch (error) {
			// Error contacting backend
			console.error('Error contacting backend:', error);
			return serveStatusPage(env.CONTACT_EMAIL);
		}
	},


};


// Serve a simple maintenance page
function serveStatusPage(contactEmail) {
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
			<p>Sorry for the inconvenience but we&rsquo;re performing some maintenance at the moment. If you need to you can always <a href="mailto:${contactEmail}">contact me</a>, otherwise the service be back online shortly!</p>
			<p>&mdash; Algo7</p>
		</div>
	</article>
	`, {
		status: 503,
		headers: { 'Content-Type': 'text/html' }
	});
}