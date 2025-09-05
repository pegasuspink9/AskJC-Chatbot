import app from "./app";
import { VercelRequest, VercelResponse } from "@vercel/node";

// For Vercel deployment
export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}

// For local development only
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}