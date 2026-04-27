import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { NgChartsModule } from "ng2-charts";
import { ChartConfiguration } from "chart.js";
import { Chart, registerables } from "chart.js";
import { ContratacaoService } from "../../core/services/contratacao.service";
import { ContratacaoStats } from "../../core/models/contratacao.model";

Chart.register(...registerables);

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, RouterLink, NgChartsModule],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.css",
})
export class DashboardComponent implements OnInit {
  stats: ContratacaoStats | null = null;

  barChartData: ChartConfiguration<"bar">["data"] = { labels: [], datasets: [] };
  barChartOptions: ChartConfiguration<"bar">["options"] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1C1C28",
        borderColor: "rgba(139, 58, 58, 0.3)",
        borderWidth: 1,
        titleColor: "#F0F0F5",
        bodyColor: "#A0A0B0",
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        ticks: { color: "#6B6B7B", font: { size: 11 } },
        grid: { color: "rgba(255,255,255,0.03)" },
      },
      y: {
        ticks: { color: "#6B6B7B", font: { size: 11 } },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
    },
  };

  doughnutChartData: ChartConfiguration<"doughnut">["data"] = { labels: [], datasets: [] };
  doughnutChartOptions: ChartConfiguration<"doughnut">["options"] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#A0A0B0", padding: 16, usePointStyle: true, pointStyle: "circle" },
      },
    },
  };

  constructor(private contratacaoService: ContratacaoService) {}

  ngOnInit(): void {
    this.contratacaoService.getStats().subscribe((stats) => {
      this.stats = stats;
      this.updateCharts(stats);
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(value);
  }

  private updateCharts(stats: ContratacaoStats): void {
    const topProjetos = stats.porProjeto.slice(0, 8);
    this.barChartData = {
      labels: topProjetos.map((p) => this.truncateLabel(p.nome, 20)),
      datasets: [
        {
          data: topProjetos.map((p) => p.count),
          backgroundColor: [
            "#8B3A3A", "#A85454", "#6E2D2D", "#D4A0A0",
            "#B06060", "#9C4848", "#C08080", "#7E3232",
          ],
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };

    this.doughnutChartData = {
      labels: ["Membro Equipe", "Serviço Pontual"],
      datasets: [
        {
          data: [stats.porCategoria.membro, stats.porCategoria.pontual],
          backgroundColor: ["#8B3A3A", "#FBBF24"],
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    };
  }

  private truncateLabel(label: string, maxLen: number): string {
    return label.length > maxLen ? label.substring(0, maxLen) + "…" : label;
  }
}
