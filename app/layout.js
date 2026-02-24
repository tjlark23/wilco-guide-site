import './globals.css';

export const metadata = {
  title: {
    default: 'WilCo Guide | Local Business Directory for Williamson County, TX',
    template: '%s | WilCo Guide',
  },
  description: 'Find local businesses, restaurants, services, and more in Williamson County, TX. The complete directory for Round Rock, Georgetown, Cedar Park, Leander, and beyond.',
  openGraph: {
    type: 'website',
    siteName: 'WilCo Guide',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
  },
  metadataBase: new URL('https://wilcoguide.com'),
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
