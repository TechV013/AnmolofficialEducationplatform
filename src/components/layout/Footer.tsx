import Link from "next/link";
// Removing these imports as the current version of lucide-react seems to have different exports
// import { Linkedin, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-white pt-16 pb-8 px-4 sm:px-6 lg:px-8 rounded-t-3xl mt-20">
      <div className="max-w-7xl mx-auto">
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Left - Brand Info */}
          <div>
            <div className="text-3xl font-bold mb-4">@anmlofficials</div>
            <p className="text-sm opacity-80 leading-relaxed max-w-sm mb-6">
              an initiative by anmol deep
            </p>
            <p className="text-sm opacity-70 leading-relaxed max-w-sm mb-6">
              On a Journey to Educate, Connect Visual Design & Animation learners.
            </p>
            <p className="text-sm opacity-70 leading-relaxed max-w-sm">
              Appreciated by NCERT, NFSU Gandhinagar - Gujarat, IIT Jodhpur, ministry of home affairs, State Forensic Science Laboratory,Jaipur, Birla Institute of Technology - Mesra (Ranchi, Jhakaratand)
            </p>
          </div>

          {/* Right - WhatsApp & Links */}
          <div className="flex flex-col gap-8">
            <div className="flex justify-end">
              <div className="bg-[#1A1A1A] rounded-2xl p-4 flex items-center justify-between border border-white/10 w-full max-w-md">
                <div className="text-sm">
                  <p className="font-semibold">Monday to Friday</p>
                  <p className="opacity-70">Timing: 10:00am - 8:00pm</p>
                </div>
                <a
                  href="https://wa.me/919999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-[#1DA851] transition-colors"
                >
                  Chat On WhatsApp
                </a>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
              <div>
                <h4 className="font-bold text-lg mb-4">Quick Links</h4>
                <ul className="space-y-3 text-sm opacity-80">
                  <li><Link href="#" className="hover:underline">About founder</Link></li>
                  <li><Link href="/courses" className="hover:underline">All Courses</Link></li>
                  <li><Link href="#" className="hover:underline">Earn money by referring</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-4">Important Links</h4>
                <ul className="space-y-3 text-sm opacity-80">
                  <li><Link href="#" className="hover:underline">Become a Creator</Link></li>
                  <li><Link href="#" className="hover:underline">Become a Speaker</Link></li>
                  <li><Link href="#" className="hover:underline">Testimonials</Link></li>
                  <li><Link href="#" className="hover:underline">FAQ's</Link></li>
                  <li><Link href="#" className="hover:underline">Community</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-4">Other Links</h4>
                <ul className="space-y-3 text-sm opacity-80">
                  <li><Link href="#" className="hover:underline">Blogs</Link></li>
                  <li><Link href="#" className="hover:underline">Jobs</Link></li>
                  <li><Link href="#" className="hover:underline">Internships</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/20 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Social Media */}
          <div className="flex items-center gap-6">
            <Link href="#" className="opacity-70 hover:opacity-100 transition-opacity font-bold">In</Link>
            <Link href="#" className="opacity-70 hover:opacity-100 transition-opacity font-bold">IG</Link>
            <Link href="#" className="opacity-70 hover:opacity-100 transition-opacity font-bold">YT</Link>
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm opacity-70">
            <Link href="#" className="hover:underline">Contact Us</Link>
            <Link href="#" className="hover:underline">Privacy Policy</Link>
            <Link href="#" className="hover:underline">Terms of Use</Link>
            <span>&copy; 2026 All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
