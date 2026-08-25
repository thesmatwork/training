import React, { useState } from "react";
import AuthScreen from "./components/AuthScreen";
import TaskBoard from "./components/TaskBoard";
import "./App.css";

const STORAGE_KEY = "ledger_auth"; // { token, phone, name }

function loadStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export default function App() {
  const [auth, setAuth] = useState(loadStoredAuth); // { token, phone, name } | null
  const [logoutMessage, setLogoutMessage] = useState(null);

  const handleLoggedIn = ({ token, phone, name }) => {
    const next = { token, phone, name: name || "" };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setLogoutMessage(null);
    setAuth(next);
  };

  const handleLogout = (message) => {
    localStorage.removeItem(STORAGE_KEY);
    setLogoutMessage(message || null);
    setAuth(null);
  };

  if (!auth) {
    return <AuthScreen onLoggedIn={handleLoggedIn} initialMessage={logoutMessage} />;
  }

  return <TaskBoard token={auth.token} phone={auth.phone} name={auth.name} onLogout={handleLogout} />;
}