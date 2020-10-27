import { PaginationParams } from './paginationParams';
import { User } from './user';
export class UserParams extends PaginationParams{
    gender: string;
    minAge = 18;
    maxAge = 99;
    orderBy = 'lastActive';

    constructor(user: User){
        super();
        this.gender = user.gender === 'female' ? 'male' : 'female';
    }
}