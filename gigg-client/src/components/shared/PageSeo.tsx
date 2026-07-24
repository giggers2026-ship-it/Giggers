import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SeoRouteConfig {
  title: string;
  description: string;
}

const ROUTE_SEO: Record<string, SeoRouteConfig> = {
  '/': {
    title: 'Giggers – Hire Trusted Workers Instantly in Chennai | Catering, Events & More',
    description: "Giggers is Chennai's #1 platform to hire trusted temporary workers instantly. Find verified workers for catering, events, delivery, housekeeping and more.",
  },
  '/home': {
    title: 'Dashboard – Giggers | Hire & Manage Gig Workers in Chennai',
    description: 'Manage your active gigs, worker applications, and live job requests on Giggers.',
  },
  '/jobs': {
    title: 'Browse Gigs & Temporary Jobs in Chennai – Giggers',
    description: 'Find verified catering, event, delivery, and housekeeping gigs near you in Chennai with instant daily pay.',
  },
  '/post-job': {
    title: 'Post a Gig – Hire Verified Workers Instantly in Chennai | Giggers',
    description: 'Post a job in less than 2 minutes. Hire rated & KYC-verified workers for your event, restaurant, or business in Chennai.',
  },
  '/login': {
    title: 'Login – Giggers Account',
    description: 'Login to your Giggers account to hire workers or apply for temporary gig jobs in Chennai.',
  },
  '/register': {
    title: 'Sign Up – Giggers | Join as Worker or Employer',
    description: 'Create your free Giggers account today. Hire workers or find daily gig jobs in Chennai.',
  },
  '/kyc': {
    title: 'KYC Verification – Giggers Account Security',
    description: 'Complete your instant Aadhaar and selfie KYC verification on Giggers.',
  },
  '/wallet': {
    title: 'Wallet & Payments – Giggers',
    description: 'Manage payments, view earnings, and process payouts securely on Giggers.',
  },
  '/profile': {
    title: 'My Profile – Giggers',
    description: 'Manage your Giggers profile, ratings, skills, and account settings.',
  },
  '/chat': {
    title: 'Messages – Giggers Worker Chat',
    description: 'Chat directly with workers and employers on Giggers.',
  },
  '/notifications': {
    title: 'Notifications – Giggers',
    description: 'Stay updated with live job alerts, applicant updates, and payment receipts on Giggers.',
  },
};

export function PageSeo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const config = ROUTE_SEO[pathname] || ROUTE_SEO['/'];

    // Update document title
    document.title = config.title;

    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', config.description);

    // Update OpenGraph title & description
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', config.title);

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute('content', config.description);
  }, [pathname]);

  return null;
}
