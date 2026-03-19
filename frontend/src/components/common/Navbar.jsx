import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Building2, Bell, ChevronDown, Menu, X, User,
  LogOut, Shield, BarChart3, Settings, CheckCircle2, Clock,
  AlertCircle, Sun, Moon, Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserNotifications, markAllNotificationsRead } from '../../api/verification.api';
import { formatRelativeTime } from '../../utils/formatters';

// ── Role badge colours ────────────────────────────────────────────────────────
const ROLE_BADGE = {
  admin:  { label: 'Admin',  bg: 'bg-purple-100', text: 'text-purple-700' },
  seller: { label: 'Seller', bg: 'bg-amber-100',  text: 'text-amber-700' },
  buyer:  { label: 'Buyer',  bg: 'bg-blue-100',   text: 'text-blue-700' },
};

// ── Dropdown animation variants ───────────────────────────────────────────────
const dropdownVariants = {
  hidden:  { opacity: 0, scale: 0.94, y: -8 },
  visible: { opacity: 1, scale: 1,    y: 0, transition: { duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:    { opacity: 0, scale: 0.94, y: -6, transition: { duration: 0.14, ease: 'easeIn' } },
};

const mobileMenuVariants = {
  hidden:  { opacity: 0, height: 0 },
  visible: { opacity: 1, height: 'auto', transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:    { opacity: 0, height: 0,      transition: { duration: 0.2,  ease: 'easeIn' } },
};

// ── Dark-mode toggle ──────────────────────────────────────────────────────────
const useDarkMode = () => {
  const [dark, setDark] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);
  return [dark, () => setDark((d) => !d)];
};

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isSeller, isBuyer, logout } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const [dark, toggleDark] = useDarkMode();

  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [scrolled,      setScrolled]      = useState(false);

  const userMenuRef = useRef(null);
  const notifRef    = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
      if (notifRef.current    && !notifRef.current.contains(e.target))    setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Load notifications
  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      try {
        const res = await getUserNotifications({ limit: 10 });
        setNotifications(res.data?.notifications || []);
        setUnreadCount(res.data?.unreadCount || 0);
      } catch {}
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const getDashboardLink  = () => isAdmin ? '/admin/dashboard' : isSeller ? '/seller/dashboard' : '/buyer/dashboard';
  const getVerificationLink = () => isSeller ? '/seller/verification' : '/buyer/verification';
  const getVerificationIcon = () => {
    if (user?.verificationStatus === 'verified') return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />;
    if (user?.verificationStatus === 'pending')  return <Clock className="w-3.5 h-3.5 text-yellow-500" />;
    return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
  };

  const isActive  = (path) => location.pathname === path;
  const roleBadge = ROLE_BADGE[user?.role] || ROLE_BADGE.buyer;

  // Nav link with animated active pill
  const NavLink = ({ to, label, exact = false }) => {
    const active = exact ? isActive(to) : location.pathname.startsWith(to);
    return (
      <Link
        to={to}
        className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
          active ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
        }`}
      >
        {active && (
          <motion.span
            layoutId="nav-active-pill"
            className="absolute inset-0 rounded-xl bg-primary-50"
            style={{ zIndex: -1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          />
        )}
        {label}
      </Link>
    );
  };

  return (
    <motion.nav
      className={`sticky top-0 z-40 navbar-glass transition-all duration-300 ${scrolled ? 'shadow-md' : ''}`}
      animate={{ height: scrolled ? 56 : 64 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full gap-4">

          {/* ── Logo ─── */}
          <Link to="/" className="flex items-center gap-2.5 font-extrabold text-xl flex-shrink-0 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #C026D3, #86198F)' }}
            >
              <Building2 className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-primary-700 dark:text-primary-400 font-display">PropEase</span>
          </Link>

          {/* ── Desktop Nav ─── */}
          <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
            <NavLink to="/" label="Home" exact />
            <NavLink to="/properties" label="Properties" />
            <NavLink to="/about" label="About" />
            {isAuthenticated && <NavLink to={getDashboardLink()} label="Dashboard" />}
          </nav>

          {/* ── Right actions ─── */}
          <div className="flex items-center gap-2 ml-auto">

            {/* Dark mode toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.92 }}
              onClick={toggleDark}
              className="p-2 text-gray-500 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition-colors"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </motion.button>

            {isAuthenticated ? (
              <>
                {/* Seller CTA */}
                {isSeller && (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="hidden md:block">
                    <Link
                      to="/seller/properties/create"
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-xl btn-primary"
                    >
                      <Plus className="w-3.5 h-3.5" /> List Property
                    </Link>
                  </motion.div>
                )}

                {/* ── Notifications ─── */}
                <div className="relative" ref={notifRef}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative p-2 text-gray-500 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    <AnimatePresence>
                      {unreadCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5"
                        >
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  <AnimatePresence>
                    {notifOpen && (
                      <motion.div
                        key="notif-dropdown"
                        variants={dropdownVariants}
                        initial="hidden" animate="visible" exit="exit"
                        style={{ originY: 'top', originX: 'right' }}
                        className="absolute right-0 mt-2 w-80 bg-white dark:bg-surface-800 rounded-2xl shadow-xl border border-gray-100 dark:border-surface-700 overflow-hidden"
                      >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-surface-700 bg-gray-50 dark:bg-surface-700">
                          <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
                          {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead} className="text-xs text-primary-600 font-semibold hover:text-primary-800">
                              Mark all read
                            </button>
                          )}
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="text-center py-10">
                              <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                              <p className="text-gray-400 text-sm">No notifications yet</p>
                            </div>
                          ) : notifications.map((notif, i) => (
                            <motion.div
                              key={notif._id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.04 }}
                              className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-primary-50/60' : ''}`}
                            >
                              {!notif.isRead && <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-500 mr-2 mb-0.5" />}
                              <p className="text-sm font-semibold text-gray-800">{notif.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(notif.createdAt)}</p>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ── User Menu ─── */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                  >
                    {/* Avatar */}
                    <div className="relative">
                      <motion.div whileHover={{ scale: 1.05 }}>
                        {user?.avatar?.url ? (
                          <img src={user.avatar.url} alt={user.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-200" />
                        ) : (
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white"
                            style={{ background: 'linear-gradient(135deg, #C026D3, #86198F)' }}
                          >
                            {user?.name?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                      </motion.div>
                      {unreadCount > 0 && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-primary-500 border-2 border-white rounded-full animate-pulse-ring" />
                      )}
                    </div>
                    {/* Name + role */}
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-semibold text-gray-800 leading-none">{user?.name?.split(' ')[0]}</p>
                      <span className={`text-[10px] font-semibold capitalize px-1.5 py-0.5 rounded-full ${roleBadge.bg} ${roleBadge.text}`}>
                        {roleBadge.label}
                      </span>
                    </div>
                    <motion.div animate={{ rotate: userMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        key="user-dropdown"
                        variants={dropdownVariants}
                        initial="hidden" animate="visible" exit="exit"
                        style={{ originY: 'top', originX: 'right' }}
                        className="absolute right-0 mt-2 w-60 bg-white dark:bg-surface-800 rounded-2xl shadow-xl border border-gray-100 dark:border-surface-700 py-1.5 overflow-hidden"
                      >
                        {/* User header */}
                        <div className="px-4 py-3 border-b border-gray-100" style={{ background: 'linear-gradient(135deg, #FAE8FF, #F5D0FE)' }}>
                          <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{user?.email}</p>
                        </div>
                        {[
                          { to: getDashboardLink(), icon: BarChart3, label: 'Dashboard' },
                          ...(isSeller || isBuyer ? [{ to: getVerificationLink(), icon: Shield, label: 'Verification', extra: getVerificationIcon() }] : []),
                        ].map(({ to, icon: Icon, label, extra }) => (
                          <Link
                            key={to}
                            to={to}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                          >
                            <span className="flex items-center gap-2.5"><Icon className="w-4 h-4" /> {label}</span>
                            {extra}
                          </Link>
                        ))}
                        <div className="border-t border-gray-100 mt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-primary-500 transition-colors rounded-xl hover:bg-primary-50">
                  Sign In
                </Link>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/register" className="px-5 py-2 text-sm font-semibold rounded-xl btn-primary">
                    Get Started
                  </Link>
                </motion.div>
              </div>
            )}

            {/* Mobile toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-500 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition-colors"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen
                  ? <motion.span key="x"    initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X className="w-5 h-5" /></motion.span>
                  : <motion.span key="menu" initial={{ rotate: 90,  opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Menu className="w-5 h-5" /></motion.span>
                }
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            variants={mobileMenuVariants}
            initial="hidden" animate="visible" exit="exit"
            className="md:hidden bg-white dark:bg-surface-800 border-t border-gray-100 dark:border-surface-700 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {[
                ['/', 'Home', true], ['/properties', 'Properties'], ['/about', 'About'],
                ...(isAuthenticated ? [[getDashboardLink(), 'Dashboard']] : []),
              ].filter(Boolean).map(([path, label, exact]) => (
                <Link key={path} to={path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center py-2.5 px-3 rounded-xl text-sm font-medium transition-colors ${
                    (exact ? isActive(path) : location.pathname.startsWith(path))
                      ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                  }`}
                >
                  {label}
                </Link>
              ))}
              {isSeller && (
                <Link to="/seller/properties/create" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold text-white btn-primary"
                >
                  <Plus className="w-4 h-4" /> List Property
                </Link>
              )}
              {!isAuthenticated && (
                <div className="flex gap-2 pt-2 border-t border-gray-100 mt-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 px-3 rounded-xl text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors">Sign In</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 px-3 rounded-xl text-sm font-semibold btn-primary">Get Started</Link>
                </div>
              )}
              {isAuthenticated && (
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="flex items-center gap-2 w-full py-2.5 px-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-1"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
