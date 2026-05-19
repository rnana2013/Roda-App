/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Car, Plus, Search, Edit2, Trash2,
  X, Save, User, Gauge
} from 'lucide-react';
import { useStore } from '../store';
import { Vehicle, Client } from '../types';
import { motion, AnimatePresence } from 'motion/react';

const Vehicles: React.FC = () => {
  const { vehicles, clients, addVehicle, updateVehicle, deleteVehicle, addClient } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [showNewClientForm, setShowNewClientForm] = useState(false);

  const filteredVehicles = vehicles.filter(v => 
    v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getClientName = (clientId?: string) => {
    if (!clientId) return 'Sem Cliente Vinculado';
    return clients.find(c => c.id === clientId)?.name || 'Cliente Desconhecido';
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    let clientId = formData.get('clientId') as string;

    // Se o formulário de novo cliente estiver aberto, cadastra ele primeiro
    if (showNewClientForm) {
      const newClient: Client = {
        id: crypto.randomUUID(),
        name: formData.get('newClientName') as string,
        phone: formData.get('newClientWhatsapp') as string,
        whatsapp: formData.get('newClientWhatsapp') as string,
        email: '',
        address: '',
        observations: 'Cadastrado via Veículo',
        createdAt: new Date().toISOString()
      };
      addClient(newClient);
      clientId = newClient.id;
    }

    const vehicleData: Vehicle = {
      id: editingVehicle?.id || crypto.randomUUID(),
      clientId: clientId || undefined,
      brand: formData.get('brand') as string,
      model: formData.get('model') as string,
      year: formData.get('year') as string || undefined,
      color: formData.get('color') as string || undefined,
      plate: (formData.get('plate') as string).toUpperCase(),
      km: formData.get('km') ? Number(formData.get('km')) : undefined,
      fuelType: formData.get('fuelType') as any,
      observations: formData.get('observations') as string,
      createdAt: editingVehicle?.createdAt || new Date().toISOString(),
    };

    if (editingVehicle) {
      updateVehicle(vehicleData);
    } else {
      addVehicle(vehicleData);
    }

    setIsModalOpen(false);
    setEditingVehicle(null);
    setShowNewClientForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente excluir este veículo definitivamente?')) {
      deleteVehicle(id);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pt-4">
        <div>
          <h1 className="text-4xl font-display font-black tracking-tighter uppercase italic text-white leading-none">Minha <span className="text-primary italic">Frota</span></h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-2">Controle total dos veículos sob seus cuidados</p>
        </div>
        <button 
          onClick={() => {
            setEditingVehicle(null);
            setShowNewClientForm(false);
            setIsModalOpen(true);
          }}
          className="btn-primary"
        >
          <Plus size={20} /> Cadastrar Veículo
        </button>
      </header>

      <div className="mb-10 relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Pesquisar por placa, modelo ou marca..."
          className="input-field pl-14 py-5"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredVehicles.map((vehicle) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={vehicle.id} 
              className="card-dark group flex flex-col hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border-white/5 overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <span className="text-[9px] font-black bg-white/5 border border-white/10 px-3 py-1 rounded-full text-white/40 uppercase tracking-[0.2em] mb-4 inline-block italic">
                      {vehicle.brand || 'Radar Desconhecido'}
                    </span>
                    <h3 className="font-black text-3xl font-display uppercase tracking-tighter italic leading-none text-white transition-colors group-hover:text-primary">{vehicle.model}</h3>
                    <div className="inline-block mt-5 bg-black px-5 py-3 rounded-2xl shadow-2xl border border-white/10 group-hover:border-primary/40 group-hover:bg-primary transition-all duration-500">
                       <p className="text-xl font-black text-white group-hover:text-black tracking-[0.1em] italic leading-none">
                        {vehicle.plate}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingVehicle(vehicle);
                        setShowNewClientForm(false);
                        setIsModalOpen(true);
                      }}
                      className="p-3 hover:bg-white/10 rounded-2xl text-white/30 hover:text-white transition-colors bg-white/5 border border-white/5"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(vehicle.id);
                      }}
                      className="p-3 hover:bg-red-500/10 rounded-2xl text-white/30 hover:text-red-500 transition-colors bg-white/5 border border-white/5"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-5 bg-black/40 border border-white/5 p-5 rounded-[2rem] shadow-inner">
                    <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center border border-white/5 shadow-2xl group-hover:rotate-6 transition-transform">
                      <User size={22} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-white/20 tracking-[0.3em] leading-none mb-1.5">Proprietário</p>
                      <p className="text-base font-black italic text-white/90">{getClientName(vehicle.clientId)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/5 border border-white/5 p-4 rounded-3xl text-center flex flex-col justify-center">
                      <p className="text-[8px] text-white/20 font-black uppercase tracking-[0.3em] mb-1">HODÔMETRO</p>
                      <p className="text-xs font-black italic text-white/70">{vehicle.km?.toLocaleString() || '--'}</p>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-4 rounded-3xl text-center flex flex-col justify-center">
                      <p className="text-[8px] text-white/20 font-black uppercase tracking-[0.3em] mb-1">ANO</p>
                      <p className="text-xs font-black italic text-white/70">{vehicle.year || '--'}</p>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-4 rounded-3xl text-center flex flex-col justify-center">
                      <p className="text-[8px] text-white/20 font-black uppercase tracking-[0.3em] mb-1">ESTÉTICA</p>
                      <p className="text-[10px] font-black uppercase italic text-white/70 truncate">{vehicle.color || '--'}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 hover:text-white py-5 rounded-3xl text-[10px] font-black tracking-[0.4em] uppercase transition-all active:scale-95">
                    DIAGNÓSTICO HISTÓRICO
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredVehicles.length === 0 && (
          <div className="col-span-full py-24 text-center flex flex-col items-center border-2 border-dashed border-white/5 rounded-[3rem]">
            <div className="p-8 bg-white/5 rounded-full mb-6">
              <Car className="text-white/10" size={64} />
            </div>
            <p className="text-white/20 font-black uppercase tracking-[0.3em] text-xs">A pista está vazia.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-hidden">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="card-dark border border-white/10 w-full max-w-xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                <h2 className="text-2xl font-black font-display uppercase italic tracking-tighter">
                  {editingVehicle ? 'Ajustar' : 'Novo'} <span className="text-primary italic">Registro</span>
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-colors text-white/50">
                  <X size={24} />
                </button>
              </div>
              
              <form id="vehicleForm" onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest">Vincular Proprietário</label>
                    {!editingVehicle && (
                      <button 
                        type="button" 
                        onClick={() => setShowNewClientForm(!showNewClientForm)}
                        className="text-[10px] font-black text-black uppercase bg-primary px-3 py-1 rounded-xl tracking-widest hover:brightness-110 shadow-lg shadow-primary/20"
                      >
                        {showNewClientForm ? 'Lista de Clientes' : '+ Novo Cadastro Fast'}
                      </button>
                    )}
                  </div>

                  {showNewClientForm ? (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4"
                    >
                      <div>
                        <input required name="newClientName" className="input-field" placeholder="Nome Completo *" />
                      </div>
                      <div>
                        <input name="newClientWhatsapp" className="input-field" placeholder="Telefone / WhatsApp" />
                      </div>
                    </motion.div>
                  ) : (
                    <div className="relative">
                       <select 
                        name="clientId" 
                        defaultValue={editingVehicle?.clientId || ""}
                        className="input-field appearance-none bg-white/5 pr-10"
                      >
                        <option value="" className="bg-black text-white">Selecionar cliente existente...</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id} className="bg-black text-white">{c.name}</option>
                        ))}
                      </select>
                      <User className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={18} />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Placa Identificadora *</label>
                    <input required name="plate" defaultValue={editingVehicle?.plate} className="input-field uppercase tracking-[0.2em] font-black text-center text-xl bg-primary/10 border-primary/20 text-primary focus:bg-primary focus:text-black" placeholder="ABC1A23" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Marca / Fabricante</label>
                    <input name="brand" defaultValue={editingVehicle?.brand} className="input-field uppercase" placeholder="Ex: VW, FIAT..." />
                  </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Modelo do Veículo *</label>
                    <input required name="model" defaultValue={editingVehicle?.model} className="input-field uppercase" placeholder="Ex: GOL 1.6 TSI" />
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Ano</label>
                    <input name="year" defaultValue={editingVehicle?.year} className="input-field text-center" placeholder="2024" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Cor Predominante</label>
                    <input name="color" defaultValue={editingVehicle?.color} className="input-field uppercase" placeholder="Ex: PRETO NINJA" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div>
                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Hodômetro Atual (KM)</label>
                    <div className="relative">
                      <Gauge className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                      <input type="number" name="km" defaultValue={editingVehicle?.km} className="input-field pl-12" placeholder="0" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Combustível</label>
                    <select name="fuelType" defaultValue={editingVehicle?.fuelType || 'Flex'} className="input-field bg-white/5 cursor-pointer">
                      <option value="Flex" className="bg-black text-white">Flex</option>
                      <option value="Gasolina" className="bg-black text-white">Gasolina</option>
                      <option value="Etanol" className="bg-black text-white">Etanol</option>
                      <option value="Diesel" className="bg-black text-white">Diesel</option>
                      <option value="Híbrido" className="bg-black text-white">Híbrido</option>
                      <option value="Elétrico" className="bg-black text-white">Elétrico</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Notas Acessórias</label>
                  <textarea name="observations" defaultValue={editingVehicle?.observations} className="input-field min-h-[100px] resize-none" placeholder="Opcionais, modificações ou histórico rápido..." />
                </div>
              </form>

              <div className="p-8 border-t border-white/5 flex gap-4 bg-white/5">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 btn-secondary">Cancelar</button>
                <button 
                  form="vehicleForm"
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  <Save size={18} /> Salvar Registro
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Vehicles;
