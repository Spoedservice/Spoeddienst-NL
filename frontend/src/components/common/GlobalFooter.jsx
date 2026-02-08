import { Link } from 'react-router-dom';
import { Zap, Phone, Mail, MapPin, Clock, Facebook, Instagram, Linkedin } from 'lucide-react';

// Detect country from environment variable
const COUNTRY = process.env.REACT_APP_COUNTRY || "NL";
const IS_BELGIUM = COUNTRY === "BE";

const config = IS_BELGIUM ? {
  siteName: "SpoedDienst24.be",
  domain: "spoeddienst24.be",
  phone: "+32 3 369 02 25",
  phoneLink: "+3233690225",
  email: "info@spoeddienst24.be",
  address: "België",
  kvkLabel: "Ondernemingsnummer",
  kvkNumber: "BE 0XXX.XXX.XXX",
  otherSite: { name: "Nederland", url: "https://spoeddienst24.nl", flag: "🇳🇱" },
  prefix: ""
} : {
  siteName: "SpoedDienst24.nl",
  domain: "spoeddienst24.nl",
  phone: "085 333 2847",
  phoneLink: "+31853332847",
  email: "info@spoeddienst24.nl",
  address: "Nederland",
  kvkLabel: "KVK",
  kvkNumber: "94499210835",
  otherSite: { name: "België", url: "https://spoeddienst24.be", flag: "🇧🇪" },
  prefix: ""
};

export default function GlobalFooter() {
  const currentYear = new Date().getFullYear();
  
  const services = [
    { name: "Spoed Loodgieter", href: `${config.prefix}/diensten/loodgieter` },
    { name: "Spoed Slotenmaker", href: `${config.prefix}/diensten/slotenmaker` },
    { name: "Spoed Elektricien", href: `${config.prefix}/diensten/elektricien` },
  ];
  
  const company = [
    { name: "Over Ons", href: `${config.prefix}/over-ons` },
    { name: "Prijzen", href: `${config.prefix}/prijzen` },
    { name: "Garantie", href: `${config.prefix}/garantie` },
    { name: "Word Vakman", href: `${config.prefix}/vakman` },
  ];
  
  const legal = [
    { name: "Algemene Voorwaarden", href: `${config.prefix}/voorwaarden` },
    { name: "Privacy Policy", href: `${config.prefix}/privacy` },
    { name: "Cookie Beleid", href: `${config.prefix}/cookies` },
  ];

  return (
    <footer className="bg-slate-900 text-white">
      {/* Main Footer */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-[#FF4500] rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">{config.siteName}</span>
            </Link>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              24/7 betrouwbare spoeddiensten voor loodgieter, slotenmaker en elektricien. 
              Binnen 30 minuten ter plaatse.
            </p>
            <div className="space-y-3">
              <a href={`tel:${config.phoneLink}`} className="flex items-center gap-3 text-slate-300 hover:text-[#FF4500] transition-colors">
                <Phone className="w-4 h-4" />
                <span>{config.phone}</span>
              </a>
              <a href={`mailto:${config.email}`} className="flex items-center gap-3 text-slate-300 hover:text-[#FF4500] transition-colors">
                <Mail className="w-4 h-4" />
                <span>{config.email}</span>
              </a>
              <div className="flex items-center gap-3 text-slate-400">
                <Clock className="w-4 h-4" />
                <span>24/7 Beschikbaar</span>
              </div>
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h3 className="font-bold text-lg mb-4">Diensten</h3>
            <ul className="space-y-3">
              {services.map((item) => (
                <li key={item.name}>
                  <Link 
                    to={item.href} 
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link 
                  to={`${config.prefix}/boek`} 
                  className="inline-flex items-center gap-2 text-[#FF4500] hover:text-[#ff6a33] font-medium text-sm mt-2"
                >
                  Direct Boeken →
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-bold text-lg mb-4">Bedrijf</h3>
            <ul className="space-y-3">
              {company.map((item) => (
                <li key={item.name}>
                  <Link 
                    to={item.href} 
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="font-bold text-lg mb-4">Juridisch</h3>
            <ul className="space-y-3">
              {legal.map((item) => (
                <li key={item.name}>
                  <Link 
                    to={item.href} 
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            
            {/* Country Switch */}
            <div className="mt-6 pt-4 border-t border-slate-800">
              <p className="text-slate-500 text-xs mb-2">Ook actief in:</p>
              <a 
                href={config.otherSite.url}
                className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm"
              >
                <span>{config.otherSite.flag}</span>
                <span>{config.otherSite.name}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-slate-500 text-sm text-center sm:text-left">
              <p>© {currentYear} {config.siteName} - Alle rechten voorbehouden</p>
              <p className="text-xs mt-1">{config.kvkLabel}: {config.kvkNumber}</p>
            </div>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a href="#" className="text-slate-500 hover:text-white transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
