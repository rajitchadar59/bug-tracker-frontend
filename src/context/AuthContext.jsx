import { createContext, useState, useEffect, useContext } from 'react';
import fetchApi from '../fetchApi';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Token hai, toh backend se user ka data laao
          const data = await fetchApi('/auth/me');
          if (data.success) {
            setUser(data.user);
          } else {
            // Agar token expire ho gaya ho
            localStorage.removeItem('token');
          }
        } catch (err) {
          console.error("Session expired or invalid token:", err);
          localStorage.removeItem('token');
        }
      }
      // Data aane ke baad loading false kar do
      setLoading(false);
    };
    
    checkUser();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/auth'; 
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);