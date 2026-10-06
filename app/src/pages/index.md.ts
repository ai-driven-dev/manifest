import { getManifestoMarkdown } from '~/lib/manifesto';
import { textResponse } from '~/lib/response';
import { absoluteUrl } from '~/lib/site';

export function GET() {
  return textResponse(getManifestoMarkdown(), 'text/markdown; charset=utf-8', {
    headers: { Link: `<${absoluteUrl('/')}>; rel="canonical"` },
  });
}
