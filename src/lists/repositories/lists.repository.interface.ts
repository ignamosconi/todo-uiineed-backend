import { List } from '../entities/list.entity';

export interface IListsRepository {
  create(): Promise<List>;
  findByUrl(url: string): Promise<List | null>;
  updateByUrl(url: string, title: string): Promise<List | null>;

  deleteEmptyLists(): Promise<void>;
  deleteInactiveLists(): Promise<void>
}