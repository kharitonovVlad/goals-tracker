export class LocalStorage<T> {
  private items: T[] = [];

  constructor(private key: string) {}

  public getItems(): T[] {
    const result = localStorage.getItem(this.key);
    if (result) {
      this.items = JSON.parse(result);
    }

    return this.items;
  }

  public setItems(items: T[]): void {
    this.items = items;
    localStorage.setItem(this.key, JSON.stringify(this.items));
  }
}
