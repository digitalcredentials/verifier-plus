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
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers
      });
    }

    let targetUrl = url;

    // If URL contains query parameters, extract the vc parameter
    if (url.includes('?')) {
      try {
        const urlObj = new URL(url);
        const vcUrl = urlObj.searchParams.get('vc');
        if (!vcUrl) {
          console.error('No vc parameter found in URL:', url);
          return new Response(JSON.stringify({ error: 'No credential URL found in query parameters' }), {
            status: 400,
            headers
          })
        }
        targetUrl = vcUrl;
      } catch (error) {
        console.error('Error parsing URL:', error);
        return new Response(JSON.stringify({ error: 'Invalid URL format' }), {
          status: 400,
          headers
        })
      }
    }

    const response = await fetch(targetUrl);

    if (!response.ok) {
      console.error('Fetch failed:', response.status, response.statusText);
      return new Response(JSON.stringify({ error: 'Failed to fetch URL' }), {
        status: response.status,
        headers
      })
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch URL' }), {
      status: 200,
      headers
    })
  }
} 