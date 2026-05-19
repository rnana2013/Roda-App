import React from 'react';
import { 
  DollarSign, TrendingUp, AlertCircle, Calendar, 
  BarChart3, PieChart, ArrowUpRight, ArrowDownRight,
  Target, Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../store';

const Financial: React.FC = () => {
  const { services } = useStore();

  const totalRevenue = services
    .filter(s => s.paymentStatus === 'pago')
    .reduce((acc, s) => acc + s.totalValue, 0);

  const pendingRevenue = services
    .filter(s => s.paymentStatus === 'pendente')
    .reduce((acc, s) => acc + s.totalValue, 0);

  return (
    <div className="p-4 md:p-12 max-w-7xl mx-auto min-h-screen">
      <header className="mb-12">
         <h1 className="text-5xl font-display font-black tracking-tighter uppercase italic text-white leading-none">Radar <span className="text-primary italic">Financeiro</span></h1>
         <p className="text-white/30 font-black uppercase tracking-[0.4em] text-[10px] mt-4">Paineis de performance e ROI</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <StatCard 
          label="Receita Consolidada" 
          value={`R$ ${totalRevenue.toLocaleString()}`} 
          trend="+12%" 
          positive={true} 
          icon={<DollarSign size={24} />} 
        />
        <StatCard 
          label="Contas a Receber" 
          value={`R$ ${pendingRevenue.toLocaleString()}`} 
          trend="8 ordens" 
          positive={false} 
          icon={<AlertCircle size={24} />} 
          color="text-orange-500"
        />
        <StatCard 
          label="Ticket Médio" 
          value="R$ 1.250" 
          trend="+5%" 
          positive={true} 
          icon={<TrendingUp size={24} />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="card-dark p-10 border border-white/5 relative overflow-hidden group min-h-[400px] flex flex-col justify-center items-center text-center">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
              <BarChart3 size={300} />
           </div>
           <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8 border border-primary/20 shadow-2xl shadow-primary/10">
              <Zap size={40} className="text-primary animate-pulse" />
           </div>
           <h2 className="text-2xl font-black text-white italic uppercase tracking-tight mb-4">Módulo de Business Intelligence</h2>
           <p className="text-sm text-white/40 leading-relaxed max-w-xs font-medium">Estamos processando seu banco de dados para gerar gráficos de lucratividade por tipo de serviço e custo de peças.</p>
           <button className="mt-8 px-8 py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-white/10 transition-all rounded-xl">LIBERAR ACESSO ANTECIPADO</button>
        </div>

        <div className="card-dark p-10 border border-white/5 relative overflow-hidden group min-h-[400px] flex flex-col justify-center items-center text-center">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
              <Target size={300} />
           </div>
           <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/10 shadow-2xl">
              <PieChart size={40} className="text-white/20" />
           </div>
           <h2 className="text-2xl font-black text-white italic uppercase tracking-tight mb-4">Relatórios de Desempenho</h2>
           <p className="text-sm text-white/40 leading-relaxed max-w-xs font-medium">Relatórios detalhados de ROI por fabricante de peças e eficiência de mão de obra estarão disponíveis em breve.</p>
           <div className="mt-10 flex gap-4">
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></div>
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string, trend: string, positive: boolean, icon: React.ReactNode, color?: string }> = ({ label, value, trend, positive, icon, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="card-dark p-8 border border-white/5 shadow-2xl relative group overflow-hidden"
  >
    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
       {icon}
    </div>
    <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 text-white/40 group-hover:text-primary transition-colors border border-white/10 group-hover:border-primary/20`}>
      {icon}
    </div>
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">{label}</p>
    <div className="flex items-end justify-between">
      <h3 className={`text-4xl font-black italic tracking-tighter leading-none ${color || 'text-white'}`}>{value}</h3>
      <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${positive ? 'bg-green-500/10 text-green-500' : 'bg-white/5 text-white/40'}`}>
        {positive ? <ArrowUpRight size={12} /> : null}
        {trend}
      </div>
    </div>
  </motion.div>
);

export default Financial;
