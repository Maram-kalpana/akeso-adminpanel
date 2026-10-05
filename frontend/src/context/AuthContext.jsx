import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('hospital_admin_token'));
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setAdmin(null);
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((res) => setAdmin(res.data.admin))
      .catch(() => {
        localStorage.removeItem('hospital_admin_token');
        setToken(null);
        setAdmin(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      admin,
      loading,
      login: (nextToken, nextAdmin) => {
        localStorage.setItem('hospital_admin_token', nextToken);
        setToken(nextToken);
        setAdmin(nextAdmin);
      },
      logout: () => {
        localStorage.removeItem('hospital_admin_token');
        setToken(null);
        setAdmin(null);
      },
    }),
    [token, admin, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
