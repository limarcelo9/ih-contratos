import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { ContratacaoService } from "../../../core/services/contratacao.service";
import { ContratoPdfService } from "../../../core/services/contrato-pdf.service";
import { Contratacao } from "../../../core/models/contratacao.model";

@Component({
  selector: "app-detalhe",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./detalhe.component.html",
  styleUrl: "./detalhe.component.css",
})
export class DetalheComponent implements OnInit {
  contratacao: Contratacao | null = null;
  activeTab = "geral";

  constructor(
    private route: ActivatedRoute,
    private contratacaoService: ContratacaoService,
    private pdfService: ContratoPdfService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get("id"));
    this.contratacaoService.getContratacao(id).subscribe((c) => {
      this.contratacao = c || null;
    });
  }

  setTab(tab: string): void {
    this.activeTab = tab;
  }

  gerarContratoPdf(): void {
    if (this.contratacao) {
      this.pdfService.generateContrato(this.contratacao);
    }
  }

  gerarAditivoPdf(): void {
    if (this.contratacao) {
      this.pdfService.generateAditivo(this.contratacao);
    }
  }

  formatCurrency(value: number): string {
    if (!value) return "—";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }
}
