import {Component} from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: `app.component.html`,
  styles: []
})
export class AppComponent {

 constructor(public afAuth : AngularFireAuth, private router : Router) {}

  cerrandoSesion = false;
  errorSalida = '';
  animacionRecarga = false;

  animarInicio(): void {
    this.animacionRecarga = false;
    setTimeout(() => { this.animacionRecarga = true; }, 20);
    setTimeout(() => { this.animacionRecarga = false; }, 650);
  }

  async logout(): Promise<void> {
    if (this.cerrandoSesion) { return; }
    this.cerrandoSesion = true;
    this.errorSalida = '';
    try {
      await this.afAuth.auth.signOut();
      await this.router.navigate(['/login']);
    } catch (_) {
      this.errorSalida = 'No se pudo cerrar sesión. Inténtalo de nuevo.';
    } finally {
      this.cerrandoSesion = false;
    }
  }
}
