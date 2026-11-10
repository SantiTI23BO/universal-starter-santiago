import { Injectable } from "@angular/core";
import { AngularFirestore } from "angularfire2/firestore";
import { AngularFireAuth } from "angularfire2/auth";
import * as firebase from "firebase/app";
import "firebase/firestore";
import { Observable, of } from "rxjs";
import { map, switchMap, take } from "rxjs/operators";
import { IList } from "../structures/lista";

@Injectable()
export class ListService {
    public listsm: Observable<IList[]>;

    constructor(private afs: AngularFirestore, private auth: AngularFireAuth) {
        this.listsm = this.auth.authState.pipe(switchMap(user => {
            if (!user) { return of([] as IList[]); }
            return this.afs.collection<IList>('users/' + user.uid + '/lists')
                .snapshotChanges().pipe(map(actions => actions.map(action => ({
                    ...action.payload.doc.data(), id: action.payload.doc.id
                } as IList))));
        }));
    }

    async remove(id: string): Promise<void> {
        const user = await this.auth.authState.pipe(take(1)).toPromise();
        if (!user) { throw new Error('Inicia sesión para eliminar listas.'); }
        if (!id || id.indexOf('/') !== -1) { throw new Error('Lista no válida.'); }
        return this.afs.doc('users/' + user.uid + '/lists/' + id).delete();
    }

    async add(list: IList): Promise<firebase.firestore.DocumentReference> {
        const user = await this.auth.authState.pipe(take(1)).toPromise();
        if (!user) { throw new Error('Inicia sesión para guardar listas.'); }
        const collection = this.afs.collection<IList>('users/' + user.uid + '/lists');
        const id = this.afs.createId();
        const ref = collection.doc(id);
        await ref.set({
            ...list,
            tipo: list.tipo || 'pendientes',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return ref.ref;
    }

    getById(id: string): Observable<IList | null> {
        return this.auth.authState.pipe(switchMap(user => {
            if (!user || !id || id.indexOf('/') !== -1) { return of(null); }
            return this.afs.doc<IList>('users/' + user.uid + '/lists/' + id)
                .snapshotChanges().pipe(map(snapshot => {
                    const data = snapshot.payload.data();
                    return data ? { ...data, id: snapshot.payload.id } as IList : null;
                }));
        }));
    }

    async addItems(id: string, items: string[]): Promise<void> {
        const user = await this.auth.authState.pipe(take(1)).toPromise();
        if (!user) { throw new Error('Inicia sesión para agregar pendientes.'); }
        if (!id || id.indexOf('/') !== -1) { throw new Error('Lista no válida.'); }
        if (!items.length) { return; }
        const ref = this.afs.doc<IList>('users/' + user.uid + '/lists/' + id);
        await this.afs.firestore.runTransaction(async transaction => {
            const snapshot = await transaction.get(ref.ref);
            if (!snapshot.exists) { throw new Error('La lista ya no existe.'); }
            const current = (snapshot.data() && snapshot.data()!.items) || [];
            transaction.update(ref.ref, {
                items: current.concat(items),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });
    }

    async setItemCompleted(id: string, itemIndex: number, completed: boolean): Promise<void> {
        const user = await this.auth.authState.pipe(take(1)).toPromise();
        if (!user) { throw new Error('Inicia sesión para actualizar pendientes.'); }
        if (!id || id.indexOf('/') !== -1 || itemIndex < 0) { throw new Error('Pendiente no válido.'); }
        const ref = this.afs.doc<IList>('users/' + user.uid + '/lists/' + id);
        await this.afs.firestore.runTransaction(async transaction => {
            const snapshot = await transaction.get(ref.ref);
            if (!snapshot.exists) { throw new Error('La lista ya no existe.'); }
            const data = snapshot.data() as IList;
            const completedItems = (data.completedItems || []).filter(index => index !== itemIndex);
            if (completed) { completedItems.push(itemIndex); }
            transaction.update(ref.ref, {
                completedItems: completedItems,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });
    }
}
