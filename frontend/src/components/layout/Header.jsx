import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Menu, 
  X, 
  LogIn, 
  UserPlus,
  Home,
  MapPin,
  Heart,
  Stethoscope,
  Users,
  Bell
} from "lucide-react";
import { useState, useEffect } from "react";
import logoImg from "@/assets/logo.png";
import { appointmentsAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { buildNotificationsFromAppointments, getLastSeen, setLastSeen, getSeenIds, addSeenIds } from '@/services/notifications';
import NotificationsDialog from '@/components/notifications/NotificationsDialog';

export const Header = ({ 
  isAuthenticated = false, 
  userInitial = "U",
  userType = 'patient',
  onLogout
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth?.() || { user: null };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  // Notifications state
  const [notifItems, setNotifItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const userId = user?._id || user?.id || 'guest';

  const refreshNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const role = userType;
      const appts = role === 'doctor' ? await appointmentsAPI.getDoctorAppointments('all') : await appointmentsAPI.getMyAppointments('all');
      const items = buildNotificationsFromAppointments(appts || [], role === 'doctor' ? 'doctor' : 'patient');
      setNotifItems(items);
      const seen = getSeenIds(userId);
      const unreadCount = items.filter(it => !seen.has(it.id)).length;
      setUnread(unreadCount);
    } catch (e) {
      // Fail quietly
      setNotifItems([]);
      setUnread(0);
    }
  };

  useEffect(() => {
    refreshNotifications();
    const id = setInterval(refreshNotifications, 30000); // poll every 30s
    return () => clearInterval(id);
  }, [isAuthenticated, userType, userId]);

  const markAllRead = () => {
    setLastSeen(userId, new Date());
    setUnread(0);
  };

  // Filter navigation links based on user type
  const allNavLinks = [
    { to: "/", label: "Home", icon: Home, allowedFor: ['all'] },
    { to: "/find-care", label: "Find Care", icon: MapPin, allowedFor: ['patient', 'careprovider', 'guest'] },
    { to: "/healthy-living", label: "Health Tips", icon: Heart, allowedFor: ['all'] },
    { to: "/doctors", label: "Doctors", icon: Stethoscope, allowedFor: ['patient', 'careprovider', 'guest'] },
    { to: "/doctor-patients", label: "Patients", icon: Users, allowedFor: ['doctor'] },
  ];

  // Filter links based on user type (doctors should not see Find Care and Doctors)
  const navLinks = allNavLinks.filter(link => {
    if (link.allowedFor.includes('all')) {
      return true;
    }
    
    // For unauthenticated users, show guest-allowed links
    if (!isAuthenticated) {
      return link.allowedFor.includes('guest');
    }
    
    // For authenticated users, check their user type
    return link.allowedFor.includes(userType);
  });

  // Debug logging (can be removed in production)
  useEffect(() => {
    console.log('🧭 Navigation Filter Debug:', {
      isAuthenticated,
      userType,
      totalLinks: allNavLinks.length,
      visibleLinks: navLinks.length,
      visibleLinkLabels: navLinks.map(link => link.label)
    });
  }, [isAuthenticated, userType, navLinks]);

  return (
    <header className="bg-gradient-primary text-white sticky top-0 z-50 shadow-strong">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 lg:h-20">
          
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 animate-slideInLeft hover:scale-105 transition-transform duration-300"
          >
            <img 
              src={logoImg} 
              alt="MASSS Logo" 
              className="h-12 lg:h-16 w-auto transition-transform hover:rotate-12"
            />
            <span className="text-xl lg:text-2xl font-bold hidden sm:block">
              MASSS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 flex-1 justify-end animate-slideInRight">
            <nav className="flex items-center gap-4">
              {navLinks.map(({ to, label, icon: Icon }) => {
                const isActive = location.pathname === to;
                return (
                  <Link key={to} to={to}>
                    <Button
                      variant="ghost"
                      className={`text-white hover:bg-white/20 transition-all ${
                        isActive ? "bg-white/20" : ""
                      } px-3 py-2`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Button>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3 ml-4">
              {isAuthenticated ? (
                <>
                  {/* Bell notifications button */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { setNotifOpen(true); }}
                      className="relative w-10 h-10 rounded-full hover:bg-white/20"
                    >
                      <Bell className="h-5 w-5 text-white" />
                      {unread > 0 && (
                        <span className="absolute top-0 right-0 translate-x-1 -translate-y-1 inline-flex items-center justify-center w-5 h-5 text-[10px] bg-red-600 text-white rounded-full ring-2 ring-primary z-10">{unread}</span>
                      )}
                    </Button>
                  </div>

                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleUserMenu}
                      className="w-10 h-10 rounded-full bg-white text-primary font-bold hover:bg-white/90 transition-all hover:scale-110 relative"
                    >
                      {userInitial}
                    </Button>
                  
{isUserMenuOpen && (
                    <div className="absolute right-0 top-12 bg-white rounded-lg shadow-strong min-w-[16rem] py-2 text-foreground">
                      <Link to={userType === 'doctor' ? '/doctor-appointments' : '/patient-appointments'} className="flex items-center gap-3 px-4 py-2 hover:bg-accent transition-colors">
                        <Stethoscope className="h-4 w-4" />
                        Appointments
                      </Link>
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-2 hover:bg-accent transition-colors">
                        <User className="h-4 w-4" />
                        My Profile
                      </Link>
                      <hr className="my-2" />
                      <button 
                        onClick={() => { onLogout?.(); setIsUserMenuOpen(false); navigate('/'); }}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-accent transition-colors w-full text-left text-destructive"
                      >
                        <LogIn className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>

                {/* Notifications full dialog */}
                <NotificationsDialog
                  open={notifOpen}
                  onClose={() => setNotifOpen(false)}
                  userType={userType}
                  userId={userId}
                  onUpdated={() => refreshNotifications()}
                />
              </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="nav" size="nav">
                      <LogIn className="h-4 w-4" />
                      Login
                    </Button>
                  </Link>
                  <Link to="/login?signup=true">
                    <Button variant="hero" size="nav">
                      <UserPlus className="h-4 w-4" />
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            className="lg:hidden text-white hover:bg-white/20"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-primary-dark border-t border-white/20 py-4">
            <nav className="flex flex-col gap-2 mb-4">
              {navLinks.map(({ to, label, icon: Icon }) => {
                const isActive = location.pathname === to;
                return (
                  <Link key={to} to={to}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start text-white hover:bg-white/20 ${
                        isActive ? "bg-white/20" : ""
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Button>
                  </Link>
                );
              })}
            </nav>
            
            <div className="flex gap-2">
              {isAuthenticated ? (
                <Button
                  variant="nav"
                  className="flex-1"
                  onClick={toggleUserMenu}
                >
                  <User className="h-4 w-4" />
                  Profile ({userInitial})
                </Button>
              ) : (
                <>
                  <Link to="/login" className="flex-1">
                    <Button variant="nav" size="nav" className="w-full">
                      <LogIn className="h-4 w-4" />
                      Login
                    </Button>
                  </Link>
                  <Link to="/login?signup=true" className="flex-1">
                    <Button variant="hero" size="nav" className="w-full">
                      <UserPlus className="h-4 w-4" />
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};