import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_NAME = '用户';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('@user').then((data) => {
      if (data) {
        setUser(JSON.parse(data));
      } else {
        const u = { name: DEFAULT_NAME };
        AsyncStorage.setItem('@user', JSON.stringify(u));
        setUser(u);
      }
      setLoading(false);
    }).catch(() => {
      const u = { name: DEFAULT_NAME };
      setUser(u);
      setLoading(false);
    });
  }, []);

  const updateName = async (name) => {
    const u = { ...user, name };
    await AsyncStorage.setItem('@user', JSON.stringify(u));
    setUser(u);
  };

  const updateAvatar = async (uri) => {
    const u = { ...user, avatarUri: uri };
    await AsyncStorage.setItem('@user', JSON.stringify(u));
    setUser(u);
  };

  return (
    <AuthContext.Provider value={{ user, updateName, updateAvatar, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
