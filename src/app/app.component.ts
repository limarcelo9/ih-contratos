import { Component, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { SidebarComponent } from "./shared/components/sidebar/sidebar.component";
import { ContratacaoService } from "./core/services/contratacao.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent implements OnInit {
  constructor(private contratacaoService: ContratacaoService) {}

  ngOnInit(): void {
    this.contratacaoService.loadFromUrl("data/form-contratacoes.csv");
  }
}
