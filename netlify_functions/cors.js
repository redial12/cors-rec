var fetch = require("node-fetch");
exports.handler = async (event, context) => {
	var url = event.path;
	url = url.split(".netlify/functions/cors/")[1];
	url = decodeURIComponent(url);
	url = new URL(url);
	
	for (let i in event.queryStringParameters) {
		url.searchParams.append(i, event.queryStringParameters[i]);
	}
	console.log(url.href);
	var cookie_string = event.headers.cookie || "";
	var useragent = event.headers["user-agent"] || "";
	
	var header_to_send= {
		"Cookie": cookie_string,
		"User-Agent": useragent,
		"content-type": "application/json",
		"accept": "*/*",
		"host": url.host
	};
	
	var options = {
		method: event.httpMethod.toUpperCase(),
		headers: header_to_send,
		body: event.body
	}
	
	if (event.httpMethod.toUpperCase() == "GET" || event.httpMethod.toUpperCase() == "HEAD") delete options.body;
	
	var response = await fetch(url, options);
	var response_text = await response.text();
	var headers = response.headers.raw();
	
	var cookie_header = null;
	if (headers["set-cookie"]) cookie_header = headers["set-cookie"];
	
	return {
		statusCode: 200,
		body: response_text,
		headers: {
			"content-type": String(headers["content-type"]) || "text/plain",
			"access-control-allow-origin": "*",
			"access-control-allow-methods": "GET, HEAD, OPTIONS, POST, PUT",
			"access-control-allow-headers": "Accept, App-Platform, Authorization, Content-Type, Origin, Retry-After, Spotify-App-Version, X-Cloud-Trace-Context, client-token, content-access-token,content-type,cache-control,access-control-allow-origin,access-control-allow-headers,access-control-allow-methods,access-control-allow-credentials,access-control-max-age,content-encoding,content-length,strict-transport-security,x-content-type-options,date,server,via,alt-svc"
			// "access-control-allow-headers": "access-control-allow-headers, origin, accept, x-requested-with, content-type, access-control-request-method, access-control-request-headers, authorization"
		},
		multiValueHeaders: {
			"set-cookie": cookie_header || []
		}
	}
};