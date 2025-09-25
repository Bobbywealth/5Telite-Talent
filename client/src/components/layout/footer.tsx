
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
  return (
    <footer className="relative bg-gradient-hero-enhanced overflow-hidden">
      {/* Brand floating elements */}
      <div className="absolute inset-0">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-5"></div>
      </div>
      
      {/* Subtle overlay pattern */}
      <div className="absolute inset-0 bg-black bg-opacity-20 brand-dot-pattern"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
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
              <a href="https://facebook.com/5ttalent" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white bg-white/10 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center hover:bg-white/20 transition-all duration-300" data-testid="link-facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://instagram.com/5ttalent" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white bg-white/10 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center hover:bg-white/20 transition-all duration-300" data-testid="link-instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com/company/5ttalent" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white bg-white/10 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center hover:bg-white/20 transition-all duration-300" data-testid="link-linkedin">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Services */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Services</h3>
            <ul className="space-y-3 text-white/80">
              <li>
                <Link href="/talent" className="hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center">
                  <Star className="w-4 h-4 mr-2 text-black" />
                  Talent Management
                </Link>
              </li>
              <li>
                <Link href="/announcements" className="hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center">
                  <Video className="w-4 h-4 mr-2 text-black" />
                  Casting Services
                </Link>
              </li>
              <li>
                <Link href="/book-request" className="hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-black" />
                  Event Staffing
                </Link>
              </li>
              <li>
                <Link href="/book-request" className="hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center">
                  <Settings className="w-4 h-4 mr-2 text-black" />
                  Production Support
                </Link>
              </li>
            </ul>
          </div>
          
          {/* For Talent */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6 bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">For Talent</h3>
            <ul className="space-y-3 text-white/80">
              <li>
                <Link href="/register" className="hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center">
                  <UserPlus className="w-4 h-4 mr-2 text-black" />
                  Join Our Roster
                </Link>
              </li>
              <li>
                <Link href="/talent/dashboard" className="hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center">
                  <User className="w-4 h-4 mr-2 text-black" />
                  Talent Portal
                </Link>
              </li>
              <li>
                <Link href="/announcements" className="hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center">
                  <Book className="w-4 h-4 mr-2 text-black" />
                  Resources
                </Link>
              </li>
              <li>
                <a href="mailto:support@5ttalent.com" className="hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center">
                  <Headphones className="w-4 h-4 mr-2 text-black" />
                  Support
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">Contact</h3>
            <ul className="space-y-4 text-white/80">
              <li className="flex items-start">
                <MapPin className="w-4 h-4 mt-1 mr-3 text-black flex-shrink-0" />
                <span>122 W 26th St., Suite 902<br />New York, NY 10001</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-4 h-4 mr-3 text-black flex-shrink-0" />
                <a href="tel:+15551234TALENT" className="hover:text-white transition-colors">(555) 123-TALENT</a>
              </li>
              <li className="flex items-center">
                <Mail className="w-4 h-4 mr-3 text-black flex-shrink-0" />
                <a href="mailto:info@5ttalent.com" className="hover:text-white transition-colors">info@5ttalent.com</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-12 pt-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 inline-block">
            <p className="text-white/90 font-medium">
              &copy; 2025 5T Talent Platform. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
