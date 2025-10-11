
    import React, { useState } from 'react';
    import { Link, useLocation, useNavigate } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { Avatar, AvatarFallback } from '@/components/ui/avatar';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
    import { Mic, LayoutDashboard, Upload, FileText, Settings, LogOut, Menu, X, CreditCard, Home } from 'lucide-react';

    const TestDashboardLayout = ({ children }) => {
      const location = useLocation();
      const navigate = useNavigate();
      const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

      const navigation = [
        { name: 'Dashboard', href: '/test-dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { name: 'Upload', href: '/test-upload', icon: <Upload className="w-5 h-5" /> },
        { name: 'Transcriptions', href: '/test-transcriptions', icon: <FileText className="w-5 h-5" /> },
      ];

      const userName = 'Test User';
      const userEmail = 'test@example.com';
      const userCredits = 9999;
      const userPlan = 'Business';

      return (
        <div className="min-h-screen">
          <nav className="glass-effect fixed top-0 left-0 right-0 z-50 border-b border-white/10">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link to="/test-dashboard" className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Mic className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold gradient-text hidden sm:block">TranscribeAI</span>
                </Link>

                <div className="hidden md:flex items-center space-x-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition ${
                        location.pathname === item.href
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>

                <div className="flex items-center space-x-4">
                  <div className="hidden sm:flex items-center space-x-2 glass-effect px-4 py-2 rounded-lg">
                    <CreditCard className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium">{userCredits} credits</span>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar>
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500">
                            T
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 glass-effect border-white/10">
                      <div className="px-2 py-2">
                        <p className="text-sm font-medium">{userName}</p>
                        <p className="text-xs text-gray-400">{userEmail}</p>
                        <p className="text-xs text-purple-400 mt-1">{userPlan} Plan</p>
                      </div>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem onClick={() => navigate('/')} className="cursor-pointer">
                        <Home className="w-4 h-4 mr-2" />
                        Back to Home
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </Button>
                </div>
              </div>

              {mobileMenuOpen && (
                <div className="md:hidden mt-4 pb-4 space-y-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition ${
                        location.pathname === item.href
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
          
          <main className="pt-28 pb-16 container mx-auto px-4">
            {children}
          </main>
        </div>
      );
    };

    export default TestDashboardLayout;
  