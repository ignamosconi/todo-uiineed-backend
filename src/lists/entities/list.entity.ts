import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Todo } from '../../todos/entities/todo.entity';

@Entity('lists')
export class List {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 50, default: ""})
  title: string = "";

  @Column({ unique: true })
  url!: string;

  @CreateDateColumn()
  creation_date!: Date;

  @OneToMany(() => Todo, (todo) => todo.list)
  todos!: Todo[];
}