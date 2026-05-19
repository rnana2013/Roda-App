import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Edit2, Trash2,
  X, Save, CheckCircle2, Package,
  DollarSign, ShoppingCart, 
  Trash, MessageCircle, FileText, Car, FileSpreadsheet, Clock
} from 'lucide-react';
import { useStore } from '../store';
import { ServiceRecord, ServiceItem, ServiceStatus, PaymentStatus, CatalogItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

const Budgets: React.FC = () => {
  const navigate = useNavigate();
  const { services, vehicles, clients, catalog, addService, updateService, deleteService } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceRecord | null>(null);
  
  // Form State
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [showCatalogResults, setShowCatalogResults] = useState(false);

  // Filter ONLY budgets or awaiting assessment
  const filteredBudgets = services.filter(s => {
    const isBudgetStatus = ['Aguardando avaliação', 'Orçamento enviado'].includes(s.status);
    if (!isBudgetStatus) return false;

    const vehicle = vehicles.find(v => v.id === s.vehicleId);
    const client = clients.find(c => c.id === s.clientId);
    return (
      vehicle?.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getVehicleInfo = (id: string) => vehicles.find(v => v.id === id);
  const getClientInfo = (id?: string) => id ? clients.find(c => c.id === id) : undefined;

  const sendWhatsApp = (service: ServiceRecord) => {
    const client = getClientInfo(service.clientId);
    const vehicle = getVehicleInfo(service.vehicleId);
    if (!vehicle) return;

    const clientName = client?.name || 'Cliente';
    const message = `Olá, ${clientName}. Aqui é da Oficina Roda App. O orçamento do seu veículo ${vehicle.model} placa ${vehicle.plate} ficou no valor de R$ ${service.totalValue.toFixed(2)}. Podemos seguir com o serviço?`;

    const phone = client ? (client.whatsapp || client.phone || '').replace(/\D/g, '') : '';
    if (phone) {
        window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
        alert('Este cliente não possui WhatsApp cadastrado.');
    }
  };

  const calculateTotals = (currentItems: ServiceItem[], currentDiscount: number) => {
    const partsValue = currentItems.filter(i => i.type === 'part').reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const laborValue = currentItems.filter(i => i.type === 'service').reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const total = (partsValue + laborValue) - currentDiscount;
    return { partsValue, laborValue, total };
  };

  const addItemFromCatalog = (catalogItem: CatalogItem) => {
    const newItem: ServiceItem = {
      id: crypto.randomUUID(),
      name: catalogItem.name,
      price: catalogItem.suggestedPrice,
      quantity: 1,
      type: catalogItem.type as any
    };

    setItems([...items, newItem]);
    setCatalogSearch('');
    setShowCatalogResults(false);
  };

  const addLooseItem = (type: 'part' | 'service') => {
    const name = prompt(`Nome da ${type === 'part' ? 'Peça' : 'Mão de Obra'} avulsa:`);
    if (!name) return;
    
    const priceStr = prompt(`Valor unitário da(o) ${name}:`, '0.00');
    if (priceStr === null) return;
    const price = parseFloat(priceStr.replace(',', '.')) || 0;

    const newItem: ServiceItem = {
      id: crypto.randomUUID(),
      name,
      price,
      quantity: 1,
      type
    };

    setItems([...items, newItem]);
  };

  const handleFinalize = (e: React.FormEvent, shouldPrint: boolean) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const vehicleId = formData.get('vehicleId') as string;
    const vehicle = vehicles.find(v => v.id === vehicleId);

    if (!vehicle) {
        alert('Selecione um veículo válido.');
        return;
    }

    const { partsValue, laborValue, total } = calculateTotals(items, discount);

    const serviceId = editingService?.id || crypto.randomUUID();
    const serviceData: ServiceRecord = {
      id: serviceId,
      vehicleId,
      clientId: vehicle.clientId,
      date: formData.get('date') as string,
      status: formData.get('status') as ServiceStatus,
      items,
      laborValue,
      partsValue,
      discount,
      totalValue: total,
      paymentStatus: formData.get('paymentStatus') as PaymentStatus,
      paymentMethod: formData.get('paymentMethod') as string,
      kmAtService: formData.get('kmAtService') ? Number(formData.get('kmAtService')) : undefined,
      description: formData.get('description') as string,
      observations: formData.get('observations') as string,
      createdAt: editingService?.createdAt || new Date().toISOString(),
    };

    if (editingService) {
      updateService(serviceData);
    } else {
      addService(serviceData);
    }

    setIsModalOpen(false);
    setItems([]);
    setEditingService(null);

    if (shouldPrint) {
      navigate(`/recibo/${serviceId}`);
    } else {
      alert('Orçamento salvo com sucesso!');
    }
  };

  const catalogResults = catalog.filter(cat => 
    cat.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    (cat.category && cat.category.toLowerCase().includes(catalogSearch.toLowerCase()))
  ).slice(0, 5);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pt-4">
        <div>
          <h1 className="text-4xl font-display font-black tracking-tighter uppercase italic text-white leading-none tracking-tight">Meus <span className="text-primary italic">Orçamentos</span></h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-2">Gestão de propostas e aprovações pendentes</p>
        </div>
        <button 
          onClick={() => {
            setEditingService(null);
            setItems([]);
            setDiscount(0);
            setIsModalOpen(true);
          }}
          className="btn-primary"
        >
          <Plus size={20} /> Novo Orçamento
        </button>
      </header>

      <div className="mb-10 relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Pesquisar por placa, cliente ou serviço..."
          className="input-field pl-14 py-5"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-6">
        {filteredBudgets.map((service) => {
          const vehicle = getVehicleInfo(service.vehicleId);
          const client = getClientInfo(service.clientId);
          
          return (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={service.id} 
              className="card-dark group hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer overflow-hidden border-white/5"
            >
              <div className="p-6 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                <div className="flex gap-8 items-start flex-1 min-w-0">
                  <div className="w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 shadow-2xl rotate-3 group-hover:rotate-6 transition-transform bg-black text-primary border border-white/10 shadow-black">
                    <FileSpreadsheet size={36} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-4 mb-3 flex-wrap">
                      <span className="font-black text-3xl tracking-tighter uppercase italic text-white leading-none group-hover:text-primary transition-colors">{vehicle?.plate || 'S/ PLACA'}</span>
                      <span className="text-white/10 text-xs font-black">•</span>
                      <span className="text-[10px] font-black bg-white/5 border border-white/10 text-white/40 px-3 py-1.5 rounded-full uppercase tracking-widest">{vehicle?.model || 'DESCONHECIDO'}</span>
                    </div>
                    <p className="text-base font-black italic text-white/40 group-hover:text-white transition-colors uppercase tracking-tight">{client?.name || 'Cliente em Prospecção'}</p>
                    <div className="flex items-center gap-2 mt-4">
                       <Clock size={12} className="text-white/20" />
                       <p className="text-[10px] font-black uppercase text-white/20 tracking-widest truncate max-w-md">{service.description || 'Pequena intervenção técnica'}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:flex items-center gap-12 lg:gap-20 shrink-0 border-t md:border-t-0 border-white/5 pt-8 md:pt-0">
                  <div className="flex flex-col md:items-end">
                    <p className="text-[9px] text-white/20 uppercase font-black tracking-[0.3em] mb-3 text-right">Status Proposta</p>
                    <span className="text-[9px] px-4 py-2 rounded-2xl font-black uppercase tracking-widest italic shadow-lg bg-black text-primary border border-primary/20 transition-all">
                      {service.status}
                    </span>
                  </div>
                  <div className="flex flex-col md:items-end">
                    <p className="text-[9px] text-white/20 uppercase font-black tracking-[0.3em] mb-3 text-right">Total Estimado</p>
                    <p className="font-black text-4xl tracking-tighter italic leading-none text-white group-hover:text-primary transition-colors">R$ {service.totalValue.toFixed(2)}</p>
                  </div>
                  
                  <div className="flex gap-2 justify-end col-span-2 md:col-span-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/recibo/${service.id}`); }}
                      className="p-5 bg-white/5 hover:bg-white text-white/20 hover:text-black rounded-2xl transition-all shadow-sm border border-white/5"
                      title="Visualizar Orçamento"
                    >
                      <FileText size={22} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); sendWhatsApp(service); }}
                      className="p-5 bg-green-500/5 hover:bg-green-500 text-green-500 hover:text-black rounded-2xl transition-all shadow-sm border border-green-500/20"
                      title="Enviar WhatsApp"
                    >
                      <MessageCircle size={22} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingService(service);
                        setItems(service.items);
                        setDiscount(service.discount);
                        setIsModalOpen(true);
                      }}
                      className="p-5 bg-white/5 hover:bg-primary text-white/20 hover:text-black rounded-2xl transition-all shadow-sm border border-white/5"
                    >
                      <Edit2 size={22} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); if (confirm('Excluir proposta permanentemente?')) deleteService(service.id); }}
                      className="p-5 bg-red-500/5 hover:bg-red-500 text-red-500/40 hover:text-white rounded-2xl transition-all shadow-sm border border-red-500/20"
                    >
                      <Trash2 size={22} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {filteredBudgets.length === 0 && (
           <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
              <FileSpreadsheet className="mx-auto text-white/5 mb-6" size={80} />
              <p className="text-white/20 font-black uppercase tracking-[0.4em] text-xs">Pátio limpo. Nenhum orçamento pendente.</p>
           </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 bg-black/95 backdrop-blur-md overflow-hidden">
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="card-dark border border-white/10 w-full h-full md:h-auto md:max-h-[95vh] md:max-w-6xl flex flex-col md:rounded-[3rem] shadow-2xl relative overflow-hidden"
            >
              <div className="p-8 md:p-10 border-b border-white/5 flex justify-between items-center bg-white/5">
                <div>
                  <h2 className="text-3xl font-black font-display uppercase tracking-tight italic text-white leading-none">
                    {editingService ? 'Ajustar' : 'Novo'} <span className="text-primary italic">Orçamento</span>
                  </h2>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-2">Protocolo de Cotação Técnica</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-4 hover:bg-white/10 rounded-2xl transition-colors text-white/50">
                  <X size={28} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
                <form id="budget-form" className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                  <div className="lg:col-span-2 space-y-10">
                    <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 space-y-8">
                      <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] border-b border-white/10 pb-4 flex items-center gap-3">
                        <Car size={16} className="text-primary" /> Identificação da Frota
                      </h3>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Veículo sob Avaliação *</label>
                          <select required name="vehicleId" defaultValue={editingService?.vehicleId} className="input-field appearance-none bg-black/50 pr-12 cursor-pointer">
                            <option value="" disabled className="bg-black text-white">Selecione uma placa...</option>
                            {vehicles.map(v => (
                              <option key={v.id} value={v.id} className="bg-black text-white">
                                {v.plate} — {v.model} ({clients.find(c => c.id === v.clientId)?.name || 'S/ DONO'})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Data Cotação *</label>
                            <input required type="date" name="date" defaultValue={editingService?.date || new Date().toISOString().split('T')[0]} className="input-field text-center font-black italic uppercase" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Status Proposta</label>
                            <select name="status" defaultValue={editingService?.status || 'Aguardando avaliação'} className="input-field font-black uppercase italic cursor-pointer">
                              <option value="Aguardando avaliação" className="bg-black">AVALIAÇÃO</option>
                              <option value="Orçamento enviado" className="bg-black">ENVIADO</option>
                              <option value="Aprovado" className="bg-black">APROVADO</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Diagnóstico / Solicitação *</label>
                          <textarea required name="description" defaultValue={editingService?.description} className="input-field min-h-[120px] resize-none" placeholder="Qual o problema ou revisão solicitada?" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-3 space-y-10">
                    <div className="space-y-6">
                       <div className="flex items-center justify-between">
                         <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Planilha de <span className="text-primary italic">Custos e Peças</span></h3>
                         <div className="flex gap-3">
                            <button type="button" onClick={() => addLooseItem('part')} className="text-[9px] font-black bg-white/5 text-white/60 px-4 py-2 rounded-xl uppercase tracking-widest border border-white/5 hover:bg-white/10 transition-colors">+ Peça Avulsa</button>
                            <button type="button" onClick={() => addLooseItem('service')} className="text-[9px] font-black bg-white/5 text-white/60 px-4 py-2 rounded-xl uppercase tracking-widest border border-white/5 hover:bg-white/10 transition-colors">+ Mão de Obra</button>
                         </div>
                       </div>

                       <div className="relative group">
                          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={20} />
                          <input 
                            type="text" 
                            value={catalogSearch}
                            onChange={(e) => { setCatalogSearch(e.target.value); setShowCatalogResults(true); }}
                            onFocus={() => setShowCatalogResults(true)}
                            className="input-field pl-14 py-5 bg-white/5 border border-white/10 text-sm italic focus:bg-white/10"
                            placeholder="Consultar tabelas de preços no Catálogo..."
                          />
                          <AnimatePresence>
                            {showCatalogResults && catalogSearch && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full left-0 right-0 mt-3 bg-black/95 border border-white/10 rounded-[2rem] shadow-2xl z-[110] overflow-hidden divide-y divide-white/5 backdrop-blur-2xl"
                              >
                                {catalogResults.length > 0 ? (
                                  catalogResults.map(item => (
                                    <button key={item.id} type="button" onClick={() => addItemFromCatalog(item)} className="w-full p-6 text-left hover:bg-white/10 flex justify-between items-center group/item transition-colors">
                                      <div>
                                        <p className="text-xs font-black uppercase tracking-tight text-white">{item.name}</p>
                                        <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1">{item.category}</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-lg font-black text-primary italic leading-none">R$ {item.suggestedPrice.toFixed(2)}</p>
                                        <p className="text-[8px] text-white bg-primary/20 px-2 py-1 rounded-lg uppercase tracking-widest mt-2 font-black italic opacity-0 group-hover/item:opacity-100 transition-opacity">Add ao Orçamento</p>
                                      </div>
                                    </button>
                                  ))
                                ) : (
                                  <div className="p-10 text-center text-[10px] font-black uppercase tracking-widest text-white/20 italic">Item inacessível no radar.</div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                       </div>

                       <div className="space-y-4 min-h-[300px] max-h-[450px] overflow-y-auto pr-3 custom-scrollbar">
                         {items.length === 0 ? (
                           <div className="flex flex-col items-center justify-center p-20 bg-white/[0.02] rounded-[3rem] border-2 border-dashed border-white/5 text-white/10">
                             <ShoppingCart size={64} className="mb-6 opacity-30" />
                             <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">Orçamento vazio. Inicie a cotação.</p>
                           </div>
                         ) : (
                           items.map(item => (
                             <motion.div 
                               initial={{ opacity: 0, x: 20 }}
                               animate={{ opacity: 1, x: 0 }}
                               key={item.id} 
                               className="p-6 rounded-[2rem] border border-white/5 flex items-center justify-between gap-6 group bg-white/5 hover:bg-white/10 transition-all shadow-inner"
                             >
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-black uppercase truncate leading-tight text-white mb-1 group-hover:text-primary transition-colors">{item.name}</p>
                                  <p className="text-[9px] font-black tracking-widest text-white/20 uppercase">{item.type === 'part' ? 'Hardware / Reposição' : 'Engenharia / Reparo'}</p>
                                </div>
                                <div className="flex items-center gap-8">
                                  <div className="flex items-center bg-black/40 rounded-2xl p-1 border border-white/5">
                                    <button type="button" onClick={() => setItems(items.map(i => i.id === item.id ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i))} className="w-10 h-10 flex items-center justify-center font-black text-white/20 hover:text-primary transition-colors text-xl">-</button>
                                    <span className="w-10 text-center text-sm font-black text-white italic">{item.quantity}</span>
                                    <button type="button" onClick={() => setItems(items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))} className="w-10 h-10 flex items-center justify-center font-black text-white/20 hover:text-primary transition-colors text-xl">+</button>
                                  </div>
                                  <div className="text-right min-w-[120px]">
                                    <p className="text-xl font-black text-white italic leading-none">R$ {(item.price * item.quantity).toFixed(2)}</p>
                                    <p className="text-[9px] text-white/20 font-black uppercase mt-1 tracking-widest italic">Unit: R$ {item.price.toFixed(2)}</p>
                                  </div>
                                  <button type="button" onClick={() => setItems(items.filter(i => i.id !== item.id))} className="p-3 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash size={18} /></button>
                                </div>
                             </motion.div>
                           ))
                         )}
                       </div>

                       <div className="bg-primary text-black p-10 rounded-[3rem] shadow-[0_20px_60px_rgba(255,214,0,0.2)] overflow-hidden relative">
                         <div className="grid grid-cols-2 gap-y-4">
                           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/50">Cotação Inicial Estimada:</span>
                           <span className="text-right font-black italic text-lg leading-none">R$ {calculateTotals(items, 0).total.toFixed(2)}</span>
                           
                           <div className="col-span-2 pt-6 mt-4 border-t border-black/10 flex items-center justify-between">
                             <div className="flex items-center gap-4">
                               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black">Ajuste de Negócio:</label>
                               <div className="relative">
                                 <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-xs text-black/40">R$</span>
                                 <input 
                                   type="number" 
                                   value={discount} 
                                   onChange={(e) => setDiscount(Number(e.target.value))} 
                                   className="bg-black/5 border-none rounded-xl px-9 py-2.5 focus:ring-2 focus:ring-black/20 w-32 text-sm font-black text-black transition-all text-center italic"
                                  />
                               </div>
                             </div>
                             <div className="text-right">
                               <p className="text-[9px] font-black uppercase tracking-[0.4em] text-black/40 mb-2 text-right">Proposta Final Consolidada</p>
                               <p className="text-5xl font-black italic tracking-tighter leading-none">R$ {calculateTotals(items, discount).total.toFixed(2)}</p>
                             </div>
                           </div>
                         </div>
                       </div>
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-8 md:p-12 border-t border-white/10 flex flex-col md:flex-row gap-6 bg-white/5">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 btn-secondary py-5 text-sm">CANCELAR</button>
                <div className="flex-[2] flex gap-4">
                   <button onClick={(e) => handleFinalize(e as any, false)} className="flex-1 bg-white/10 border border-white/10 text-white font-black uppercase tracking-[0.2em] italic py-5 rounded-3xl hover:bg-white/20 transition-all flex items-center justify-center gap-3 active:scale-95"><Save size={24} className="text-primary" /> SALVAR PROPOSTA</button>
                   <button onClick={(e) => handleFinalize(e as any, true)} className="flex-1 btn-primary py-5 text-sm"><FileText size={24} /> FINALIZAR & IMPRIMIR</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Budgets;
