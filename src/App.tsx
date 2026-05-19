/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './screens/Dashboard';
import Clients from './screens/Clients';
import Vehicles from './screens/Vehicles';
import Services from './screens/Services';
import Catalog from './screens/Catalog';
import Calendar from './screens/Calendar';
import Receipt from './screens/Receipt';
import Budgets from './screens/Budgets';
import Financial from './screens/Financial';
import Settings from './screens/Settings';
import { useStore } from './store';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="clientes" element={<Clients />} />
          <Route path="veiculos" element={<Vehicles />} />
          <Route path="calendario" element={<Calendar />} />
          <Route path="servicos" element={<Services />} />
          <Route path="recibo/:id" element={<Receipt />} />
          <Route path="orcamentos" element={<Budgets />} />
          <Route path="catalogo" element={<Catalog />} />
          <Route path="financeiro" element={<Financial />} />
          <Route path="configuracoes" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
