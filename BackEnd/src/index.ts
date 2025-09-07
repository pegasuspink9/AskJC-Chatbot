import app from './app';
import { VercelRequest, VercelResponse } from '@vercel/node';

// For Vercel serverless function
export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}

// For local development (optional)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}