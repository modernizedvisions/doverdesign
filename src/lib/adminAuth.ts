const ADMIN_PASSWORD_KEY = 'admin_password';
const ADMIN_REMEMBER_KEY = 'admin_password_remember';

const shouldDebug = () => import.meta.env.VITE_DEBUG_ADMIN_AUTH === '1';

export const getAdminPassword = () => {
  return (
    sessionStorage.getItem(ADMIN_PASSWORD_KEY) ||
    localStorage.getItem(ADMIN_PASSWORD_KEY) ||
    ''
  );
};

export const setAdminPassword = (password: string, remember: boolean) => {
  sessionStorage.setItem(ADMIN_PASSWORD_KEY, password);
  if (remember) {
    localStorage.setItem(ADMIN_PASSWORD_KEY, password);
    localStorage.setItem(ADMIN_REMEMBER_KEY, '1');
  } else {
    localStorage.removeItem(ADMIN_PASSWORD_KEY);
    localStorage.removeItem(ADMIN_REMEMBER_KEY);
  }
};

export const clearAdminPassword = () => {
  sessionStorage.removeItem(ADMIN_PASSWORD_KEY);
  localStorage.removeItem(ADMIN_PASSWORD_KEY);
  localStorage.removeItem(ADMIN_REMEMBER_KEY);
};

export const notifyAdminAuthRequired = (message?: string) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('admin-auth-required', {
      detail: { message: message || 'Admin session expired. Please re-authenticate.' },
    })
  );
};

export const adminFetch = async (input: string, init: RequestInit = {}) => {
  const adminPassword = getAdminPassword();
  const headers = new Headers(init.headers || {});
  const headerSet = !!adminPassword;
  if (adminPassword) {
    headers.set('x-admin-password', adminPassword);
    headers.set('X-Admin-Password', adminPassword);
  }

  if (shouldDebug()) {
    console.debug('[admin auth] fetch', {
      path: input,
      headerSet,
    });
  }

  if (!adminPassword) {
    notifyAdminAuthRequired();
    throw new Error('Admin session expired. Please re-authenticate.');
  }

  const response = await fetch(input, { ...init, headers });
  if (response.status === 401) {
    notifyAdminAuthRequired();
    throw new Error('Admin session expired. Please re-authenticate.');
  }

  return response;
};

export const getRememberAdminPassword = () => localStorage.getItem(ADMIN_REMEMBER_KEY) === '1';
