import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
 try {
	const kvs = params.kvs
    const hash = params.hash

    // Build te request body
	const request_body = {
		"key_value_store_address": kvs,
		"keys": [
		  {
			"key_json": {
				"value": hash,
				"kind": "String"
			}
		  }
		]
	  }

    // Query Stokenet via the Gateway API
    const response = await fetch("https://stokenet.radixdlt.com/state/key-value-store/data", {
		method: "POST",
		body: JSON.stringify(request_body),
		headers: {
			"Content-type": "application/json"
		}		
	});

    // Check if the response from the external API is okay.
    if (!response.ok) {
		return response;
	}

    // We're okay, let's server the file
	const data = await response.json().then((data) => data)
	const file_name = data.entries[0]['value']['programmatic_json']['fields'][0]['value']
	const file_hex = data.entries[0]['value']['programmatic_json']['fields'][1]['hex']
	const file_bytes = await hexToBytes(file_hex)

    // Return the file as a response with appropriate headers.
    return new Response(file_bytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${file_name}"`,
      }
    });
  } catch (error) {
    console.error('Error fetching file:', error);
    return new Response('Error fetching file', { status: 500 });
  }
}

async function hexToBytes(hex: string) {
    let bytes = [];
    for (let c = 0; c < hex.length; c += 2)
		bytes.push(parseInt(hex.substring(c, c + 2), 16));

    return new Uint8Array(bytes);
}