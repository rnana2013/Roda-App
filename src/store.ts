import { create } from 'zustand';
import { 
  collection, doc, setDoc, deleteDoc, onSnapshot, limit, query, addDoc, serverTimestamp
} from 'firebase/firestore';
import { onAuthStateChanged, signOut as firebaseSignOut, User as FirebaseUser, signInAnonymously } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { popularCatalogoInicial } from './services/popularCatalogoInicial';
import { 
  Client, Vehicle, ServiceRecord, CatalogItem, 
  ShopSettings, OilChange 
} from './types';

interface AppState {
  clients: Client[];
  vehicles: Vehicle[];
  services: ServiceRecord[];
  catalog: CatalogItem[];
  oilChanges: OilChange[];
  settings: ShopSettings;
  user: FirebaseUser | null;
  authLoading: boolean;

  // Actions
  addClient: (client: Client) => Promise<void>;
  updateClient: (client: Client) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  addVehicle: (vehicle: Vehicle) => Promise<void>;
  updateVehicle: (vehicle: Vehicle) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;

  addService: (service: ServiceRecord) => Promise<void>;
  updateService: (service: ServiceRecord) => Promise<void>;
  deleteService: (id: string) => Promise<void>;

  addToCatalog: (item: CatalogItem) => Promise<void>;
  updateCatalog: (item: CatalogItem) => Promise<void>;
  deleteCatalog: (id: string) => Promise<void>;

  addOilChange: (oilChange: OilChange) => Promise<void>;
  updateOilChange: (oilChange: OilChange) => Promise<void>;

  updateSettings: (settings: ShopSettings) => Promise<void>;
  clearStorage: () => Promise<void>;
  signOut: () => Promise<void>;
}

// Keep track of active subscriptions
let unsubscribes: (() => void)[] = [];

function clearAllSubscriptions() {
  unsubscribes.forEach(unsub => unsub());
  unsubscribes = [];
}

export const useStore = create<AppState>((set, get) => {
  // Setup real-time subscribers once user is authenticated
  const startFirestoreSync = () => {
    clearAllSubscriptions();

    // Import default catalog if empty
    popularCatalogoInicial().catch(err => {
      console.error("Erro na importação automática do catálogo inicial:", err);
    });

    // 1. Listen to 'clientes'
    const unsubClients = onSnapshot(collection(db, 'clientes'), (snap) => {
      const clientsList: Client[] = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.nome || data.name || '',
          phone: data.phone || data.telefone || '',
          whatsapp: data.whatsapp || data.telefone || '',
          email: data.email || '',
          cpf: data.cpf || '',
          address: data.address || data.endereco || '',
          observations: data.observations || data.observacoes || '',
          createdAt: data.createdAt || new Date().toISOString()
        } as Client;
      });
      set({ clients: clientsList });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'clientes');
    });
    unsubscribes.push(unsubClients);

    // 2. Listen to 'veiculos'
    const unsubVehicles = onSnapshot(collection(db, 'veiculos'), (snap) => {
      const vehiclesList: Vehicle[] = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          clientId: data.clientId || data.clienteId || undefined,
          brand: data.brand || data.marca || '',
          model: data.model || data.modelo || '',
          year: data.year || data.ano || '',
          color: data.color || data.cor || '',
          plate: data.plate || data.placa || '',
          km: data.km !== undefined ? Number(data.km) : (data.quilometragem !== undefined ? Number(data.quilometragem) : undefined),
          fuelType: data.fuelType || data.combustivel || 'Flex',
          observations: data.observations || data.observacoes || '',
          createdAt: data.createdAt || new Date().toISOString()
        } as Vehicle;
      });
      set({ vehicles: vehiclesList });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'veiculos');
    });
    unsubscribes.push(unsubVehicles);

    // 3. Listen to 'servicos' and 'pecas' (Catalog item split collection sync)
    let tempServices: CatalogItem[] = [];
    let tempParts: CatalogItem[] = [];

    const unsubServicos = onSnapshot(collection(db, 'servicos'), (snap) => {
      try {
        tempServices = snap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.nome || data.name || '',
            type: 'service',
            category: data.categoria || data.category || 'Geral',
            description: data.descricao || data.description || '',
            suggestedPrice: Number(data.valorPadrao || data.suggestedPrice || 0),
            minPrice: Number(data.minPrice || data.valorPadrao || 0),
            execTime: data.execTime || '',
          } as CatalogItem;
        });
        console.log("Serviços carregados:", tempServices);
        set({ catalog: [...tempServices, ...tempParts] });
      } catch (err) {
        console.error("Erro ao mapear serviços do Firestore:", err);
      }
    }, (error) => {
      console.error("FALHA CRÍTICA FIRESTORE (Serviços):", error);
      handleFirestoreError(error, OperationType.GET, 'servicos');
    });
    unsubscribes.push(unsubServicos);

    const unsubPecas = onSnapshot(collection(db, 'pecas'), (snap) => {
      try {
        tempParts = snap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.nome || data.name || '',
            type: 'part',
            category: data.categoria || data.category || 'Peças',
            description: data.description || data.observacoes || '',
            suggestedPrice: Number(data.valorVenda || data.suggestedPrice || 0),
            minPrice: Number(data.minPrice || data.valorVenda || 0),
            costPrice: Number(data.valorCusto || data.costPrice || 0),
            stock: Number(data.estoque !== undefined ? data.estoque : (data.stock || 0)),
            code: data.codigo || data.code || '',
            brand: data.marca || data.brand || '',
          } as CatalogItem;
        });
        console.log("Peças carregadas:", tempParts);
        set({ catalog: [...tempServices, ...tempParts] });
      } catch (err) {
        console.error("Erro ao mapear peças do Firestore:", err);
      }
    }, (error) => {
      console.error("FALHA CRÍTICA FIRESTORE (Peças):", error);
      handleFirestoreError(error, OperationType.GET, 'pecas');
    });
    unsubscribes.push(unsubPecas);

    // 4. Listen to 'ordens_servico' (ServiceRecord work orders)
    const unsubOrders = onSnapshot(collection(db, 'ordens_servico'), (snap) => {
      const ordersList: ServiceRecord[] = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          vehicleId: data.vehicleId || data.veiculoId || '',
          clientId: data.clientId || data.clienteId || undefined,
          date: data.date || data.createdAt || new Date().toISOString(),
          status: data.status || 'Aguardando avaliação',
          items: data.items || data.itens || [],
          laborValue: Number(data.laborValue !== undefined ? data.laborValue : (data.subtotal || 0)),
          partsValue: Number(data.partsValue || 0),
          discount: Number(data.discount !== undefined ? data.discount : (data.desconto || 0)),
          totalValue: Number(data.totalValue !== undefined ? data.totalValue : (data.total || 0)),
          paymentStatus: data.paymentStatus || 'pendente',
          paymentMethod: data.paymentMethod || '',
          kmAtService: data.kmAtService !== undefined ? Number(data.kmAtService) : undefined,
          description: data.description || data.observacoes || '',
          observations: data.observations || data.observacoes || '',
          createdAt: data.createdAt || new Date().toISOString()
        } as ServiceRecord;
      });
      set({ services: ordersList });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'ordens_servico');
    });
    unsubscribes.push(unsubOrders);

    // 5. Listen to 'settings'
    const unsubSettings = onSnapshot(doc(db, 'settings', 'general'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        set({
          settings: {
            name: data.name || 'Pit Stop App Oficina',
            phone: data.phone || '',
            address: data.address || '',
            cnpj: data.cnpj || '',
            email: data.email || '',
            whatsappMessageTemplate: data.whatsappMessageTemplate || 'Olá, [cliente]! Seu veículo [veiculo] está pronto.'
          }
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/general');
    });
    unsubscribes.push(unsubSettings);

    // 6. Listen to 'oil_changes'
    const unsubOil = onSnapshot(collection(db, 'oil_changes'), (snap) => {
      const oilList: OilChange[] = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          vehicleId: data.vehicleId || '',
          lastChangeDate: data.lastChangeDate || '',
          lastChangeKm: Number(data.lastChangeKm || 0),
          nextChangeKm: Number(data.nextChangeKm || 0),
          oilType: data.oilType || '',
          filterChanged: !!data.filterChanged,
          observations: data.observations || ''
        } as OilChange;
      });
      set({ oilChanges: oilList });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'oil_changes');
    });
    unsubscribes.push(unsubOil);
  };

  // Setup Auth state listener
  onAuthStateChanged(auth, (user) => {
    if (user) {
      set({ user, authLoading: false });
      startFirestoreSync();
    } else {
      set({ 
        user: null, 
        authLoading: true,
        clients: [],
        vehicles: [],
        services: [],
        catalog: [],
        oilChanges: []
      });
      clearAllSubscriptions();
      signInAnonymously(auth).catch((error) => {
        console.error('Failed to authenticate anonymously:', error);
        set({ authLoading: false });
      });
    }
  });

  return {
    clients: [],
    vehicles: [],
    services: [],
    catalog: [],
    oilChanges: [],
    settings: {
      name: 'Pit Stop App Oficina',
      phone: '11999999999',
      address: 'Rua das Oficinas, 123',
      cnpj: '12.345.678/0001-90',
      email: 'contato@rodaapp.com',
      whatsappMessageTemplate: 'Olá, [cliente]! Seu veículo [veiculo] está pronto.',
    },
    user: null,
    authLoading: true,

    addClient: async (client) => {
      // Local state update first
      set((state) => ({ clients: [...state.clients, client] }));

      if (auth.currentUser) {
        try {
          await setDoc(doc(db, 'clientes', client.id), {
            id: client.id,
            nome: client.name,
            name: client.name,
            telefone: client.phone || '',
            phone: client.phone || '',
            whatsapp: client.whatsapp || '',
            cpf: client.cpf || '',
            endereco: client.address || '',
            address: client.address || '',
            observacoes: client.observations || '',
            observations: client.observations || '',
            createdAt: client.createdAt || new Date().toISOString()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `clientes/${client.id}`);
        }
      }
    },

    updateClient: async (client) => {
      set((state) => ({ 
        clients: state.clients.map(c => c.id === client.id ? client : c) 
      }));

      if (auth.currentUser) {
        try {
          await setDoc(doc(db, 'clientes', client.id), {
            id: client.id,
            nome: client.name,
            name: client.name,
            telefone: client.phone || '',
            phone: client.phone || '',
            whatsapp: client.whatsapp || '',
            cpf: client.cpf || '',
            endereco: client.address || '',
            address: client.address || '',
            observacoes: client.observations || '',
            observations: client.observations || '',
            createdAt: client.createdAt || new Date().toISOString()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `clientes/${client.id}`);
        }
      }
    },

    deleteClient: async (id) => {
      set((state) => ({ 
        clients: state.clients.filter(c => c.id !== id),
        vehicles: state.vehicles.filter(v => v.clientId !== id)
      }));

      if (auth.currentUser) {
        try {
          await deleteDoc(doc(db, 'clientes', id));
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `clientes/${id}`);
        }
      }
    },

    addVehicle: async (vehicle) => {
      set((state) => ({ vehicles: [...state.vehicles, vehicle] }));

      if (auth.currentUser) {
        try {
          await setDoc(doc(db, 'veiculos', vehicle.id), {
            id: vehicle.id,
            clientId: vehicle.clientId || '',
            clienteId: vehicle.clientId || '',
            brand: vehicle.brand,
            marca: vehicle.brand,
            model: vehicle.model,
            modelo: vehicle.model,
            year: vehicle.year || '',
            ano: vehicle.year || '',
            color: vehicle.color || '',
            cor: vehicle.color || '',
            plate: vehicle.plate.toUpperCase(),
            placa: vehicle.plate.toUpperCase(),
            km: vehicle.km !== undefined ? Number(vehicle.km) : null,
            quilometragem: vehicle.km !== undefined ? Number(vehicle.km) : null,
            fuelType: vehicle.fuelType || '',
            combustivel: vehicle.fuelType || '',
            observations: vehicle.observations || '',
            observacoes: vehicle.observations || '',
            createdAt: vehicle.createdAt || new Date().toISOString()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `veiculos/${vehicle.id}`);
        }
      }
    },

    updateVehicle: async (vehicle) => {
      set((state) => ({ 
        vehicles: state.vehicles.map(v => v.id === vehicle.id ? vehicle : v) 
      }));

      if (auth.currentUser) {
        try {
          await setDoc(doc(db, 'veiculos', vehicle.id), {
            id: vehicle.id,
            clientId: vehicle.clientId || '',
            clienteId: vehicle.clientId || '',
            brand: vehicle.brand,
            marca: vehicle.brand,
            model: vehicle.model,
            modelo: vehicle.model,
            year: vehicle.year || '',
            ano: vehicle.year || '',
            color: vehicle.color || '',
            cor: vehicle.color || '',
            plate: vehicle.plate.toUpperCase(),
            placa: vehicle.plate.toUpperCase(),
            km: vehicle.km !== undefined ? Number(vehicle.km) : null,
            quilometragem: vehicle.km !== undefined ? Number(vehicle.km) : null,
            fuelType: vehicle.fuelType || '',
            combustivel: vehicle.fuelType || '',
            observations: vehicle.observations || '',
            observacoes: vehicle.observations || '',
            createdAt: vehicle.createdAt || new Date().toISOString()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `veiculos/${vehicle.id}`);
        }
      }
    },

    deleteVehicle: async (id) => {
      set((state) => ({ 
        vehicles: state.vehicles.filter(v => v.id !== id),
        services: state.services.filter(s => s.vehicleId !== id),
      }));

      if (auth.currentUser) {
        try {
          await deleteDoc(doc(db, 'veiculos', id));
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `veiculos/${id}`);
        }
      }
    },

    addService: async (service) => {
      set((state) => ({ services: [...state.services, service] }));

      if (auth.currentUser) {
        try {
          const subtotal = service.items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
          await setDoc(doc(db, 'ordens_servico', service.id), {
            id: service.id,
            clientId: service.clientId || '',
            clienteId: service.clientId || '',
            vehicleId: service.vehicleId,
            veiculoId: service.vehicleId,
            items: service.items,
            itens: service.items,
            subtotal: subtotal,
            partsValue: service.partsValue || 0,
            laborValue: service.laborValue || 0,
            discount: service.discount || 0,
            desconto: service.discount || 0,
            total: service.totalValue,
            totalValue: service.totalValue,
            status: service.status,
            observations: service.observations || '',
            observacoes: service.observations || '',
            description: service.description || '',
            paymentStatus: service.paymentStatus || 'pendente',
            paymentMethod: service.paymentMethod || '',
            kmAtService: service.kmAtService || 0,
            date: service.date || new Date().toISOString(),
            createdAt: service.createdAt || new Date().toISOString(),
            finalizadoEm: service.status === 'Finalizado' || service.status === 'Entregue' ? new Date().toISOString() : null
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `ordens_servico/${service.id}`);
        }
      }
    },

    updateService: async (service) => {
      set((state) => ({ 
        services: state.services.map(s => s.id === service.id ? service : s) 
      }));

      if (auth.currentUser) {
        try {
          const subtotal = service.items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
          await setDoc(doc(db, 'ordens_servico', service.id), {
            id: service.id,
            clientId: service.clientId || '',
            clienteId: service.clientId || '',
            vehicleId: service.vehicleId,
            veiculoId: service.vehicleId,
            items: service.items,
            itens: service.items,
            subtotal: subtotal,
            partsValue: service.partsValue || 0,
            laborValue: service.laborValue || 0,
            discount: service.discount || 0,
            desconto: service.discount || 0,
            total: service.totalValue,
            totalValue: service.totalValue,
            status: service.status,
            observations: service.observations || '',
            observacoes: service.observations || '',
            description: service.description || '',
            paymentStatus: service.paymentStatus || 'pendente',
            paymentMethod: service.paymentMethod || '',
            kmAtService: service.kmAtService || 0,
            date: service.date || new Date().toISOString(),
            createdAt: service.createdAt || new Date().toISOString(),
            finalizadoEm: service.status === 'Finalizado' || service.status === 'Entregue' ? new Date().toISOString() : null
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `ordens_servico/${service.id}`);
        }
      }
    },

    deleteService: async (id) => {
      set((state) => ({ 
        services: state.services.filter(s => s.id !== id) 
      }));

      if (auth.currentUser) {
        try {
          await deleteDoc(doc(db, 'ordens_servico', id));
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `ordens_servico/${id}`);
        }
      }
    },

    addToCatalog: async (item) => {
      set((state) => ({ catalog: [...state.catalog, item] }));

      console.log("Tentando salvar item no catálogo:", item);
      try {
        if (item.type === 'service') {
          if (auth.currentUser) {
            await setDoc(doc(db, 'servicos', item.id), {
              id: item.id,
              nome: item.name,
              name: item.name,
              descricao: item.description || '',
              description: item.description || '',
              valorPadrao: item.suggestedPrice || 0,
              suggestedPrice: item.suggestedPrice || 0,
              minPrice: item.minPrice || 0,
              categoria: item.category || 'Geral',
              category: item.category || 'Geral',
              execTime: item.execTime || '',
              createdAt: serverTimestamp()
            });
            console.log("Serviço salvo com sucesso");
          } else {
            console.log("Aviso: serviço ignorado do Firestore por falta de usuário logado");
          }
        } else {
          if (auth.currentUser) {
            await setDoc(doc(db, 'pecas', item.id), {
              id: item.id,
              nome: item.name,
              name: item.name,
              codigo: item.code || '',
              code: item.code || '',
              marca: item.brand || '',
              brand: item.brand || '',
              categoria: item.category || 'Peças',
              category: item.category || 'Peças',
              valorCusto: Number(item.costPrice || 0),
              costPrice: Number(item.costPrice || 0),
              valorVenda: Number(item.suggestedPrice || 0),
              suggestedPrice: Number(item.suggestedPrice || 0),
              estoque: Number(item.stock || 0),
              stock: Number(item.stock || 0),
              observacoes: item.description || '',
              description: item.description || '',
              createdAt: serverTimestamp()
            });
            console.log("Peça salva com sucesso");
          } else {
            console.log("Aviso: peça ignorada do Firestore por falta de usuário logado");
          }
        }
      } catch (error) {
        console.error("Erro completo ao registrar no Firestore:", error);
        handleFirestoreError(error, OperationType.WRITE, `${item.type === 'service' ? 'servicos' : 'pecas'}/${item.id}`);
      }
    },

    updateCatalog: async (item) => {
      set((state) => ({ 
        catalog: state.catalog.map(i => i.id === item.id ? item : i) 
      }));

      if (auth.currentUser) {
        try {
          if (item.type === 'service') {
            await setDoc(doc(db, 'servicos', item.id), {
              id: item.id,
              nome: item.name,
              name: item.name,
              descricao: item.description || '',
              description: item.description || '',
              valorPadrao: item.suggestedPrice || 0,
              suggestedPrice: item.suggestedPrice || 0,
              minPrice: item.minPrice || 0,
              categoria: item.category || 'Geral',
              category: item.category || 'Geral',
              execTime: item.execTime || '',
              updatedAt: serverTimestamp()
            });
          } else {
            await setDoc(doc(db, 'pecas', item.id), {
              nome: item.name,
              name: item.name,
              codigo: item.code || '',
              code: item.code || '',
              marca: item.brand || '',
              brand: item.brand || '',
              valorCusto: Number(item.costPrice || 0),
              costPrice: Number(item.costPrice || 0),
              valorVenda: Number(item.suggestedPrice || 0),
              suggestedPrice: Number(item.suggestedPrice || 0),
              minPrice: Number(item.minPrice || 0),
              estoque: Number(item.stock || 0),
              stock: Number(item.stock || 0),
              observacoes: item.description || '',
              description: item.description || '',
              updatedAt: serverTimestamp()
            });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `${item.type === 'service' ? 'servicos' : 'pecas'}/${item.id}`);
        }
      }
    },

    deleteCatalog: async (id) => {
      set((state) => ({ 
        catalog: state.catalog.filter(i => i.id !== id) 
      }));

      if (auth.currentUser) {
        try {
          await deleteDoc(doc(db, 'servicos', id));
          await deleteDoc(doc(db, 'pecas', id));
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `catalog/${id}`);
        }
      }
    },

    addOilChange: async (oilChange) => {
      set((state) => ({ oilChanges: [...state.oilChanges, oilChange] }));

      if (auth.currentUser) {
        try {
          await setDoc(doc(db, 'oil_changes', oilChange.id), {
            id: oilChange.id,
            vehicleId: oilChange.vehicleId,
            lastChangeDate: oilChange.lastChangeDate,
            lastChangeKm: Number(oilChange.lastChangeKm),
            nextChangeKm: Number(oilChange.nextChangeKm),
            oilType: oilChange.oilType,
            filterChanged: !!oilChange.filterChanged,
            observations: oilChange.observations || ''
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `oil_changes/${oilChange.id}`);
        }
      }
    },

    updateOilChange: async (oilChange) => {
      set((state) => ({ 
        oilChanges: state.oilChanges.map(o => o.id === oilChange.id ? oilChange : o) 
      }));

      if (auth.currentUser) {
        try {
          await setDoc(doc(db, 'oil_changes', oilChange.id), {
            id: oilChange.id,
            vehicleId: oilChange.vehicleId,
            lastChangeDate: oilChange.lastChangeDate,
            lastChangeKm: Number(oilChange.lastChangeKm),
            nextChangeKm: Number(oilChange.nextChangeKm),
            oilType: oilChange.oilType,
            filterChanged: !!oilChange.filterChanged,
            observations: oilChange.observations || ''
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `oil_changes/${oilChange.id}`);
        }
      }
    },

    updateSettings: async (settings) => {
      set({ settings });

      if (auth.currentUser) {
        try {
          await setDoc(doc(db, 'settings', 'general'), {
            name: settings.name,
            phone: settings.phone,
            address: settings.address,
            cnpj: settings.cnpj || '',
            email: settings.email || '',
            whatsappMessageTemplate: settings.whatsappMessageTemplate
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, 'settings/general');
        }
      }
    },

    clearStorage: async () => {
      set({
        clients: [],
        vehicles: [],
        services: [],
        catalog: [],
        oilChanges: [],
        settings: {
          name: 'Pit Stop App Oficina',
          phone: '',
          address: '',
          cnpj: '',
          email: '',
          whatsappMessageTemplate: 'Olá, [cliente]! Seu veículo [veiculo] está pronto.',
        }
      });
      if (auth.currentUser) {
        try {
          // Keep Firestore clean but can delete locally
        } catch (error) {
          console.error(error);
        }
      }
    },

    signOut: async () => {
      await firebaseSignOut(auth);
    }
  };
});
