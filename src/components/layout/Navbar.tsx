import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-[#EBF5FF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img 
              src="/images/logo.png" 
              alt="Logo" 
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-[#181D27]">
            <Link href="/" className="hover:text-primary transition-colors menu-hover-shadow px-2 py-1 rounded">Home</Link>
            <Link href="/courses" className="hover:text-primary transition-colors menu-hover-shadow px-2 py-1 rounded">Courses</Link>
            <Link href="#" className="hover:text-primary transition-colors menu-hover-shadow px-2 py-1 rounded">Community</Link>
            <Link href="#" className="hover:text-primary transition-colors menu-hover-shadow px-2 py-1 rounded">About</Link>
          </div>

          {/* Login Button */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="border-2 border-[#181D27] text-[#181D27] px-6 py-2 rounded-full font-semibold hover:bg-[#181D27] hover:text-white transition-all menu-hover-shadow text-sm"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
