import { collection, getDocs, writeBatch, doc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

export interface PartSeed {
  nome: string;
  categoria: string;
  marca: string;
  valorCusto: number;
  valorVenda: number;
  estoque: number;
}

export interface ServiceSeed {
  nome: string;
  categoria: string;
  valorPadrao: number;
  descricao: string;
}

export const initialParts: PartSeed[] = [
  { nome: "Filtro de Óleo", categoria: "Filtros", marca: "Tecfil", valorCusto: 15, valorVenda: 35, estoque: 15 },
  { nome: "Filtro de Ar", categoria: "Filtros", marca: "Tecfil", valorCusto: 20, valorVenda: 45, estoque: 12 },
  { nome: "Filtro de Combustível", categoria: "Filtros", marca: "Fram", valorCusto: 18, valorVenda: 40, estoque: 10 },
  { nome: "Filtro de Cabine", categoria: "Filtros", marca: "Tecfil", valorCusto: 22, valorVenda: 50, estoque: 8 },
  { nome: "Óleo 5W30", categoria: "Lubrificantes", marca: "Shell Helix", valorCusto: 25, valorVenda: 45, estoque: 30 },
  { nome: "Óleo 10W40", categoria: "Lubrificantes", marca: "Castrol Magnatec", valorCusto: 22, valorVenda: 42, estoque: 20 },
  { nome: "Óleo 15W40", categoria: "Lubrificantes", marca: "Mobil Super", valorCusto: 18, valorVenda: 35, estoque: 25 },
  { nome: "Óleo ATF", categoria: "Lubrificantes", marca: "Lubrax", valorCusto: 30, valorVenda: 60, estoque: 10 },
  { nome: "Fluido de Freio DOT3", categoria: "Fluidos", marca: "Varga", valorCusto: 12, valorVenda: 25, estoque: 15 },
  { nome: "Fluido de Freio DOT4", categoria: "Fluidos", marca: "Bosch", valorCusto: 16, valorVenda: 32, estoque: 15 },
  { nome: "Fluido de Direção Hidráulica", categoria: "Fluidos", marca: "Tutela", valorCusto: 25, valorVenda: 50, estoque: 8 },
  { nome: "Aditivo Radiador", categoria: "Arrefecimento", marca: "Paraflu", valorCusto: 15, valorVenda: 30, estoque: 20 },
  { nome: "Vela de Ignição", categoria: "Ignição", marca: "NGK", valorCusto: 12, valorVenda: 28, estoque: 24 },
  { nome: "Cabo de Vela", categoria: "Ignição", marca: "Bosch", valorCusto: 45, valorVenda: 85, estoque: 6 },
  { nome: "Bobina de Ignição", categoria: "Ignição", marca: "Marelli", valorCusto: 120, valorVenda: 220, estoque: 4 },
  { nome: "Bateria 45Ah", categoria: "Elétrica", marca: "Moura", valorCusto: 220, valorVenda: 390, estoque: 5 },
  { nome: "Bateria 60Ah", categoria: "Elétrica", marca: "Heliar", valorCusto: 280, valorVenda: 480, estoque: 8 },
  { nome: "Bateria 70Ah", categoria: "Elétrica", marca: "Moura", valorCusto: 350, valorVenda: 590, estoque: 3 },
  { nome: "Alternador", categoria: "Elétrica", marca: "Bosch", valorCusto: 450, valorVenda: 790, estoque: 2 },
  { nome: "Motor de Partida", categoria: "Elétrica", marca: "Valeo", valorCusto: 380, valorVenda: 650, estoque: 2 },
  { nome: "Fusível 10A", categoria: "Elétrica", marca: "Poli", valorCusto: 0.5, valorVenda: 2, estoque: 100 },
  { nome: "Fusível 15A", categoria: "Elétrica", marca: "Poli", valorCusto: 0.5, valorVenda: 2, estoque: 100 },
  { nome: "Fusível 20A", categoria: "Elétrica", marca: "Poli", valorCusto: 0.5, valorVenda: 2, estoque: 100 },
  { nome: "Lâmpada H4", categoria: "Iluminação", marca: "Philips", valorCusto: 12, valorVenda: 25, estoque: 20 },
  { nome: "Lâmpada H7", categoria: "Iluminação", marca: "Osram", valorCusto: 15, valorVenda: 30, estoque: 18 },
  { nome: "Lâmpada de Freio", categoria: "Iluminação", marca: "Autopoli", valorCusto: 2.5, valorVenda: 7, estoque: 50 },
  { nome: "Pastilha de Freio Dianteira", categoria: "Freios", marca: "Fras-le", valorCusto: 45, valorVenda: 95, estoque: 10 },
  { nome: "Pastilha de Freio Traseira", categoria: "Freios", marca: "Fras-le", valorCusto: 40, valorVenda: 85, estoque: 8 },
  { nome: "Disco de Freio Dianteiro", categoria: "Freios", marca: "Fremax", valorCusto: 85, valorVenda: 175, estoque: 6 },
  { nome: "Disco de Freio Traseiro", categoria: "Freios", marca: "Fremax", valorCusto: 75, valorVenda: 150, estoque: 4 },
  { nome: "Lona de Freio", categoria: "Freios", marca: "Fras-le", valorCusto: 35, valorVenda: 75, estoque: 6 },
  { nome: "Cilindro Mestre", categoria: "Freios", marca: "Controil", valorCusto: 110, valorVenda: 220, estoque: 3 },
  { nome: "Servo Freio", categoria: "Freios", marca: "TRW", valorCusto: 190, valorVenda: 350, estoque: 2 },
  { nome: "Amortecedor Dianteiro", categoria: "Suspensão", marca: "Cofap", valorCusto: 175, valorVenda: 340, estoque: 8 },
  { nome: "Amortecedor Traseiro", categoria: "Suspensão", marca: "Cofap", valorCusto: 145, valorVenda: 280, estoque: 8 },
  { nome: "Mola Dianteira", categoria: "Suspensão", marca: "Fabrini", valorCusto: 80, valorVenda: 160, estoque: 4 },
  { nome: "Mola Traseira", categoria: "Suspensão", marca: "Fabrini", valorCusto: 70, valorVenda: 140, estoque: 4 },
  { nome: "Bandeja Inferior", categoria: "Suspensão", marca: "Nakata", valorCusto: 120, valorVenda: 240, estoque: 4 },
  { nome: "Pivô de Suspensão", categoria: "Suspensão", marca: "Nakata", valorCusto: 30, valorVenda: 70, estoque: 12 },
  { nome: "Terminal de Direção", categoria: "Direção", marca: "TRW", valorCusto: 35, valorVenda: 75, estoque: 10 },
  { nome: "Barra Axial", categoria: "Direção", marca: "Nakata", valorCusto: 40, valorVenda: 85, estoque: 8 },
  { nome: "Caixa de Direção", categoria: "Direção", marca: "TRW", valorCusto: 450, valorVenda: 890, estoque: 2 },
  { nome: "Bieleta", categoria: "Suspensão", marca: "Cofap", valorCusto: 18, valorVenda: 42, estoque: 16 },
  { nome: "Bucha de Bandeja", categoria: "Suspensão", marca: "Axios", valorCusto: 12, valorVenda: 30, estoque: 24 },
  { nome: "Rolamento Dianteiro", categoria: "Suspensão", marca: "SKF", valorCusto: 50, valorVenda: 110, estoque: 10 },
  { nome: "Rolamento Traseiro", categoria: "Suspensão", marca: "SKF", valorCusto: 40, valorVenda: 90, estoque: 10 },
  { nome: "Homocinética", categoria: "Transmissão", marca: "Spicer", valorCusto: 70, valorVenda: 150, estoque: 6 },
  { nome: "Cubo de Roda", categoria: "Suspensão", marca: "ALBARUS", valorCusto: 65, valorVenda: 130, estoque: 6 },
  { nome: "Correia Dentada", categoria: "Motor", marca: "Gates", valorCusto: 45, valorVenda: 90, estoque: 12 },
  { nome: "Correia Auxiliar", categoria: "Motor", marca: "Contitech", valorCusto: 25, valorVenda: 55, estoque: 14 },
  { nome: "Tensor da Correia", categoria: "Motor", marca: "Ina", valorCusto: 55, valorVenda: 115, estoque: 8 },
  { nome: "Bomba D'Água", categoria: "Arrefecimento", marca: "Urba", valorCusto: 85, valorVenda: 165, estoque: 6 },
  { nome: "Junta do Cabeçote", categoria: "Motor", marca: "Sabó", valorCusto: 50, valorVenda: 110, estoque: 5 },
  { nome: "Junta da Tampa de Válvulas", categoria: "Motor", marca: "Sabó", valorCusto: 15, valorVenda: 35, estoque: 10 },
  { nome: "Retentor de Comando", categoria: "Motor", marca: "Sabó", valorCusto: 10, valorVenda: 25, estoque: 12 },
  { nome: "Retentor de Virabrequim", categoria: "Motor", marca: "Sabó", valorCusto: 15, valorVenda: 35, estoque: 10 },
  { nome: "Sensor de Rotação", categoria: "Elétrica", marca: "Bosch", valorCusto: 60, valorVenda: 120, estoque: 4 },
  { nome: "Sensor MAP", categoria: "Injeção Eletrônica", marca: "MTE", valorCusto: 75, valorVenda: 150, estoque: 4 },
  { nome: "Sensor TPS", categoria: "Injeção Eletrônica", marca: "Marelli", valorCusto: 50, valorVenda: 100, estoque: 5 },
  { nome: "Sensor de Temperatura", categoria: "Injeção Eletrônica", marca: "MTE", valorCusto: 20, valorVenda: 45, estoque: 10 },
  { nome: "Bico Injetor", categoria: "Injeção Eletrônica", marca: "Bosch", valorCusto: 85, valorVenda: 170, estoque: 8 },
  { nome: "Corpo de Borboleta", categoria: "Injeção Eletrônica", marca: "Marelli", valorCusto: 320, valorVenda: 590, estoque: 2 },
  { nome: "Bomba de Combustível", categoria: "Injeção Eletrônica", marca: "Bosch", valorCusto: 110, valorVenda: 210, estoque: 6 },
  { nome: "Regulador de Pressão", categoria: "Injeção Eletrônica", marca: "DS", valorCusto: 40, valorVenda: 90, estoque: 5 },
  { nome: "Mangueira de Combustível", categoria: "Injeção Eletrônica", marca: "Gates", valorCusto: 15, valorVenda: 35, estoque: 15 },
  { nome: "Radiador", categoria: "Arrefecimento", marca: "Visconde", valorCusto: 210, valorVenda: 410, estoque: 3 },
  { nome: "Reservatório de Expansão", categoria: "Arrefecimento", marca: "Gonel", valorCusto: 25, valorVenda: 55, estoque: 8 },
  { nome: "Válvula Termostática", categoria: "Arrefecimento", marca: "MTE", valorCusto: 40, valorVenda: 85, estoque: 6 },
  { nome: "Eletroventilador", categoria: "Arrefecimento", marca: "Bosch", valorCusto: 170, valorVenda: 330, estoque: 2 },
  { nome: "Mangueira Superior Radiador", categoria: "Arrefecimento", marca: "Gates", valorCusto: 18, valorVenda: 40, estoque: 5 },
  { nome: "Mangueira Inferior Radiador", categoria: "Arrefecimento", marca: "Gates", valorCusto: 20, valorVenda: 45, estoque: 5 },
  { nome: "Compressor de Ar", categoria: "Ar Condicionado", marca: "Denso", valorCusto: 600, valorVenda: 1100, estoque: 2 },
  { nome: "Condensador", categoria: "Ar Condicionado", marca: "Denso", valorCusto: 230, valorVenda: 450, estoque: 3 },
  { nome: "Evaporador", categoria: "Ar Condicionado", marca: "Magneti Marelli", valorCusto: 180, valorVenda: 360, estoque: 2 },
  { nome: "Filtro Secador", categoria: "Ar Condicionado", marca: "Mastercool", valorCusto: 30, valorVenda: 65, estoque: 8 },
  { nome: "Correia do Ar Condicionado", categoria: "Ar Condicionado", marca: "Dayco", valorCusto: 15, valorVenda: 35, estoque: 10 },
  { nome: "Escapamento", categoria: "Escapamento", marca: "Mastra", valorCusto: 130, valorVenda: 250, estoque: 3 },
  { nome: "Catalisador", categoria: "Escapamento", marca: "Mastra", valorCusto: 340, valorVenda: 650, estoque: 2 },
  { nome: "Silencioso Traseiro", categoria: "Escapamento", marca: "Tuper", valorCusto: 100, valorVenda: 200, estoque: 4 },
  { nome: "Coxim do Motor", categoria: "Suportes", marca: "Sampel", valorCusto: 60, valorVenda: 120, estoque: 6 },
  { nome: "Coxim do Câmbio", categoria: "Suportes", marca: "Sampel", valorCusto: 50, valorVenda: 100, estoque: 6 },
  { nome: "Trizeta", categoria: "Transmissão", marca: "Spicer", valorCusto: 30, valorVenda: 70, estoque: 8 },
  { nome: "Cruzeta", categoria: "Transmissão", marca: "Spicer", valorCusto: 35, valorVenda: 80, estoque: 6 },
  { nome: "Semi Eixo", categoria: "Transmissão", marca: "Cofap", valorCusto: 170, valorVenda: 340, estoque: 3 },
  { nome: "Retentor de Caixa", categoria: "Transmissão", marca: "Sabó", valorCusto: 12, valorVenda: 30, estoque: 10 },
  { nome: "Óleo de Câmbio", categoria: "Lubrificantes", marca: "Tutela", valorCusto: 25, valorVenda: 50, estoque: 15 },
  { nome: "Jogo de Juntas", categoria: "Motor", marca: "Sabó", valorCusto: 110, valorVenda: 220, estoque: 4 },
  { nome: "Tampa do Radiador", categoria: "Arrefecimento", marca: "Valclei", valorCusto: 10, valorVenda: 25, estoque: 12 },
  { nome: "Sensor ABS", categoria: "Segurança", marca: "Bosch", valorCusto: 70, valorVenda: 140, estoque: 4 },
  { nome: "Cubo ABS", categoria: "Segurança", marca: "FAG", valorCusto: 130, valorVenda: 260, estoque: 4 },
  { nome: "Módulo ABS", categoria: "Segurança", marca: "Bosch", valorCusto: 800, valorVenda: 1500, estoque: 1 },
  { nome: "Chicote Elétrico", categoria: "Elétrica", marca: "TC", valorCusto: 40, valorVenda: 85, estoque: 5 },
  { nome: "Relé Universal", categoria: "Elétrica", marca: "DNI", valorCusto: 5, valorVenda: 15, estoque: 30 },
  { nome: "Interruptor de Freio", categoria: "Elétrica", marca: "3RHO", valorCusto: 12, valorVenda: 28, estoque: 10 },
  { nome: "Interruptor de Ré", categoria: "Elétrica", marca: "3RHO", valorCusto: 15, valorVenda: 32, estoque: 10 },
  { nome: "Fechadura Porta", categoria: "Acessórios", marca: "Universal", valorCusto: 40, valorVenda: 90, estoque: 4 },
  { nome: "Máquina de Vidro", categoria: "Acessórios", marca: "Micro", valorCusto: 70, valorVenda: 150, estoque: 4 },
  { nome: "Motor Limpador Para-brisa", categoria: "Elétrica", marca: "Bosch", valorCusto: 100, valorVenda: 195, estoque: 2 },
  { nome: "Palheta Limpador", categoria: "Acessórios", marca: "Dyna", valorCusto: 15, valorVenda: 35, estoque: 25 },
  { nome: "Reservatório Água Limpador", categoria: "Arrefecimento", marca: "Gonel", valorCusto: 18, valorVenda: 40, estoque: 5 }
];

export const initialServices: ServiceSeed[] = [
  { nome: "Troca de Óleo", categoria: "Lubrificação", valorPadrao: 60, descricao: "Substituição completa do óleo do motor e arruela do bujão." },
  { nome: "Troca de Filtro de Óleo", categoria: "Lubrificação", valorPadrao: 30, descricao: "Substituição ou higienização do alojamento do filtro de óleo." },
  { nome: "Troca de Filtro de Ar", categoria: "Revisão", valorPadrao: 25, descricao: "Troca do elemento filtrante do ar de admissão do motor." },
  { nome: "Troca de Filtro de Combustível", categoria: "Alimentação", valorPadrao: 35, descricao: "Substituição do filtro de combustível externo da linha de pressão." },
  { nome: "Troca de Filtro de Cabine", categoria: "Ar Condicionado", valorPadrao: 30, descricao: "Troca do filtro de cabine e limpeza superficial do duto." },
  { nome: "Alinhamento", categoria: "Geometria", valorPadrao: 90, descricao: "Alinhamento técnico da geometria dianteira e traseira das rodas." },
  { nome: "Balanceamento", categoria: "Geometria", valorPadrao: 15, descricao: "Balanceamento dinâmico de rodas por unidade." },
  { nome: "Cambagem", categoria: "Geometria", valorPadrao: 80, descricao: "Correção do ângulo excessivo da inclinação vertical (Camber)." },
  { nome: "Rodízio de Pneus", categoria: "Pneus", valorPadrao: 20, descricao: "Inversão programada da posição de pneus dianteiros e traseiros." },
  { nome: "Troca de Pneus", categoria: "Pneus", valorPadrao: 30, descricao: "Desmontagem do pneu antigo e montagem do pneu novo com bico." },
  { nome: "Conserto de Pneus", categoria: "Pneus", valorPadrao: 25, descricao: "Reparo rápido de perfurações por prego/parafuso com macarrão." },
  { nome: "Vulcanização", categoria: "Pneus", valorPadrao: 60, descricao: "Vulcanização química de pneus com dano lateral ou estrutural médio." },
  { nome: "Troca de Pastilhas", categoria: "Freios", valorPadrao: 120, descricao: "Substituição de pastilhas de freio do eixo dianteiro ou traseiro." },
  { nome: "Troca de Discos", categoria: "Freios", valorPadrao: 140, descricao: "Substituição de discos de freio combinada à troca de pastilhas." },
  { nome: "Troca de Lonas", categoria: "Freios", valorPadrao: 160, descricao: "Remoção e troca de jogo de sapatas e lonas de tambor traseiras." },
  { nome: "Sangria do Freio", categoria: "Freios", valorPadrao: 50, descricao: "Sangria de fluido velho e remoção de ar no encanamento de freio." },
  { nome: "Troca de Fluido de Freio", categoria: "Freios", valorPadrao: 90, descricao: "Substituição com máquina de vácuo de todo o fluido DOT do sistema." },
  { nome: "Troca de Amortecedores", categoria: "Suspensão", valorPadrao: 250, descricao: "Substituição do par de amortecedores dianteiros ou traseiros com batentes." },
  { nome: "Troca de Molas", categoria: "Suspensão", valorPadrao: 180, descricao: "Substituição de molas helicoidais de carga em par por eixo." },
  { nome: "Troca de Pivôs", categoria: "Suspensão", valorPadrao: 80, descricao: "Troca de pivô inferior de articulação da suspensão (unidade)." },
  { nome: "Troca de Bandejas", categoria: "Suspensão", valorPadrao: 150, descricao: "Remoção e instalação de bandeja inferior de suspensão nova oscilante." },
  { nome: "Troca de Buchas", categoria: "Suspensão", valorPadrao: 90, descricao: "Troca das buchas de bandeja hidráulica ou de borracha maciça." },
  { nome: "Troca de Terminais", categoria: "Direção", valorPadrao: 70, descricao: "Troca de terminal articulado de direção e barra axial." },
  { nome: "Troca de Caixa de Direção", categoria: "Direção", valorPadrao: 380, descricao: "Troca da caixa de direção mecânica ou assistência hidráulica e sangria." },
  { nome: "Troca de Bieletas", categoria: "Suspensão", valorPadrao: 40, descricao: "Substituição em par das bieletas estabilizadoras de impacto." },
  { nome: "Troca de Homocinética", categoria: "Transmissão", valorPadrao: 140, descricao: "Troca de junta homocinética de tração lateral ou tulipa de câmbio." },
  { nome: "Troca de Rolamentos", categoria: "Suspensão", valorPadrao: 130, descricao: "Substituição completa do rolamento de roda na prensa de alta tonelagem." },
  { nome: "Troca de Correia Dentada", categoria: "Motor", valorPadrao: 350, descricao: "Troca de correia dentada de timing valvular com sincronismo preciso." },
  { nome: "Troca de Correia Auxiliar", categoria: "Motor", valorPadrao: 80, descricao: "Substituição de correiras micro-v do alternador ou polia do motor." },
  { nome: "Troca de Tensor", categoria: "Motor", valorPadrao: 120, descricao: "Remoção de tensor barulhento e substituição do conjunto polia esticador." },
  { nome: "Troca de Bomba D'Água", categoria: "Arrefecimento", valorPadrao: 220, descricao: "Instalação de bomba de fluxo centrífugo d'água no motor." },
  { nome: "Limpeza de Bicos", categoria: "Injeção Eletrônica", valorPadrao: 180, descricao: "Processo de ultrassom na cuba injetora e equalização de fluxo em bancada." },
  { nome: "Teste de Bicos", categoria: "Injeção Eletrônica", valorPadrao: 60, descricao: "Diagnóstico simples na bancada de ensaio de injetores." },
  { nome: "Troca de Velas", categoria: "Ignição", valorPadrao: 80, descricao: "Substituição e calibração de jogo de velas de ignição do motor." },
  { nome: "Troca de Cabos", categoria: "Ignição", valorPadrao: 60, descricao: "Substituição de cabos supressores de ignição de alta voltagem." },
  { nome: "Troca de Bobinas", categoria: "Ignição", valorPadrao: 70, descricao: "Diagnóstico e troca da bobina ou régua de ignição integrada." },
  { nome: "Diagnóstico Eletrônico", categoria: "Injeção Eletrônica", valorPadrao: 120, descricao: "Passagem completa do scanner de alta resolução e verificação de sensores." },
  { nome: "Scanner Automotivo", categoria: "Injeção Eletrônica", valorPadrao: 90, descricao: "Apenas leitura rápida de falhas armazenadas e limpeza de histórico de erros." },
  { nome: "Troca de Bateria", categoria: "Elétrica", valorPadrao: 40, descricao: "Substituição física do acumulador elétrico e teste dinâmico do alternador." },
  { nome: "Teste de Bateria", categoria: "Elétrica", valorPadrao: 30, descricao: "Teste avançado com analisador de condutância e teste de partida rápida." },
  { nome: "Troca de Alternador", categoria: "Elétrica", valorPadrao: 240, descricao: "Substituição do alternador e conferência das polias de acessorios." },
  { nome: "Troca de Motor de Partida", categoria: "Elétrica", valorPadrao: 220, descricao: "Substituição de motor de partida de partida e solenoide." },
  { nome: "Recarga de Ar Condicionado", categoria: "Ar Condicionado", valorPadrao: 160, descricao: "Exaustão de vácuo, verificação de vazamento básico e recarga com gás R134a." },
  { nome: "Higienização de Ar Condicionado", categoria: "Ar Condicionado", valorPadrao: 90, descricao: "Oxi-sanitização com gerador ativo de ozônio ou nebulização bactericida." },
  { nome: "Limpeza de TBI", categoria: "Injeção Eletrônica", valorPadrao: 110, descricao: "Descarbonização química do corpo de borboletas acelerador eletrônico." },
  { nome: "Troca de Radiador", categoria: "Arrefecimento", valorPadrao: 260, descricao: "Remoção de radiador ineficiente ou furado e substituição completa." },
  { nome: "Troca de Bomba de Combustível", categoria: "Alimentação", valorPadrao: 180, descricao: "Troca completa do refil de pressão no módulo de combustivel do tanque." },
  { nome: "Troca de Escapamento", categoria: "Escapamento", valorPadrao: 130, descricao: "Remoção de tubulações rotas ou abafador ineficiente." },
  { nome: "Revisão Básica", categoria: "Revisão", valorPadrao: 250, descricao: "Inspeção geral de fluídos nível cor, pastilhas, suspensão visual de borracha." },
  { nome: "Revisão Completa", categoria: "Revisão", valorPadrao: 550, descricao: "Check-up estruturado de 80 pontos, suspensão, freios, injeção e teste prático." }
];

export async function popularCatalogoInicial(): Promise<{ pecas: number; servicos: number }> {
  console.log("Iniciando rotina popularCatalogoInicial()...");
  let pecasInseridas = 0;
  let servicosInseridas = 0;

  try {
    // 1. Check existing Parts in collection 'pecas'
    const pecasCollectionRef = collection(db, "pecas");
    const pecasQuerySnapshot = await getDocs(pecasCollectionRef);
    const existingPartsNames = new Set(
      pecasQuerySnapshot.docs.map(doc => (doc.data().nome || doc.data().name || '').toLowerCase().trim())
    );

    // 2. Filter parts that don't exist yet
    const nonExistingParts = initialParts.filter(part => !existingPartsNames.has(part.nome.toLowerCase().trim()));

    if (nonExistingParts.length > 0) {
      console.log(`Encontradas ${nonExistingParts.length} peças novas para cadastrar no Firestore...`);
      
      // Firestore batch supports up to 500 operations. Since we have up to 100 parts, we can batch easily.
      const batchParts = writeBatch(db);
      nonExistingParts.forEach((part) => {
        const docRef = doc(pecasCollectionRef);
        batchParts.set(docRef, {
          nome: part.nome,
          categoria: part.categoria,
          marca: part.marca,
          valorCusto: Number(part.valorCusto),
          valorVenda: Number(part.valorVenda),
          estoque: Number(part.estoque),
          createdAt: serverTimestamp()
        });
        pecasInseridas++;
      });
      await batchParts.commit();
      console.log(`Batch de ${pecasInseridas} peças inserido com sucesso.`);
    } else {
      console.log("Todas as 100 peças iniciais já existem no Firestore.");
    }

    // 3. Check existing Services in 'servicos'
    const servicosCollectionRef = collection(db, "servicos");
    const servicosQuerySnapshot = await getDocs(servicosCollectionRef);
    const existingServicesNames = new Set(
      servicosQuerySnapshot.docs.map(doc => (doc.data().nome || doc.data().name || '').toLowerCase().trim())
    );

    // 4. Filter services that don't exist yet
    const nonExistingServices = initialServices.filter(service => !existingServicesNames.has(service.nome.toLowerCase().trim()));

    if (nonExistingServices.length > 0) {
      console.log(`Encontrados ${nonExistingServices.length} serviços novos para cadastrar no Firestore...`);
      const batchServices = writeBatch(db);
      nonExistingServices.forEach((service) => {
        const docRef = doc(servicosCollectionRef);
        batchServices.set(docRef, {
          nome: service.nome,
          categoria: service.categoria,
          valorPadrao: Number(service.valorPadrao),
          descricao: service.descricao,
          createdAt: serverTimestamp()
        });
        servicosInseridas++;
      });
      await batchServices.commit();
      console.log(`Batch de ${servicosInseridas} serviços inserido com sucesso.`);
    } else {
      console.log("Todos os 50 serviços iniciais já existem no Firestore.");
    }

    // Print summary log to satisfy both requirements
    console.log(`Peças inseridas: ${pecasInseridas}. Serviços inseridos: ${servicosInseridas}.`);
    console.log("Catálogo inicial carregado com sucesso");

    return { pecas: pecasInseridas, servicos: servicosInseridas };
  } catch (error) {
    console.error("Falha ao rodar popularCatalogoInicial():", error);
    throw error;
  }
}
