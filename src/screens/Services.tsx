/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wrench, Plus, Search, Edit2, Trash2,
  X, Save, CheckCircle2, Clock, Package,
  DollarSign, MoreHorizontal, ShoppingCart, 
  Trash, MessageCircle, FileText, Car
} from 'lucide-react';
import { useStore } from '../store';
import { ServiceRecord, ServiceItem, ServiceStatus, PaymentStatus, CatalogItem } from '../types';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

const Services: React.FC = () => {
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

  // States for select-and-configure modal flow (Requirements 8 & 9)
  const [catalogModalOpen, setCatalogModalOpen] = useState(false);
  const [catalogModType, setCatalogModType] = useState<'service' | 'part' | null>(null);
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<CatalogItem | null>(null);
  const [preAddPrice, setPreAddPrice] = useState(0);
  const [preAddQty, setPreAddQty] = useState(1);
  const [preAddDiscount, setPreAddDiscount] = useState(0);
  const [preAddSearch, setPreAddSearch] = useState('');

  const filteredServices = services.filter(s => {
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

  const sendWhatsApp = (service: ServiceRecord, type: 'budget' | 'ready') => {
    const client = getClientInfo(service.clientId);
    const vehicle = getVehicleInfo(service.vehicleId);
    if (!vehicle) return;

    let message = '';
    const clientName = client?.name || 'Cliente';
    if (type === 'budget') {
      message = `Olá, ${clientName}. Aqui é da Oficina Pit Stop App. O orçamento do seu veículo ${vehicle.model} placa ${vehicle.plate} ficou no valor de R$ ${service.totalValue.toFixed(2)}. Podemos seguir com o serviço?`;
    } else {
      message = `Olá, ${clientName}. Seu veículo ${vehicle.model} placa ${vehicle.plate} já está pronto para retirada. Valor total: R$ ${service.totalValue.toFixed(2)}.`;
    }

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

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const updateItemQuantity = (id: string, qty: number) => {
    setItems(items.map(i => i.id === id ? { ...i, quantity: Math.max(1, qty) } : i));
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
      alert('Serviço salvo com sucesso!');
    }
  };

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case 'Aguardando avaliação': return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
      case 'Orçamento enviado': return 'bg-blue-500/10 text-blue-400 border border-blue-400/20';
      case 'Aprovado': return 'bg-purple-500/10 text-purple-400 border border-purple-400/20';
      case 'Em andamento': return 'bg-orange-500/10 text-orange-400 border border-orange-400/20';
      case 'Aguardando peça': return 'bg-red-500/10 text-red-400 border border-red-400/20';
      case 'Finalizado': return 'bg-green-500/10 text-green-400 border border-green-400/20';
      case 'Entregue': return 'bg-green-500 text-black font-bold';
      default: return 'bg-white/5 text-white/40 border border-white/5';
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
          <h1 className="text-4xl font-display font-black tracking-tighter uppercase italic text-white leading-none">Minha <span className="text-primary italic">Oficina</span></h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-2">Gestão total de ordens de serviço e orçamentos</p>
        </div>
        <button 
          onClick={() => {
            setEditingService(null);
            setItems([]);
            setDiscount(0);
            setIsModalOpen(true);
          }}
          className="btn-primary px-8"
        >
          <Plus size={20} /> Nova Ordem de Serviço
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
        {filteredServices.map((service) => {
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
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 shadow-2xl rotate-3 group-hover:rotate-6 transition-transform ${service.status === 'Entregue' ? 'bg-green-500 text-black shadow-green-500/20' : 'bg-black text-primary border border-white/10 shadow-black'}`}>
                    <Wrench size={36} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-4 mb-3 flex-wrap">
                      <span className="font-black text-3xl tracking-tighter uppercase italic text-white leading-none group-hover:text-primary transition-colors">{vehicle?.plate || 'S/ PLACA'}</span>
                      <span className="text-white/10 text-xs font-black">•</span>
                      <span className="text-[10px] font-black bg-white/5 border border-white/10 text-white/40 px-3 py-1.5 rounded-full uppercase tracking-widest">{vehicle?.model || 'DESCONHECIDO'}</span>
                    </div>
                    <p className="text-base font-black italic text-white/40 group-hover:text-white transition-colors uppercase tracking-tight">{client?.name || 'Operação Manual'}</p>
                    <div className="flex items-center gap-2 mt-4">
                       <Clock size={12} className="text-white/20" />
                       <p className="text-[10px] font-black uppercase text-white/20 tracking-widest truncate max-w-md">{service.description || 'Pequena intervenção técnica'}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:flex items-center gap-12 lg:gap-20 shrink-0 border-t md:border-t-0 border-white/5 pt-8 md:pt-0">
                  <div className="flex flex-col md:items-end">
                    <p className="text-[9px] text-white/20 uppercase font-black tracking-[0.3em] mb-3">Status Operacional</p>
                    <span className={`text-[9px] px-4 py-2 rounded-2xl font-black uppercase tracking-widest transition-all ${getStatusColor(service.status)}`}>
                      {service.status}
                    </span>
                  </div>
                  <div className="flex flex-col md:items-end">
                    <p className="text-[9px] text-white/20 uppercase font-black tracking-[0.3em] mb-3">Fluxo Financeiro</p>
                    <p className="font-black text-4xl tracking-tighter italic leading-none text-white group-hover:text-primary transition-colors">R$ {service.totalValue.toFixed(2)}</p>
                  </div>
                  
                  <div className="flex gap-2 justify-end col-span-2 md:col-span-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/recibo/${service.id}`); }}
                      className="p-5 bg-white/5 hover:bg-white text-white/20 hover:text-black rounded-2xl transition-all shadow-sm border border-white/5"
                      title="Imprimir Protocolo"
                    >
                      <FileText size={22} />
                    </button>
                    <div className="relative group/wa">
                      <button className="p-5 bg-green-500/5 hover:bg-green-500 text-green-500 hover:text-black rounded-2xl transition-all shadow-sm border border-green-500/20">
                        <MessageCircle size={22} />
                      </button>
                      <div className="absolute right-0 bottom-full mb-4 w-64 bg-black border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.8)] opacity-0 invisible group-hover/wa:opacity-100 group-hover/wa:visible transition-all z-30 overflow-hidden divide-y divide-white/10 backdrop-blur-3xl">
                        <button onClick={(e) => { e.stopPropagation(); sendWhatsApp(service, 'budget'); }} className="w-full text-left px-8 py-6 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest flex items-center justify-between text-white group/item">
                           <span className="flex items-center gap-3"><DollarSign size={18} className="text-primary" /> Transmitir Orçamento</span>
                           <Plus size={16} className="opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); sendWhatsApp(service, 'ready'); }} className="w-full text-left px-8 py-6 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest flex items-center justify-between text-white group/item">
                           <span className="flex items-center gap-3"><CheckCircle2 size={18} className="text-green-500" /> Veículo Líquido</span>
                           <Plus size={16} className="opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        </button>
                      </div>
                    </div>
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
                      onClick={(e) => { e.stopPropagation(); if (confirm('Excluir OS definitivamente?')) deleteService(service.id); }}
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

        {filteredServices.length === 0 && (
          <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
            <Wrench className="mx-auto text-white/5 mb-6" size={80} />
            <p className="text-white/20 font-black uppercase tracking-[0.4em] text-xs">Pátio limpo. Sem serviços pendentes.</p>
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
              className="card-dark w-full h-full md:h-auto md:max-h-[95vh] md:max-w-6xl flex flex-col md:rounded-[3rem] shadow-2xl relative overflow-hidden border border-white/10"
            >
              <div className="p-8 md:p-10 border-b border-white/5 flex justify-between items-center bg-white/5">
                <div>
                  <h2 className="text-3xl font-black font-display uppercase tracking-tight italic text-white">
                    {editingService ? 'Ajustar' : 'Nova'} <span className="text-primary italic">Ordem de Serviço</span>
                  </h2>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                    <Clock size={12} className="text-primary" /> {editingService?.status || 'Protocolo Inicial de Entrada'}
                  </p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-4 hover:bg-white/10 rounded-2xl transition-colors text-white/50">
                  <X size={28} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
                <form key={editingService?.id || 'new'} id="service-form" className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                  <div className="lg:col-span-2 space-y-10">
                    <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 space-y-8">
                      <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] border-b border-white/10 pb-4 flex items-center gap-3">
                        <Car size={16} className="text-primary" /> Check-in do Veículo
                      </h3>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Veículo sob Cuidados *</label>
                          <div className="relative">
                            <select 
                              required 
                              name="vehicleId" 
                              defaultValue={editingService?.vehicleId} 
                              className="input-field appearance-none bg-black/50 pr-12 cursor-pointer"
                            >
                              <option value="" disabled className="bg-black text-white">Selecione na frota...</option>
                              {vehicles.map(v => (
                                <option key={v.id} value={v.id} className="bg-black text-white">
                                  {v.plate} — {v.model} ({clients.find(c => c.id === v.clientId)?.name || 'Sem Dono'})
                                </option>
                              ))}
                            </select>
                            <Car className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={20} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Entrada</label>
                            <input required type="date" name="date" defaultValue={editingService?.date || new Date().toISOString().split('T')[0]} className="input-field text-center font-black italic uppercase" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Hodômetro KM</label>
                            <input type="number" name="kmAtService" defaultValue={editingService?.kmAtService} className="input-field text-center font-black italic" placeholder="000.000" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Diagnóstico / Ocorrência *</label>
                          <textarea required name="description" defaultValue={editingService?.description} className="input-field min-h-[100px] resize-none" placeholder="Qual o sintoma ou solicitação do cliente?" />
                        </div>
                      </div>
                    </div>

                    <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 space-y-8">
                      <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] border-b border-white/10 pb-4 flex items-center gap-3">
                        <DollarSign size={16} className="text-primary" /> Logística de Pagamento
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Workflow OS</label>
                          <select name="status" defaultValue={editingService?.status || 'Aguardando avaliação'} className="input-field font-black uppercase italic cursor-pointer">
                            <option value="Aguardando avaliação" className="bg-black">AVALIAÇÃO</option>
                            <option value="Orçamento enviado" className="bg-black">ORÇAMENTO</option>
                            <option value="Aprovado" className="bg-black">APROVADO</option>
                            <option value="Em andamento" className="bg-black">EM CURSO</option>
                            <option value="Aguardando peça" className="bg-black">AG. PEÇA</option>
                            <option value="Finalizado" className="bg-black">FINALIZADO</option>
                            <option value="Entregue" className="bg-black">ENTREGUE</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Financeiro</label>
                          <select name="paymentStatus" defaultValue={editingService?.paymentStatus || 'pendente'} className="input-field font-black uppercase italic cursor-pointer">
                            <option value="pendente" className="bg-black">PENDENTE</option>
                            <option value="parcial" className="bg-black">PARCIAL</option>
                            <option value="pago" className="bg-black">PAGO</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-3 space-y-10">
                    <div className="space-y-6">
                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                         <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Itens Técnicos <span className="text-primary italic">& Mão de Obra</span></h3>
                         <div className="flex flex-wrap gap-2">
                            <button 
                              type="button" 
                              onClick={() => {
                                setCatalogModType('part');
                                setSelectedCatalogItem(null);
                                setPreAddSearch('');
                                setCatalogModalOpen(true);
                              }}
                              className="text-[9px] font-black bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 px-4 py-2 rounded-xl uppercase tracking-widest transition-all"
                            >
                              [ Adicionar Peça ]
                            </button>
                            <button 
                              type="button" 
                              onClick={() => {
                                setCatalogModType('service');
                                setSelectedCatalogItem(null);
                                setPreAddSearch('');
                                setCatalogModalOpen(true);
                              }}
                              className="text-[9px] font-black bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 px-4 py-2 rounded-xl uppercase tracking-widest transition-all"
                            >
                              [ Adicionar Serviço ]
                            </button>
                            <button 
                              type="button" 
                              onClick={() => addLooseItem('part')}
                              className="text-[9px] font-black bg-white/5 text-white/50 px-4 py-2 rounded-xl uppercase tracking-widest border border-white/5 hover:bg-white/10 transition-colors"
                            >
                              + Avulsa
                            </button>
                            <button 
                              type="button" 
                              onClick={() => addLooseItem('service')}
                              className="text-[9px] font-black bg-white/5 text-white/50 px-4 py-2 rounded-xl uppercase tracking-widest border border-white/5 hover:bg-white/10 transition-colors"
                            >
                              + Avulso
                            </button>
                         </div>
                       </div>

                       <div className="relative group">
                          <div className="relative">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={20} />
                            <input 
                              type="text" 
                              value={catalogSearch}
                              onChange={(e) => {
                                setCatalogSearch(e.target.value);
                                setShowCatalogResults(true);
                              }}
                              onFocus={() => setShowCatalogResults(true)}
                              className="input-field pl-14 py-5 bg-white/5 border border-white/10 text-sm italic focus:bg-white/10"
                              placeholder="Pesquisar no Catálogo Inteligente de Peças..."
                            />
                            {catalogSearch && (
                              <button onClick={() => { setCatalogSearch(''); setShowCatalogResults(false); }} className="absolute right-5 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={18} className="text-white/30" />
                              </button>
                            )}
                          </div>

                          <AnimatePresence>
                            {showCatalogResults && catalogSearch && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full left-0 right-0 mt-3 bg-black/90 border border-white/10 rounded-[2rem] shadow-2xl z-[110] overflow-hidden divide-y divide-white/5 backdrop-blur-2xl"
                              >
                                {catalogResults.length > 0 ? (
                                  catalogResults.map(item => (
                                    <button 
                                      key={item.id} 
                                      type="button"
                                      onClick={() => addItemFromCatalog(item)}
                                      className="w-full p-6 text-left hover:bg-white/10 flex justify-between items-center group/item transition-colors"
                                    >
                                      <div>
                                        <p className="text-xs font-black uppercase tracking-tight text-white">{item.name}</p>
                                        <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1">{item.category}</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-lg font-black text-primary italic leading-none">R$ {item.suggestedPrice.toFixed(2)}</p>
                                        <p className="text-[8px] text-white bg-primary/20 px-2 py-1 rounded-lg uppercase tracking-widest mt-2 font-black italic opacity-0 group-hover/item:opacity-100 transition-opacity">Adicionar à Lista</p>
                                      </div>
                                    </button>
                                  ))
                                ) : (
                                  <div className="p-10 text-center text-[10px] font-black uppercase tracking-widest text-white/20 italic">Radar limpo. Cadastre no catálogo.</div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                       </div>

                       <div className="space-y-4 min-h-[300px] max-h-[450px] overflow-y-auto pr-3 custom-scrollbar">
                         {items.length === 0 ? (
                           <div className="flex flex-col items-center justify-center p-20 bg-white/[0.02] rounded-[3rem] border-2 border-dashed border-white/5 text-white/10">
                             <ShoppingCart size={64} className="mb-6 opacity-30" />
                             <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">O Carrinho da OS está vazio.</p>
                           </div>
                         ) : (
                           items.map(item => (
                             <motion.div 
                               initial={{ opacity: 0, x: 20 }}
                               animate={{ opacity: 1, x: 0 }}
                               key={item.id} 
                               className="p-6 rounded-[2rem] border border-white/5 flex items-center justify-between gap-6 group bg-white/5 hover:bg-white/10 transition-all shadow-inner"
                             >
                                <div className="flex items-center gap-6 flex-1 min-w-0">
                                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${item.type === 'part' ? 'bg-primary/10 text-primary' : 'bg-green-500/10 text-green-500'}`}>
                                      {item.type === 'part' ? <Package size={24} /> : <Wrench size={24} />}
                                   </div>
                                   <div className="flex-1 min-w-0">
                                     <p className="text-sm font-black uppercase truncate leading-tight text-white">{item.name}</p>
                                     <p className="text-[9px] font-black tracking-widest text-white/20 uppercase mt-1">
                                       {item.type === 'part' ? 'Hardware / Componente' : 'Engenharia / Mão de Obra'}
                                     </p>
                                   </div>
                                </div>
                               
                               <div className="flex items-center gap-8">
                                 <div className="flex items-center bg-black/40 rounded-2xl p-1 border border-white/5">
                                   <button type="button" onClick={() => updateItemQuantity(item.id, item.quantity - 1)} className="w-10 h-10 flex items-center justify-center font-black text-white/20 hover:text-primary transition-colors text-xl">-</button>
                                   <span className="w-10 text-center text-sm font-black text-white italic">{item.quantity}</span>
                                   <button type="button" onClick={() => updateItemQuantity(item.id, item.quantity + 1)} className="w-10 h-10 flex items-center justify-center font-black text-white/20 hover:text-primary transition-colors text-xl">+</button>
                                 </div>
                                 
                                 <div className="text-right min-w-[140px]">
                                   <p className="text-xl font-black text-white italic leading-none mb-1">R$ {(item.price * item.quantity).toFixed(2)}</p>
                                   <div className="flex items-center gap-1.5 justify-end text-[9px] text-white/30 font-black uppercase tracking-widest">
                                     <span>Un: R$</span>
                                     <input 
                                       type="number"
                                       value={item.price}
                                       step="0.01"
                                       onChange={(e) => {
                                         const newPrice = parseFloat(e.target.value) || 0;
                                         setItems(items.map(i => i.id === item.id ? { ...i, price: newPrice } : i));
                                       }}
                                       className="bg-black/50 border border-white/10 rounded-lg py-0.5 px-2 w-20 text-center text-primary font-black italic text-xs leading-none"
                                     />
                                   </div>
                                 </div>
                                 
                                 <button type="button" onClick={() => removeItem(item.id)} className="p-3 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                                   <Trash size={18} />
                                 </button>
                               </div>
                             </motion.div>
                           ))
                         )}
                       </div>

                       <div className="bg-primary text-black p-10 rounded-[3rem] shadow-[0_20px_60px_rgba(255,214,0,0.2)] overflow-hidden relative group">
                         <div className="absolute top-[-20%] right-[-10%] p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <DollarSign size={200} />
                         </div>
                         
                         <div className="grid grid-cols-2 gap-y-4 relative z-10">
                           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/50">Total em Hardware (Peças):</span>
                           <span className="text-right font-black italic text-lg leading-none">R$ {items.filter(i => i.type === 'part').reduce((acc, i) => acc + (i.price * i.quantity), 0).toFixed(2)}</span>
                           
                           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/50">Total em Serviços (Mão de Obra):</span>
                           <span className="text-right font-black italic text-lg leading-none">R$ {items.filter(i => i.type === 'service' || i.type === 'labor').reduce((acc, i) => acc + (i.price * i.quantity), 0).toFixed(2)}</span>
                           
                           <div className="col-span-2 pt-6 mt-4 border-t border-black/10 flex items-center justify-between">
                             <div className="flex items-center gap-4">
                               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black">Ajuste / Desconto:</label>
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
                               <p className="text-[9px] font-black uppercase tracking-[0.4em] text-black/40 mb-2">Valor Total OS Premium</p>
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
                   <button 
                    onClick={(e) => handleFinalize(e as any, false)} 
                    className="flex-1 bg-white/10 border border-white/10 text-white font-black uppercase tracking-[0.2em] italic py-5 rounded-3xl hover:bg-white/20 transition-all flex items-center justify-center gap-3 active:scale-95"
                   >
                    <Save size={24} className="text-primary" /> SALVAR PROTOCOLO
                  </button>
                   <button 
                    onClick={(e) => handleFinalize(e as any, true)} 
                    className="flex-1 btn-primary py-5 text-sm"
                   >
                    <FileText size={24} /> FINALIZAR & IMPRIMIR
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Select-and-Configure Modal Flow (Requirements 8 & 9) */}
      <AnimatePresence>
        {catalogModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="card-dark w-full max-w-xl bg-[#0c0c0e] border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden text-white"
            >
              <button 
                onClick={() => setCatalogModalOpen(false)} 
                className="absolute right-6 top-6 p-2 hover:bg-white/10 rounded-full text-white/55 transition-colors"
                type="button"
              >
                <X size={20} />
              </button>

              <h2 className="text-2xl font-black italic uppercase tracking-tight text-white mb-6">
                Adicionar {catalogModType === 'service' ? 'Serviço' : 'Peça'} <span className="text-primary italic">do Catálogo</span>
              </h2>

              {!selectedCatalogItem ? (
                <div className="space-y-6">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="text" 
                      placeholder={`Buscar ${catalogModType === 'service' ? 'serviço' : 'peça'} pelo nome...`}
                      value={preAddSearch}
                      onChange={(e) => setPreAddSearch(e.target.value)}
                      className="input-field w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl"
                    />
                  </div>

                  <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                    {catalog
                      .filter(item => item.type === catalogModType && item.name.toLowerCase().includes(preAddSearch.toLowerCase()))
                      .map(item => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSelectedCatalogItem(item);
                            setPreAddPrice(item.suggestedPrice);
                            setPreAddQty(1);
                            setPreAddDiscount(0);
                          }}
                          className="w-full text-left p-4 hover:bg-white/5 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between group/list-item transition-all"
                        >
                          <div>
                            <p className="text-sm font-black uppercase text-white group-hover/list-item:text-primary transition-colors">{item.name}</p>
                            <p className="text-[10px] text-white/30 font-black uppercase tracking-wider mt-1">{item.category}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black italic text-primary">R$ {item.suggestedPrice.toFixed(2)}</span>
                          </div>
                        </button>
                      ))}

                    {catalog.filter(item => item.type === catalogModType).length === 0 && (
                      <div className="py-12 text-center text-xs text-white/40">
                        Nenhum item cadastrado neste grupo. Acesse o Catálogo acima para cadastrar.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Selected Item details & customization form */}
                  <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                    <span className="text-[8px] px-2 py-0.5 rounded bg-primary text-black font-black uppercase tracking-widest">{selectedCatalogItem.category}</span>
                    <h3 className="text-xl font-black uppercase italic tracking-tight text-white mt-2">{selectedCatalogItem.name}</h3>
                    {selectedCatalogItem.description && (
                      <p className="text-xs text-white/40 mt-1">{selectedCatalogItem.description}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Valor Base (Padrão)</label>
                        <div className="py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold text-center text-xs">
                          R$ {selectedCatalogItem.suggestedPrice.toFixed(2)}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Valor Ajustado *</label>
                        <input 
                          type="number" 
                          step="0.01" 
                          value={preAddPrice} 
                          onChange={(e) => setPreAddPrice(Number(e.target.value))}
                          className="input-field w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-center text-primary font-black italic"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Quantidade *</label>
                        <input 
                          type="number" 
                          value={preAddQty} 
                          min="1" 
                          onChange={(e) => setPreAddQty(Math.max(1, Number(e.target.value)))}
                          className="input-field w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-center font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Desconto Direto (R$)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={preAddDiscount} 
                        onChange={(e) => setPreAddDiscount(Number(e.target.value))}
                        className="input-field w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-center font-bold text-red-400"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Calculations breakdown block */}
                  <div className="p-5 bg-primary/10 border border-primary/20 rounded-2xl flex justify-between items-center text-black">
                    <div>
                      <span className="text-[9px] font-black uppercase text-white/40 tracking-widest block mb-1">Cálculo de Cobertura</span>
                      <span className="text-xs font-bold text-white/60 block">({preAddQty}x de R$ {Number(preAddPrice).toFixed(2)}) - R$ {Number(preAddDiscount).toFixed(2)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] font-black uppercase text-primary tracking-widest block">Subtotal</span>
                      <span className="text-2xl font-black italic text-primary leading-none">
                        R$ {Math.max(0, (Number(preAddPrice) * Number(preAddQty)) - Number(preAddDiscount)).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-white/5">
                    <button 
                      type="button" 
                      onClick={() => setSelectedCatalogItem(null)} 
                      className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/5 text-white font-bold uppercase text-[10px] tracking-wider rounded-xl transition-all"
                    >
                      Voltar à pesquisa
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        const finalPrice = Math.max(0, ((Number(preAddPrice) * Number(preAddQty)) - Number(preAddDiscount)) / Number(preAddQty));
                        const newItem: ServiceItem = {
                          id: crypto.randomUUID(),
                          name: selectedCatalogItem.name,
                          price: finalPrice,
                          quantity: Number(preAddQty),
                          type: catalogModType === 'service' ? 'service' : 'part'
                        };
                        setItems([...items, newItem]);
                        setCatalogModalOpen(false);
                      }}
                      className="flex-1 py-4 bg-primary text-black font-extrabold uppercase text-[10px] tracking-wider rounded-xl transition-all shadow-lg shadow-primary/20"
                    >
                      Confirmar e Adicionar
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Services;
