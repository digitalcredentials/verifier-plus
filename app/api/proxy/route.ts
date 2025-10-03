import { NextRequest } from 'next/server';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      console.error('No URL provided in request body');
      return Response.json({ error: 'URL is required' }, {
        status: 400,
        headers
      });
    }

    let targetUrl = url;

    try {
      const urlObj = new URL(url);
      // if there is a 'vc' query param then 
      // we want to use the value of that as our url
      const vcUrl = urlObj.searchParams.get('vc');
      if (vcUrl) {
        try {
          // now check the vcURL by parsing it
          new URL(vcUrl)
        } catch (e) {
          console.error("Error parsing the URL in the 'VC' query parameter:", e);
          return Response.json({ error: "Invalid URL format in the 'vc' query parameter" }, {
            status: 400,
            headers
          })
        }
        targetUrl = vcUrl;
      }
    } catch (error) {
      console.error('Error parsing URL:', error);
      return Response.json({ error: 'Invalid URL format' }, {
        status: 400,
        headers
      })
    }

    const response = await fetch(targetUrl);

    if (!response.ok) {
      console.error('Fetch failed:', response.status, response.statusText);

      return Response.json({ error: 'Failed to fetch URL' }, {
        status: response.status,
        headers
      })
    }

    const data = await response.json();
    return Response.json(data, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('Proxy error:', error);
    return Response.json({ error: 'Failed to fetch URL' }, {
      status: 500,
      headers
    })
  }
} 