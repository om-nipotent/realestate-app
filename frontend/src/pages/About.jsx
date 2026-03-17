import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Linkedin, Twitter, Mail, Target, Eye, Heart, Users, TrendingUp, Shield } from 'lucide-react';
import Footer from '../components/common/Footer';

const FOUNDERS = [
  {
    name: 'Arjun Mehta',
    role: 'CEO & Co-Founder',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    bio: 'Former Goldman Sachs VP with 12 years in PropTech and real estate finance. Arjun saw firsthand how opaque and fragmented the Indian property market was — and built Housify to fix it. He leads product strategy and investor relations from Mumbai.',
    linkedin: '#',
    twitter: '#',
    email: 'arjun@housify.in',
    tag: '12 yrs · PropTech & Finance',
  },
  {
    name: 'Priya Iyer',
    role: 'CTO & Co-Founder',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    bio: 'Ex-Google engineer and IIT Bombay alumna passionate about making technology work for real-world problems. Priya architected Housify\'s verification system, AI-powered price engine, and real-time notification platform that processes millions of events daily.',
    linkedin: '#',
    twitter: '#',
    email: 'priya@housify.in',
    tag: 'Ex-Google · IIT Bombay',
  },
  {
    name: 'Rohan Kapoor',
    role: 'COO & Co-Founder',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    bio: 'Serial entrepreneur with two successful PropTech exits. Rohan manages operations, seller partnerships, and city expansion across India. He has onboarded 2,000+ verified sellers and built the trust framework that keeps Housify\'s marketplace safe and reliable.',
    linkedin: '#',
    twitter: '#',
    email: 'rohan@housify.in',
    tag: '2 Exits · Operations & Growth',
  },
];

const VALUES = [
  { icon: Shield, title: 'Trust First', desc: 'Every seller and buyer goes through our Aadhaar-based verification. We don\'t compromise on authenticity.', color: 'from-blue-500 to-blue-700' },
  { icon: Eye, title: 'Full Transparency', desc: 'No hidden fees, no bait-and-switch listings. What you see is exactly what you get — prices, photos, and facts.', color: 'from-purple-500 to-purple-700' },
  { icon: TrendingUp, title: 'Data-Driven', desc: 'Our AI price engine and market analytics give buyers and sellers the intelligence to make confident decisions.', color: 'from-primary-500 to-primary-700' },
  { icon: Heart, title: 'People First', desc: 'Technology is just the means. Our real mission is to help Indian families find their perfect home without stress.', color: 'from-rose-500 to-rose-700' },
];

const MILESTONES = [
  { year: '2021', event: 'Housify founded in Mumbai with a 3-person team and a bold vision.' },
  { year: '2022', event: 'Launched in 5 cities. First 1,000 verified sellers onboarded.' },
  { year: '2023', event: 'Crossed 10,000 active listings. Introduced AI-powered price estimation.' },
  { year: '2024', event: 'Expanded to 50+ cities. 15,000+ happy buyers. Series A funding raised.' },
  { year: '2025', event: 'Launched real-time visit scheduling, map search, and fraud detection.' },
];

const About = () => {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-800 via-primary-700 to-primary-950 py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-300 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-sm px-4 py-2 rounded-full mb-6 border border-white/20">
            <Building2 className="w-4 h-4" /> Our Story
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            We're Building India's Most<br />
            <span className="text-accent-300">Trustworthy</span> Property Platform
          </h1>
          <p className="text-primary-100 text-lg max-w-2xl mx-auto leading-relaxed">
            Housify was born out of frustration. We experienced firsthand how broken, opaque, and stressful the Indian real estate market was for regular people. So we built the platform we always wished existed.
          </p>
        </div>
      </section>

      {/* Mission + Vision */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center mb-5">
                <Target className="w-6 h-6 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                To make buying and selling property in India as simple, safe, and transparent as possible — eliminating fraud, confusion, and unnecessary middlemen from the process.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-accent-100 rounded-2xl flex items-center justify-center mb-5">
                <Eye className="w-6 h-6 text-accent-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Vision</h2>
              <p className="text-gray-600 leading-relaxed">
                A future where every Indian family has access to verified, affordable, and accurately priced properties — and where selling your home doesn't require expensive brokers or months of waiting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gradient-to-r from-primary-700 to-primary-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '50+', label: 'Cities Covered' },
              { value: '5,000+', label: 'Properties Listed' },
              { value: '15,000+', label: 'Happy Buyers' },
              { value: '2,000+', label: 'Verified Sellers' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-extrabold text-white">{value}</p>
                <p className="text-primary-200 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-primary-600 text-sm font-semibold uppercase tracking-wide mb-2">The People Behind Housify</p>
            <h2 className="text-3xl font-extrabold text-gray-900">Meet Our Founders</h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto">Three people with one shared obsession: making real estate work for everyone in India, not just the privileged few.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FOUNDERS.map((founder) => (
              <div key={founder.name} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                {/* Photo */}
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-primary-100 to-accent-100">
                  <img
                    src={founder.image}
                    alt={founder.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-gray-700 text-xs px-3 py-1 rounded-full font-medium">
                      {founder.tag}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900">{founder.name}</h3>
                  <p className="text-primary-600 font-semibold text-sm mb-3">{founder.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed mb-5">{founder.bio}</p>

                  {/* Social */}
                  <div className="flex items-center gap-2">
                    <a href={founder.linkedin} className="w-8 h-8 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-lg flex items-center justify-center transition-all" title="LinkedIn">
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <a href={founder.twitter} className="w-8 h-8 bg-sky-50 hover:bg-sky-400 text-sky-500 hover:text-white rounded-lg flex items-center justify-center transition-all" title="Twitter">
                      <Twitter className="w-4 h-4" />
                    </a>
                    <a href={`mailto:${founder.email}`} className="w-8 h-8 bg-gray-50 hover:bg-gray-800 text-gray-500 hover:text-white rounded-lg flex items-center justify-center transition-all" title="Email">
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-primary-600 text-sm font-semibold uppercase tracking-wide mb-2">What Drives Us</p>
            <h2 className="text-3xl font-extrabold text-gray-900">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-primary-600 text-sm font-semibold uppercase tracking-wide mb-2">Since 2021</p>
            <h2 className="text-3xl font-extrabold text-gray-900">Our Journey</h2>
          </div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-8">
              {MILESTONES.map(({ year, event }, i) => (
                <div key={year} className="flex gap-6 items-start">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md relative z-10">
                    {year}
                  </div>
                  <div className="flex-1 pt-3.5">
                    <p className="text-gray-700 leading-relaxed">{event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary-800 to-primary-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Be Part of the Housify Story</h2>
          <p className="text-primary-200 mb-8">Join thousands of buyers and sellers who trust Housify to make their property dreams a reality.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-700 font-bold rounded-2xl hover:bg-primary-50 transition-all shadow-xl active:scale-95">
              Get Started Free
            </Link>
            <Link to="/properties" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-bold rounded-2xl border-2 border-white/30 hover:bg-white/20 transition-all backdrop-blur-sm">
              Browse Properties
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
