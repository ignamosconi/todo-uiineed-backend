import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { List } from '../../lists/entities/list.entity';
import { TodoStatus } from '../enums/todo-status.enum';

@Entity('todos')
export class Todo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({
    type: 'enum',
    enum: TodoStatus,
    default: TodoStatus.CREATED,
  })
  status!: TodoStatus;

  @ManyToOne(() => List, (list) => list.todos)
  list!: List;
}