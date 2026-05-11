import {Controller, Post, Get, Patch, Body, Param, Query, Inject, ParseIntPipe, Delete, } from '@nestjs/common';
import { CreateTodoDto } from '../dto/create-todo.dto';
import { UpdateTodoStatusDto } from '../dto/update-todo-status.dto';
import { TodoStatus } from '../enums/todo-status.enum';

import type { ITodosService } from '../services/todos.service.interface';
import { TrimNamePipe } from '../pipes/trim-name.pipe';
import { TodoStatusPipe } from '../pipes/todo-status.pipe';
import { UpdateTodoNameDto } from '../dto/update-todo-name.dto';
import { UpdateTodoIsEliminatedDto } from '../dto/update-todo-isEliminated.dto';
import { TodoResponseDto } from '../dto/todo-response.dto';
import { SuccessResponseDto } from '../dto/success-response.dto';
import { ReorderItemDto } from '../dto/reorder-item.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('todos/:url')
export class TodosController {
  constructor(
    @Inject('ITodosService') private readonly todosService: ITodosService,
  ) {}

  //Active: Todos con status CREATED o COMPLETED, con isEliminated = false
  @Get()
  async getActive(
    @Param('url') url: string,
    @Query('status', TodoStatusPipe) status?: TodoStatus,
  ): Promise<TodoResponseDto[]> {
    console.log('[GET /todos/:url]: Getting all todos with CREATED & COMPLETED status, with isEliminated = false.')
    return this.todosService.findActiveByStatus(url, status);
  }

  @Post()
  @Throttle({ default: { limit: 5, ttl: 1000 } })
  async add(
    @Param('url') url: string,
    @Body(new TrimNamePipe()) dto: CreateTodoDto,
  ): Promise<TodoResponseDto> {
    console.log('[POST /todos/:url]: Creating a todo.')
    return this.todosService.create(url, dto.name);
  }


  //Trash = Todos con isEliminated! = true
  @Get('trash')
  async getTrash(@Param('url') url: string): Promise<TodoResponseDto[]> {
    console.log('[POST /todos/:url/trash]: Getting all todos with isEliminated = false')
    return this.todosService.findTrash(url);
  }

  @Patch('reorder')
  async reorder(
    @Param('url') url: string,
    @Body() dto: ReorderItemDto,
  ): Promise<SuccessResponseDto> {
    console.log('[PATCH /todos/:url/reorder]: Reordering todos')
    return this.todosService.reorder(url, dto);
  }

  @Patch(':id/status')
  @Throttle({ default: { limit: 50, ttl: 10000 } })
  async updateStatus(
    @Param('url') url: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTodoStatusDto,
  ): Promise<TodoResponseDto> {
    console.log('[PATCH /todos/:url/:id/status]: Changing todo status.')
    return this.todosService.changeStatus(url, id, dto.status);
  }

  @Patch(':id/name')
  @Throttle({ default: { limit: 20, ttl: 10000 } })
  async updateName(
    @Param('url') url: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTodoNameDto,
  ): Promise<TodoResponseDto> {
    console.log('[PATCH /todos/:url/:id/name]: Changing todo name.')
    return this.todosService.changeName(url, id, dto.name);
  }

  //Modificar isEliminated a true o false
  @Patch(':id/is-eliminated')
  async updateIsEliminated(
    @Param('url') url: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTodoIsEliminatedDto,
  ): Promise<TodoResponseDto> {
    console.log('[PATCH /todos/:url/:id/is-eliminated]: Changing todo isEliminated to '+ dto.isEliminated+'.')
    return this.todosService.changeIsEliminated(url, id, dto.isEliminated);
  }

  //Marcar all todos como completed
  @Patch('complete-all')
  @Throttle({ default: { limit: 15, ttl: 60000 } }) 
  async allDone(@Param('url') url: string): Promise<SuccessResponseDto> {
    console.log('[PATCH /todos/:url/complete-all]: Completing all todos.')
    return this.todosService.completeAll(url);
  }

  //Pasar all todos completed a trash
  @Patch('clear-completed')
  @Throttle({ default: { limit: 15, ttl: 60000 } }) 
  async clearCompleted(@Param('url') url: string): Promise<SuccessResponseDto> {
    console.log('[PATCH /todos/:url/complete-all]: Trashing all completed todos.')
    return this.todosService.clearCompleted(url);
  }

  //Pasar all todos created y completed a trash
  @Patch('clear-all')
  @Throttle({ default: { limit: 15, ttl: 60000 } }) 
  async deleteAll(@Param('url') url: string): Promise<SuccessResponseDto> {
    console.log('[PATCH /todos/:url/complete-all]: Completing all todos.')
    return this.todosService.clearAll(url);
  }

  //Se actualizan a todas las 'todos' con isEliminated: false por isEliminated:true, manteniendo su estado anterior a ser eliminadas.
  @Patch('restore-trash')
  @Throttle({ default: { limit: 15, ttl: 60000 } }) 
  async restore(@Param('url') url: string): Promise<SuccessResponseDto> {
    console.log('[PATCH /todos/:url/restore-trash]: Restoring all todos in trash.')
    return this.todosService.restoreTrash(url);
  }

  //Borrar de la bd todo lo que esté en trash. 
  @Delete('clear-trash')
  @Throttle({ default: { limit: 15, ttl: 60000 } }) 
  async clearTrash(@Param('url') url: string): Promise<SuccessResponseDto> {
    console.log('[DELETE /todos/:url/clear-trash]: Permanently deleting all todos in trash.')
    return this.todosService.clearTrash(url);
  }

}