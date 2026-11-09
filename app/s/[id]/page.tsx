import { notFound, redirect } from 'next/navigation';
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
  const { id } = await params
  const credentialUrl = await shortLinks.get({ id });

  if (!credentialUrl) {
    notFound();
  }

  redirect(`/#verify?vc=${encodeURIComponent(credentialUrl)}`);
}
