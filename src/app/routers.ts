import { HomeComponent } from "./home/home.component";
import { LoginComponent } from "./login/login";
import { RegistroComponent } from "./registro/registro";
import { AuthGuard } from "./guards/auth.guard.services";
import { ListCreatorComponent } from "./creator/list.creator.component";
import { Routes } from "@angular/router";
import { TarjetaComponent } from './tarjeta/tarjeta.component';
import { ListDetailComponent } from './list-detail/list-detail.component';

export const routes: Routes = [ 
    {path: 'tarjeta', component: TarjetaComponent, canActivate:[AuthGuard]},
    {path: '', component: ListCreatorComponent, pathMatch: 'full', canActivate:[AuthGuard]},
    {path: 'login', component: LoginComponent },
    {path: 'registro', component: RegistroComponent },
    {path: 'creators', component: ListCreatorComponent, canActivate:[AuthGuard]},
    {path: 'list/:id', component: ListDetailComponent, canActivate:[AuthGuard]},
    {path: 'new', component: ListCreatorComponent, canActivate:[AuthGuard]}
]
