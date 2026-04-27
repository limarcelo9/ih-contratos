import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { ContratacaoService } from "../../core/services/contratacao.service";

@Component({
  selector: "app-importar",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./importar.component.html",
  styleUrl: "./importar.component.css",
})
export class ImportarComponent {
  isDragOver = false;
  fileName = "";
  isLoading = false;
  isSuccess = false;
  recordCount = 0;

  constructor(
    private contratacaoService: ContratacaoService,
    private router: Router
  ) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files[0];
    if (file) this.processFile(file);
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.processFile(file);
  }

  private processFile(file: File): void {
    if (!file.name.endsWith(".csv")) {
      alert("Por favor, selecione um arquivo CSV.");
      return;
    }

    this.fileName = file.name;
    this.isLoading = true;
    this.isSuccess = false;

    this.contratacaoService.replaceFromFile(file);

    // Acompanha o resultado
    setTimeout(() => {
      this.isLoading = false;
      this.recordCount = this.contratacaoService.getCount();
      this.isSuccess = true;
    }, 1500);
  }

  navigateToList(): void {
    this.router.navigate(["/contratacoes"]);
  }
}
