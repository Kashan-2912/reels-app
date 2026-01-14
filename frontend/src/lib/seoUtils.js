import Head from 'next/head';

/**
 * SEO Meta Tags Component
 * Use this in your Next.js pages to set meta tags
 */
export function SEOMeta({
  title,
  description,
  canonicalUrl,
  ogImage,
  ogType = 'website',
  twitterHandle,
  keywords,
}) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      {twitterHandle && <meta name="twitter:creator" content={twitterHandle} />}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />

      {/* No index for development */}
      {process.env.NODE_ENV === 'development' && (
        <meta name="robots" content="noindex, nofollow" />
      )}
    </Head>
  );
}

/**
 * JSON-LD Structured Data
 * For better SEO and rich snippets
 */
export function JsonLD({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Generate meta tags for a user profile page
 */
export const generateProfileMeta = (user) => {
  return {
    title: `${user.name} (@${user.username}) on ReelApp`,
    description: `${user.bio || 'Check out ' + user.name + "'s profile on ReelApp"}`,
    ogImage: user.avatar,
    canonicalUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/profile/${user.username}`,
    keywords: `${user.username}, profile, reels, social media`,
  };
};

/**
 * Generate meta tags for a post page
 */
export const generatePostMeta = (post, author) => {
  const description = post.caption?.substring(0, 160) || 'Check out this post on ReelApp';

  return {
    title: `${author.name}'s post on ReelApp`,
    description,
    ogImage: post.image || author.avatar,
    ogType: 'article',
    canonicalUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/post/${post.id}`,
    keywords: 'reels, social media, post',
  };
};

/**
 * Generate meta tags for hashtag page
 */
export const generateHashtagMeta = (hashtag, postCount) => {
  return {
    title: `#${hashtag} posts on ReelApp`,
    description: `Browse ${postCount} posts with #${hashtag} hashtag on ReelApp`,
    canonicalUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/hashtag/${hashtag}`,
    keywords: `${hashtag}, hashtags, reels, social media`,
  };
};

/**
 * Schema.org JSON-LD for different content types
 */
export const schemas = {
  // Person/Profile Schema
  person: (user) => ({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: user.name,
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/profile/${user.username}`,
    image: user.avatar,
    description: user.bio,
    sameAs: [], // Add social media URLs
  }),

  // BlogPosting Schema
  blogPost: (post, author) => ({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.caption?.substring(0, 100),
    description: post.caption,
    image: post.image,
    author: {
      '@type': 'Person',
      name: author.name,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/profile/${author.username}`,
    },
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
  }),

  // CreativeWork Schema
  creativeWork: (post) => ({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: post.caption?.substring(0, 100),
    description: post.caption,
    image: post.image,
    datePublished: post.createdAt,
    interactionCount: [
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/LikeAction',
        userInteractionCount: post.likeCount || 0,
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/CommentAction',
        userInteractionCount: post.commentCount || 0,
      },
    ],
  }),
};

/**
 * Generate sitemap entry
 */
export const generateSitemapEntry = (url, lastmod = new Date(), priority = 0.8) => {
  return {
    url,
    lastmod: lastmod.toISOString().split('T')[0],
    changefreq: 'weekly',
    priority,
  };
};

/**
 * SEO utility functions
 */
export const seoUtils = {
  /**
   * Generate page title with site name
   */
  getPageTitle: (pageName, siteName = 'ReelApp') => {
    return pageName === 'Home' ? siteName : `${pageName} - ${siteName}`;
  },

  /**
   * Truncate description to SEO-friendly length
   */
  truncateDescription: (text, maxLength = 160) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  },

  /**
   * Generate hashtag canonical URL
   */
  getHashtagUrl: (hashtag) => {
    return `${process.env.NEXT_PUBLIC_BASE_URL}/hashtag/${encodeURIComponent(hashtag)}`;
  },

  /**
   * Generate profile URL
   */
  getProfileUrl: (username) => {
    return `${process.env.NEXT_PUBLIC_BASE_URL}/profile/${username}`;
  },

  /**
   * Generate post URL
   */
  getPostUrl: (postId) => {
    return `${process.env.NEXT_PUBLIC_BASE_URL}/post/${postId}`;
  },
};

export default SEOMeta;
