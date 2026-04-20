import { List } from '../entities/list.entity';

export interface IListsRepository {
  create(): Promise<List>;
  findByUrl(url: string): Promise<List | null>;
}