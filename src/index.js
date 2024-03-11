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
				method: 'HEAD' // Use a HEAD request for efficiency 
			});

			// Backend is up
			if (backendResponse.ok) {
				return fetch(request); // Pass the request to the backend
			} else {
				// Backend is down
				return serveStatusPage();
			}

		} catch (error) {
			// Error contacting backend
			return serveStatusPage();
		}
	},


};


addEventListener('fetch', event => {
	event.respondWith(handleRequest(event.request))
})

function serveStatusPage() {
	return new Response(`
	  <!DOCTYPE html>
	  <html>
	  <head>
		<title>Service Temporarily Unavailable</title>
	  </head>
	  <body>
		<h1>Our service is currently down for maintenance.</h1>
		<p>We apologize for the inconvenience and expect to be back online shortly.</p>
	  </body>
	  </html>
	`, {
		status: 503,
		headers: { 'Content-Type': 'text/html' }
	});
}