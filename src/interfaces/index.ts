export interface Dish {
    category: string;
    name: string;
    price: string | number;
    weight: string | number;
    units: string;
    description: string;
    calories?: string | number;
    proteins?: string | number;
    fats?: string | number;
    carbohydrate?: string | number;
    image: string;
    article: number;
}