import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './screens/Dashboard';
import Clients from './screens/Clients';
import Vehicles from './screens/Vehicles';
import Services from './screens/Services';
import Catalog from './screens/Catalog';
import CatalogServices from './screens/CatalogServices';
import CatalogParts from './screens/CatalogParts';
import Calendar from './screens/Calendar';
import Receipt from './screens/Receipt';
import Budgets from './screens/Budgets';
import Financial from './screens/Financial';
import Settings from './screens/Settings';
import { useStore } from './store';
import { PitStopLogo } from './components/PitStopLogo';
import { motion } from 'motion/react';

export default function App() {
  const { user, authLoading } = useStore();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#070708] flex flex-col items-center justify-center p-6 text-white select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-xs mb-8"
        >
          <PitStopLogo />
        </motion.div>
        <span className="text-[10px] uppercase tracking-[0.4em] font-black text-white/40">
          Iniciando Sistemas de Engenharia Pit Stop App...
        </span>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="clientes" element={<Clients />} />
          <Route path="veiculos" element={<Vehicles />} />
          <Route path="calendario" element={<Calendar />} />
          <Route path="servicos" element={<Services />} />
          <Route path="recibo/:id" element={<Receipt />} />
          <Route path="orcamentos" element={<Budgets />} />
          <Route path="catalogo" element={<Catalog />} />
          <Route path="catalogo-servicos" element={<CatalogServices />} />
          <Route path="catalogo-pecas" element={<CatalogParts />} />
          <Route path="financeiro" element={<Financial />} />
          <Route path="configuracoes" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
