import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { IList } from '../structures/lista';
import { ListService } from '../services/list.services';

@Component({
    selector: 'list-detail',
    templateUrl: './list-detail.component.html'
})
export class ListDetailComponent implements OnInit, OnDestroy {
    public lista: IList | null = null;
    public pendiente = '';
    public cargando = true;
    public guardando = false;
    public mensaje = '';
    public error = '';
    public formularioAbierto = false;
    public swipeOffset: { [index: number]: number } = {};
    public actualizandoItem: number | null = null;
    private inicioSwipe: { x: number, y: number, index: number } | null = null;
    private routeSubscription: Subscription;
    private listSubscription: Subscription;

    constructor(private route: ActivatedRoute, private listService: ListService) {}

    ngOnInit(): void {
        this.routeSubscription = this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (this.listSubscription) { this.listSubscription.unsubscribe(); }
            this.lista = null;
            this.cargando = true;
            if (!id) { this.cargando = false; return; }
            this.listSubscription = this.listService.getById(id).subscribe(lista => {
                this.lista = lista;
                this.cargando = false;
            }, error => {
                this.error = this.mensajeError(error, 'No se pudo cargar la lista.');
                this.cargando = false;
            });
        });
    }

    ngOnDestroy(): void {
        if (this.routeSubscription) { this.routeSubscription.unsubscribe(); }
        if (this.listSubscription) { this.listSubscription.unsubscribe(); }
    }

    async agregar(): Promise<void> {
        const item = this.pendiente.trim();
        if (!this.lista || !this.lista.id || !item || this.guardando) { return; }
        this.guardando = true;
        this.mensaje = '';
        this.error = '';
        try {
            await this.listService.addItems(this.lista.id, [item]);
            this.pendiente = '';
            this.mensaje = 'Pendiente agregado.';
            this.formularioAbierto = false;
        } catch (error) {
            this.error = this.mensajeError(error, 'No se pudo agregar el pendiente.');
        } finally {
            this.guardando = false;
        }
    }

    iniciarSwipe(event: TouchEvent, index: number): void {
        const touch = event.touches[0];
        if (!touch) { return; }
        this.inicioSwipe = { x: touch.clientX, y: touch.clientY, index: index };
        this.swipeOffset[index] = 0;
    }

    moverSwipe(event: TouchEvent, index: number): void {
        if (!this.inicioSwipe || this.inicioSwipe.index !== index) { return; }
        const touch = event.touches[0];
        if (!touch) { return; }
        const dx = touch.clientX - this.inicioSwipe.x;
        const dy = touch.clientY - this.inicioSwipe.y;
        if (Math.abs(dx) > Math.abs(dy)) {
            this.swipeOffset[index] = Math.max(0, Math.min(dx, 92));
        }
    }

    finalizarSwipe(event: TouchEvent, index: number): void {
        if (!this.inicioSwipe || this.inicioSwipe.index !== index) { return; }
        const touch = event.changedTouches[0];
        const dx = touch ? touch.clientX - this.inicioSwipe.x : 0;
        const dy = touch ? touch.clientY - this.inicioSwipe.y : 0;
        this.inicioSwipe = null;
        this.swipeOffset[index] = 0;
        if (dx > 65 && Math.abs(dx) > Math.abs(dy)) {
            this.establecerCompletado(index, true);
        }
    }

    estaCompletado(index: number): boolean {
        return !!(this.lista && this.lista.completedItems && this.lista.completedItems.indexOf(index) !== -1);
    }

    async establecerCompletado(index: number, completado: boolean): Promise<void> {
        if (!this.lista || !this.lista.id || this.actualizandoItem !== null) { return; }
        this.actualizandoItem = index;
        this.error = '';
        this.mensaje = '';
        try {
            await this.listService.setItemCompleted(this.lista.id, index, completado);
            this.mensaje = completado ? 'Pendiente completado.' : 'Pendiente reabierto.';
        } catch (error) {
            this.error = this.mensajeError(error, 'No se pudo actualizar el pendiente.');
        } finally {
            this.actualizandoItem = null;
        }
    }

    private mensajeError(error: any, prefijo: string): string {
        const codigo = error && error.code ? ' (' + error.code + ')' : '';
        const detalle = error && error.message ? error.message : 'Error desconocido.';
        return prefijo + codigo + ' ' + detalle;
    }
}
