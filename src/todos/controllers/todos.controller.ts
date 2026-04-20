import { Controller, Post, Get, Patch, Body, Param, Query, Inject } from '@nestjs/common';
import type { ITodosService } from '../services/todos.service.interface';

@Controller('todos/:url') // El ":url" permite capturar el código único de la lista
export class TodosController {
  constructor(
    @Inject('ITodosService') private readonly todosService: ITodosService,
  ) {}

  // Crear nueva tarea
  @Post()
  async add(@Param('url') url: string, @Body('name') name: string) {
    return await this.todosService.create(url, name);
  }

  // Consultar tareas por estado (created, completed, eliminated)
  // Ejemplo: GET /todos/abc-123?status=completed
  @Get()
  async get(@Param('url') url: string, @Query('status') status: string) {
    return await this.todosService.findByStatus(url, status || 'created');
  }

  //Cambiar estado de una tarea puntual
  @Patch(':id/status')
  async update(@Param('id') id: number, @Body('status') status: string) {
    return await this.todosService.changeStatus(id, status);
  }

  // 7. Marcar todas las "created" como "completed"
  @Post('complete-all')
  async allDone(@Param('url') url: string) {
    return await this.todosService.completeAll(url);
  }

  // 8. "Eliminar" todas (pasar a estado eliminated)
  @Post('clear-all')
  async deleteAll(@Param('url') url: string) {
    return await this.todosService.clearAll(url);
  }
}