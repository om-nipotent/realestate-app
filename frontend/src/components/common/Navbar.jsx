import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Building2, Bell, ChevronDown, Menu, X, User,
  LogOut, Shield, BarChart3, Settings, CheckCircle2, Clock, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserNotifications, markAllNotificationsRead } from '../../api/verification.api';
import { formatRelativeTime } from '../../utils/formatters';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isSeller, isBuyer, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
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

  const getDashboardLink = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isSeller) return '/seller/dashboard';
    return '/buyer/dashboard';
  };

  const getVerificationLink = () => {
    if (isSeller) return '/seller/verification';
    return '/buyer/verification';
  };

  const getVerificationIcon = () => {
    if (user?.verificationStatus === 'verified') return <CheckCircle2 className="w-3.5 h-3.5 text-primary-500" />;
    if (user?.verificationStatus === 'pending') return <Clock className="w-3.5 h-3.5 text-yellow-500" />;
    return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
  };

  const isActive = (path) => location.pathname === path;

  const navLink = (path, label, exact = false) => {
    const active = exact ? isActive(path) : location.pathname.startsWith(path);
    return (
      <Link to={path}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
          active
            ? 'text-primary-500 bg-primary-50'
            : 'text-gray-600 hover:text-primary-500 hover:bg-primary-50'
        }`}
      >{label}</Link>
    );
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-surface-200"
      style={{ background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #EAEAEA' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-extrabold text-xl">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: '#F57799' }}>
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span style={{ color: '#F57799' }}>Housify</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLink('/', 'Home', true)}
            {navLink('/properties', 'Properties')}
            {navLink('/about', 'About')}
            {isAuthenticated && navLink(getDashboardLink(), 'Dashboard')}
            {isSeller && (
              <Link to="/seller/properties/create"
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all active:scale-95 ml-1"
                style={{ background: '#F57799', color: '#ffffff', boxShadow: '0 3px 10px rgba(245,119,153,0.30)' }}>
                + List Property
              </Link>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Bell */}
                <div className="relative" ref={notifRef}>
                  <button onClick={() => setNotifOpen(!notifOpen)}
                    className="relative p-2 text-gray-500 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition-colors">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-accent-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-surface-200 overflow-hidden animate-slide-down">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
                        <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllRead} className="text-xs text-primary-600 font-semibold hover:text-primary-800">
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="text-center text-gray-400 text-sm py-8">No notifications yet</p>
                        ) : notifications.map((notif) => (
                          <div key={notif._id}
                            className={`px-4 py-3 border-b border-surface-50 hover:bg-surface-50 transition-colors ${!notif.isRead ? 'bg-primary-50' : ''}`}>
                            <p className="text-sm font-semibold text-gray-800">{notif.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(notif.createdAt)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                    <div className="relative">
                      {user?.avatar?.url ? (
                        <img src={user.avatar.url} alt={user.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-200" />
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                          style={{ background: '#F57799', color: '#ffffff' }}>
                          {user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-semibold text-gray-800 leading-none">{user?.name?.split(' ')[0]}</p>
                      <p className="text-xs text-gray-500 capitalize mt-0.5">{user?.role}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-surface-200 py-1.5 animate-slide-down overflow-hidden">
                      <div className="px-4 py-3 border-b border-surface-200" style={{ background: '#FDE7EE' }}>
                        <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                      </div>
                      <Link to={getDashboardLink()} onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                        <BarChart3 className="w-4 h-4" /> Dashboard
                      </Link>
                      {/* Verification link for sellers and buyers */}
                      {(isSeller || isBuyer) && (
                        <Link to={getVerificationLink()} onClick={() => setUserMenuOpen(false)}
                          className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                          <span className="flex items-center gap-2.5">
                            <Shield className="w-4 h-4" /> Verification
                          </span>
                          {getVerificationIcon()}
                        </Link>
                      )}
                      <div className="border-t border-surface-100 mt-1">
                        <button onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-primary-500 transition-colors rounded-xl hover:bg-primary-50">
                  Sign In
                </Link>
                <Link to="/register"
                  className="px-5 py-2 text-sm font-semibold rounded-xl transition-all active:scale-95 shadow-sm btn-primary">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-500 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition-colors">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-surface-100 py-3 px-4 space-y-1 animate-slide-down">
          {[['/', 'Home', true], ['/properties', 'Properties'], ['/about', 'About'], isAuthenticated && [getDashboardLink(), 'Dashboard']].filter(Boolean).map(([path, label, exact]) => (
            <Link key={path} to={path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-colors ${
                (exact ? isActive(path) : location.pathname.startsWith(path)) ? 'text-primary-500 bg-primary-50' : 'text-gray-700 hover:bg-primary-50'
              }`}>
              {label}
            </Link>
          ))}
          {isSeller && (
            <Link to="/seller/properties/create" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold text-white transition-colors"
              style={{ background: '#F57799', color: '#ffffff' }}>
              + List Property
            </Link>
          )}
          {isAuthenticated && (
            <button onClick={() => { handleLogout(); setMobileOpen(false); }}
              className="flex items-center gap-2 w-full py-2.5 px-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
