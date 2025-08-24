
import { Link } from "wouter";
import logoImage from "@assets/5t-logo.png";

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
              <a href="#" className="text-white/70 hover:text-white bg-white/10 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center hover:bg-white/20 transition-all duration-300" data-testid="link-facebook">
                <i className="fab fa-facebook text-xl"></i>
              </a>
              <a href="#" className="text-white/70 hover:text-white bg-white/10 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center hover:bg-white/20 transition-all duration-300" data-testid="link-instagram">
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a href="#" className="text-white/70 hover:text-white bg-white/10 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center hover:bg-white/20 transition-all duration-300" data-testid="link-linkedin">
                <i className="fab fa-linkedin text-xl"></i>
              </a>
            </div>
          </div>
          
          {/* Services */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Services</h3>
            <ul className="space-y-3 text-white/80">
              <li><a href="#" className="hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center"><i className="fas fa-star mr-2 text-yellow-400"></i>Talent Management</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center"><i className="fas fa-video mr-2 text-blue-400"></i>Casting Services</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center"><i className="fas fa-users mr-2 text-green-400"></i>Event Staffing</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center"><i className="fas fa-cog mr-2 text-purple-400"></i>Production Support</a></li>
            </ul>
          </div>
          
          {/* For Talent */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6 bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">For Talent</h3>
            <ul className="space-y-3 text-white/80">
              <li>
                <a href="/register" className="hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center">
                  <i className="fas fa-plus-circle mr-2 text-green-400"></i>Join Our Roster
                </a>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center">
                  <i className="fas fa-user-circle mr-2 text-blue-400"></i>Talent Portal
                </Link>
              </li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center"><i className="fas fa-book mr-2 text-yellow-400"></i>Resources</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center"><i className="fas fa-headset mr-2 text-purple-400"></i>Support</a></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">Contact</h3>
            <ul className="space-y-4 text-white/80">
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt mt-1 mr-3 text-red-400"></i>
                <span>122 W 26th St., Suite 902<br />New York, NY 10001</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-phone mr-3 text-green-400"></i>
                <a href="tel:+15551234TALENT" className="hover:text-white transition-colors">(555) 123-TALENT</a>
              </li>
              <li className="flex items-center">
                <i className="fas fa-envelope mr-3 text-blue-400"></i>
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
