import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { StockResearch } from './pages/StockResearch';
import { PortfolioAnalyzer } from './pages/PortfolioAnalyzer';
import { RiskAnalytics } from './pages/RiskAnalytics';
import { SipCalculator } from './pages/SipCalculator';
import { AiAssistant } from './pages/AiAssistant';
import { getHealth } from './services/api';
import { HealthStatus } from './types';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('Dashboard');
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const fetchBackendHealth = async () => {
    try {
      const data = await getHealth();
      setHealth(data);
    } catch (err) {
      console.warn('Backend health check warning:', err);
      setHealth(null);
    }
  };

  useEffect(() => {
    fetchBackendHealth();
    const interval = setInterval(fetchBackendHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchBackendHealth();
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="flex min-h-screen bg-[#0B1020] text-[#E5E7EB] font-sans antialiased">
      {/* Desktop & Tablet Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          currentPage={currentPage}
          onSelectPage={(page) => setCurrentPage(page)}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          health={health}
        />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-72">
            <Sidebar
              currentPage={currentPage}
              onSelectPage={(page) => {
                setCurrentPage(page);
                setMobileMenuOpen(false);
              }}
              collapsed={false}
              onToggleCollapse={() => setMobileMenuOpen(false)}
              health={health}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentPage={currentPage}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          health={health}
        />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto" key={refreshKey}>
          {currentPage === 'Dashboard' && <Dashboard onNavigate={(page) => setCurrentPage(page)} />}
          {currentPage === 'Stock Research' && <StockResearch />}
          {currentPage === 'Portfolio Analyzer' && <PortfolioAnalyzer />}
          {currentPage === 'Risk Analytics' && <RiskAnalytics />}
          {currentPage === 'SIP Calculator' && <SipCalculator />}
          {currentPage === 'AI Assistant' && <AiAssistant />}
        </main>
      </div>
    </div>
  );
};

export default App;
