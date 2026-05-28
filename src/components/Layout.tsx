/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  Home, Users, Car, Wrench, FileText, 
  Settings, LayoutDashboard, Database, BarChart3, Search, Calendar as CalendarIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store';
import { PitStopLogo } from './PitStopLogo';

const Layout: React.FC = () => {

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#070708]">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-black border-b border-white/5 sticky top-0 z-50">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 py-1">
            <PitStopLogo width={150} height={32} className="justify-start" />
          </div>
        </div>
      </header>

      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-black border-r border-white/5 h-screen sticky top-0 text-white select-none">
        <div className="px-6 py-8 mb-4 flex items-center justify-center">
          <PitStopLogo width={190} height={42} />
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem to="/clientes" icon={<Users size={20} />} label="Clientes" />
          <NavItem to="/veiculos" icon={<Car size={20} />} label="Veículos" />
          <NavItem to="/calendario" icon={<CalendarIcon size={20} />} label="Calendário" />
          <NavItem to="/servicos" icon={<Wrench size={20} />} label="Ordens de Serviço" />
          <NavItem to="/catalogo-servicos" icon={<Wrench size={20} />} label="Catálogo de Serviços" />
          <NavItem to="/catalogo-pecas" icon={<Database size={20} />} label="Catálogo de Peças" />
          <NavItem to="/orcamentos" icon={<FileText size={20} />} label="Orçamentos" />
          <NavItem to="/financeiro" icon={<BarChart3 size={20} />} label="Financeiro" />
          <NavItem to="/configuracoes" icon={<Settings size={20} />} label="Ajustes" />
        </nav>

        <div className="p-6 mt-auto">
          <div className="p-5 bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Wrench size={80} />
            </div>
            <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-1">Painel Pro</p>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Gestão de Oficinas v1.2</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative pb-20 md:pb-0 overflow-x-hidden">
        <Outlet />
      </main>

      {/* Mobile Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-black border-t border-white/5 flex items-center justify-around px-2 z-50 backdrop-blur-md bg-black/90">
        <MobileNavItem to="/" icon={<LayoutDashboard size={22} />} label="Home" />
        <MobileNavItem to="/clientes" icon={<Users size={22} />} label="Clientes" />
        <MobileNavItem to="/calendario" icon={<CalendarIcon size={22} />} label="Agenda" />
        <MobileNavItem to="/servicos" icon={<Wrench size={22} />} label="Serviços" />
        <MobileNavItem to="/orcamentos" icon={<FileText size={22} />} label="Docs" />
        <MobileNavItem to="/configuracoes" icon={<Settings size={22} />} label="Ajustes" />
      </nav>
    </div>
  );
};

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
      ${isActive ? 'bg-primary text-black font-extrabold shadow-lg shadow-primary/20' : 'text-white/60 hover:bg-white/10 hover:text-white'}
    `}
  >
    <span className="shrink-0">{icon}</span>
    <span className="text-sm">{label}</span>
  </NavLink>
);

const MobileNavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      flex flex-col items-center justify-center gap-1 transition-all duration-200 w-16
      ${isActive ? 'text-primary scale-110' : 'text-white/40'}
    `}
  >
    <span className="shrink-0">{icon}</span>
    <span className="text-[10px] font-bold tracking-tight">{label}</span>
  </NavLink>
);

export default Layout;
