import { Product } from '../models/product.model';

export class ProductFactory {
  static create(overrides: Partial<Product> = {}): Product {
    return new Product(
      overrides.name ?? 'Wireless Headphones',
      overrides.price ?? 59.99,
      overrides.category ?? 'Electronics',
      overrides.in_stock ?? true,
    );
  }
}
