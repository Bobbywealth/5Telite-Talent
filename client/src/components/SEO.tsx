import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'profile' | 'article';
  siteName?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  noIndex?: boolean;
}

export function SEO({
  title = '5T Elite Talent Platform - Professional Talent Booking & Management',
  description = 'Connect with top-tier professional talent for your events, productions, and projects. 5T Elite offers premium talent booking services with verified profiles and seamless management.',
  keywords = 'talent booking, professional talent, entertainment, actors, models, performers, casting, production, events',
  image = 'https://www.5telite.org/attached_assets/5t-logo.png',
  url,
  type = 'website',
  siteName = '5T Elite Talent Platform',
  twitterCard = 'summary_large_image',
  noIndex = false
}: SEOProps) {
  const fullTitle = title.includes('5T Elite') ? title : `${title} | 5T Elite Talent Platform`;
  const fullUrl = url ? `https://www.5telite.org${url}` : 'https://www.5telite.org';

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="5T Elite Talent Platform" />
      <meta name="robots" content={noIndex ? 'noindex,nofollow' : 'index,follow'} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@5Telite" />
      <meta name="twitter:creator" content="@5Telite" />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#7c3aed" />
      <meta name="msapplication-TileColor" content="#7c3aed" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "5T Elite Talent Platform",
          "url": "https://www.5telite.org",
          "logo": "https://www.5telite.org/attached_assets/5t-logo.png",
          "description": "Professional talent booking and management platform connecting clients with top-tier entertainment professionals.",
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+1-555-5T-ELITE",
            "contactType": "customer service",
            "email": "5T.Elite.Talent@gmail.com"
          },
          "sameAs": [
            "https://www.instagram.com/5telite",
            "https://www.facebook.com/5telite",
            "https://www.twitter.com/5telite"
          ]
        })}
      </script>
    </Helmet>
  );
}
