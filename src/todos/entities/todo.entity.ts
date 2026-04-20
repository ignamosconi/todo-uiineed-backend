import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { List } from '../../lists/entities/list.entity';

@Entity('todos')
export class Todo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ default: 'created' }) // 'created', 'completed', 'eliminated'
  status!: string;

  @ManyToOne(() => List, (list) => list.todos)
  list!: List;
}