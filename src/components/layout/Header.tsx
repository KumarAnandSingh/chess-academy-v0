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
  BarChart3
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
  const { user } = useAuthStore()
  const location = useLocation()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden"
          onClick={onMobileMenuToggle}
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center space-x-2 mr-8">
          <Crown className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl hidden sm:inline-block">Chess Academy</span>
          <span className="font-bold text-xl sm:hidden">CA</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium flex-1">
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

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Progress chip */}
          <Badge variant="secondary" className="hidden sm:inline-flex">
            Demo Mode
          </Badge>

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <User className="h-5 w-5" />
                <span className="sr-only">Profile menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.displayName || 'Guest'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    Rating: 1200
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export default Header