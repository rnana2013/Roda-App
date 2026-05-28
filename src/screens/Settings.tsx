import React from 'react';
import { 
  Settings as SettingsIcon, Save, Trash2, 
  ShieldCheck, Smartphone, MapPin, 
  Download, Database, Bell, User
} from 'lucide-react';
import { useStore } from '../store';
import { motion } from 'motion/react';

const Settings: React.FC = () => {
  const { settings, updateSettings, clearStorage, clients, vehicles, services, catalog } = useStore();

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateSettings({
      ...settings,
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      cnpj: formData.get('cnpj') as string,
      email: formData.get('email') as string,
    });
    alert('Configurações atualizadas com sucesso!');
  };

  const handleExport = () => {
    const data = {
      clients,
      vehicles,
      services,
      catalog,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-pit-stop-app-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="p-4 md:p-12 max-w-5xl mx-auto min-h-screen">
       <header className="mb-12">
         <h1 className="text-5xl font-display font-black tracking-tighter uppercase italic text-white leading-none tracking-tight">Painel de <span className="text-primary italic">Ajustes</span></h1>
         <p className="text-white/30 font-black uppercase tracking-[0.4em] text-[10px] mt-4">Configuração global do ecossistema Pit Stop App</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Menu Lateral de Ajustes */}
        <div className="lg:col-span-1 space-y-4">
           <SettingsTab icon={<User size={18} />} label="Perfil Oficina" active={true} />
           <SettingsTab icon={<ShieldCheck size={18} />} label="Segurança & Backup" />
           <SettingsTab icon={<Smartphone size={18} />} label="Integrações WhatsApp" />
           <SettingsTab icon={<Bell size={18} />} label="Notificações" />
        </div>

        {/* Conteúdo Principal */}
        <div className="lg:col-span-2 space-y-12">
          {/* Formulário de Identidade */}
          <section>
            <form onSubmit={handleSave} className="card-dark border border-white/5 p-10 space-y-8">
              <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                 <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 text-primary">
                    <Database size={24} />
                 </div>
                 <div>
                    <h3 className="text-lg font-black text-white italic uppercase tracking-tight">Identidade Comercial</h3>
                    <p className="text-[10px] font-black uppercase text-white/30 tracking-widest mt-1">Dados para emissão de ordens de serviço</p>
                 </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-3">
                      <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Nome Comercial / Razão Social</label>
                      <input name="name" className="input-field" defaultValue={settings.name} placeholder="Sua Oficina Master" />
                   </div>
                   <div className="space-y-3">
                      <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">CNPJ / CPF</label>
                      <input name="cnpj" className="input-field" defaultValue={settings.cnpj || ''} placeholder="00.000.000/0001-00" />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-3">
                      <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">WhatsApp de Contato</label>
                      <input name="phone" className="input-field" defaultValue={settings.phone} placeholder="(11) 99999-9999" />
                   </div>
                   <div className="space-y-3">
                      <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">E-mail Administrativo</label>
                      <input name="email" type="email" className="input-field" defaultValue={settings.email || ''} placeholder="oficina@exemplo.com" />
                   </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Endereço Completo</label>
                  <textarea name="address" className="input-field min-h-[100px] resize-none" defaultValue={settings.address} placeholder="Rua, Número, Bairro, Cidade - UF" />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full py-5 text-sm flex items-center justify-center gap-4 active:scale-[0.98] transition-transform">
                <Save size={24} /> SALVAR ALTERAÇÕES TÉCNICAS
              </button>
            </form>
          </section>

          {/* Backup e Dados */}
          <section className="card-dark border border-white/5 p-10 space-y-8">
             <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                 <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 text-white/40">
                    <ShieldCheck size={24} />
                 </div>
                 <div>
                    <h3 className="text-lg font-black text-white italic uppercase tracking-tight">Segurança de Dados</h3>
                    <p className="text-[10px] font-black uppercase text-white/30 tracking-widest mt-1">Backup local e integridade do sistema</p>
                 </div>
              </div>

              <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl">
                 <p className="text-xs font-medium text-white/60 leading-relaxed italic">
                    <span className="text-primary font-black not-italic uppercase mr-2 tracking-widest">Atenção:</span>
                    Seus dados são armazenados localmente neste dispositivo. Recomendamos exportar um backup semanalmente para garantir que suas informações não sejam perdidas caso o navegador seja limpo.
                 </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <button onClick={handleExport} className="flex-1 px-8 py-5 bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                   <Download size={20} className="text-primary" /> EXPORTAR BACKUP (JSON)
                 </button>
                 <button 
                   onClick={() => {
                     if(confirm('CUIDADO: Isso apagará TODOS os dados permanentemente. Tem certeza?')) {
                        clearStorage();
                        window.location.reload();
                     }
                   }}
                   className="flex-1 px-8 py-5 bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3"
                  >
                   <Trash2 size={20} /> LIMPAR BASE DE DADOS
                 </button>
              </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const SettingsTab: React.FC<{ icon: React.ReactNode, label: string, active?: boolean }> = ({ icon, label, active }) => (
  <button className={`w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] transition-all border ${active ? 'bg-primary text-black border-primary shadow-lg shadow-primary/20' : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:text-white'}`}>
    <span className={active ? 'text-black' : 'text-primary'}>{icon}</span>
    <span className="text-xs font-black uppercase tracking-widest italic">{label}</span>
  </button>
);

export default Settings;
