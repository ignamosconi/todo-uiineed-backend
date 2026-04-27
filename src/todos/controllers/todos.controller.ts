import {Controller, Post, Get, Patch, Body, Param, Query, Inject, ParseIntPipe, Delete, } from '@nestjs/common';
import { CreateTodoDto } from '../dto/create-todo.dto';
import { UpdateTodoStatusDto } from '../dto/update-todo-status.dto';
import { TodoStatus } from '../enums/todo-status.enum';

import type { ITodosService } from '../services/todos.service.interface';
import { TrimNamePipe } from '../pipes/trim-name.pipe';
import { TodoStatusPipe } from '../pipes/todo-status.pipe';
import { UpdateTodoNameDto } from '../dto/update-todo-name.dto';

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

  //Active: Todos con status CREATED o COMPLETED, con isEliminated! = false
  @Get()
  async getActive(
    @Param('url') url: string,
    @Query('status', TodoStatusPipe) status?: TodoStatus,
  ) {
    return this.todosService.findActiveByStatus(url, status);
  }

  //Trash = Todos con isEliminated! = true
  @Get('trash')
  async getTrash(@Param('url') url: string) {
    return this.todosService.findTrash(url);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('url') url: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTodoStatusDto,
  ) {
    return this.todosService.changeStatus(url, id, dto.status);
  }

  @Patch(':id/name')
  async updateName(
    @Param('url') url: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTodoNameDto,
  ) {
    return this.todosService.changeName(url, id, dto.name);
  }

  //Marcar all todos como completed
  @Patch('complete-all')
  async allDone(@Param('url') url: string) {
    return this.todosService.completeAll(url);
  }

  //Pasar all todos completed a trash
  @Patch('clear-completed')
  async clearCompleted(@Param('url') url: string) {
    return this.todosService.clearCompleted(url);
  }

  //Pasar all todos created y completed a trash
  @Patch('clear-all')
  async deleteAll(@Param('url') url: string) {
    return this.todosService.clearAll(url);
  }

  //Se cambia isEliminated por true y la Todo mantiene su estado anterior a ser eliminada.
  @Patch('restore-trash')
  async restore(@Param('url') url: string) {
    return this.todosService.restoreTrash(url);
  }

  //Borrar de la bd todo lo que esté en trash. 
  @Delete('clear-trash')
  async clearTrash(@Param('url') url: string) {
    return this.todosService.clearTrash(url);
  }


}