export interface Contratacao {
  id: number;
  timestamp: string;
  email: string;
  entidade: string;
  projeto: string;
  demandante: string;
  gestorAprovador: string;
  evidenciaAprovacao: string;
  tipoContratacao: "Membro da equipe IH" | "Serviço pontual" | string;
  fornecedorNome: string;
  perfilProfissional: string;
  fornecedorContato: string;
  objetoContratacao: string;
  valor: number;
  valorOriginal: string;
  vigencia: string;
  observacoes: string;
  planoTrabalho: string;
  cotacoes: string;
  cartaoCnpj: string;
  certidaoFiscal: string;
  certidaoFgts: string;
  dadosBancarios: string;
  circulo: string;
  emailOrganizacional: string;
  notebook: string;
  celular: string;
  plataformas: string;
  // Campos derivados
  status: "ativo" | "encerrado" | "futuro" | "indefinido";
  categoria: "membro" | "pontual";
}

export interface ContratacaoStats {
  total: number;
  valorTotal: number;
  ativos: number;
  projetos: number;
  porProjeto: { nome: string; count: number; valor: number }[];
  porCategoria: { membro: number; pontual: number };
  porEntidade: { nome: string; count: number }[];
}
