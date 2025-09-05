import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Crown, 
  BookOpen, 
  Puzzle, 
  Monitor, 
  Trophy, 
  BarChart3
} from 'lucide-react'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'vs Computer Champs', href: '/play', icon: Monitor },
  { name: 'Learn Basics', href: '/lessons', icon: BookOpen },
  { name: 'Practice', href: '/puzzles', icon: Puzzle },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy }
]

interface SidebarProps {
  isOpen: boolean
  onClose?: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation()

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo - Always visible now */}
      <div className="p-4 border-b">
        <Link 
          to="/dashboard" 
          className="flex items-center space-x-2"
          onClick={onClose}
        >
          <Crown className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-xl text-gray-900">Chess Academy</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href
          return (
            <Button
              key={item.name}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start space-x-2 h-10",
                isActive && "bg-accent text-accent-foreground"
              )}
              asChild
            >
              <Link 
                to={item.href}
                onClick={onClose}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            </Button>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground">
          <div className="flex items-center justify-between mb-1">
            <span>Current Rating</span>
            <span className="font-medium">1200</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-14 z-50 h-[calc(100vh-3.5rem)] w-64 transform border-r bg-background transition-transform duration-200 ease-in-out md:relative md:top-0 md:h-full md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {sidebarContent}
      </aside>
    </>
  )
}

export default Sidebar