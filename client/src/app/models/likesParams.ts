import { PaginationParams } from './paginationParams';
export class LikesParams extends PaginationParams{
    constructor(public predicate: string = 'liked'){
        super();
    }
}