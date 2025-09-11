import React, { useState, useEffect } from 'react'
import Sidebar from '../layout/Sidebar'
import { Button } from './button'
import { Menu, X, User, LogIn, Sun, Moon } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import { AuthModal } from '../auth/AuthModal'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const { user, isAuthenticated, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false)
  }

  const handleAuthModal = () => {
    setAuthModalOpen(true)
  }

  const handleLogout = async () => {
    await logout()
  }

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  // Ensure mobile menu is closed on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setIsMobileMenuOpen(false)
      }
    }
    
    window.addEventListener('resize', handleResize)
    handleResize() // Run on mount
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      {/* Desktop Sidebar - Hidden on mobile */}
      <div 
        className={`hidden md:flex md:flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'md:w-16' : 'md:w-64'
        }`}
        style={{ 
          backgroundColor: 'var(--color-surface-elevated)', 
          borderRight: '1px solid var(--color-border-default)' 
        }}
      >
        <Sidebar isOpen={true} isCollapsed={isSidebarCollapsed} onToggleCollapse={handleSidebarToggle} />
      </div>

      {/* Mobile Sidebar Overlay - Only visible on mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 md:hidden" 
            onClick={handleMobileMenuClose} 
          />
          <div 
            className="relative flex w-64 h-full" 
            style={{ 
              backgroundColor: 'var(--color-surface-elevated)', 
              borderRight: '1px solid var(--color-border-default)' 
            }}
          >
            <Sidebar isOpen={true} onClose={handleMobileMenuClose} />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header - Only visible on mobile */}
        <div 
          className="md:hidden flex items-center justify-between p-4 border-b" 
          style={{ 
            backgroundColor: 'var(--color-surface-elevated)', 
            borderColor: 'var(--color-border-default)' 
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMobileMenuToggle}
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Chess Academy</h1>
          
          {/* Theme toggle and Auth buttons for mobile */}
          <div className="flex items-center space-x-2">
            {/* Mobile Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              style={{ color: 'var(--color-text-secondary)' }}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
            {/* Mobile Auth Button */}
            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <User className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAuthModal}
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <LogIn className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Desktop Header - Only visible on desktop */}
        <div 
          className="hidden md:flex items-center justify-between p-4 border-b" 
          style={{ 
            backgroundColor: 'var(--color-surface-elevated)', 
            borderColor: 'var(--color-border-default)' 
          }}
        >
          <div></div> {/* Empty space for alignment */}
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Chess Academy</h1>
          
          {/* Theme toggle and Auth section for desktop */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2"
              style={{ color: 'var(--color-text-secondary)' }}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Welcome, {user.displayName}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleAuthModal}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login / Sign Up
              </Button>
            )}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto" style={{ backgroundColor: 'var(--color-bg-base)' }}>
          {children}
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
    </div>
  )
}

export default Layout