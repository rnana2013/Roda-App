/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Users, Car, Wrench, FileText, 
  TrendingUp, Clock, AlertTriangle, ArrowRight,
  Plus, Search, Calendar as CalendarIcon, Database,
  MessageCircle, BarChart3, FileSpreadsheet
} from 'lucide-react';
import { useStore } from '../store';
import { format, isToday, isAfter, subDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

const Dashboard: React.FC = () => {
  const { clients, vehicles, services } = useStore();
  const navigate = useNavigate();

  // Stats calculations
  const paidServices = services.filter(s => s.paymentStatus === 'pago');
  const totalReceived = paidServices.reduce((acc, s) => acc + s.totalValue, 0);

  const activeServices = services.filter(s => 
    !['Finalizado', 'Entregue', 'Aguardando avaliação', 'Orçamento enviado'].includes(s.status)
  );

  const pendingBudgets = services.filter(s => 
    ['Aguardando avaliação', 'Orçamento enviado'].includes(s.status)
  );

  const oilChangeReminders = vehicles.filter(v => {
    if (!v.km) return false;
    const nextTarget = Math.ceil((v.km + 1) / 5000) * 5000;
    return (nextTarget - v.km) < 500;
  });

  const recentBudgets = [...pendingBudgets]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
      <header className="mb-10 pt-4">
        <h1 className="text-4xl font-display font-black mb-1 tracking-tighter uppercase italic text-white">Resumo da <span className="text-primary italic">Operação</span></h1>
        <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Dashboard administrativo da Pit Stop App</p>
      </header>

      {/* Quick Actions / Atalhos */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-16">
        <QuickAction label="Registrar Carro" icon={<Car size={24} />} onClick={() => navigate('/veiculos')} color="primary" />
        <QuickAction label="Novo Cliente" icon={<Users size={24} />} onClick={() => navigate('/clientes')} color="dark" />
        <QuickAction label="Abrir O.S." icon={<Wrench size={24} />} onClick={() => navigate('/servicos')} color="dark" />
        <QuickAction label="Criar Orçamento" icon={<FileText size={24} />} onClick={() => navigate('/orcamentos')} color="dark" />
        <QuickAction label="Preços/Peças" icon={<Database size={24} />} onClick={() => navigate('/catalogo')} color="dark" />
        <QuickAction label="Agenda" icon={<CalendarIcon size={24} />} onClick={() => navigate('/calendario')} color="dark" />
        <QuickAction label="Contatos" icon={<MessageCircle size={24} />} onClick={() => window.open('https://web.whatsapp.com', '_blank')} color="dark" />
        <QuickAction label="Relatórios" icon={<BarChart3 size={24} />} onClick={() => navigate('/financeiro')} color="dark" />
      </div>

      <motion.div 
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10"
      >
        {/* Main Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard label="Total Clientes" value={clients.length} icon={<Users size={40} className="text-white/20" />} />
          <StatCard label="Frota Cadastrada" value={vehicles.length} icon={<Car size={40} className="text-white/20" />} />
          <StatCard label="O.S. em Execução" value={activeServices.length} icon={<Wrench size={40} className="text-white/20" />} subtitle="Pátio ocupado" />
          <StatCard 
            label="Lucro Consolidado" 
            value={`R$ ${totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
            icon={<TrendingUp size={40} className="text-primary/40" />} 
            subtitle="Pagamentos recebidos"
          />
        </div>

        {/* Sidebar Alerts */}
        <div className="space-y-6">
           <div className="card-dark p-6">
              <h3 className="font-black text-[10px] uppercase tracking-[0.2em] mb-6 flex items-center gap-2 text-white/40">
                <Clock className="text-primary" size={14} /> Atividade Crítica
              </h3>
              <div className="space-y-4">
                {oilChangeReminders.length > 0 && oilChangeReminders.slice(0, 2).map(v => (
                  <div key={v.id} className="bg-red-500/10 p-4 rounded-3xl border border-red-500/20 group cursor-help transition-colors hover:bg-red-500/20">
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Troca de Óleo Próxima</p>
                    <p className="text-sm font-black uppercase italic tracking-tighter text-white">{v.plate} • {v.model}</p>
                  </div>
                ))}
                
                {activeServices.length > 0 ? (
                  activeServices.slice(0, 3).map(service => (
                    <div key={service.id} className="bg-white/5 p-4 rounded-3xl border border-white/5 shadow-sm group hover:border-primary transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-[9px] font-black uppercase text-white/30 tracking-widest">{service.status}</p>
                        <p className="text-[9px] font-black text-primary italic">#{service.id.slice(0, 4).toUpperCase()}</p>
                      </div>
                      <p className="text-sm font-black uppercase italic tracking-tighter text-white">
                        {vehicles.find(v => v.id === service.vehicleId)?.plate || 'S/ PLACA'}
                      </p>
                      <p className="text-[10px] font-bold text-white/40 truncate mt-1">{service.description}</p>
                    </div>
                  ))
                ) : (
                  oilChangeReminders.length === 0 && <p className="text-xs text-white/20 italic text-center py-6 border-2 border-dashed border-white/5 rounded-[2rem]">Nenhuma atividade agora.</p>
                )}
              </div>
           </div>
        </div>

        {/* Pending Budgets Table-like section */}
        <div className="lg:col-span-2 card-dark flex flex-col overflow-hidden border-white/5">
           <div className="p-8 bg-white/5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight italic">Orçamentos <span className="text-black bg-primary px-2 pb-1 italic">Provisórios</span></h3>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mt-2">Negociações em aberto no radar</p>
              </div>
              <button 
                onClick={() => navigate('/orcamentos')}
                className="bg-white/5 text-white/60 hover:text-white border border-white/10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 active:scale-95 transition-all"
              >
                Gerenciar Propostas
              </button>
           </div>
           
           <div className="divide-y divide-white/5 bg-black/20">
              {recentBudgets.length > 0 ? (
                recentBudgets.map(budget => {
                  const vehicle = vehicles.find(v => v.id === budget.vehicleId);
                  const client = clients.find(c => c.id === budget.clientId);
                  return (
                    <div 
                      key={budget.id} 
                      onClick={() => navigate(`/recibo/${budget.id}`)}
                      className="p-6 flex items-center justify-between hover:bg-white/[0.03] cursor-pointer group transition-colors"
                    >
                      <div className="flex gap-5 items-center">
                         <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white/20 group-hover:bg-primary group-hover:text-black transition-all">
                            <FileSpreadsheet size={22} />
                         </div>
                         <div>
                            <p className="font-black text-base uppercase tracking-tighter italic text-white group-hover:text-primary transition-colors">{vehicle?.plate || 'S/ PLACA'}</p>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest truncate max-w-[200px]">{client?.name || 'Cliente Avulso'}</p>
                         </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-2xl italic tracking-tighter leading-none mb-1 text-white">R$ {budget.totalValue.toFixed(2)}</p>
                        <span className="text-[8px] bg-white/5 text-white/40 px-2 py-1 rounded font-black uppercase tracking-widest italic border border-white/5">{budget.status}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-16 text-center text-white/10">
                  <FileText className="mx-auto mb-4 opacity-5" size={48} />
                  <p className="font-black uppercase tracking-[0.3em] text-[10px]">Radar livre. Nenhuma pendência.</p>
                </div>
              )}
           </div>
        </div>

        {/* Mini Promotional Card or Inventory Status */}
        <div className="card-dark p-10 bg-gradient-to-br from-card-dark to-black flex flex-col items-center justify-center text-center group relative overflow-hidden border-white/5">
           <div className="absolute top-0 left-0 w-full h-full bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
           <div className="w-24 h-24 bg-primary/10 text-primary border border-primary/20 rounded-3xl flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform rotate-6 relative z-10">
              <Database size={48} />
           </div>
           <h3 className="font-black text-2xl italic uppercase tracking-tighter mb-2 relative z-10 text-white">Catálogo Premium</h3>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-10 leading-tight relative z-10">Inteligência de mercado e ROI</p>
           <button 
             onClick={() => navigate('/catalogo')}
             className="w-full py-5 bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 rounded-3xl text-[10px] font-black uppercase tracking-[0.4em] transition-all relative z-10"
           >
             Gerenciar Tabela
           </button>
        </div>
      </motion.div>
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string | number, icon: React.ReactNode, subtitle?: string }> = ({ label, value, icon, subtitle }) => (
  <div className="card-dark p-6 md:p-10 relative group overflow-hidden border-white/5 hover:border-primary/30 transition-all shadow-2xl">
    <div className="absolute right-0 top-0 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity translate-x-1/4 -translate-y-1/4 scale-150 rotate-12">
      {icon}
    </div>
    <div className="flex flex-col gap-1 relative z-10">
      <span className="text-[9px] text-white/30 font-black uppercase tracking-[0.3em] italic mb-2">{label}</span>
      <span className="text-4xl md:text-5xl font-black font-display tracking-tight italic group-hover:text-primary transition-colors text-white">{value}</span>
      {subtitle && <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] mt-3 italic">{subtitle}</span>}
    </div>
  </div>
);

const QuickAction: React.FC<{ label: string, icon: React.ReactNode, onClick: () => void, color: 'primary' | 'dark' }> = ({ label, icon, onClick, color }) => (
  <button 
    onClick={onClick}
    className={`p-5 rounded-3xl flex flex-col items-center justify-center gap-4 transition-all active:scale-95 group border ${color === 'primary' ? 'bg-primary border-primary text-black font-black' : 'bg-white/5 border-white/10 hover:border-primary/40 text-white/60 hover:text-white hover:bg-white/10'}`}
  >
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6 ${color === 'primary' ? 'bg-black/10' : 'bg-black text-primary border border-white/5 shadow-2xl'}`}>
      {icon}
    </div>
    <span className="text-[9px] font-black uppercase tracking-tighter leading-tight text-center">{label}</span>
  </button>
);

export default Dashboard;
