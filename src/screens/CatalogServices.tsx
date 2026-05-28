/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Wrench, Plus, Search, Edit2, Trash2,
  X, Save, Play, CheckCircle, Database
} from 'lucide-react';
import { useStore } from '../store';
import { CatalogItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { popularCatalogoInicial } from '../services/popularCatalogoInicial';

const CatalogServices: React.FC = () => {
  const { catalog, addToCatalog, updateCatalog, deleteCatalog } = useStore();
  const [services, setServices] = useState<CatalogItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  
  // Alert message state
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 3. Real-time sync with onSnapshot for servicos (Constraint 3)
  useEffect(() => {
    console.log("Inicializando onSnapshot para serviços...");
    const unsub = onSnapshot(collection(db, 'servicos'), (snap) => {
      const list = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.nome || data.name || '',
          type: 'service',
          category: data.categoria || data.category || 'Geral',
          description: data.descricao || data.description || '',
          suggestedPrice: Number(data.valorPadrao !== undefined ? data.valorPadrao : (data.suggestedPrice || 0)),
          minPrice: Number(data.minPrice || data.valorPadrao || 0),
          execTime: data.execTime || '',
        } as CatalogItem;
      });
      console.log("Serviços carregados:", list);
      setServices(list);
    }, (error) => {
      console.error("Erro completo ao buscar serviços do Firestore:", error);
      setErrorMsg(`Erro de conexão com Firestore: ${error.message}`);
    });

    return () => unsub();
  }, []);

  // Filter logic
  const filteredServices = services.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Unique categories for filter
  const categories = ['Todas', ...Array.from(new Set(services.map(s => s.category).filter(Boolean)))];

  const handleDelete = async (id: string) => {
    if (window.confirm("Deseja realmente excluir este serviço do Firestore em tempo real?")) {
      try {
        await deleteDoc(doc(db, 'servicos', id));
        setSuccessMsg("Serviço excluído com sucesso!");
        setTimeout(() => setSuccessMsg(null), 3000);
      } catch (err: any) {
        console.error("Erro ao deletar:", err);
        alert(`Erro ao excluir: ${err.message}`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const itemId = editingItem?.id || crypto.randomUUID();
    const name = formData.get('name') as string;
    const category = formData.get('category') as string;
    const valorPadrao = Number(formData.get('valorPadrao'));
    const description = formData.get('description') as string;

    const documentData = {
      id: itemId,
      nome: name,
      name: name,
      categoria: category,
      category: category,
      valorPadrao: valorPadrao,
      suggestedPrice: valorPadrao,
      descricao: description,
      description: description,
      type: 'service',
      updatedAt: serverTimestamp(),
      ...(editingItem ? {} : { createdAt: serverTimestamp() })
    };

    try {
      await setDoc(doc(db, 'servicos', itemId), documentData);
      
      // Show success, do NOT close form (Requirement 4)
      setSuccessMsg("Serviço cadastrado com sucesso!");
      setTimeout(() => setSuccessMsg(null), 4000);

      if (editingItem) {
        setIsModalOpen(false);
        setEditingItem(null);
      } else {
        // Reset only values inside the form to allow rapid successive creations
        const form = e.target as HTMLFormElement;
        form.reset();
      }
    } catch (err: any) {
      console.error("Erro ao salvar:", err);
      setErrorMsg(`Erro ao salvar no Firestore: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pt-4">
        <div>
          <h1 className="text-4xl font-display font-black tracking-tighter uppercase italic text-white leading-none">
            Catálogo de <span className="text-primary italic">Serviços</span>
          </h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-2">
            Serviços automotivos syncados em tempo real com o Firestore
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={async () => {
              try {
                const res = await popularCatalogoInicial();
                alert(`Catálogo inicial carregado com sucesso. Peças novas: ${res.pecas}. Serviços novos: ${res.servicos}.`);
              } catch (err: any) {
                alert(`Erro ao inicializar catálogo: ${err.message}`);
              }
            }}
            className="flex items-center gap-2 px-6 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-extrabold uppercase tracking-widest text-[10px] rounded-2xl transition-all"
          >
            <Database size={16} className="text-primary animate-pulse" /> Popular Catálogo Inicial
          </button>
          <button 
            onClick={() => {
              setEditingItem(null);
              setSuccessMsg(null);
              setErrorMsg(null);
              setIsModalOpen(true);
            }}
            className="btn-primary flex items-center gap-2 px-8 py-4 bg-primary text-black font-extrabold uppercase tracking-widest text-xs rounded-2xl shadow-lg ring-1 ring-primary/30"
          >
            <Plus size={18} /> Cadastrar Novo Serviço
          </button>
        </div>
      </header>

      {/* Control bar */}
      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Pesquisar serviço por nome..."
            className="input-field pl-14 py-5 w-full bg-white/5 border border-white/5 rounded-2xl text-white italic text-sm focus:outline-none focus:border-primary/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 p-2 bg-white/5 rounded-[1.5rem] border border-white/5 backdrop-blur-md">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${
                selectedCategory === cat 
                  ? 'bg-primary text-black font-extrabold' 
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of cards (Requirement 6) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredServices.map((item) => (
          <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={item.id} 
            className="card-dark group hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer overflow-hidden border border-white/5 hover:border-primary/20 bg-white/5 p-6 rounded-[2rem] flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <span className="text-[9px] px-3 py-1.5 rounded-xl font-black uppercase tracking-widest italic shadow-sm border bg-primary text-black border-primary">
                  {item.category || 'Geral'}
                </span>
                <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setEditingItem(item); 
                      setSuccessMsg(null);
                      setErrorMsg(null);
                      setIsModalOpen(true); 
                    }} 
                    className="p-3 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-colors"
                    title="Editar"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleDelete(item.id); 
                    }} 
                    className="p-3 hover:bg-red-500/10 rounded-xl text-white/40 hover:text-red-500 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-black text-2xl mb-2 leading-tight uppercase italic tracking-tighter text-white group-hover:text-primary transition-colors">
                  {item.name}
                </h3>
                <p className="text-xs text-white/40 line-clamp-3 leading-relaxed">
                  {item.description || 'Nenhuma descrição detalhada informada.'}
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase text-white/20 tracking-[0.3em]">VALOR PADRÃO:</span>
                <span className="text-xl font-black italic text-primary">
                  R$ {item.suggestedPrice.toFixed(2)}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  alert(`Para aplicar o serviço "${item.name}" a uma Ordem de Serviço, abra a tela de "Ordens de Serviço", inicie ou edite um registro e utilize a busca integrada.`);
                }}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 group-hover:border-primary/20 text-white hover:text-primary text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 active:scale-95"
              >
                Aplicar ao veículo
              </button>
            </div>
          </motion.div>
        ))}

        {filteredServices.length === 0 && (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-white/5 rounded-[2.5rem]">
            <Wrench className="mx-auto text-white/10 mb-6" size={64} />
            <p className="text-white/30 font-black uppercase tracking-[0.2em] text-xs">Nenhum serviço técnico encontrado.</p>
          </div>
        )}
      </div>

      {/* Form Dialog Modal (Requirement 4) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="card-dark w-full max-w-lg bg-[#0c0c0e] border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="absolute right-6 top-6 p-2 hover:bg-white/10 rounded-full text-white/55 transition-colors"
                type="button"
              >
                <X size={20} />
              </button>

              <h2 className="text-2xl font-black italic uppercase tracking-tight text-white mb-6">
                {editingItem ? 'Editar' : 'Cadastrar'} <span className="text-primary">Serviço</span>
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Nome do Serviço *</label>
                  <input 
                    required 
                    type="text" 
                    name="name" 
                    placeholder="Ex: Troca de pastilhas de freio"
                    defaultValue={editingItem?.name}
                    className="input-field w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Categoria *</label>
                    <input 
                      required 
                      type="text" 
                      name="category" 
                      placeholder="Ex: Freios"
                      defaultValue={editingItem?.category}
                      className="input-field w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Valor Padrão (R$) *</label>
                    <input 
                      required 
                      type="number" 
                      step="0.01"
                      name="valorPadrao" 
                      placeholder="120.00"
                      defaultValue={editingItem?.suggestedPrice}
                      className="input-field w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Descrição Completa</label>
                  <textarea 
                    name="description" 
                    rows={3}
                    placeholder="Insira detalhes sobre a execução do serviço..."
                    defaultValue={editingItem?.description}
                    className="input-field w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                {/* Submitting visual signals block */}
                <AnimatePresence>
                  {successMsg && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold uppercase text-[10px] tracking-wider rounded-xl flex items-center gap-2"
                    >
                      <CheckCircle size={14} /> {successMsg}
                    </motion.div>
                  )}
                  {errorMsg && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 font-bold uppercase text-[10px] tracking-wider rounded-xl flex items-center gap-2"
                    >
                      <X size={14} /> {errorMsg}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-4 pt-4 border-t border-white/5">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 hover:text-white font-bold uppercase text-[10px] tracking-wider rounded-xl transition-all"
                  >
                    Fechar
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-primary hover:bg-primary-hover text-black font-extrabold uppercase text-[10px] tracking-wider rounded-xl transition-all shadow-lg"
                  >
                    {isSubmitting ? 'Gravando...' : 'Gravar no Firestore'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CatalogServices;
