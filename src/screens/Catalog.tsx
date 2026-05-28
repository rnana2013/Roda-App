/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Database, Plus, Search, Edit2, Trash2,
  X, Save, Package, Wrench, ChevronRight,
  AlertCircle, DollarSign, Tag, Clock
} from 'lucide-react';
import { useStore } from '../store';
import { CatalogItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { popularServicosPadrao } from '../services/popularServicos';

const Catalog: React.FC = () => {
  const { catalog, addToCatalog, updateCatalog, deleteCatalog } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'part' | 'service'>('all');

  const [formType, setFormType] = useState<'part' | 'service'>('part');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filteredItems = catalog.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (i.category && i.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || i.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    const formData = new FormData(e.currentTarget);
    
    const itemData: CatalogItem = {
      id: editingItem?.id || crypto.randomUUID(),
      name: formData.get('name') as string,
      type: formType,
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      suggestedPrice: Number(formData.get('suggestedPrice')),
      minPrice: Number(formData.get('minPrice')) || 0,
      costPrice: formType === 'part' ? Number(formData.get('costPrice')) : undefined,
      execTime: formType === 'service' ? formData.get('execTime') as string : undefined,
      stock: formType === 'part' ? Number(formData.get('stock')) : undefined,
      brand: formData.get('brand') as string,
      code: formData.get('code') as string,
    };

    try {
      if (editingItem) {
        await updateCatalog(itemData);
      } else {
        await addToCatalog(itemData);
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao salvar o item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pt-4">
        <div>
          <h1 className="text-4xl font-display font-black tracking-tighter uppercase italic text-white leading-none">Meu <span className="text-primary italic">Catálogo</span></h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-2">Gestão rápida de peças e serviços técnicos</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button 
            type="button"
            onClick={async () => {
              try {
                console.log("Tentando salvar peça");
                const docRef = await addDoc(collection(db, "pecas"), {
                  nome: "Teste Firebase",
                  valorVenda: 10,
                  estoque: 1,
                  createdAt: serverTimestamp(),
                });
                console.log("Peça salva com sucesso");
                alert(`Sucesso! DocumentoID criado: ${docRef.id}`);
              } catch (error: any) {
                console.log(error);
                alert(`Erro: ${error.message}`);
              }
            }}
            className="px-6 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold uppercase text-[10px] tracking-widest text-white transition-all duration-300 flex items-center gap-2 border border-indigo-400/20 shadow-lg shadow-indigo-500/10 active:scale-95"
          >
            <Database size={16} /> Teste Firebase
          </button>
          <button 
            type="button"
            onClick={async () => {
              try {
                const count = await popularServicosPadrao();
                if (count > 0) {
                  alert(`Sucesso! Foram cadastrados ${count} serviços automotivos automáticos no Firestore.`);
                } else {
                  alert('A coleção de serviços já possui dados. Nenhum serviço novo foi inserido para evitar duplicados.');
                }
              } catch (error: any) {
                console.log(error);
                alert(`Erro ao popular: ${error.message}`);
              }
            }}
            className="px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-bold uppercase text-[10px] tracking-widest text-white transition-all duration-300 flex items-center gap-2 border border-emerald-400/20 shadow-lg shadow-emerald-500/10 active:scale-95"
          >
            <Database size={16} /> Pop. Serviços Padrão
          </button>
          <button 
            onClick={() => {
              setEditingItem(null);
              setFormType('part');
              setErrorMsg(null);
              setIsSubmitting(false);
              setIsModalOpen(true);
            }}
            className="btn-primary"
          >
            <Plus size={20} /> Adicionar Item
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Pesquisar por nome, categoria ou código..."
            className="input-field pl-14 py-5"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 p-2 bg-white/5 rounded-[1.5rem] border border-white/5 backdrop-blur-md">
          <FilterBtn active={filterType === 'all'} label="Tudo" onClick={() => setFilterType('all')} />
          <FilterBtn active={filterType === 'part'} label="Peças" onClick={() => setFilterType('part')} />
          <FilterBtn active={filterType === 'service'} label="Serviços" onClick={() => setFilterType('service')} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={item.id} 
            className="card-dark group hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer overflow-hidden border border-white/5 hover:border-primary/20"
          >
            <div className="p-8 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <span className={`text-[9px] px-3 py-1.5 rounded-xl font-black uppercase tracking-widest italic shadow-sm border ${item.type === 'part' ? 'bg-black text-primary border-primary/20' : 'bg-primary text-black border-primary'}`}>
                  {item.type === 'part' ? 'HARDWARE' : 'SERVICE'}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setEditingItem(item); 
                      setFormType(item.type); 
                      setErrorMsg(null);
                      setIsSubmitting(false);
                      setIsModalOpen(true); 
                    }} 
                    className="p-3 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); if(confirm('Excluir este item do catálogo definitivamente?')) deleteCatalog(item.id); }} 
                    className="p-3 hover:bg-red-500/10 rounded-xl text-white/40 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="font-black text-2xl mb-2 leading-tight uppercase italic tracking-tighter text-white group-hover:text-primary transition-colors">{item.name}</h3>
                <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.3em]">{item.category || 'Sistema sem radar'}</p>
              </div>

              <div className="mt-auto pt-8 border-t border-white/5 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-white/20 tracking-[0.3em]">Cotação Sugerida:</span>
                  <span className="font-black text-3xl italic tracking-tighter text-white">R$ {item.suggestedPrice.toFixed(2)}</span>
                </div>
                
                <div className="flex gap-3">
                  {item.type === 'part' ? (
                    <div className={`flex-1 px-4 py-3 rounded-2xl border flex items-center justify-between uppercase font-black text-[9px] tracking-widest ${ (item.stock || 0) < 3 ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-black text-primary border-primary/10 shadow-lg'}`}>
                      <span>Disponível</span>
                      <span className="text-xs italic">{item.stock || 0} UN</span>
                    </div>
                  ) : (
                    <div className="flex-1 px-4 py-3 rounded-2xl border border-primary/10 bg-black text-primary flex items-center justify-between uppercase font-black text-[9px] tracking-widest shadow-lg">
                      <span>Execução</span>
                      <span className="text-xs italic">{item.execTime || '--'}</span>
                    </div>
                  )}
                  {item.brand && (
                    <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/5 text-white/20 font-black text-[9px] tracking-[0.2em] uppercase">
                      {item.brand}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full py-32 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
            <Database className="mx-auto text-white/5 mb-6" size={80} />
            <p className="text-white/20 font-black uppercase tracking-[0.4em] text-xs">Catálogo vazio. Comece a cadastrar.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-hidden">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="card-dark border border-white/10 w-full max-w-xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                <h2 className="text-2xl font-black font-display uppercase tracking-tight italic text-white">
                  {editingItem ? 'Ajustar' : 'Novo'} <span className="text-primary italic">Item</span>
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-colors text-white/50">
                  <X size={24} />
                </button>
              </div>

              <div className="px-8 py-6 bg-white/5 border-b border-white/5">
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setFormType('part')}
                    className={`py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all ${formType === 'part' ? 'bg-primary text-black shadow-lg shadow-primary/20 scale-[1.02]' : 'bg-white/5 text-white/30'}`}
                  >
                    <Package size={18} /> Hardware (Peça)
                  </button>
                  <button 
                    onClick={() => setFormType('service')}
                    className={`py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all ${formType === 'service' ? 'bg-primary text-black shadow-lg shadow-primary/20 scale-[1.02]' : 'bg-white/5 text-white/30'}`}
                  >
                    <Wrench size={18} /> Service (MDO)
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="mx-8 mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center gap-3 text-xs uppercase font-black tracking-wider">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form key={editingItem?.id || 'new'} id="catalog-form" onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div>
                  <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Nome Técnico do Item *</label>
                  <input required name="name" defaultValue={editingItem?.name} className="input-field" placeholder={formType === 'part' ? 'Ex: Disco de Freio Ventilado' : 'Ex: Revisão Preventiva 40k'} />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Categoria / Sistema</label>
                    <input required name="category" defaultValue={editingItem?.category} className="input-field" placeholder="Ex: Suspensão, Freios..." />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Código Interno / REF</label>
                    <input name="code" defaultValue={editingItem?.code} className="input-field italic uppercase" placeholder="Ex: DF-2024-V" />
                  </div>
                </div>

                {formType === 'part' ? (
                  <>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Preço de Venda Praticado *</label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                          <input required type="number" step="0.01" name="suggestedPrice" defaultValue={editingItem?.suggestedPrice} className="input-field pl-12 text-primary font-black italic" placeholder="0.00" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Custo de Aquisição</label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                          <input type="number" step="0.01" name="costPrice" defaultValue={editingItem?.costPrice} className="input-field pl-12" placeholder="0.00" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Marca / Fabricante</label>
                        <input name="brand" defaultValue={editingItem?.brand} className="input-field uppercase" placeholder="Ex: BREMBO, METAL LEVE" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Disponibilidade Inicial</label>
                        <input type="number" name="stock" defaultValue={editingItem?.stock} className="input-field" placeholder="0" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Valor da Hora / Serviço *</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                        <input required type="number" step="0.01" name="suggestedPrice" defaultValue={editingItem?.suggestedPrice} className="input-field pl-12 text-primary font-black italic" placeholder="0.00" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Tempo de Execução (Estimado)</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                        <input name="execTime" defaultValue={editingItem?.execTime} className="input-field pl-12" placeholder="Ex: 01:30h" />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Memória Técnica / Observações</label>
                  <textarea name="description" defaultValue={editingItem?.description} className="input-field min-h-[100px] resize-none" placeholder="Detalhes técnicos, procedimentos ou compatibilidade..." />
                </div>
              </form>

              <div className="p-8 border-t border-white/5 flex gap-4 bg-white/5">
                <button type="button" disabled={isSubmitting} onClick={() => setIsModalOpen(false)} className="flex-1 btn-secondary py-4 disabled:opacity-50">CANCELAR</button>
                <button 
                  type="submit"
                  form="catalog-form"
                  disabled={isSubmitting}
                  className="flex-1 btn-primary py-4 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      SALVANDO...
                    </>
                  ) : (
                    <>
                      <Save size={18} /> SALVAR ITEM
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FilterBtn: React.FC<{ active: boolean, label: string, onClick: () => void }> = ({ active, label, onClick }) => (
  <button 
    onClick={onClick}
    className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-primary text-black shadow-lg shadow-primary/20 scale-[1.05]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
  >
    {label}
  </button>
);

export default Catalog;
