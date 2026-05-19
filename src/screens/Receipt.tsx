import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Printer, Share2, ArrowLeft, 
  MapPin, Phone, Mail, FileText, 
  CheckCircle2, DollarSign, Calendar, Clock, Car, User,
  MessageCircle, Smartphone
} from 'lucide-react';
import { useStore } from '../store';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'motion/react';

const Receipt: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { services, clients, vehicles } = useStore();
  
  const service = services.find(s => s.id === id);
  if (!service) return <div className="p-20 text-center text-white font-black uppercase">Ordem de Serviço não encontrada.</div>;

  const client = clients.find(c => c.id === service.clientId);
  const vehicle = vehicles.find(v => v.id === service.vehicleId);

  const handlePrint = () => {
    window.print();
  };

  const totals = service.items.reduce((acc, item) => {
    if (item.type === 'part') acc.parts += item.price * item.quantity;
    else acc.services += item.price * item.quantity;
    return acc;
  }, { parts: 0, services: 0 });

  return (
    <div className="min-h-screen bg-black/95 p-4 md:p-12">
      {/* Barra de Ações (Escondida na Impressão) */}
      <div className="max-w-4xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-white/50 hover:text-white transition-colors group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          <span className="font-black uppercase tracking-widest text-xs">Voltar para Oficina</span>
        </button>
        <div className="flex gap-3">
          <button onClick={handlePrint} className="btn-primary px-8 flex items-center gap-3">
            <Printer size={20} />
            <span className="text-xs">IMPRIMIR RECIBO</span>
          </button>
          <button className="btn-secondary px-8 flex items-center gap-3 bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500 hover:text-white">
            <MessageCircle size={20} />
            <span className="text-xs">ENVIAR WHATSAPP</span>
          </button>
        </div>
      </div>

      {/* Recibo Estruturado */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-[#0F0F0F] text-white shadow-[0_50px_100px_rgba(0,0,0,0.8)] rounded-[3rem] overflow-hidden border border-white/5 print:bg-white print:text-black print:shadow-none print:rounded-none print:border-none print:m-0"
      >
        {/* Topo - Identidade da Oficina */}
        <div className="p-12 md:p-16 bg-black text-white flex flex-col md:flex-row justify-between items-start gap-12 border-b-8 border-primary relative overflow-hidden print:p-8">
          <div className="absolute top-[-20%] right-[-10%] opacity-5 print:hidden">
             <Car size={300} strokeWidth={1} />
          </div>
          
          <div className="relative z-10">
            <h1 className="text-6xl font-display font-black tracking-tighter uppercase italic leading-none mb-4 print:text-5xl">Roda <span className="text-primary italic">App</span></h1>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 mb-12">Centro de Engenharia Automotiva</p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-white/60 text-xs font-bold">
                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 print:hidden">
                  <MapPin size={16} className="text-primary" />
                </div>
                Rua das Oficinas, 123 • Bairro Industrial
              </div>
              <div className="flex items-center gap-4 text-white/60 text-xs font-bold">
                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 print:hidden">
                  <Phone size={16} className="text-primary" />
                </div>
                (11) 98765-4321 • WhatsApp 24h
              </div>
              <div className="flex items-center gap-4 text-white/60 text-xs font-bold">
                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 print:hidden">
                  <Mail size={16} className="text-primary" />
                </div>
                contato@rodaapp.com • CNPJ: 12.345.678/0001-90
              </div>
            </div>
          </div>

          <div className="text-right flex flex-col items-end relative z-10">
             <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] text-right shadow-2xl backdrop-blur-xl print:bg-black/5 print:border-black/10 print:text-black">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-3">Protocolo de Operação</p>
                <p className="text-5xl font-black italic tracking-tighter text-white print:text-black"># {service.id.slice(0, 8).toUpperCase()}</p>
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-8 flex items-center gap-3 print:text-black/40">
                <Calendar size={14} className="text-primary" /> Transmitido em: {format(new Date(), "dd/MM/yyyy • HH:mm")}
             </p>
          </div>
        </div>

        {/* Dados do Cliente e Veículo */}
        <div className="p-12 md:p-16 grid grid-cols-1 md:grid-cols-2 gap-16 border-b border-white/5 bg-[#0A0A0A] print:bg-white print:border-black/10 print:p-8">
          <div className="space-y-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 flex items-center gap-4 border-b border-white/5 pb-4 print:text-black/40 print:border-black/10">
               <User size={16} className="text-primary" /> Proprietário Requisitante
            </h3>
            <div className="space-y-3">
              <p className="text-3xl font-black italic tracking-tight uppercase leading-none text-white print:text-black">{client?.name || 'Cliente Avulso'}</p>
              <div className="flex flex-col gap-2 text-xs font-bold text-white/40 pt-2 print:text-black/60">
                 <span className="flex items-center gap-2"><Smartphone size={12} className="text-primary" /> {client?.whatsapp || 'Não informado'}</span>
                 <span className="flex items-center gap-2"><MapPin size={12} className="text-primary" /> {client?.address || 'Endereço não cadastrado'}</span>
                 <span className="italic opacity-50">{client?.email || ''}</span>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 flex items-center gap-4 border-b border-white/5 pb-4 print:text-black/40 print:border-black/10">
               <Car size={16} className="text-primary" /> Identificação do Ativo
            </h3>
            <div className="space-y-5">
              <div className="flex items-center gap-8">
                 <div className="bg-black border border-white/10 text-primary px-6 py-3 rounded-2xl font-black text-3xl tracking-tighter italic shadow-2xl print:bg-black/5 print:text-black print:border-black/20">
                    {vehicle?.plate || 'S/ PLACA'}
                 </div>
                 <div className="text-sm">
                    <p className="font-black uppercase italic tracking-tight text-white print:text-black text-xl leading-none mb-1">{vehicle?.model || 'Desconhecido'}</p>
                    <p className="text-[10px] uppercase font-black text-white/20 tracking-[0.3em] print:text-black/40">{vehicle?.brand || 'Fabricante Desconhecido'} • {vehicle?.year || 'S/ ANO'}</p>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-5 bg-white/5 border border-white/5 rounded-[1.5rem] shadow-inner print:bg-white print:border-black/10">
                    <p className="text-[8px] font-black uppercase text-white/20 tracking-[0.3em] mb-2 print:text-black/30">HODÔMETRO ATUAL</p>
                    <p className="text-lg font-black italic leading-none text-white print:text-black">{service.kmAtService ? service.kmAtService.toLocaleString() : '---'} <span className="text-[10px] uppercase tracking-widest text-white/20 not-italic ml-1">km</span></p>
                 </div>
                 <div className="p-5 bg-white/5 border border-white/5 rounded-[1.5rem] shadow-inner print:bg-white print:border-black/10">
                    <p className="text-[8px] font-black uppercase text-white/20 tracking-[0.3em] mb-2 print:text-black/30">DATA ENTRADA</p>
                    <p className="text-lg font-black italic leading-none text-white print:text-black">{format(parseISO(service.date), 'dd/MM/yyyy')}</p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Descrição do Problema */}
        <div className="px-12 md:px-16 py-12 bg-[#0F0F0F] print:bg-white print:p-8">
           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 flex items-center gap-4 border-b border-white/5 pb-4 mb-8 print:text-black/40 print:border-black/10">
               <FileText size={16} className="text-primary" /> Diagnóstico Analítico & Ocorrências
            </h3>
            <p className="text-xl font-medium text-white/70 italic leading-relaxed bg-[#0A0A0A] p-10 rounded-[2.5rem] border border-white/5 shadow-inner print:bg-black/5 print:text-black print:border-black/5 print:p-6 print:text-sm">
               {service.description || 'Nenhum detalhe técnico redundante foi registrado no protocolo de entrada.'}
            </p>
        </div>

        {/* Tabela de Itens e Serviços */}
        <div className="p-12 md:p-16 print:p-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 print:border-black print:text-black/60">
                <th className="py-8 px-4">ESPECIFICAÇÃO DO COMPONENTE / SERVIÇO</th>
                <th className="py-8 px-4 text-center">TIPO</th>
                <th className="py-8 px-4 text-center">QTD</th>
                <th className="py-8 px-4 text-right">V. UNITÁRIO</th>
                <th className="py-8 px-4 text-right">SUBTOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 print:divide-black/10">
              {service.items.map((item, index) => (
                <tr key={index} className="group hover:bg-white/[0.02] transition-colors print:hover:bg-transparent">
                  <td className="py-10 px-4">
                    <div>
                      <p className="font-black uppercase italic tracking-tight mb-2 text-white print:text-black text-base">{item.name}</p>
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] print:text-black/40">Item Auditado e Autorizado</p>
                    </div>
                  </td>
                  <td className="py-8 px-4 text-center">
                    <span className={`text-[8px] px-3 py-1.5 rounded-lg font-black uppercase tracking-[0.2em] italic border ${item.type === 'part' ? 'bg-black text-primary border-primary/20' : 'bg-primary text-black border-primary/50'}`}>
                      {item.type === 'part' ? 'HARDWARE' : 'SERVICE'}
                    </span>
                  </td>
                  <td className="py-8 px-4 text-center font-black italic text-white print:text-black">{item.quantity}</td>
                  <td className="py-8 px-4 text-right font-bold text-white/60 print:text-black/60">R$ {item.price.toFixed(2)}</td>
                  <td className="py-8 px-4 text-right font-black italic text-white print:text-black">R$ {(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Resumo Financeiro */}
        <div className="p-12 md:p-16 bg-[#0A0A0A] flex flex-col md:flex-row justify-between items-end gap-16 border-t border-white/5 print:bg-white print:border-black/20 print:p-8">
            <div className="flex-1 space-y-10 group">
               <div className="p-10 bg-[#0F0F0F] border border-white/5 rounded-[3rem] shadow-inner print:bg-black/5 print:border-black/5 print:p-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6 border-b border-white/10 pb-3 print:text-black print:border-black/10">TERMOS DE GARANTIA & QUALIDADE</h4>
                  <p className="text-[10px] leading-relaxed text-white/30 text-justify font-medium print:text-black/60">
                    Garantia mandatória de 90 dias úteis para serviços e componentes instalados, em conformidade com o CDC. 
                    Excluem-se danos por operação indevida, sinistros ou intervenção externa não autorizada. 
                    Recomendamos retorno imediato para check-up em caso de anomalia residual no sistema reparado.
                  </p>
               </div>
               <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.5em] text-white/10 group-hover:text-primary transition-colors print:text-black/20">
                  <CheckCircle2 size={16} /> SISTEMA RODA APP • ENGENHARIA DE SOFTWARE AUTOMOTIVO
               </div>
            </div>

            <div className="w-full md:w-[450px] space-y-5 bg-white/5 p-10 rounded-[3rem] border border-white/10 shadow-2xl print:bg-transparent print:p-0 print:border-none print:shadow-none">
              <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.3em] text-white/30 print:text-black/50">
                <span>Total em Hardware:</span>
                <span className="italic text-white print:text-black">R$ {totals.parts.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.3em] text-white/30 print:text-black/50">
                <span>Total em Engenharia:</span>
                <span className="italic text-white print:text-black">R$ {totals.services.toFixed(2)}</span>
              </div>
              {service.discount > 0 && (
                <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.3em] text-primary">
                  <span>Ajuste / Desconto Especial:</span>
                  <span className="italic">- R$ {service.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-10 mt-6 border-t-2 border-white/10 flex justify-between items-center print:border-black print:pt-6">
                <span className="text-[12px] font-black uppercase tracking-[0.6em] text-white print:text-black">TOTAL LÍQUIDO:</span>
                <span className="text-6xl font-black italic tracking-tighter leading-none text-primary print:text-black">R$ {service.totalValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-8">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 print:text-black/40">POSIÇÃO FINANCEIRA:</span>
                <span className={`text-[9px] px-5 py-2.5 rounded-xl font-black uppercase tracking-[0.3em] italic border ${service.paymentStatus === 'pago' ? 'bg-green-500 text-black border-green-500 shadow-[0_10px_30px_rgba(34,197,94,0.3)]' : 'bg-orange-500 text-black border-orange-500 shadow-[0_10px_30px_rgba(249,115,22,0.3)]'}`}>
                   {service.paymentStatus.toUpperCase()}
                </span>
              </div>
            </div>
        </div>

        {/* Rodapé - Assinaturas */}
        <div className="p-16 pt-0 bg-[#0A0A0A] grid grid-cols-1 md:grid-cols-2 gap-24 print:bg-white print:p-8 print:pt-0">
           <div className="flex flex-col items-center">
              <div className="w-full border-b border-white/20 mb-6 print:border-black"></div>
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 print:text-black/60">Responsável por Engenharia Automotiva</p>
           </div>
           <div className="flex flex-col items-center">
              <div className="w-full border-b border-white/20 mb-6 print:border-black"></div>
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 print:text-black/60">Proprietário / Requisitante Autorizado</p>
           </div>
        </div>
      </motion.div>
      
      <div className="max-w-4xl mx-auto mt-12 pb-20 text-center text-white/20 text-[10px] font-black uppercase tracking-[0.5em] print:hidden">
         DOCUMENTO GERADO VIA RODA APP • GESTÃO PROFISSIONAL
      </div>
    </div>
  );
};

export default Receipt;
