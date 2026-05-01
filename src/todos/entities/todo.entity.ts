import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { List } from '../../lists/entities/list.entity';
import { TodoStatus } from '../enums/todo-status.enum';

@Index(['list', 'position'], { unique: true})
@Entity('todos')
export class Todo {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ length: 126 })
  name!: string;

  @Column({ type: 'float' })
  position!: number;

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

  @ManyToOne(() => List, (list) => list.todos, { onDelete: 'CASCADE' })
  list!: List;
}