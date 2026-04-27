import { Component, inject } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { AsyncPipe } from "@angular/common";
import { map } from "rxjs/operators";
import { ContratacaoService } from "../../../core/services/contratacao.service";

@Component({
  selector: "app-sidebar",
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AsyncPipe],
  templateUrl: "./sidebar.component.html",
  styleUrl: "./sidebar.component.css",
})
export class SidebarComponent {
  private contratacaoService = inject(ContratacaoService);
  count$ = this.contratacaoService.getContratacoes().pipe(map((c) => c.length));
}
