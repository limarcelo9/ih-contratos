import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { ContratacaoService } from "../../../core/services/contratacao.service";
import { ContratoPdfService } from "../../../core/services/contrato-pdf.service";
import { Contratacao } from "../../../core/models/contratacao.model";

@Component({
  selector: "app-lista",
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: "./lista.component.html",
  styleUrl: "./lista.component.css",
})
export class ListaComponent implements OnInit {
  contratacoes: Contratacao[] = [];
  filtered: Contratacao[] = [];
  searchTerm = "";
  filterProjeto = "";
  filterCategoria = "";
  filterStatus = "";
  projetos: string[] = [];

  constructor(
    private contratacaoService: ContratacaoService,
    private pdfService: ContratoPdfService
  ) {}

  ngOnInit(): void {
    this.contratacaoService.getContratacoes().subscribe((data) => {
      this.contratacoes = data;
      this.projetos = [...new Set(data.map((c) => c.projeto).filter(Boolean))].sort();
      this.applyFilters();
    });
  }

  applyFilters(): void {
    let result = [...this.contratacoes];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.fornecedorNome.toLowerCase().includes(term) ||
          c.objetoContratacao.toLowerCase().includes(term) ||
          c.projeto.toLowerCase().includes(term) ||
          c.entidade.toLowerCase().includes(term)
      );
    }

    if (this.filterProjeto) {
      result = result.filter((c) => c.projeto === this.filterProjeto);
    }

    if (this.filterCategoria) {
      result = result.filter((c) => c.categoria === this.filterCategoria);
    }

    if (this.filterStatus) {
      result = result.filter((c) => c.status === this.filterStatus);
    }

    this.filtered = result;
  }

  clearFilters(): void {
    this.searchTerm = "";
    this.filterProjeto = "";
    this.filterCategoria = "";
    this.filterStatus = "";
    this.applyFilters();
  }

  gerarPdf(contratacao: Contratacao, event: Event): void {
    event.stopPropagation();
    this.pdfService.generateContrato(contratacao);
  }

  formatCurrency(value: number): string {
    if (!value) return "—";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.filterProjeto || this.filterCategoria || this.filterStatus);
  }
}
