import { PaginationParams } from './paginationParams';
export class MessageParams extends PaginationParams{
    constructor(public container: string = 'Unread'){
        super();
    }
}