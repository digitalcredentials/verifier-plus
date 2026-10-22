import { redirect } from 'next/navigation';
import { LoadingError } from '@/components/LoadingError/LoadingError';
import * as shortLinks from '@/lib/shortLinks';

/**
 * GET /s/{shortLinkId}
 * Opens the credential behind a short link, the same way the long
 * /#verify?vc={url} link does.
 */
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  let credentialUrl: string
  try {
    const { id } = await params
    credentialUrl = await shortLinks.get({ id });
  } catch (error) {
    console.log(error)
    return (<LoadingError />)
  }

  // redirect() works by throwing, so it has to stay outside the try/catch
  redirect(`/#verify?vc=${encodeURIComponent(credentialUrl)}`);
}
