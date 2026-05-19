/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Client {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  cpf?: string;
  address?: string;
  observations?: string;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  clientId?: string;
  brand: string;
  model: string;
  year?: string;
  color?: string;
  plate: string;
  km?: number;
  fuelType?: 'Gasolina' | 'Etanol' | 'Diesel' | 'Flex' | 'Híbrido' | 'Elétrico';
  observations?: string;
  createdAt: string;
}

export type ServiceStatus = 
  | 'Aguardando avaliação' 
  | 'Orçamento enviado' 
  | 'Aprovado' 
  | 'Em andamento' 
  | 'Aguardando peça' 
  | 'Finalizado' 
  | 'Entregue';

export type PaymentStatus = 'pago' | 'pendente' | 'parcial';

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'part' | 'service';
}

export interface ServiceRecord {
  id: string;
  vehicleId: string;
  clientId?: string;
  date: string;
  status: ServiceStatus;
  items: ServiceItem[];
  laborValue: number;
  partsValue: number;
  discount: number;
  totalValue: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  kmAtService?: number;
  description: string;
  observations?: string;
  createdAt: string;
}

export interface OilChange {
  id: string;
  vehicleId: string;
  lastChangeDate: string;
  lastChangeKm: number;
  nextChangeKm: number;
  oilType: string;
  filterChanged: boolean;
  observations?: string;
}

export interface Budget {
  id: string;
  clientId?: string;
  vehicleId: string;
  date: string;
  items: ServiceItem[];
  laborValue: number;
  partsValue: number;
  discount: number;
  totalValue: number;
  status: 'Pendente' | 'Enviado' | 'Aprovado' | 'Recusado' | 'Convertido';
  observations?: string;
  createdAt: string;
}

export interface CatalogItem {
  id: string;
  name: string;
  type: 'service' | 'part';
  category: string;
  description?: string;
  minPrice?: number;
  suggestedPrice: number; // For parts, this is sale price
  costPrice?: number; // Only for parts
  execTime?: string; // Only for services
  stock?: number; // Only for parts
  code?: string;
  brand?: string;
}

export interface ShopSettings {
  name: string;
  phone: string;
  address: string;
  cnpj?: string;
  email?: string;
  whatsappMessageTemplate: string;
}
