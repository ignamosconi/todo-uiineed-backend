import { CreateListResponseDto } from '../dto/create-list-response.dto';
import { ListMetadataDto } from '../dto/list-metadata-response.dto';
import { UpdateListResponseDto } from '../dto/update-list-response.dto';

export interface IListsService {
  generateNewList(): Promise<CreateListResponseDto>;
  getListMetadata(url: string): Promise<ListMetadataDto>;
  updateList(url: string, title: string): Promise<UpdateListResponseDto>;

  cleanupLists(): Promise<void>;
}