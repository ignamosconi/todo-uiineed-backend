import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class TrimNamePipe implements PipeTransform {
  transform(value: any) {
    if (value?.name && typeof value.name === 'string') {
      value.name = value.name.trim().slice(0, 126);
    }

    return value;
  }
}