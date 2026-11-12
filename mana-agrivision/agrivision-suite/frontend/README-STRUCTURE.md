# Mana Polam frontend – separated level architecture

- `src/app`: level selection and top-level routing.
- `src/levels/beginner|intermediate|expert`: separate dashboard entry, layout, route module, page directory and styles for each farmer level.
- `src/shared`: shared legacy feature implementations, pages, API client, components, hooks, translations, assets and global styles.

The existing page implementations and API client have been moved rather than discarded. The level route modules currently reuse those implementations where a dedicated feature implementation was not present in the uploaded source.

Run: `npm install` then `npm run dev`. Backend default: `http://127.0.0.1:8000`; set `VITE_API_BASE_URL` in your local `.env` if needed. Do not commit real secrets.
