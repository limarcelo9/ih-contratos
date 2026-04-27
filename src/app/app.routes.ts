import { Routes } from "@angular/router";

export const routes: Routes = [
  { path: "", redirectTo: "dashboard", pathMatch: "full" },
  {
    path: "dashboard",
    loadComponent: () =>
      import("./features/dashboard/dashboard.component").then((m) => m.DashboardComponent),
  },
  {
    path: "contratacoes",
    loadComponent: () =>
      import("./features/contratacoes/lista/lista.component").then((m) => m.ListaComponent),
  },
  {
    path: "contratacoes/:id",
    loadComponent: () =>
      import("./features/contratacoes/detalhe/detalhe.component").then((m) => m.DetalheComponent),
  },
  {
    path: "importar",
    loadComponent: () =>
      import("./features/importar/importar.component").then((m) => m.ImportarComponent),
  },
];
