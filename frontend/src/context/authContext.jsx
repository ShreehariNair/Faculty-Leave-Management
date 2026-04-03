import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post("/auth/login", { email, password });
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (formData) => {
    const { data } = await API.post("/auth/register", formData);
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  /* Update text profile fields */
  const updateProfile = async (fields) => {
    const { data } = await API.put("/users/profile", fields);
    const updated = { ...user, ...data };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
    return updated;
  };
  const changePassword = async (payload) => {
    const { data } = await API.put("/users/change-password", payload);
    return data;
  };
  /* Upload / replace avatar image */
  const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);

    const { data } = await API.post("/users/avatar", formData);
    const updated = { ...user, avatar: data.avatar };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
    return data.avatar;
  };

  /* Remove avatar */
  const removeAvatar = async () => {
    await API.delete("/users/avatar");
    const updated = { ...user, avatar: null };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        uploadAvatar,
        removeAvatar,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
