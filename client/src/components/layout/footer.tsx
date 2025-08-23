import { Link } from "wouter";
import logoImage from "@assets/5t-logo.png";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center mb-4">
              <img 
                src={logoImage} 
                alt="5T Talent Platform" 
                className="h-12 w-auto hover:scale-105 transition-transform duration-200"
              />
            </Link>
            <p className="text-slate-400 mb-4">
              Professional talent agency connecting exceptional performers with leading brands and productions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-white" data-testid="link-facebook">
                <i className="fab fa-facebook text-xl"></i>
              </a>
              <a href="#" className="text-slate-400 hover:text-white" data-testid="link-instagram">
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a href="#" className="text-slate-400 hover:text-white" data-testid="link-linkedin">
                <i className="fab fa-linkedin text-xl"></i>
              </a>
            </div>
          </div>
          
          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#" className="hover:text-white">Talent Management</a></li>
              <li><a href="#" className="hover:text-white">Casting Services</a></li>
              <li><a href="#" className="hover:text-white">Event Staffing</a></li>
              <li><a href="#" className="hover:text-white">Production Support</a></li>
            </ul>
          </div>
          
          {/* For Talent */}
          <div>
            <h3 className="text-lg font-semibold mb-4">For Talent</h3>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a href="/api/login" className="hover:text-white">Join Our Roster</a>
              </li>
              <li>
                <Link href="/dashboard">
                  <a className="hover:text-white">Talent Portal</a>
                </Link>
              </li>
              <li><a href="#" className="hover:text-white">Resources</a></li>
              <li><a href="#" className="hover:text-white">Support</a></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center">
                <i className="fas fa-map-marker-alt mr-2"></i>
                New York, NY 10001
              </li>
              <li className="flex items-center">
                <i className="fas fa-phone mr-2"></i>
                (555) 123-TALENT
              </li>
              <li className="flex items-center">
                <i className="fas fa-envelope mr-2"></i>
                info@5ttalent.com
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
          <p>&copy; 2024 5T Talent Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
