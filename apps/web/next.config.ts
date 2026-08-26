import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // המנוע נצרך ישירות מהמקור בתוך ה-workspace, בלי שלב build נפרד.
  transpilePackages: ['@pandora/deadline-gate'],
};

export default nextConfig;
