import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { List } from '../../lists/entities/list.entity';
import { TodoStatus } from '../enums/todo-status.enum';

@Entity('todos')
export class Todo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 126 })
  name!: string;

  @Column({
    type: 'enum',
    enum: TodoStatus,
    default: TodoStatus.CREATED,
  })
  status!: TodoStatus;

  //El front permite que las tareas eliminadas tengan estado (created / completed), entonces
  //eliminated no es un estado del enum, tiene que ir aparte.
  @Column({ default: false })
  isEliminated!: boolean;

  @ManyToOne(() => List, (list) => list.todos)
  list!: List;
}