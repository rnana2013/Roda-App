/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  Client, Vehicle, ServiceRecord, Budget, 
  CatalogItem, ShopSettings, OilChange 
} from './types';

interface AppState {
  clients: Client[];
  vehicles: Vehicle[];
  services: ServiceRecord[];
  catalog: CatalogItem[];
  oilChanges: OilChange[];
  settings: ShopSettings;

  // Actions
  addClient: (client: Client) => void;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;

  addVehicle: (vehicle: Vehicle) => void;
  updateVehicle: (vehicle: Vehicle) => void;
  deleteVehicle: (id: string) => void;

  addService: (service: ServiceRecord) => void;
  updateService: (service: ServiceRecord) => void;
  deleteService: (id: string) => void;

  addToCatalog: (item: CatalogItem) => void;
  updateCatalog: (item: CatalogItem) => void;
  deleteCatalog: (id: string) => void;

  addOilChange: (oilChange: OilChange) => void;
  updateOilChange: (oilChange: OilChange) => void;

  updateSettings: (settings: ShopSettings) => void;
  clearStorage: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      clients: [
        { id: 'c1', name: 'Ricardo Santos', phone: '(11) 98888-7777', whatsapp: '11988887777', email: 'ricardo@email.com', cpf: '123.456.789-00', address: 'Av. Paulista, 1000', createdAt: new Date().toISOString() },
        { id: 'c2', name: 'Maria Oliveira', phone: '(11) 97777-6666', whatsapp: '11977776666', email: 'maria@email.com', createdAt: new Date().toISOString() },
      ],
      vehicles: [
        { id: 'v1', clientId: 'c1', brand: 'Volkswagen', model: 'Gol 1.0', year: '2018', color: 'Branco', plate: 'BRA-2E19', km: 45000, fuelType: 'Flex', createdAt: new Date().toISOString() },
        { id: 'v2', clientId: 'c2', brand: 'Fiat', model: 'Argo', year: '2020', color: 'Cinza', plate: 'OFF-1234', km: 28000, fuelType: 'Flex', createdAt: new Date().toISOString() },
        { id: 'v3', clientId: 'c1', brand: 'Honda', model: 'Civic', year: '2022', color: 'Preto', plate: 'ROA-9999', km: 9500, fuelType: 'Flex', createdAt: new Date().toISOString() },
      ],
      services: [
        { 
          id: 's1', vehicleId: 'v1', clientId: 'c1', date: new Date().toISOString(), status: 'Em andamento', 
          items: [{ id: 'i1', name: 'Troca de Óleo', price: 150, quantity: 1, type: 'service' }],
          laborValue: 50, partsValue: 100, discount: 0, totalValue: 150, 
          paymentStatus: 'pendente', kmAtService: 45000, description: 'Revisão básica', createdAt: new Date().toISOString() 
        }
      ],
      catalog: [
        { id: '1', name: 'Troca de Óleo 5W30', type: 'service', category: 'Manutenção', suggestedPrice: 180, execTime: '30 min' },
        { id: '2', name: 'Alinhamento e Balanceamento', type: 'service', category: 'Suspensão', suggestedPrice: 120, execTime: '45 min' },
        { id: '3', name: 'Pastilha de Freio Bosch', type: 'part', category: 'Freios', suggestedPrice: 240, costPrice: 140, stock: 8, brand: 'Bosch' },
        { id: '4', name: 'Filtro de Ar de Cabine', type: 'part', category: 'Revisão', suggestedPrice: 45, costPrice: 22, stock: 15 },
        { id: '5', name: 'Lâmpada Farol H7', type: 'part', category: 'Elétrica', suggestedPrice: 35, costPrice: 15, stock: 2, brand: 'Osram' },
      ],
      oilChanges: [],
      settings: {
        name: 'Roda App Oficina',
        phone: '11999999999',
        address: 'Rua das Oficinas, 123',
        whatsappMessageTemplate: 'Olá, [cliente]! Seu veículo [veiculo] está pronto.',
      },

      addClient: (client) => set((state) => ({ clients: [...state.clients, client] })),
      updateClient: (client) => set((state) => ({ 
        clients: state.clients.map(c => c.id === client.id ? client : c) 
      })),
      deleteClient: (id) => set((state) => ({ 
        clients: state.clients.filter(c => c.id !== id),
        vehicles: state.vehicles.filter(v => v.clientId !== id)
      })),

      addVehicle: (vehicle) => set((state) => ({ vehicles: [...state.vehicles, vehicle] })),
      updateVehicle: (vehicle) => set((state) => ({ 
        vehicles: state.vehicles.map(v => v.id === vehicle.id ? vehicle : v) 
      })),
      deleteVehicle: (id) => set((state) => ({ 
        vehicles: state.vehicles.filter(v => v.id !== id),
        services: state.services.filter(s => s.vehicleId !== id),
      })),

      addService: (service) => set((state) => ({ services: [...state.services, service] })),
      updateService: (service) => set((state) => ({ 
        services: state.services.map(s => s.id === service.id ? service : s) 
      })),
      deleteService: (id) => set((state) => ({ 
        services: state.services.filter(s => s.id !== id) 
      })),

      addToCatalog: (item) => set((state) => ({ catalog: [...state.catalog, item] })),
      updateCatalog: (item) => set((state) => ({ 
        catalog: state.catalog.map(i => i.id === item.id ? item : i) 
      })),
      deleteCatalog: (id) => set((state) => ({ 
        catalog: state.catalog.filter(i => i.id !== id) 
      })),

      addOilChange: (oilChange) => set((state) => ({ oilChanges: [...state.oilChanges, oilChange] })),
      updateOilChange: (oilChange) => set((state) => ({ 
        oilChanges: state.oilChanges.map(o => o.id === oilChange.id ? oilChange : o) 
      })),

      updateSettings: (settings) => set({ settings }),
      clearStorage: () => {
        localStorage.clear();
        set({
          clients: [],
          vehicles: [],
          services: [],
          catalog: [],
          oilChanges: [],
          settings: {
            name: 'Roda App Oficina',
            phone: '',
            address: '',
            whatsappMessageTemplate: 'Olá, [cliente]! Seu veículo [veiculo] está pronto.',
          }
        });
      },
    }),
    {
      name: 'roda-app-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
