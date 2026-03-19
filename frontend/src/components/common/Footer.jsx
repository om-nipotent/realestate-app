import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl mb-4">
              <div className="bg-primary-600 p-1.5 rounded-lg">
                <Building2 className="w-5 h-5" />
              </div>
              PropEase
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              India's most trusted real estate platform connecting verified buyers and sellers with transparency and confidence.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <button
                  key={i}
                  className="w-8 h-8 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { label: 'Browse Properties', to: '/properties' },
                { label: 'List a Property', to: '/seller/dashboard' },
                { label: 'Price Estimation', to: '/seller/properties/create' },
                { label: 'About PropEase', to: '/about' },
                { label: 'Buyer Dashboard', to: '/buyer/dashboard' },
                { label: 'Seller Dashboard', to: '/seller/dashboard' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              {[
                'Property Listings',
                'Identity Verification',
                'Price Suggestions',
                'Visit Scheduling',
                'Buyer-Seller Communication',
                'Market Analytics',
              ].map((item) => (
                <li key={item}>
                  <span className="text-sm text-gray-400">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-400">
                  Narayanpur Road, Paratwada
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <p className="text-sm text-gray-400">7397xxxxxx</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <p className="text-sm text-gray-400">support@propease.in</p>
              </div>
            </div>

            {/* Newsletter */}
            <div className="mt-6">
              <p className="text-sm text-white font-medium mb-2">Newsletter</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 text-xs bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                />
                <button className="px-3 py-2 bg-primary-600 text-white text-xs rounded-lg hover:bg-primary-700 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} PropEase. All rights reserved.
          </p>
          <div className="flex gap-6">
            <span className="text-xs text-gray-500 hover:text-gray-300 cursor-pointer">Privacy Policy</span>
            <span className="text-xs text-gray-500 hover:text-gray-300 cursor-pointer">Terms of Service</span>
            <span className="text-xs text-gray-500 hover:text-gray-300 cursor-pointer">Cookie Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
