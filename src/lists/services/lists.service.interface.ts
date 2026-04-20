import { CreateListResponseDto } from '../dto/create-list-response.dto';

export interface IListsService {
  generateNewList(): Promise<CreateListResponseDto>;
  validateList(url: string): Promise<void>;
  getListMetadata(url: string): Promise<{ url: string; creation_date: Date }>;
}