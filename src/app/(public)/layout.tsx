import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="pb-16 md:pb-0">
        <main>{children}</main>
        <Footer />
      </div>
    </>
  );
}