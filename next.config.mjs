/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/webhook',
        destination: 'https://n8n.arkeup.com/webhook/7f6e7c35-c134-4630-bf07-81ab60c59d6e',
      },
    ]
  },
};

export default nextConfig;
