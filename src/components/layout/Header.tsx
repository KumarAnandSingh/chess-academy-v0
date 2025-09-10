import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Crown, 
  Menu, 
  X, 
  User, 
  Settings, 
  BookOpen, 
  Puzzle, 
  Monitor, 
  Trophy,
  BarChart3,
  LogOut,
  Shield,
  Smartphone,
  Bell,
  Search
} from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu'
import { useAuthStore } from '../../stores/authStore'
import { AuthModal } from '../auth/AuthModal'
import { cn } from '../../lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Lessons', href: '/lessons', icon: BookOpen },
  { name: 'Puzzles', href: '/puzzles', icon: Puzzle },
  { name: 'vs Computer', href: '/play', icon: Monitor },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy }
]

interface HeaderProps {
  onMobileMenuToggle?: () => void
  isMobileMenuOpen?: boolean
}

const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle, isMobileMenuOpen }) => {
  const { user, isAuthenticated, logout, deviceInfo } = useAuthStore()
  const [authModalOpen, setAuthModalOpen] = React.useState(false)
  const location = useLocation()
  
  const openLogin = () => setAuthModalOpen(true)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <header className={cn(
      "sticky top-0 z-mobile-nav w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      "mobile:bg-background/90",
      "safe-top"
    )}>
      <div className={cn(
        "container flex items-center",
        "h-14 mobile:h-16 px-4 mobile:px-6"
      )}>
        {/* Mobile menu button */}
        {isAuthenticated && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "mr-2 lg:hidden",
              "h-10 w-10 mobile:h-12 mobile:w-12",
              "touch:h-12 touch:w-12"
            )}
            onClick={onMobileMenuToggle}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 mobile:h-6 mobile:w-6" />
            ) : (
              <Menu className="h-5 w-5 mobile:h-6 mobile:w-6" />
            )}
            <span className="sr-only">Toggle menu</span>
          </Button>
        )}

        {/* Logo */}
        <Link 
          to={isAuthenticated ? "/dashboard" : "/"} 
          className="flex items-center space-x-2 mr-4 lg:mr-8"
        >
          <Crown className="h-6 w-6 text-primary mobile:h-8 mobile:w-8" />
          <span className="font-bold text-lg mobile:text-xl hidden sm:inline-block">
            Chess Academy
          </span>
          <span className="font-bold text-lg mobile:text-xl sm:hidden">
            CA
          </span>
        </Link>

        {/* Desktop Navigation - only show when authenticated */}
        {isAuthenticated && (
          <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium flex-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-2 transition-colors hover:text-foreground/80",
                    isActive ? "text-foreground" : "text-foreground/60"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        )}

        {/* Spacer for non-authenticated users */}
        {!isAuthenticated && <div className="flex-1" />}

        {/* Right side */}
        <div className={cn(
          "flex items-center",
          "space-x-2 mobile:space-x-3"
        )}>
          {isAuthenticated ? (
            <>
              {/* Device indicator badge */}
              <Badge 
                variant="secondary" 
                className={cn(
                  "hidden sm:inline-flex text-xs",
                  deviceInfo.isMobile && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                )}
              >
                {deviceInfo.isMobile ? 'Mobile' : deviceInfo.isTablet ? 'Tablet' : 'Desktop'}
              </Badge>

              {/* Notifications - hide on mobile */}
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "relative hidden sm:inline-flex",
                  "h-10 w-10 mobile:h-12 mobile:w-12"
                )}
              >
                <Bell className="h-5 w-5 mobile:h-6 mobile:w-6" />
                <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full"></span>
                <span className="sr-only">Notifications</span>
              </Button>

              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "relative",
                      "h-10 w-10 mobile:h-12 mobile:w-12",
                      "touch:h-12 touch:w-12"
                    )}
                  >
                    <User className="h-5 w-5 mobile:h-6 mobile:w-6" />
                    <span className="sr-only">Profile menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className={cn(
                    "w-56 mobile:w-64",
                    "mr-2 mobile:mr-4"
                  )}
                >
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none mobile:text-base">
                        {user?.displayName || 'Guest'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground mobile:text-sm">
                        {user?.email || 'guest@example.com'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground mobile:text-sm">
                        Rating: 1200
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Mobile device indicator */}
                  {deviceInfo.isMobile && (
                    <>
                      <DropdownMenuItem className="sm:hidden">
                        <Smartphone className="mr-2 h-4 w-4" />
                        <span>Mobile View</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="sm:hidden" />
                    </>
                  )}
                  
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  {/* Admin section for demo */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Admin Panel</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            /* Authentication buttons for non-authenticated users */
            <>
              <Button 
                variant="ghost" 
                onClick={openLogin}
                className={cn(
                  "h-10 px-4 mobile:h-12 mobile:px-6",
                  "touch:h-12 touch:px-6",
                  "text-sm mobile:text-base"
                )}
              >
                Sign In
              </Button>
              <Button 
                onClick={openLogin}
                className={cn(
                  "h-10 px-4 mobile:h-12 mobile:px-6",
                  "touch:h-12 touch:px-6",
                  "text-sm mobile:text-base"
                )}
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        initialMode="login" 
      />
    </header>
  )
}

export default Header