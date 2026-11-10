import { Component, OnInit, OnDestroy } from "@angular/core";
import { IList } from "../structures/lista";
import { ListService } from "../services/list.services";

@Component({
    selector: 'list-creator',
    templateUrl: 'list.creator.component.html'
})
export class ListCreatorComponent implements OnInit, OnDestroy {
    private subscription: import("rxjs").Subscription;
    public listasGuardadas: IList[] = [];
    public list: IList = { title: '' };
    public elementos = '';
    public cargando = true;
    public listas = this.listS.listsm;
    public errorCarga = '';
    public guardando = false;
    public eliminando: string | null = null;
    public listasDesplegadas: { [id: string]: boolean } = {};
    public mensaje = '';
    public error = '';
    public formularioAbierto = false;

    constructor(private listS: ListService) {}

    ngOnInit(): void {
        this.subscription = this.listas.subscribe(listas => {
            this.listasGuardadas = listas;
            this.cargando = false;
        }, () => {
            this.cargando = false;
            this.errorCarga = 'No se pudieron cargar las listas. Comprueba los permisos de Firestore.';
        });
    }

    ngOnDestroy(): void {
        if (this.subscription) { this.subscription.unsubscribe(); }
    }

    alternarLista(id: string): void {
        this.listasDesplegadas[id] = !this.listasDesplegadas[id];
    }

    estaDesplegada(id: string): boolean {
        return !!this.listasDesplegadas[id];
    }

    registrarSwipe(titulo: string, numero: number): void {
        console.log(numero + ' SWIPE ' + titulo.toUpperCase());
    }

    async eliminar(lista: IList): Promise<void> {
        if (!lista.id || this.eliminando) { return; }
        this.eliminando = lista.id;
        this.error = '';
        this.mensaje = '';
        try {
            await this.listS.remove(lista.id);
            this.mensaje = 'Lista eliminada.';
        } catch (error) {
            this.error = 'No se pudo eliminar la lista. Comprueba tu sesión y los permisos de Firestore.';
        } finally {
            this.eliminando = null;
        }
    }

    async save(): Promise<void> {
        if (this.guardando || !this.list.title.trim()) { return; }
        this.guardando = true;
        this.mensaje = '';
        this.error = '';
        try {
            await this.listS.add({
                title: this.list.title.trim(),
                tipo: 'pendientes',
                items: this.elementos.split(/\r?\n/).map(item => item.trim()).filter(item => !!item)
            });
            this.mensaje = 'Lista guardada correctamente.';
            this.list = { title: '' };
            this.elementos = '';
            this.formularioAbierto = false;
        } catch (error) {
            this.error = this.mensajeError(error, 'No se pudo guardar la lista.');
        } finally {
            this.guardando = false;
        }
    }

    private mensajeError(error: any, prefijo: string): string {
        const codigo = error && error.code ? ' (' + error.code + ')' : '';
        const detalle = error && error.message ? error.message : 'Error desconocido.';
        return prefijo + codigo + ' ' + detalle;
    }
}
