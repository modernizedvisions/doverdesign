type AdminAuthEnv = {
  ADMIN_PASSWORD?: string;
};

export const getAdminPasswordFromRequest = (request: Request): string => {
  return (
    request.headers.get('x-admin-password') ||
    request.headers.get('X-Admin-Password') ||
    ''
  );
};

export const requireAdmin = (request: Request, env: AdminAuthEnv): Response | null => {
  const expected = env?.ADMIN_PASSWORD || '';
  const provided = getAdminPasswordFromRequest(request);
  const hasExpected = !!expected;
  const hasProvided = !!provided;

  if (!hasExpected || !hasProvided || provided !== expected) {
    return Response.json(
      {
        ok: false,
        code: 'UNAUTHORIZED',
        expectedLength: expected.length,
        providedLength: provided.length,
        hasExpected,
        hasProvided,
      },
      { status: 401 }
    );
  }

  return null;
};
