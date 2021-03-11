export interface ProductsProps {
    results: Array<Producto>;
}

export interface Producto {
    id: string;
    title: string;
    thumbnail: string;
    price: number;
    condition: string;
    sold_quantity: number;
    permalink: string
}

export type Rating = {
    rating_average: number
}

export type TweetData = {
    idTweet: string;
    username: string;
    text: string
}

export interface ProductDetailsProps {
    producto: Producto;
    productA?: boolean;
    rating: number
}