export interface IList{
    id ?:string;
    title:string;
    items?: string[];
    completedItems?: number[];
    tipo?: 'creator' | 'propia' | 'pendientes';
    createdAt ?:any;
}
