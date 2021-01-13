import { Arg, Field, InputType, Mutation, Query, Resolver } from 'type-graphql';
import { IsEmail, IsUUID, MinLength } from 'class-validator';
import { compare as bcryptCompare, hash as bcryptHash } from 'bcryptjs';

import { IsEmailNotRegistered } from '../lib/classValidator/IsEmailNotRegistered';
import { User } from '../entity/User';

@InputType()
class CreateUserArgs {
	@Field()
	@IsEmail()
	@IsEmailNotRegistered()
	email: string;

	@Field()
	@MinLength(8)
	password: string;
}

@InputType()
class UpdateUserArgs {
	@Field()
	@IsUUID()
	id: string;

	@Field({ nullable: true })
	@IsEmail()
	@IsEmailNotRegistered(true)
	email?: string;

	@Field({ nullable: true })
	@MinLength(8)
	password?: string;
}

@InputType()
class DeleteUserArgs {
	@Field()
	@IsUUID()
	id: string;
}

@Resolver()
export class UserResolver {
	@Mutation(() => User)
	async createUser(
		@Arg('args', () => CreateUserArgs) { email, password }: CreateUserArgs
	) {
		return await User.create({
			email,
			password,
		}).save();
	}

	@Query(() => [User])
	async getAllUsers() {
		return await User.find({ select: ['id', 'email'] });
	}

	@Mutation(() => Boolean)
	async loginUser(
		@Arg('email') email: string,
		@Arg('password') password: string
	) {
		const user = await User.findOne({ email });
		if (!user) throw new Error('Email is incorrect');

		const isMatch = await bcryptCompare(password, user.password);
		if (!isMatch) throw new Error('Password is incorrect');
		return true;
	}

	@Mutation(() => Boolean)
	async updateUser(@Arg('args', () => UpdateUserArgs) args: UpdateUserArgs) {
		if (args.password) args.password = await bcryptHash(args.password, 10);
		const { affected } = await User.update(args.id, {
			...(!!args.email && { email: args.email }),
			...(!!args.password && { password: args.password }),
		});
		if (!affected) throw new Error('User not found');
		return true;
	}

	@Mutation(() => Boolean)
	async deleteUser(@Arg('args', () => DeleteUserArgs) { id }: DeleteUserArgs) {
		const { affected } = await User.delete(id);
		if (!affected) throw new Error('User not found');
		return true;
	}
}
