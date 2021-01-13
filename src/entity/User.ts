import {
	Entity,
	PrimaryColumn,
	Column,
	BeforeInsert,
	BaseEntity,
} from 'typeorm';
import { Field, ObjectType } from 'type-graphql';
import { v4 as uuidv4 } from 'uuid';
import { hash as bcryptHash } from 'bcryptjs';

@Entity('users')
@ObjectType()
export class User extends BaseEntity {
	@PrimaryColumn('uuid')
	@Field()
	id: string;

	@Column('text')
	@Field()
	email: string;

	@Column('text')
	password: string;

	@BeforeInsert()
	async genIdAndHashPass() {
		this.id = uuidv4();
		this.password = await bcryptHash(this.password, 10);
	}
}
