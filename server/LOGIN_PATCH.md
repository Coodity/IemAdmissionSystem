# Wire Login.tsx (minimal change)

Add `import { api } from '../api';` and replace `handleLogin`:

```tsx
async function handleLogin(e: React.FormEvent) {
  e.preventDefault();
  try {
    const data = await api('/auth/login', 'POST', { email, password });
    localStorage.setItem('token', data.token);
    if (data.role === 'applicant') {
      navigate('/dashboard');
    } else {
      navigate('/officer');
    }
  } catch (err) {
    alert((err as Error).message);
  }
}
```
Role now comes from the server, so the "Login as" toggle can go.

# Run
1. `cd iem-server && cp .env.example .env && npm i && npm run dev` (needs MongoDB running)
2. Officer login is seeded: staff@iem.edu / Staff@123
3. Frontend: `pnpm dev` (CORS allows localhost:5173)
