// Single source of truth for both AuthScreen.jsx and TaskBoard.jsx.
// Flip MOCK_MODE here once — both files import it, so they can never
// disagree with each other.

export const MOCK_MODE = false;
export const API_BASE = "http://127.0.0.1:8000";