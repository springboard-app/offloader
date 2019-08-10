import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ApiModelProperty } from '@nestjs/swagger';
import { IsEmpty, IsOptional, IsString } from 'class-validator';

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  @ApiModelProperty({
    readOnly: true
  })
  id: string;

  @CreateDateColumn()
  @ApiModelProperty({
    readOnly: true
  })
  createdAt: string;

  @UpdateDateColumn()
  @ApiModelProperty({
    readOnly: true
  })
  updatedAt: string;

  @Column()
  @IsString()
  @ApiModelProperty()
  title: string;

  @Column()
  @IsString()
  @ApiModelProperty()
  description: string;
}
