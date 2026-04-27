import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import * as Papa from "papaparse";
import { Contratacao } from "../models/contratacao.model";

@Injectable({ providedIn: "root" })
export class CsvParserService {
  constructor(private http: HttpClient) {}

  parseFromUrl(url: string): Observable<Contratacao[]> {
    return this.http.get(url, { responseType: "text" }).pipe(
      map((csvText) => this.parseCsvText(csvText))
    );
  }

  parseFromFile(file: File): Observable<Contratacao[]> {
    return new Observable((subscriber) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        encoding: "UTF-8",
        complete: (result) => {
          const contratacoes = this.mapRows(result.data as Record<string, string>[]);
          subscriber.next(contratacoes);
          subscriber.complete();
        },
        error: (error: Error) => {
          subscriber.error(error);
        },
      });
    });
  }

  parseCsvText(csvText: string): Contratacao[] {
    const result = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });
    return this.mapRows(result.data as Record<string, string>[]);
  }

  private mapRows(rows: Record<string, string>[]): Contratacao[] {
    const headers = Object.keys(rows[0] || {});

    return rows.map((row, index) => {
      const values = headers.map((h) => (row[h] || "").trim());

      const tipoContratacao = this.findField(row, headers, [
        "Tipo de Contratação",
        "Trata-se de",
        "tipo",
      ]);

      const valorOriginal = this.findField(row, headers, [
        "Valor",
        "Valor (R$)",
        "valor",
      ]);

      const vigencia = this.findField(row, headers, [
        "Vigência",
        "vigencia",
        "Vigência do contrato",
      ]);

      const categoria: "membro" | "pontual" =
        tipoContratacao.toLowerCase().includes("membro") ? "membro" : "pontual";

      return {
        id: index + 1,
        timestamp: this.findField(row, headers, ["Carimbo de data/hora", "Timestamp"]),
        email: this.findField(row, headers, ["Endereço de e-mail", "Email", "e-mail"]),
        entidade: this.findField(row, headers, ["Identificar a entidade", "Entidade", "entidade"]),
        projeto: this.findField(row, headers, ["Projeto a que se refere", "Projeto", "projeto"]),
        demandante: this.findField(row, headers, ["Demandante", "demandante", "Nome do demandante"]),
        gestorAprovador: this.findField(row, headers, ["Gestor", "Aprovador", "gestor"]),
        evidenciaAprovacao: this.findField(row, headers, ["Evidência", "evidencia", "Evidência de aprovação"]),
        tipoContratacao,
        fornecedorNome: this.findField(row, headers, [
          "Nome do Fornecedor",
          "Fornecedor",
          "Nome completo/Razão Social",
          "fornecedor",
        ]),
        perfilProfissional: this.findField(row, headers, ["Perfil profissional", "perfil"]),
        fornecedorContato: this.findField(row, headers, ["Contato", "contato", "Telefone"]),
        objetoContratacao: this.findField(row, headers, [
          "Descrição do Objeto",
          "Objeto",
          "objeto",
          "Descrição",
        ]),
        valor: this.parseValor(valorOriginal),
        valorOriginal,
        vigencia,
        observacoes: this.findField(row, headers, ["Observações", "observacoes", "Obs"]),
        planoTrabalho: this.findField(row, headers, ["Plano de trabalho", "plano"]),
        cotacoes: this.findField(row, headers, ["Cotações", "cotacoes", "Cotação"]),
        cartaoCnpj: this.findField(row, headers, ["Cartão CNPJ", "CNPJ"]),
        certidaoFiscal: this.findField(row, headers, ["Certidão", "certidao", "CND"]),
        certidaoFgts: this.findField(row, headers, ["FGTS", "fgts", "CRF"]),
        dadosBancarios: this.findField(row, headers, ["Dados bancários", "dados bancarios", "banco"]),
        circulo: this.findField(row, headers, ["Círculo", "circulo"]),
        emailOrganizacional: this.findField(row, headers, ["E-mail organizacional", "email organizacional"]),
        notebook: this.findField(row, headers, ["Notebook", "notebook"]),
        celular: this.findField(row, headers, ["Celular", "celular"]),
        plataformas: this.findField(row, headers, ["Plataformas", "plataformas"]),
        status: this.calcularStatus(vigencia),
        categoria,
      } as Contratacao;
    });
  }

  private findField(row: Record<string, string>, headers: string[], possibleNames: string[]): string {
    for (const name of possibleNames) {
      // Busca exata
      if (row[name] !== undefined) return row[name].trim();
      // Busca parcial (contém o nome)
      const found = headers.find((h) =>
        h.toLowerCase().includes(name.toLowerCase())
      );
      if (found && row[found]) return row[found].trim();
    }
    return "";
  }

  private parseValor(valorStr: string): number {
    if (!valorStr) return 0;
    // Remove "R$", espaços, e converte formato BR (1.234,56) para número
    const clean = valorStr
      .replace(/R\$\s*/g, "")
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(",", ".");
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  }

  private calcularStatus(vigencia: string): "ativo" | "encerrado" | "futuro" | "indefinido" {
    if (!vigencia) return "indefinido";
    const hoje = new Date();
    // Tenta parsear padrões como "01/01/2025 a 31/12/2025" ou "01.01.2025 - 31.12.2025"
    const match = vigencia.match(
      /(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{4})\s*(?:a|até|-)?\s*(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{4})/i
    );
    if (match) {
      const inicio = new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
      const fim = new Date(parseInt(match[6]), parseInt(match[5]) - 1, parseInt(match[4]));
      if (hoje < inicio) return "futuro";
      if (hoje > fim) return "encerrado";
      return "ativo";
    }
    return "indefinido";
  }
}
