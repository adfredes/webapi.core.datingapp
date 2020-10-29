export interface Group{
    name: string;
    conections: Connection[];
}

interface Connection {
    connectionId: string;
    username: string;
}
