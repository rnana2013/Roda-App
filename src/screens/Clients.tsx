/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, Plus, Search, Phone, 
  MessageCircle, MoreVertical, Edit2, Trash2,
  X, Save
} from 'lucide-react';
import { useStore } from '../store';
import { Client } from '../types';
import { motion, AnimatePresence } from 'motion/react';

const Clients: React.FC = () => {
  const { clients, addClient, updateClient, deleteClient } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const clientData: Client = {
      id: editingClient?.id || crypto.randomUUID(),
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      whatsapp: formData.get('whatsapp') as string,
      email: formData.get('email') as string,
      cpf: formData.get('cpf') as string,
      address: formData.get('address') as string,
      observations: formData.get('observations') as string,
      createdAt: editingClient?.createdAt || new Date().toISOString(),
    };

    if (editingClient) {
      updateClient(clientData);
    } else {
      addClient(clientData);
    }

    setIsModalOpen(false);
    setEditingClient(null);
  };

  const openWhatsApp = (phone: string, name: string) => {
    const message = encodeURIComponent(`Olá, ${name}! Tudo bem?`);
    window.open(`https://wa.me/55${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente? Todos os veículos vinculados também serão removidos.')) {
      deleteClient(id);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pt-4">
        <div>
          <h1 className="text-4xl font-display font-black tracking-tighter uppercase italic text-white leading-none">Meus <span className="text-primary italic">Clientes</span></h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-2">Gerencie sua base de contatos e fidelização</p>
        </div>
        <button 
          onClick={() => {
            setEditingClient(null);
            setIsModalOpen(true);
          }}
          className="btn-primary"
        >
          <Plus size={20} /> Adicionar Cliente
        </button>
      </header>

      <div className="mb-10 relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nome ou telefone..."
          className="input-field pl-14 py-5"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredClients.map((client) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={client.id} 
              className="card-dark p-8 group flex flex-col hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border-white/5"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-black text-primary border border-white/5 shadow-2xl rounded-2xl flex items-center justify-center font-black text-2xl rotate-3 group-hover:rotate-6 transition-transform italic">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-xl leading-none uppercase italic tracking-tighter text-white group-hover:text-primary transition-colors">{client.name}</h3>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-2">{client.email || 'Canal de e-mail não registrado'}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingClient(client);
                      setIsModalOpen(true);
                    }}
                    className="p-3 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(client.id);
                    }}
                    className="p-3 hover:bg-red-500/10 rounded-xl text-white/40 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 border border-white/5 p-4 rounded-3xl">
                  <p className="text-[9px] text-white/20 uppercase font-black tracking-widest mb-1.5">Telefone</p>
                  <p className="text-sm font-black italic text-white/80">{client.phone}</p>
                </div>
                <div className="bg-white/5 border border-white/5 p-4 rounded-3xl">
                  <p className="text-[9px] text-white/20 uppercase font-black tracking-widest mb-1.5">Identidade</p>
                  <p className="text-sm font-black italic text-white/80">{client.cpf || 'N/A'}</p>
                </div>
              </div>

              <div className="mt-auto flex gap-4">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    openWhatsApp(client.whatsapp || client.phone, client.name);
                  }}
                  className="flex-1 bg-primary text-black font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/10"
                >
                  <MessageCircle size={18} /> WhatsApp
                </button>
                <a 
                  href={`tel:${client.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="px-6 bg-white/5 border border-white/10 text-white/40 rounded-2xl flex items-center justify-center hover:bg-white/10 hover:text-white transition-all active:scale-95"
                >
                  <Phone size={20} />
                </a>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredClients.length === 0 && (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
            <Users className="mx-auto text-white/5 mb-6" size={64} />
            <p className="text-white/20 font-black uppercase tracking-[0.3em] text-xs">Nenhum cliente no radar.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="card-dark border border-white/10 w-full max-w-xl overflow-hidden shadow-2xl"
          >
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h2 className="text-2xl font-black font-display uppercase italic tracking-tighter">
                {editingClient ? 'Ajustar' : 'Cadastrar'} <span className="text-primary italic">Cliente</span>
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-3 hover:bg-white/10 rounded-2xl text-white/50 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form id="client-form" onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Nome Completo do Cliente *</label>
                <input 
                  required 
                  name="name" 
                  defaultValue={editingClient?.name}
                  className="input-field" 
                  placeholder="Ex: Ayrton Senna da Silva" 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Principal Telefone *</label>
                  <input 
                    required 
                    name="phone" 
                    defaultValue={editingClient?.phone}
                    className="input-field" 
                    placeholder="(11) 99999-9999" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">WhatsApp de Contato</label>
                  <input 
                    name="whatsapp" 
                    defaultValue={editingClient?.whatsapp}
                    className="input-field" 
                    placeholder="(11) 99999-9999" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">E-mail para Orçamentos</label>
                <input 
                  name="email" 
                  type="email"
                  defaultValue={editingClient?.email}
                  className="input-field" 
                  placeholder="contato@cliente.com" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">CPF / CNPJ</label>
                  <input 
                    name="cpf" 
                    defaultValue={editingClient?.cpf}
                    className="input-field" 
                    placeholder="000.000.000-00" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Endereço Residencial</label>
                  <input 
                    name="address" 
                    defaultValue={editingClient?.address}
                    className="input-field" 
                    placeholder="Cidade, Bairro, Rua..." 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Observações Premium</label>
                <textarea 
                  name="observations" 
                  defaultValue={editingClient?.observations}
                  className="input-field min-h-[120px] resize-none" 
                  placeholder="Preferências, histórico ou detalhes importantes..."
                />
              </div>
            </form>

            <div className="p-8 border-t border-white/5 flex gap-4 bg-white/5">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 btn-secondary"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                form="client-form"
                className="flex-1 btn-primary"
              >
                <Save size={18} /> Salvar Cadastro
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Clients;
