import { NextRequest } from 'next/server';
import { appContext } from '@/lib/context/context-store';
import { isTimeoutError, OUTBOUND_TIMEOUT_MS, readTextWithin, withTimeout } from '@/lib/limits';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
}

/**
 * POST /api/proxy
 * Body: { url }, up to 5 MB (413 over it). Fetches the url, or the url in its
 * 'vc' query parameter, and answers its JSON. Answers 504 when the fetch takes
 * longer than 20 seconds and 502 when the document is over 5 MB.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await readTextWithin(request);
    if (body === null) {
      return Response.json({ error: 'Request body too large (limit 5 MB)' }, {
        status: 413,
        headers
      });
    }
    const { url } = JSON.parse(body);

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

    const { fetch } = await appContext();
    let fetched: { ok: false, status: number } | { ok: true, text: string | null };
    try {
      fetched = await withTimeout(OUTBOUND_TIMEOUT_MS, async (signal) => {
        const response = await fetch(targetUrl, { signal });
        if (!response.ok) {
          console.error('Fetch failed:', response.status, response.statusText);
          await response.body?.cancel().catch(() => {});
          return { ok: false, status: response.status };
        }
        return { ok: true, text: await readTextWithin(response) };
      });
    } catch (error) {
      if (!isTimeoutError(error)) throw error;
      console.error('Fetch timed out:', targetUrl);
      return Response.json({ error: 'Fetching the URL timed out after 20 seconds' }, {
        status: 504,
        headers
      })
    }

    if (!fetched.ok) {
      return Response.json({ error: 'Failed to fetch URL' }, {
        status: fetched.status,
        headers
      })
    }

    if (fetched.text === null) {
      // The remote is at fault, not the caller.
      console.error('Remote document too large:', targetUrl);
      return Response.json({ error: 'Remote document too large (limit 5 MB)' }, {
        status: 502,
        headers
      })
    }

    const data = JSON.parse(fetched.text);
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