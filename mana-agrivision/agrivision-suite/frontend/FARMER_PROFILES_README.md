# Mana Polam Farmer Profiles

The Beginner, Intermediate and Expert profile routes now render separate level-specific profile experiences through a shared responsive component.

## Updated files
- `src/shared/components/FarmerProfile.jsx`
- `src/shared/components/FarmerProfile.css`
- `src/levels/beginner/pages/ProfilePage.jsx`
- `src/levels/intermediate/pages/ProfilePage.jsx`
- `src/levels/expert/pages/ProfilePage.jsx`

## Data persistence
- The signed-in user's display name is updated through the existing `PATCH /api/v1/auth/me` endpoint when it changes.
- Extended profile fields, farm records and equipment records are currently stored in browser `localStorage`, separated by experience level.
- To persist all extended fields across devices, the backend needs matching profile/farm/equipment endpoints and database columns. The supplied frontend archive did not include the backend, so no unsupported endpoint was assumed.

## Run
From this `frontend` folder:
```bash
npm install
npm run dev
```
