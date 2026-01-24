import { getAdminPasswordFromRequest, requireAdmin } from '../_lib/adminAuth';

type Env = {
  ADMIN_PASSWORD?: string;
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });

export async function onRequestGet(context: { env: Env; request: Request }): Promise<Response> {
  const unauthorized = requireAdmin(context.request, context.env);
  if (unauthorized) return unauthorized;

  const expected = context.env.ADMIN_PASSWORD || '';
  const provided = getAdminPasswordFromRequest(context.request);
  return json({
    ok: true,
    code: 'AUTHORIZED',
    expectedLength: expected.length,
    providedLength: provided.length,
    hasExpected: !!expected,
    hasProvided: !!provided,
  });
}
