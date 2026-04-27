import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Contratacao, ContratacaoStats } from "../models/contratacao.model";
import { CsvParserService } from "./csv-parser.service";

@Injectable({ providedIn: "root" })
export class ContratacaoService {
  private contratacoes$ = new BehaviorSubject<Contratacao[]>([]);

  constructor(private csvParser: CsvParserService) {}

  getContratacoes(): Observable<Contratacao[]> {
    return this.contratacoes$.asObservable();
  }

  getContratacao(id: number): Observable<Contratacao | undefined> {
    return this.contratacoes$.pipe(
      map((list) => list.find((c) => c.id === id))
    );
  }

  getStats(): Observable<ContratacaoStats> {
    return this.contratacoes$.pipe(map((list) => this.calcularStats(list)));
  }

  loadFromUrl(url: string): void {
    this.csvParser.parseFromUrl(url).subscribe({
      next: (data) => this.contratacoes$.next(data),
      error: (err) => console.error("Erro ao carregar CSV:", err),
    });
  }

  loadFromFile(file: File): void {
    this.csvParser.parseFromFile(file).subscribe({
      next: (data) => {
        const current = this.contratacoes$.value;
        this.contratacoes$.next([...current, ...data]);
      },
      error: (err) => console.error("Erro ao parsear arquivo:", err),
    });
  }

  replaceFromFile(file: File): void {
    this.csvParser.parseFromFile(file).subscribe({
      next: (data) => this.contratacoes$.next(data),
      error: (err) => console.error("Erro ao parsear arquivo:", err),
    });
  }

  getCount(): number {
    return this.contratacoes$.value.length;
  }

  private calcularStats(list: Contratacao[]): ContratacaoStats {
    const projetoMap = new Map<string, { count: number; valor: number }>();
    const entidadeMap = new Map<string, number>();
    let membros = 0;
    let pontuais = 0;
    let ativos = 0;
    let valorTotal = 0;

    for (const c of list) {
      valorTotal += c.valor;
      if (c.status === "ativo") ativos++;
      if (c.categoria === "membro") membros++;
      else pontuais++;

      const proj = c.projeto || "Sem projeto";
      const pData = projetoMap.get(proj) || { count: 0, valor: 0 };
      pData.count++;
      pData.valor += c.valor;
      projetoMap.set(proj, pData);

      const ent = c.entidade || "Sem entidade";
      entidadeMap.set(ent, (entidadeMap.get(ent) || 0) + 1);
    }

    return {
      total: list.length,
      valorTotal,
      ativos,
      projetos: projetoMap.size,
      porProjeto: Array.from(projetoMap.entries())
        .map(([nome, data]) => ({ nome, ...data }))
        .sort((a, b) => b.count - a.count),
      porCategoria: { membro: membros, pontual: pontuais },
      porEntidade: Array.from(entidadeMap.entries())
        .map(([nome, count]) => ({ nome, count }))
        .sort((a, b) => b.count - a.count),
    };
  }
}
