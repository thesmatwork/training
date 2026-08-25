import React, { useState } from "react";
import AuthScreen from "./components/AuthScreen";
import StudentManagement from "./components/StudentManagement";
import "./App.css";

const STORAGE_KEY = "student_management_auth";

function loadStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

export default function App() {
  const [auth, setAuth] = useState(loadStoredAuth);
  const [logoutMessage, setLogoutMessage] = useState("");

  const handleLoggedIn = ({ token, email }) => {
    const next = {
      token,
      email,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

    setLogoutMessage("");
    setAuth(next);
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);

    setAuth(null);
    setLogoutMessage("You have been logged out successfully.");
  };

  if (!auth) {
    return (
      <AuthScreen
        onLoggedIn={handleLoggedIn}
        initialMessage={logoutMessage}
      />
    );
  }

  return (
    <StudentManagement
      token={auth.token}
      email={auth.email}
      onLogout={handleLogout}
    />
  );
}