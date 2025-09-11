import React, { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Crown, 
  BookOpen, 
  Puzzle, 
  Monitor, 
  Trophy, 
  BarChart3,
  User,
  Settings,
  Bell,
  Award,
  TrendingUp,
  Target,
  Menu,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { useAuthStore } from '../../stores/authStore'
import { cn } from '../../lib/utils'

const navigation = [
  { name: 'Play', href: '/play', icon: Monitor, description: 'Play against AI' },
  { name: 'Learn / Lessons', href: '/lessons', icon: BookOpen, description: 'Learn chess fundamentals' },
  { name: 'Puzzles', href: '/puzzles', icon: Puzzle, description: 'Practice tactics' },
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3, description: 'Your progress overview' },
  { name: 'Rate My Strength', href: '/strength-assessment', icon: Target, description: 'Assess your skill level', divider: true },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy, description: 'See top players' }
]

const secondaryNavigation = [
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
]

interface SidebarProps {
  isOpen: boolean
  onClose?: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isCollapsed = false, onToggleCollapse }) => {
  const location = useLocation()
  const { user, deviceInfo, isAuthenticated, loginDemo } = useAuthStore()

  // Close sidebar on route change for mobile
  useEffect(() => {
    if (deviceInfo.isMobile && isOpen) {
      onClose?.()
    }
  }, [location.pathname, deviceInfo.isMobile, isOpen, onClose])

  const sidebarContent = (
    <motion.div 
      className="flex flex-col h-full"
      initial={false}
      animate={{ opacity: isOpen ? 1 : 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Logo - Mobile optimized */}
      <div className={cn(
        "p-4 border-b mobile:p-6 flex items-center justify-between",
        "safe-left safe-right"
      )}>
        <Link 
          to="/dashboard" 
          className={cn(
            "flex items-center",
            isCollapsed ? "justify-center w-full" : "space-x-2"
          )}
          onClick={onClose}
        >
          <Crown className="h-6 w-6 text-primary mobile:h-8 mobile:w-8" />
          {!isCollapsed && (
            <span className="font-bold text-lg mobile:text-xl text-foreground">
              Chess Academy
            </span>
          )}
        </Link>
        
        {/* Desktop Toggle Button */}
        {!deviceInfo.isMobile && onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggleCollapse}
            className="hidden md:flex"
            style={{ color: 'var(--color-text-secondary)' }}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* User info section - mobile only */}
      {deviceInfo.isMobile && (
        <div className="p-4 border-b bg-muted/20">
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.displayName}
                </p>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    Rating: 1200
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +50
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Welcome to Chess Academy!</p>
              <Button 
                onClick={loginDemo} 
                variant="outline" 
                size="sm"
                className="w-full"
              >
                Try Demo Mode
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Primary Navigation */}
      <nav className={cn(
        "flex-1 p-4 space-y-1 mobile:p-6",
        "safe-left safe-right"
      )}>
        <div className="space-y-1">
          {navigation.map((item, index) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            return (
              <div key={item.name}>
                {item.divider && (
                  <div className="my-3 border-t" style={{ borderColor: 'var(--color-border-default)' }} />
                )}
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full",
                    isCollapsed 
                      ? "justify-center p-2 h-10" 
                      : "justify-start space-x-3 h-10 mobile:h-12 text-sm mobile:text-base",
                    "touch:h-12",
                    isActive && "bg-accent text-accent-foreground shadow-sm"
                  )}
                  asChild
                  title={isCollapsed ? item.name : undefined}
                >
                  <Link 
                    to={item.href}
                    onClick={onClose}
                    className="flex items-center"
                  >
                    <Icon className="h-4 w-4 mobile:h-5 mobile:w-5 shrink-0" />
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{item.name}</div>
                        {deviceInfo.isMobile && (
                          <div className="text-xs text-muted-foreground">
                            {item.description}
                          </div>
                        )}
                      </div>
                    )}
                  </Link>
                </Button>
              </div>
            )
          })}
        </div>

        {/* Secondary navigation - mobile only */}
        {deviceInfo.isMobile && (
          <div className="pt-4 mt-4 border-t space-y-1">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Account
            </div>
            {secondaryNavigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start space-x-3",
                    "h-10 mobile:h-12 text-sm mobile:text-base",
                    isActive && "bg-accent text-accent-foreground"
                  )}
                  asChild
                >
                  <Link 
                    to={item.href}
                    onClick={onClose}
                  >
                    <Icon className="h-4 w-4 mobile:h-5 mobile:w-5" />
                    <span>{item.name}</span>
                  </Link>
                </Button>
              )
            })}
          </div>
        )}
      </nav>

      {/* Bottom section - Enhanced for mobile */}
      <div className={cn(
        "p-4 border-t bg-muted/20 mobile:p-6",
        "safe-left safe-right safe-bottom"
      )}>
        {isAuthenticated ? (
          <div className="space-y-3">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 text-xs mobile:text-sm">
              <div className="text-center">
                <div className="font-semibold text-foreground">1200</div>
                <div className="text-muted-foreground">Rating</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600">+50</div>
                <div className="text-muted-foreground">This Week</div>
              </div>
            </div>
            
            {/* Progress indicator */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs mobile:text-sm">
                <span className="text-muted-foreground">Level Progress</span>
                <span className="font-medium text-foreground">75%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary rounded-full h-2 transition-all duration-300" 
                  style={{ width: '75%' }}
                />
              </div>
            </div>
            
            {/* Achievement indicator */}
            <div className="flex items-center space-x-2 text-xs mobile:text-sm text-muted-foreground">
              <Award className="w-4 h-4 text-yellow-500" />
              <span>3 achievements unlocked</span>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Sign up to track your progress!
            </p>
            <Button 
              onClick={loginDemo} 
              variant="primary" 
              size="sm"
              className="w-full"
            >
              Get Started
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  )

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-mobile-overlay lg:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <motion.aside 
        className={cn(
          "fixed left-0 z-mobile-nav w-72 mobile:w-80 transform border-r bg-background",
          "top-14 mobile:top-16 h-[calc(100vh-3.5rem)] mobile:h-[calc(100vh-4rem)]",
          "transition-transform duration-300 ease-out",
          "lg:relative lg:top-0 lg:h-full lg:translate-x-0 lg:w-64",
          "shadow-mobile-bottom lg:shadow-none"
        )}
        initial={false}
        animate={{ 
          x: isOpen ? 0 : '-100%',
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          duration: 0.3 
        }}
      >
        {sidebarContent}
      </motion.aside>
    </>
  )
}

export default Sidebar