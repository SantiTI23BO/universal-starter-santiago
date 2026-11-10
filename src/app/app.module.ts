import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import { environment } from '../environments/environment';
import {AngularFireModule} from 'angularfire2';

import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireAuthModule } from 'angularfire2/auth';

import { routes } from './routers';
import { LoginComponent } from './login/login';
import { RegistroComponent } from './registro/registro';

import {AppComponent} from './base/app.component';
import {HomeComponent} from './home/home.component';
import {TransferHttpCacheModule} from '@nguniversal/common';

import { AuthServices } from './services/auth.services';

import { AuthGuard } from './guards/auth.guard.services';

import { UserService } from './services/user.service';
import { ListCreatorComponent } from './creator/list.creator.component';
import{FormsModule} from "@angular/forms";
import { ListService } from './services/list.services';
import { TarjetaComponent } from './tarjeta/tarjeta.component';
import { ListDetailComponent } from './list-detail/list-detail.component';
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegistroComponent,
    ListCreatorComponent,
    TarjetaComponent,
    ListDetailComponent
  ],
  imports: [
    BrowserModule.withServerTransition({appId: 'my-app'}),
    RouterModule.forRoot(routes),
    TransferHttpCacheModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    FormsModule
  ],
  providers: [AuthServices,AuthGuard, UserService, ListService],
  bootstrap: [AppComponent]
})
export class AppModule { }
