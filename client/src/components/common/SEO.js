import React from 'react';
import { Helmet } from 'react-helmet';

const SEO = ({ 
  title = 'Village Portfolio',
  description = 'Discover Puriya Thanda village - A comprehensive portfolio showcasing our culture, development, and community.',
  keywords = 'village portfolio, Puriya Thanda, development, culture, community',
  image = '/images/og-image.jpg',
  url = 'https://villageportfolio.com'
}) => {
  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph meta tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />

      {/* Twitter Card meta tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional meta tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#4F46E5" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Preconnect to important third-party domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://res.cloudinary.com" />
    </Helmet>
  );
};

export default SEO; 