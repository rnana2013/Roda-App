import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  Plus, Search, Wrench, Clock, CheckCircle2, AlertCircle,
  FileText, MessageCircle, DollarSign
} from 'lucide-react';
import { useStore } from '../store';
import { 
  format, addMonths, subMonths, startOfMonth, 
  endOfMonth, startOfWeek, endOfWeek, isSameMonth, 
  isSameDay, addDays, isToday, parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

const Calendar: React.FC = () => {
  const { services, clients, vehicles } = useStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getServicesForDate = (date: Date) => {
    return services.filter(service => {
      const serviceDate = parseISO(service.date);
      return isSameDay(serviceDate, date);
    });
  };

  const filteredServicesForSelectedDate = getServicesForDate(selectedDate).filter(service => {
    const client = clients.find(c => c.id === service.clientId);
    const vehicle = vehicles.find(v => v.id === service.vehicleId);
    const searchStr = `${client?.name} ${vehicle?.plate} ${service.description}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Finalizado': return 'bg-green-500 text-white';
      case 'Entregue': return 'bg-blue-500 text-white';
      case 'Em andamento': return 'bg-primary text-black';
      case 'Aprovado': return 'bg-primary/50 text-black';
      case 'Orçamento enviado': return 'bg-orange-500 text-white';
      case 'Aguardando avaliação': return 'bg-black text-primary border border-white/10';
      default: return 'bg-white/10 text-white';
    }
  };

  const renderHeader = () => {
    const dateFormat = "MMMM yyyy";

    return (
      <div className="flex items-center justify-between p-8 border-b border-white/5 bg-white/5 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 -rotate-3">
             <CalendarIcon size={32} className="text-black" />
          </div>
          <div>
            <h2 className="text-3xl font-black font-display uppercase tracking-widest italic text-white leading-none">
              {format(currentMonth, dateFormat, { locale: ptBR })}
            </h2>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-2">Agenda Global de Atendimentos</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={prevMonth} className="p-4 hover:bg-white/10 text-white/50 hover:text-white rounded-2xl transition-all border border-white/5">
            <ChevronLeft size={24} />
          </button>
          <button onClick={() => setCurrentMonth(new Date())} className="px-8 font-black text-[10px] uppercase tracking-widest bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all border border-white/5">
            HOJE
          </button>
          <button onClick={nextMonth} className="p-4 hover:bg-white/10 text-white/50 hover:text-white rounded-2xl transition-all border border-white/5">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const dateNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="py-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] text-center">
          {dateNames[i]}
        </div>
      );
    }

    return <div className="grid grid-cols-7 bg-white/5 border-b border-white/5">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        const dayServices = getServicesForDate(day);
        const hasServices = dayServices.length > 0;
        
        days.push(
          <div
            key={day.toString()}
            className={`relative h-24 md:h-32 border-r border-b border-white/5 flex flex-col items-center justify-center transition-all cursor-pointer group
              ${!isSameMonth(day, monthStart) ? "opacity-20 pointer-events-none" : ""}
              ${isSameDay(day, selectedDate) ? "bg-primary/10" : "hover:bg-white/[0.03]"}
            `}
            onClick={() => setSelectedDate(cloneDay)}
          >
            <span className={`text-sm font-black mb-2 italic
              ${isSameDay(day, selectedDate) ? "text-primary scale-125" : "text-white/40 group-hover:text-white"}
              ${isToday(day) ? "bg-primary text-black px-2 py-0.5 rounded-lg !text-black shadow-lg shadow-primary/20" : ""}
            `}>
              {formattedDate}
            </span>
            {hasServices && (
              <div className="flex flex-wrap justify-center gap-1 mt-1 px-1">
                {dayServices.slice(0, 3).map((s, idx) => (
                  <div key={idx} className={`w-1.5 h-1.5 rounded-full ${getStatusColor(s.status).split(' ')[0]}`} />
                ))}
                {dayServices.length > 3 && <div className="w-1 h-1 rounded-full bg-white/40" />}
              </div>
            )}
            {isSameDay(day, selectedDate) && (
              <motion.div layoutId="active-day" className="absolute inset-0 border-2 border-primary/30 pointer-events-none" />
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="bg-black/20">{rows}</div>;
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background">
      {/* Lateral Esquerda - Calendário */}
      <div className="flex-1 lg:max-w-4xl border-r border-white/5 flex flex-col">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </div>

      {/* Lateral Direita - Detalhes do Dia */}
      <div className="lg:w-[450px] lg:h-screen lg:sticky lg:top-0 overflow-y-auto bg-black/40 backdrop-blur-3xl p-8 md:p-12 border-l border-white/5">
        <header className="mb-12">
          <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">Atendimento para:</h3>
          <p className="text-4xl font-black font-display text-white uppercase italic tracking-tighter leading-tight drop-shadow-2xl">
            {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </header>

        <div className="mb-10 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Filtrar placa ou cliente do dia..."
            className="input-field pl-12 py-4 bg-white/5 border border-white/10 text-xs italic"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-6">
          {filteredServicesForSelectedDate.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
              <Clock className="mx-auto text-white/5 mb-6" size={64} />
              <p className="text-white/20 font-black uppercase tracking-[0.4em] text-[10px] px-8">Nenhum serviço agendado ou realizado nesta data.</p>
            </div>
          ) : (
            filteredServicesForSelectedDate.map(service => {
              const vehicle = vehicles.find(v => v.id === service.vehicleId);
              const client = clients.find(c => c.id === service.clientId);
              
              return (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={service.id} 
                  className="card group hover:scale-[1.02] transition-all bg-white/5 border-white/5 hover:border-primary/20"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <span className={`text-[9px] px-3 py-1 rounded-xl font-black uppercase tracking-widest italic shadow-lg ${getStatusColor(service.status)}`}>
                        {service.status}
                      </span>
                      <p className="font-black text-xl italic text-white tracking-tighter group-hover:text-primary transition-colors">R$ {service.totalValue.toFixed(2)}</p>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                       <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center border border-white/5 shadow-2xl group-hover:rotate-6 transition-transform">
                          <Wrench size={24} className="text-primary" />
                       </div>
                       <div>
                         <p className="text-lg font-black italic uppercase text-white leading-none mb-1 group-hover:translate-x-1 transition-transform">{vehicle?.plate || 'S/ PLACA'}</p>
                         <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">{client?.name || 'Venda Direta'}</p>
                       </div>
                    </div>

                    <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                       <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1 italic">Diagnóstico:</p>
                       <p className="text-[11px] font-medium text-white italic leading-relaxed line-clamp-2">{service.description || 'Sem detalhes técnicos registrados'}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        <div className="mt-12 pt-12 border-t border-white/5">
           <button className="w-full btn-primary py-5 flex items-center justify-center gap-4 group">
              <Plus size={24} className="group-hover:rotate-90 transition-transform" />
              <span className="text-sm">NOVO AGENDAMENTO</span>
           </button>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
