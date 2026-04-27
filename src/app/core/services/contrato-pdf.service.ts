import { Injectable } from "@angular/core";
import { jsPDF } from "jspdf";
import { Contratacao } from "../models/contratacao.model";

@Injectable({ providedIn: "root" })
export class ContratoPdfService {
  private readonly MARGIN_LEFT = 25;
  private readonly MARGIN_RIGHT = 25;
  private readonly PAGE_WIDTH = 210;
  private readonly CONTENT_WIDTH = 210 - 25 - 25; // 160

  generateContrato(contratacao: Contratacao): void {
    const doc = new jsPDF("p", "mm", "a4");
    let y = 20;

    // Header com título
    y = this.addHeader(doc, y);

    // Título do contrato
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    const titulo = contratacao.categoria === "membro"
      ? "CONTRATO DE PRESTAÇÃO DE SERVIÇOS"
      : "CONTRATO DE PRESTAÇÃO DE SERVIÇOS PONTUAIS";
    doc.text(titulo, this.PAGE_WIDTH / 2, y, { align: "center" });
    y += 12;

    // Identificação das partes
    y = this.addSection(doc, y, "ENTRE:");
    y = this.addParteContratante(doc, y, contratacao);
    y = this.addParteContratada(doc, y, contratacao);

    // Considerandos
    y = this.addConsiderandos(doc, y);

    // Cláusula 1 - Declaração
    y = this.checkPageBreak(doc, y, 60);
    y = this.addClausula(doc, y, "1. DECLARAÇÃO DE PREENCHIMENTO DOS REQUISITOS DE CONTRATAÇÃO", [
      "1.1 A Contratada garante que não está sob qualquer impedimento, restrição ou proibição com respeito à sua capacidade de executar este acordo e atender a todos os seus termos e condições.",
      "1.2 A Contratada garante ainda e assegura que nenhum de seus atos — comissivos ou omissivos — irá violar qualquer direito de terceiros.",
      "1.3 A Contratada se compromete a indenizar a Contratante por quaisquer danos, custas, despesas, taxas, incluindo custas processuais e honorários nos quais incorra em razão de qualquer queixa, reclamação, ação penal, litígio ou processo instituído contra a Contratante em face do objeto do presente contrato.",
      "1.4 A Contratada se compromete a exercer seus melhores e maiores esforços para executar o presente contrato na estrita observância dos prazos aqui previstos.",
      "1.5 A Contratada reconhece que o resultado final do serviço objeto do presente Contrato somente poderá ser utilizado ou divulgado com a devida autorização da Contratante.",
    ]);

    // Cláusula 2 - Objeto
    y = this.checkPageBreak(doc, y, 40);
    y = this.addClausula(doc, y, "2. OBJETO", [
      `2.1 O presente instrumento contratual privado tem por objeto prestação de serviços técnico especializado.`,
      `2.2 Os serviços a serem prestados pela Contratada à Contratante têm a seguinte descrição:`,
      `    ${contratacao.objetoContratacao || "[Descrição do objeto a ser definida]"}`,
    ]);

    // Cláusula 3 - Obrigações da Contratada
    y = this.checkPageBreak(doc, y, 60);
    y = this.addClausula(doc, y, "3. OBRIGAÇÕES DA CONTRATADA", [
      "3.1.1 Manter as declarações e compromissos previstos na cláusula 1ª do presente instrumento ao longo da vigência do presente contrato;",
      "3.1.2 Cumprir e fazer cumprir o contido no Anexo I do presente instrumento (DIRETRIZES DE COMBATE A CORRUPÇÃO);",
      "3.1.3 Adotar todas as medidas necessárias ao cabal cumprimento do objeto deste contrato, segundo sua independência técnica;",
      "3.1.4 Guardar sigilo a respeito de todas as informações recebidas da Contratante;",
      "3.1.5 Prestar os serviços com pessoal adequadamente qualificado e capacitado;",
      "3.1.6 Prestar à Contratante os esclarecimentos necessários à perfeita compreensão dos serviços;",
    ]);

    // Cláusula 4 - Obrigações da Contratante
    y = this.checkPageBreak(doc, y, 40);
    y = this.addClausula(doc, y, "4. OBRIGAÇÕES DA CONTRATANTE", [
      "4.1.1 Fornecer, tempestivamente, as informações necessárias à adequada execução dos serviços contratados;",
      "4.1.2 Observar a independência técnica da Contratada;",
      "4.1.3 Pagar pontualmente os valores pactuados, na forma e prazo definido neste instrumento contratual.",
    ]);

    // Cláusula 5 - Pagamento
    y = this.checkPageBreak(doc, y, 50);
    const valorFormatado = contratacao.valor > 0
      ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(contratacao.valor)
      : "R$ [VALOR A DEFINIR]";

    const clausulasPagamento = contratacao.categoria === "membro"
      ? [
          `5.1 Pela prestação dos serviços contratados, o Contratante pagará à Contratada o valor mensal de ${valorFormatado}.`,
          "5.2 A Contratada deverá apresentar, até o 5º dia útil do mês subsequente, relatório de atividades desempenhadas no mês com o registro das horas trabalhadas, bem como a nota fiscal referente ao seu pagamento.",
          "5.3 O pagamento mensal será realizado em até 30 (trinta) dias da apresentação da nota fiscal e do relatório de atividades.",
        ]
      : [
          `5.1 Pela prestação dos serviços contratados, o Contratante pagará à Contratada o valor total de ${valorFormatado}.`,
          "5.2 O pagamento será realizado em até 30 (trinta) dias da apresentação da nota fiscal e do relatório de atividades.",
        ];

    y = this.addClausula(doc, y, "5. PAGAMENTO", clausulasPagamento);

    // Cláusula 5 extra - Dados Bancários
    if (contratacao.dadosBancarios) {
      y = this.checkPageBreak(doc, y, 20);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Dados Bancários para Pagamento:", this.MARGIN_LEFT, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      const linhasBanco = doc.splitTextToSize(contratacao.dadosBancarios, this.CONTENT_WIDTH);
      doc.text(linhasBanco, this.MARGIN_LEFT, y);
      y += linhasBanco.length * 4 + 6;
    }

    // Cláusula 6 - Vigência e Rescisão
    y = this.checkPageBreak(doc, y, 40);
    const vigenciaTexto = contratacao.vigencia || "[DATA INÍCIO] a [DATA FIM]";
    y = this.addClausula(doc, y, "6. VIGÊNCIA E RESCISÃO", [
      `6.1 Este Contrato terá vigência de ${vigenciaTexto}.`,
      "6.2 O presente instrumento poderá ser rescindido mediante aviso prévio de 30 dias, sem ônus para as Partes.",
      "6.3 A rescisão deverá ser formalizada por meio da assinatura de termo de distrato e extinção do contrato.",
    ]);

    // Cláusula 7 - Confidencialidade
    y = this.checkPageBreak(doc, y, 30);
    y = this.addClausula(doc, y, "7. CONFIDENCIALIDADE", [
      "7.1 As Partes estabelecem o pacto do mais absoluto sigilo, relativamente às informações confidenciais fornecidas por qualquer das Partes à outra, inclusive qualquer tipo de propriedade intelectual.",
      "7.2 Todas as regras de confidencialidade e sigilo previstas neste termo terão validade durante e após a vigência deste instrumento.",
    ]);

    // Cláusula 8 - Não Solicitação
    y = this.checkPageBreak(doc, y, 30);
    y = this.addClausula(doc, y, "8. NÃO SOLICITAÇÃO E NÃO-COMPETIÇÃO", [
      "8.1 A Contratada se compromete a, durante a vigência deste instrumento, não exercer atividades que impliquem conflito de interesses com as atividades da Contratante.",
      "8.2 A Contratada se compromete a não solicitar ou encorajar, direta ou indiretamente, qualquer colaborador da Contratante a deixar de trabalhar ou prestar serviços.",
    ]);

    // Cláusula 9 - Propriedade Intelectual
    y = this.checkPageBreak(doc, y, 20);
    y = this.addClausula(doc, y, "9. PROPRIEDADE INTELECTUAL", [
      "9.1 A Contratada garante à Contratante o direito irrestrito de utilização de todos os conhecimentos técnicos e produtos desenvolvidos/obtidos na execução do objeto deste Acordo.",
    ]);

    // Cláusula 10 - Tratamento de Dados
    y = this.checkPageBreak(doc, y, 30);
    y = this.addClausula(doc, y, "10. DO TRATAMENTO ADEQUADO DE DADOS", [
      "10.1 A Contratada se compromete a tratar e usar os dados da Contratante nos termos legalmente permitidos, em especial em conformidade com a LGPD.",
      "10.2 O descumprimento poderá ensejar a imediata rescisão do presente Contrato com justa causa.",
    ]);

    // Cláusula 11 - Desvinculação
    y = this.checkPageBreak(doc, y, 30);
    y = this.addClausula(doc, y, "11. DA DESVINCULAÇÃO ENTRE AS PARTES", [
      "11.1 O presente Contrato não estabelece qualquer vínculo trabalhista, societário, associativo, de representação ou de responsabilidade entre a Contratante e a Contratada.",
      "11.2 A Contratada terá flexibilidade quanto ao local, dias, horários e condições para a execução dos serviços, ficando estabelecido que o local da prestação dos serviços será em Brasília – DF.",
    ]);

    // Cláusula 12 - Negócio Jurídico Processual
    y = this.checkPageBreak(doc, y, 30);
    y = this.addClausula(doc, y, "12. DO NEGÓCIO JURÍDICO PROCESSUAL", [
      "12.1.1 Fica eleito o Foro da Circunscrição Judiciária de Brasília - DF, para dirimir todas e quaisquer dúvidas decorrentes deste contrato de prestação de serviços.",
      "12.1.2 As Partes acordam que eventual procedimento judicial que verse sobre a relação aqui entabulada não irá comportar recurso para os tribunais superiores.",
    ]);

    // Cláusula 13 - Disposições Finais
    y = this.checkPageBreak(doc, y, 30);
    y = this.addClausula(doc, y, "13. DISPOSIÇÕES FINAIS", [
      "13.1 Qualquer aditamento e/ou alteração somente terá validade se realizado por escrito, mediante Termo Aditivo firmado por ambas as Partes.",
      "13.2 O presente Contrato obriga as Partes e seus sucessores a qualquer título.",
    ]);

    // Fechamento
    y = this.checkPageBreak(doc, y, 30);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const textoFecho = "Por estarem assim, justas e acordadas, as Partes firmam eletronicamente o presente instrumento contratual, sendo este título executivo extrajudicial.";
    const fecho = doc.splitTextToSize(textoFecho, this.CONTENT_WIDTH);
    doc.text(fecho, this.MARGIN_LEFT, y);
    y += fecho.length * 4 + 15;

    // Assinaturas
    y = this.checkPageBreak(doc, y, 40);
    this.addAssinaturas(doc, y, contratacao);

    // Salvar
    const nomeArquivo = `Contrato_${contratacao.fornecedorNome || "Contratado"}_${contratacao.projeto || "Projeto"}.pdf`
      .replace(/[^a-zA-Z0-9_.\-\s]/g, "")
      .replace(/\s+/g, "_");
    doc.save(nomeArquivo);
  }

  private addHeader(doc: jsPDF, y: number): number {
    // Linha superior decorativa
    doc.setDrawColor(139, 58, 58); // bordô IH
    doc.setLineWidth(1.5);
    doc.line(this.MARGIN_LEFT, y, this.PAGE_WIDTH - this.MARGIN_RIGHT, y);
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(139, 58, 58);
    doc.text("IMPACT HUB BRASÍLIA", this.PAGE_WIDTH / 2, y, { align: "center" });
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text("ASSOCIAÇÃO IMPACT HUB BRASIL — CNPJ: 18.702.797/0001-34", this.PAGE_WIDTH / 2, y, { align: "center" });
    y += 3;
    doc.text("ROD JOSÉ CARLOS DAUX S/N SALA 01 E 02, FLORIANÓPOLIS-SC, CEP 88.032-005", this.PAGE_WIDTH / 2, y, { align: "center" });

    y += 5;
    doc.setDrawColor(139, 58, 58);
    doc.setLineWidth(0.5);
    doc.line(this.MARGIN_LEFT, y, this.PAGE_WIDTH - this.MARGIN_RIGHT, y);

    doc.setTextColor(0, 0, 0);
    return y + 10;
  }

  private addParteContratante(doc: jsPDF, y: number, c: Contratacao): number {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("CONTRATANTE:", this.MARGIN_LEFT, y);
    y += 5;
    doc.setFont("helvetica", "normal");

    const entidade = c.entidade || "ASSOCIAÇÃO IMPACT HUB BRASIL";
    const textoContratante = `${entidade}, pessoa jurídica inscrita no CNPJ sob o nº 18.702.797/0001-34, com endereço na ROD JOSÉ CARLOS DAUX S/N SALA 01 E 02, FLORIANÓPOLIS-SC, CEP 88.032-005, com endereço de e-mail associacao.brasil@impacthub.net, doravante denominada simplesmente Contratante.`;
    const linhas = doc.splitTextToSize(textoContratante, this.CONTENT_WIDTH);
    doc.text(linhas, this.MARGIN_LEFT, y);
    return y + linhas.length * 4 + 6;
  }

  private addParteContratada(doc: jsPDF, y: number, c: Contratacao): number {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("CONTRATADA:", this.MARGIN_LEFT, y);
    y += 5;
    doc.setFont("helvetica", "normal");

    const nome = c.fornecedorNome || "[NOME EMPRESARIAL]";
    const contato = c.fornecedorContato ? `, com contato ${c.fornecedorContato}` : "";
    const textoContratada = `${nome}${contato}, doravante denominada Contratada.`;
    const linhas = doc.splitTextToSize(textoContratada, this.CONTENT_WIDTH);
    doc.text(linhas, this.MARGIN_LEFT, y);
    return y + linhas.length * 4 + 6;
  }

  private addConsiderandos(doc: jsPDF, y: number): number {
    y = this.checkPageBreak(doc, y, 40);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    const considerandos = [
      "a) A Contratante firmou junto a FUNDAÇÃO ESCOLA NACIONAL DE ADMINISTRAÇÃO PÚBLICA — ENAP (CNPJ no 00.627.612/0001-09) termo de colaboração, que tem por objeto a execução da Estratégia de Inovação Aberta da Enap;",
      "b) O termo de colaboração tem finalidade de interesse público e recíproco, envolvendo a transferência de recursos públicos à Contratante;",
      "c) Os recursos oriundos do termo de colaboração têm natureza pública, de modo que a sua utilização está sujeita a prestação de contas;",
    ];

    doc.text("Têm entre si o presente contrato de prestação de serviços, considerando que:", this.MARGIN_LEFT, y);
    y += 6;

    for (const c of considerandos) {
      const linhas = doc.splitTextToSize(c, this.CONTENT_WIDTH - 5);
      doc.text(linhas, this.MARGIN_LEFT + 5, y);
      y += linhas.length * 4 + 3;
    }

    return y + 3;
  }

  private addSection(doc: jsPDF, y: number, title: string): number {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(title, this.MARGIN_LEFT, y);
    return y + 7;
  }

  private addClausula(doc: jsPDF, y: number, titulo: string, itens: string[]): number {
    // Título da cláusula
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(139, 58, 58);
    doc.text(titulo, this.MARGIN_LEFT, y);
    doc.setTextColor(0, 0, 0);
    y += 7;

    // Itens
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    for (const item of itens) {
      y = this.checkPageBreak(doc, y, 15);
      const linhas = doc.splitTextToSize(item, this.CONTENT_WIDTH);
      doc.text(linhas, this.MARGIN_LEFT, y);
      y += linhas.length * 4 + 3;
    }

    return y + 3;
  }

  private addAssinaturas(doc: jsPDF, y: number, c: Contratacao): number {
    const col1X = this.MARGIN_LEFT;
    const col2X = this.PAGE_WIDTH / 2 + 10;
    const lineW = 60;

    // Contratante
    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    doc.line(col1X, y, col1X + lineW, y);
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("ASSOCIAÇÃO IMPACT HUB BRASIL", col1X, y);
    y -= 5;

    // Contratada
    doc.line(col2X, y, col2X + lineW, y);
    y += 5;
    doc.text(c.fornecedorNome || "[CONTRATADA]", col2X, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.text("Contratante", col1X, y);
    doc.text("Contratada", col2X, y);

    return y + 10;
  }

  private checkPageBreak(doc: jsPDF, y: number, needed: number): number {
    if (y + needed > 280) {
      doc.addPage();
      // Adicionar rodapé na página anterior e header na nova
      this.addPageFooter(doc);
      return 20;
    }
    return y;
  }

  private addPageFooter(doc: jsPDF): void {
    const pageCount = doc.getNumberOfPages();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Página ${pageCount}`,
      this.PAGE_WIDTH / 2,
      290,
      { align: "center" }
    );
    doc.setTextColor(0, 0, 0);
  }

  generateAditivo(contratacao: Contratacao): void {
    const doc = new jsPDF("p", "mm", "a4");
    let y = 20;

    y = this.addHeader(doc, y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("TERMO ADITIVO AO INSTRUMENTO PARTICULAR", this.PAGE_WIDTH / 2, y, { align: "center" });
    y += 12;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const texto = `Pelo presente instrumento particular, as partes ASSOCIAÇÃO IMPACT HUB BRASIL (CNPJ: 18.702.797/0001-34), doravante CONTRATANTE, e ${contratacao.fornecedorNome || "[CONTRATADA]"}, doravante CONTRATADA, resolvem celebrar o presente Termo Aditivo.`;
    const linhas = doc.splitTextToSize(texto, this.CONTENT_WIDTH);
    doc.text(linhas, this.MARGIN_LEFT, y);
    y += linhas.length * 4 + 10;

    y = this.addClausula(doc, y, "1. DA ALTERAÇÃO", [
      "1.1 As Partes resolvem incluir, no Contrato Originário, a seguinte condição adicional:",
      "    [DESCRIÇÃO DA ALTERAÇÃO]",
    ]);

    y = this.addClausula(doc, y, "2. DA RATIFICAÇÃO", [
      "2.1 No mais, as Partes ratificam todas as demais disposições do Contrato Originário.",
    ]);

    y += 10;
    this.addAssinaturas(doc, y, contratacao);

    const nomeArquivo = `Aditivo_${contratacao.fornecedorNome || "Contratado"}.pdf`.replace(/[^a-zA-Z0-9_.\-\s]/g, "").replace(/\s+/g, "_");
    doc.save(nomeArquivo);
  }
}
