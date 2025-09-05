import React, { useState } from 'react'
import Sidebar from '../layout/Sidebar'
import { Button } from './button'
import { Menu, X } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:flex md:w-64 md:flex-col bg-white border-r border-gray-200">
        <Sidebar isOpen={true} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleMobileMenuClose} />
          <div className="relative flex w-64 h-full bg-white border-r border-gray-200">
            <Sidebar isOpen={true} onClose={handleMobileMenuClose} />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header - Only visible on mobile */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMobileMenuToggle}
            className="text-gray-600"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">Chess Academy</h1>
          <div className="w-8" /> {/* Spacer for center alignment */}
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout