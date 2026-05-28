import { collection, getDocs, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';

export interface DefaultServiceDef {
  nome: string;
  categoria: string;
  valorPadrao: number;
  descricao: string;
}

export const defaultServices: DefaultServiceDef[] = [
  { nome: 'Troca de óleo', categoria: 'Lubrificação', valorPadrao: 80, descricao: 'Substituição do óleo do motor' },
  { nome: 'Troca de filtro de óleo', categoria: 'Lubrificação', valorPadrao: 0, descricao: 'Substituição do filtro de óleo' },
  { nome: 'Troca de filtro de ar', categoria: 'Motor', valorPadrao: 0, descricao: 'Substituição do filtro de ar do motor' },
  { nome: 'Troca de filtro de combustível', categoria: 'Motor', valorPadrao: 0, descricao: 'Substituição do filtro de combustível' },
  { nome: 'Troca de filtro de cabine', categoria: 'Ar Condicionado', valorPadrao: 0, descricao: 'Substituição do filtro do ar condicionado' },
  { nome: 'Alinhamento', categoria: 'Direção', valorPadrao: 60, descricao: 'Alinhamento de direção' },
  { nome: 'Balanceamento', categoria: 'Pneus', valorPadrao: 15, descricao: 'Balanceamento de rodas' },
  { nome: 'Cambagem', categoria: 'Suspensão', valorPadrao: 80, descricao: 'Cambagem de rodas' },
  { nome: 'Caster', categoria: 'Suspensão', valorPadrao: 0, descricao: 'Ajuste de caster' },
  { nome: 'Rodízio de pneus', categoria: 'Pneus', valorPadrao: 0, descricao: 'Giro e posicionamento de pneus' },
  { nome: 'Troca de pneus', categoria: 'Pneus', valorPadrao: 0, descricao: 'Substituição de pneus' },
  { nome: 'Conserto de pneus', categoria: 'Pneus', valorPadrao: 0, descricao: 'Reparo e conserto de pneus' },
  { nome: 'Vulcanização', categoria: 'Pneus', valorPadrao: 0, descricao: 'Conserto térmico de pneus' },
  { nome: 'Montagem de pneus', categoria: 'Pneus', valorPadrao: 0, descricao: 'Instalação de pneus na roda' },
  { nome: 'Desmontagem de pneus', categoria: 'Pneus', valorPadrao: 0, descricao: 'Retirada de pneus da roda' },
  { nome: 'Troca de pastilhas de freio', categoria: 'Freios', valorPadrao: 120, descricao: 'Substituição de pastilhas de freio' },
  { nome: 'Troca de discos de freio', categoria: 'Freios', valorPadrao: 0, descricao: 'Substituição de discos de freio' },
  { nome: 'Troca de lonas de freio', categoria: 'Freios', valorPadrao: 0, descricao: 'Substituição de lonas de freio traseiras' },
  { nome: 'Sangria do freio', categoria: 'Freios', valorPadrao: 0, descricao: 'Sangria do sistema hidráulico de freio' },
  { nome: 'Troca de fluido de freio', categoria: 'Freios', valorPadrao: 0, descricao: 'Substituição completa de fluido de freio' },
  { nome: 'Troca de amortecedores', categoria: 'Suspensão', valorPadrao: 250, descricao: 'Substituição de amortecedores' },
  { nome: 'Troca de molas', categoria: 'Suspensão', valorPadrao: 0, descricao: 'Substituição de molas de suspensão' },
  { nome: 'Troca de pivôs', categoria: 'Suspensão', valorPadrao: 0, descricao: 'Substituição de pivôs da suspensão' },
  { nome: 'Troca de bandejas', categoria: 'Suspensão', valorPadrao: 0, descricao: 'Substituição de braços/bandejas oscilantes' },
  { nome: 'Troca de buchas', categoria: 'Suspensão', valorPadrao: 0, descricao: 'Substituição de buchas de suspensão' },
  { nome: 'Troca de terminais de direção', categoria: 'Direção', valorPadrao: 0, descricao: 'Substituição de terminais' },
  { nome: 'Troca de caixa de direção', categoria: 'Direção', valorPadrao: 0, descricao: 'Substituição do conjunto de caixa de direção' },
  { nome: 'Troca de bieletas', categoria: 'Suspensão', valorPadrao: 0, descricao: 'Substituição de bieletas estabilizadoras' },
  { nome: 'Troca de homocinética', categoria: 'Suspensão', valorPadrao: 0, descricao: 'Substituição de juntas homocinéticas' },
  { nome: 'Troca de rolamento', categoria: 'Suspensão', valorPadrao: 0, descricao: 'Substituição de rolamentos de roda' },
  { nome: 'Troca de cubo de roda', categoria: 'Suspensão', valorPadrao: 0, descricao: 'Substituição do cubo de roda' },
  { nome: 'Troca de correia dentada', categoria: 'Motor', valorPadrao: 350, descricao: 'Substituição de correia dentada de sincronismo' },
  { nome: 'Troca de correia auxiliar', categoria: 'Motor', valorPadrao: 0, descricao: 'Substituição de correias de acessórios' },
  { nome: 'Troca de tensor', categoria: 'Motor', valorPadrao: 0, descricao: 'Substituição de tensores e polias' },
  { nome: 'Troca de bomba d\'água', categoria: 'Arrefecimento', valorPadrao: 0, descricao: 'Substituição de bomba d\'água' },
  { nome: 'Troca de junta do cabeçote', categoria: 'Motor', valorPadrao: 0, descricao: 'Substituição de junta do cabeçote' },
  { nome: 'Retífica de cabeçote', categoria: 'Motor', valorPadrao: 0, descricao: 'Serviço de retífica de cabeçote' },
  { nome: 'Limpeza de bicos', categoria: 'Injeção Eletrônica', valorPadrao: 180, descricao: 'Limpeza e teste de injetores' },
  { nome: 'Teste de bicos', categoria: 'Injeção Eletrônica', valorPadrao: 0, descricao: 'Teste em máquina de bicos injetores' },
  { nome: 'Troca de velas', categoria: 'Injeção Eletrônica', valorPadrao: 0, descricao: 'Substituição de velas de ignição' },
  { nome: 'Troca de cabos de vela', categoria: 'Injeção Eletrônica', valorPadrao: 0, descricao: 'Substituição de cabos de ignição' },
  { nome: 'Troca de bobinas', categoria: 'Elétrica', valorPadrao: 0, descricao: 'Substituição de bobinas de ignição' },
  { nome: 'Diagnóstico eletrônico', categoria: 'Injeção Eletrônica', valorPadrao: 80, descricao: 'Diagnóstico geral com scanner' },
  { nome: 'Scanner automotivo', categoria: 'Injeção Eletrônica', valorPadrao: 50, descricao: 'Análise de falhas via scanner' },
  { nome: 'Troca de bateria', categoria: 'Elétrica', valorPadrao: 0, descricao: 'Substituição de bateria automotiva' },
  { nome: 'Teste de bateria', categoria: 'Elétrica', valorPadrao: 0, descricao: 'Teste de carga de bateria e alternador' },
  { nome: 'Troca de alternador', categoria: 'Elétrica', valorPadrao: 0, descricao: 'Substituição do alternador' },
  { nome: 'Troca de motor de partida', categoria: 'Elétrica', valorPadrao: 0, descricao: 'Substituição do motor de arranque' },
  { nome: 'Troca de lâmpadas', categoria: 'Elétrica', valorPadrao: 0, descricao: 'Substituição de lâmpadas de sinalização' },
  { nome: 'Troca de fusíveis', categoria: 'Elétrica', valorPadrao: 0, descricao: 'Substituição de fusíveis queimados' },
  { nome: 'Troca de chicote elétrico', categoria: 'Elétrica', valorPadrao: 0, descricao: 'Reparo ou troca de chicote elétrico' },
  { nome: 'Instalação de som', categoria: 'Elétrica', valorPadrao: 0, descricao: 'Instalação de som automotivo' },
  { nome: 'Instalação de alarme', categoria: 'Elétrica', valorPadrao: 0, descricao: 'Instalação de kit de alarme' },
  { nome: 'Instalação de rastreador', categoria: 'Elétrica', valorPadrao: 0, descricao: 'Instalação e configuração de rastreador' },
  { nome: 'Instalação de câmera de ré', categoria: 'Elétrica', valorPadrao: 0, descricao: 'Instalação de câmera de marcha ré/sensores' },
  { nome: 'Recarga de ar condicionado', categoria: 'Ar Condicionado', valorPadrao: 180, descricao: 'Substituição/Recarga de gás refrigerante r134a' },
  { nome: 'Troca de compressor', categoria: 'Ar Condicionado', valorPadrao: 0, descricao: 'Substituição de compressor de ar condicionado' },
  { nome: 'Troca de condensador', categoria: 'Ar Condicionado', valorPadrao: 0, descricao: 'Substituição de condensador' },
  { nome: 'Troca de evaporador', categoria: 'Ar Condicionado', valorPadrao: 0, descricao: 'Substituição de evaporador' },
  { nome: 'Higienização de ar condicionado', categoria: 'Ar Condicionado', valorPadrao: 0, descricao: 'Higienização interna com ozônio/aplicação' },
  { nome: 'Revisão básica', categoria: 'Revisão', valorPadrao: 150, descricao: 'Revisão de itens básicos de segurança' },
  { nome: 'Revisão completa', categoria: 'Revisão', valorPadrao: 450, descricao: 'Revisão geral' },
  { nome: 'Troca de óleo de câmbio', categoria: 'Transmissão', valorPadrao: 0, descricao: 'Substituição de fluído da transmissão' },
  { nome: 'Troca de óleo de direção hidráulica', categoria: 'Direção', valorPadrao: 0, descricao: 'Substituição do fluído de direção' },
  { nome: 'Limpeza de TBI', categoria: 'Injeção Eletrônica', valorPadrao: 0, descricao: 'Limpeza de corpo de borboleta' },
  { nome: 'Limpeza do sistema de arrefecimento', categoria: 'Arrefecimento', valorPadrao: 0, descricao: 'Limpeza e aditivação do sistema de arrefecimento' },
  { nome: 'Troca de radiador', categoria: 'Arrefecimento', valorPadrao: 0, descricao: 'Substituição de radiador de resfriamento' },
  { nome: 'Troca de reservatório', categoria: 'Arrefecimento', valorPadrao: 0, descricao: 'Substituição de reservatório de expansão' },
  { nome: 'Troca de válvula termostática', categoria: 'Arrefecimento', valorPadrao: 0, descricao: 'Substituição de válvula termostática' },
  { nome: 'Troca de sensor', categoria: 'Injeção Eletrônica', valorPadrao: 0, descricao: 'Substituição de sensores do motor' },
  { nome: 'Troca de bomba de combustível', categoria: 'Injeção Eletrônica', valorPadrao: 0, descricao: 'Substituição de bomba de combustível' },
  { nome: 'Troca de tanque de combustível', categoria: 'Injeção Eletrônica', valorPadrao: 0, descricao: 'Substituição de tanque' },
  { nome: 'Diagnóstico de injeção eletrônica', categoria: 'Injeção Eletrônica', valorPadrao: 0, descricao: 'Análise detalhada do sistema de injeção' },
  { nome: 'Troca de escapamento', categoria: 'Escapamento', valorPadrao: 0, descricao: 'Substituição de itens de escapamento' },
  { nome: 'Solda de escapamento', categoria: 'Escapamento', valorPadrao: 0, descricao: 'Serviço de soldagem em tubulação' },
  { nome: 'Troca de catalisador', categoria: 'Escapamento', valorPadrao: 0, descricao: 'Substituição de conversor catalítico' },
  { nome: 'Troca de silencioso', categoria: 'Escapamento', valorPadrao: 0, descricao: 'Substituição de abafador silencioso traseiro' }
];

export async function popularServicosPadrao(): Promise<number> {
  console.log("Tentando inicializar popularServicosPadrao...");
  try {
    const servicesCollectionRef = collection(db, "servicos");
    const querySnapshot = await getDocs(servicesCollectionRef);
    
    if (querySnapshot.empty) {
      console.log("A coleção 'servicos' está vazia! Cadastrando serviços automotivos automáticos...");
      const batch = writeBatch(db);
      
      let insertedCount = 0;
      defaultServices.forEach((service) => {
        const docRef = doc(servicesCollectionRef);
        batch.set(docRef, {
          nome: service.nome,
          categoria: service.categoria,
          valorPadrao: Number(service.valorPadrao),
          descricao: service.descricao,
          createdAt: serverTimestamp()
        });
        insertedCount++;
      });
      
      await batch.commit();
      console.log(`Coleção 'servicos' criada e populada com sucesso! ${insertedCount} serviços inseridos.`);
      return insertedCount;
    } else {
      console.log(`A coleção 'servicos' já possui ${querySnapshot.size} registros. Pular importação.`);
      return 0;
    }
  } catch (error) {
    console.error("Erro ao popular a coleção 'servicos':", error);
    throw error;
  }
}
