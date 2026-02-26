import { Link } from "wouter";
import logoImage from "@assets/5t-logo.png";
import { 
  Star, 
  Video, 
  Users, 
  Settings, 
  UserPlus, 
  User, 
  Book, 
  Headphones, 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Instagram, 
  Linkedin 
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-hero-enhanced overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-5"></div>
      </div>
      <div className="absolute inset-0 bg-black bg-opacity-20 brand-dot-pattern pointer-events-none"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center mb-6">
              <img 
                src={logoImage} 
                alt="5T Talent Platform" 
                className="h-16 w-auto hover:scale-105 transition-transform duration-200 filter drop-shadow-lg"
              />
            </Link>
            <p className="text-white/90 mb-6 leading-relaxed">
              Professional talent agency connecting exceptional performers with leading brands and productions.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com/5telitetalent" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white bg-white/10 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center hover:bg-white/20 transition-all duration-300" data-testid="link-facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://instagram.com/5telitetalent" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white bg-white/10 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center hover:bg-white/20 transition-all duration-300" data-testid="link-instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com/company/5telitetalent" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white bg-white/10 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center hover:bg-white/20 transition-all duration-300" data-testid="link-linkedin">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Services</h3>
            <ul className="space-y-3 text-white/80">
              <li>
                <Link href="/talent" className="hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center">
                  <Star className="w-4 h-4 mr-2 text-white/50" />
                  Talent Management
                </Link>
              </li>
              <li>
                <Link href="/announcements" className="hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center">
                  <Video className="w-4 h-4 mr-2 text-white/50" />
                  Casting Services
                </Link>
              </li>
              <li>
                <Link href="/book" className="hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-white/50" />
                  Event Staffing
                </Link>
              </li>
              <li>
                <Link href="/book" className="hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center">
                  <Settings className="w-4 h-4 mr-2 text-white/50" />
                  Production Support
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-6 bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">For Talent</h3>
            <ul className="space-y-3 text-white/80">
              <li>
                <a href="/register" className="hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center cursor-pointer relative z-20 block">
                  <UserPlus className="w-4 h-4 mr-2 text-white/50" />
                  Join Our Roster
                </a>
              </li>
              <li>
                <a href="/auth" className="hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center cursor-pointer relative z-20 block">
                  <User className="w-4 h-4 mr-2 text-white/50" />
                  Talent Portal
                </a>
              </li>
              <li>
                <a href="/announcements" className="hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center cursor-pointer relative z-20 block">
                  <Book className="w-4 h-4 mr-2 text-white/50" />
                  Open Calls
                </a>
              </li>
              <li>
                <a href="/support" className="hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center cursor-pointer relative z-20 block">
                  <Headphones className="w-4 h-4 mr-2 text-white/50" />
                  Support
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">Contact</h3>
            <ul className="space-y-4 text-white/80">
              <li className="flex items-start">
                <MapPin className="w-4 h-4 mt-1 mr-3 text-white/50 flex-shrink-0" />
                <span>New York, NY</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-4 h-4 mr-3 text-white/50 flex-shrink-0" />
                <a href="mailto:info@5telite.org" className="hover:text-white transition-colors">info@5telite.org</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/20 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 inline-block">
            <p className="text-white/90 font-medium">
              &copy; {currentYear} 5T Elite Talent Platform. All rights reserved.
            </p>
          </div>
          <div className="flex gap-4 text-white/60 text-sm">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/support" className="hover:text-white transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
