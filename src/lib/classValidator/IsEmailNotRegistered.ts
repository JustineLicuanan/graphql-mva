import {
	registerDecorator,
	ValidationArguments,
	ValidationOptions,
} from 'class-validator';

import { User } from '../../entity/User';

export const IsEmailNotRegistered = (
	forUpdate?: true,
	validationOptions: ValidationOptions = {
		message: 'Email is already registered',
	}
) => (object: Object, propertyName: string) => {
	registerDecorator({
		name: 'isEmailNotRegistered',
		target: object.constructor,
		propertyName,
		constraints: ['id'],
		options: validationOptions,
		validator: {
			validate: (email: string, args: ValidationArguments) =>
				User.findOne({ email }, { select: ['id'] }).then(
					(user) =>
						!user ||
						(!!forUpdate && user.id === (args.object as { id: string }).id)
				),
		},
	});
};
