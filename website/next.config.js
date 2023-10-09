/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,
  reactStrictMode: true,
  swcMinify: true,
  //next js <html> element does not have a [lang] attribute
  i18n: { 
    locales: ["en"],
    defaultLocale: "en",
  },
}

module.exports = nextConfig
