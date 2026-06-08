import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('@user').then((data) => {
      if (data) setUser(JSON.parse(data));
      setLoading(false);
    });
  }, []);

  const login = async (phone) => {
    const u = { phone, name: '用户' + phone.slice(-4), registerDate: new Date().toISOString() };
    await AsyncStorage.setItem('@user', JSON.stringify(u));
    setUser(u);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('@user');
    setUser(null);
  };

  const updateName = async (name) => {
    const u = { ...user, name };
    await AsyncStorage.setItem('@user', JSON.stringify(u));
    setUser(u);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateName, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
