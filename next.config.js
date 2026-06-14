/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/indicacao',
        destination: '/indicacao.html',
        permanent: false,
      },
      {
        source: '/parceiros-qr',
        destination: '/parceiros-qr.html',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
