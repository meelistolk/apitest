export class Product {
  constructor(
    public readonly name: string,
    public readonly price: number,
    public readonly category: string,
    public readonly in_stock: boolean,
  ) {}
}
