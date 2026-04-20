import {Controller, Post, Get, Patch, Body, Param, Query, Inject, ParseIntPipe, } from '@nestjs/common';
import { CreateTodoDto } from '../dto/create-todo.dto';
import { UpdateTodoStatusDto } from '../dto/update-todo-status.dto';
import { TodoStatus } from '../enums/todo-status.enum';

import type { ITodosService } from '../services/todos.service.interface';
import { TrimNamePipe } from '../pipes/trim-name.pipe';
import { TodoStatusPipe } from '../pipes/todo-status.pipe';

@Controller('todos/:url')
export class TodosController {
  constructor(
    @Inject('ITodosService') private readonly todosService: ITodosService,
  ) {}

  @Post()
  async add(
    @Param('url') url: string,
    @Body(new TrimNamePipe()) dto: CreateTodoDto,
  ) {
    return this.todosService.create(url, dto.name);
  }

  @Get()
  async get(
    @Param('url') url: string,
    @Query('status', TodoStatusPipe) status: TodoStatus,
  ) {
    return this.todosService.findByStatus(url, status);
  }

  @Patch(':id/status')
  async update(
    @Param('url') url: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTodoStatusDto,
  ) {
    return this.todosService.changeStatus(url, id, dto.status);
  }

  @Post('complete-all')
  async allDone(@Param('url') url: string) {
    return this.todosService.completeAll(url);
  }

  @Post('clear-all')
  async deleteAll(@Param('url') url: string) {
    return this.todosService.clearAll(url);
  }
}