import PrimaryNav from '../../components/PrimaryNav';
import SecondaryNav from '../../components/SecondaryNav';
import ContextualBanner from '../../components/ContextualBanner';
import Footer from '../../components/Footer';

export default function DirectoryLayout({ children }) {
  return (
    <>
      <PrimaryNav />
      <SecondaryNav />
      <ContextualBanner />
      {children}
      <Footer />
    </>
  );
}
