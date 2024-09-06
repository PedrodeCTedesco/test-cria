import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, INestApplication, Logger } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schema/user.schema';
import { SimpleUser } from 'src/types/user/user.type';
import { UpdateUserDto } from './dto/update-user.dto';

describe('users controller', () => {
  let app: INestApplication;
  let service: UsersService;
  const logger: Logger = new Logger();

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UsersService)
      .useValue({
        create: jest.fn().mockImplementation((dto) => ({
          id: 'mocked_id',
          username: dto.username,
          password: dto.password,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        findAll: jest.fn().mockResolvedValue([
          {
            id: 'mocked_id_1',
            username: 'user1',
            password: 'user@321',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'mocked_id_2',
            username: 'user2',
            password: 'user@123',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]),
        findOne: jest.fn().mockImplementation(
          (id) =>
            ({
              id,
              username: 'user',
              password: 'user@123',
            }) as SimpleUser,
        ),
        findOneByUsername: jest.fn().mockImplementation((username) => {
          if (username === 'existing_user') {
            return {
              id: 'mocked_id_existing',
              username: 'existing_user',
              password: 'existing@123',
            };
          }
          return null;
        }),
        update: jest.fn().mockImplementation((id, dto) => ({
          id,
          ...dto,
          updatedAt: new Date(),
        })),
        remove: jest.fn().mockResolvedValue({ deleted: true }),
      })
      .compile();

    app = module.createNestApplication();
    await app.init();
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('HTTP responses create method', () => {
    it('should return 201 if successful', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        username: 'novo usuário',
        password: 'novo@123',
      };

      jest.spyOn(service, 'findOneByUsername').mockResolvedValue(null);
      jest.spyOn(service, 'create').mockResolvedValue(createUserDto as User);

      // Act
      const result = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto);
      // Assert
      expect(result.statusCode).toBe(201);
      expect(result.body).toHaveProperty('username', createUserDto.username);
      expect(result.body).toHaveProperty('password', createUserDto.password);
    });

    it('should return 400 if password property is missing in payload', async () => {
      // Arrange
      const createUserDto: Partial<CreateUserDto> = {
        username: 'novo usuário',
      };
      // Act
      const result = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto);
      // Assert
      expect(result.statusCode).toBe(400);
      expect(result.body.message).toEqual([
        'password should not be empty',
        'password must be a string',
      ]);
    });

    it('should return 400 if username property is missing in payload', async () => {
      // Arrange
      const createUserDto: Partial<CreateUserDto> = {
        password: 'novo@123',
      };
      // Act
      const result = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto);
      // Assert
      expect(result.statusCode).toBe(400);
      expect(result.body.message).toEqual([
        'username should not be empty',
        'username must be a string',
      ]);
    });

    it('should return 409 if user already exists with the given username', async () => {
      // Arrange
      const existingUser: SimpleUser = {
        id: 'existing_id',
        username: 'username',
        password: 'user@123',
      };

      const createUserDto: CreateUserDto = {
        username: existingUser.username,
        password: 'newpassword@123',
      };

      jest.spyOn(service, 'create').mockRejectedValue(
        new ConflictException({
          type: process.env.API_DOCUMENTATION,
          title: 'User already exists',
          status: 409,
          detail: `A user with the username ${createUserDto.username} already exists.`,
          instance: '/users',
        }),
      );
      // Act
      const result = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto);
      // Assert
      expect(result.statusCode).toBe(409);
      expect(result.body.detail).toEqual(
        `A user with the username ${createUserDto.username} already exists.`,
      );
      expect(result.body.instance).toEqual('/users');
    });
  });

  describe('HTTP responses findAll method', () => {
    it('should return 200 if successful', async () => {
      // Arrange, Act
      const result = await request(app.getHttpServer()).get('/users');
      // Assert
      expect(result.statusCode).toBe(200);
      expect(result.body).toBeInstanceOf(Array);
    });

    it('should return 500 if unsuccessful', async () => {
      // Arrange
      const wrongReturn: any = {
        username: 'user',
        password: 'user@123',
      };
      jest.spyOn(service, 'findAll').mockResolvedValue(wrongReturn);
      jest.spyOn(logger, 'error').mockImplementation(() => {});

      // Act
      const result = await request(app.getHttpServer()).get('/users');

      // Assert
      expect(result.statusCode).toBe(500);
      expect(result.body.title).toBe('Data type must be an array');
      expect(result.body.detail).toBe(
        'The type of response data is not an array of users',
      );
      expect(result.body.instance).toBe('/users');
    });

    it('should return 500 if return is null', async () => {
      // Arrange
      jest.spyOn(service, 'findAll').mockResolvedValue(null);
      jest.spyOn(logger, 'error').mockImplementation(() => {});
      // Act
      const result = await request(app.getHttpServer()).get('/users');
      // Assert
      expect(result.statusCode).toBe(500);
    });

    it('should return 400 if password property is missing in payload', async () => {
      // Arrange
      const createUserDto: Partial<CreateUserDto> = {
        username: 'novo usuário',
      };
      // Act
      const result = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto);
      // Assert
      expect(result.statusCode).toBe(400);
      expect(result.body.message).toEqual([
        'password should not be empty',
        'password must be a string',
      ]);
    });

    it('it should return 400 if username property is missing in payload', async () => {
      // Arrange
      const createUserDto: Partial<CreateUserDto> = {
        password: 'novo@123',
      };
      // Act
      const result = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto);
      // Assert
      expect(result.statusCode).toBe(400);
      expect(result.body.message).toEqual([
        'username should not be empty',
        'username must be a string',
      ]);
    });
  });

  describe('HTTP responses findOne method', () => {
    it('should return 200 if the user was found', async () => {
      // Arrange
      const id: string = 'mock_id';
      const user: SimpleUser = {
        id: id,
        username: 'user',
        password: 'user@123',
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(user as User);
      // Act
      const result = await request(app.getHttpServer()).get(`/users/${id}`);
      // Assert
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual(user);
    });

    it('should return 404 if the user was not found and return value is null', async () => {
      // Arrange
      const id: string = 'mock_invalid_id';
      jest.spyOn(service, 'findOne').mockResolvedValue(null);
      // Act
      const result = await request(app.getHttpServer()).get(`/users/${id}`);
      // Assert
      expect(result.statusCode).toBe(404);
      expect(result.body.title).toBe('user not found');
      expect(result.body.detail).toBe(
        `Check the id because there is no user under the id ${id}`,
      );
      expect(result.body.instance).toBe('/users/:id');
    });

    it('should handle unexpected errors and return 500 with custom error details', async () => {
      // Arrange
      const id: string = 'mock_invalid_id';
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new Error('Database error'));
      jest.spyOn(logger, 'error').mockImplementation(() => {});
      // Act
      const result = await request(app.getHttpServer()).get(`/users/${id}`);
      // Assert
      expect(result.statusCode).toBe(500);
      expect(result.body.type).toBe(process.env.API_DOCUMENTATION);
      expect(result.body.title).toBe('Unexpected Internal Server Error');
      expect(result.body.status).toBe(500);
      expect(result.body.detail).toBe('An unexpected error occurred');
      expect(result.body.instance).toBe('/users/:id');
    });
  });

  describe('HTTP responses update method', () => {
    it('should return 200 if update was successul', async () => {
      // Arrange
      const id: string = 'valid_id';
      const updateUserDto: UpdateUserDto = {
        username: 'updated_username',
        password: 'new_password',
      };
      // Act
      const result = await request(app.getHttpServer())
        .patch(`/users/${id}`)
        .send(updateUserDto);
      // Assert
      expect(result.statusCode).toBe(200);
      expect(result.body.username).toBe(updateUserDto.username);
      expect(result.body.password).toBe(updateUserDto.password);
    });

    it('should return 404 if user was not found', async () => {
      // Arrange
      const invalidId: string = 'invalid_id';
      jest.spyOn(service, 'update').mockResolvedValue(null);
      // Act
      const result = await request(app.getHttpServer())
        .patch(`/users/${invalidId}`)
        .send({});
      // Assert
      expect(result.statusCode).toBe(404);
      expect(result.body.title).toBe('User not found');
      expect(result.body.detail).toBe(
        `Check the id because there is no user under the id ${invalidId} to update`,
      );
      expect(result.body.instance).toBe('/users/:id');
    });

    it('should return 500 if an unexpected error occurs', async () => {
      // Arrange
      const id: string = 'valid_id';
      jest
        .spyOn(service, 'update')
        .mockRejectedValue(new Error('Database error'));
      jest.spyOn(logger, 'error').mockImplementation(() => {});
      // Act
      const result = await request(app.getHttpServer())
        .patch(`/users/${id}`)
        .send({});
      // Assert
      expect(result.statusCode).toBe(500);
      expect(result.body.type).toBe(process.env.API_DOCUMENTATION);
      expect(result.body.title).toBe('Unexpected Internal Server Error');
      expect(result.body.status).toBe(500);
      expect(result.body.detail).toBe(
        'An unexpected error occurred during user update',
      );
      expect(result.body.instance).toBe('/users/:id');
    });
  });

  describe('HTTP responses remove method', () => {
    it('should return 200 No Content when user is successfully removed', async () => {
      // Arrange
      const id: string = 'existing_id';
      jest.spyOn(service, 'remove').mockResolvedValue(true);
      // Act
      const result = await request(app.getHttpServer()).delete(`/users/${id}`);
      // Assert
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({});
      expect(service.remove).toHaveBeenCalledWith(id);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });

    it('should return 404 if the user to remove does not exist', async () => {
      // Arrange
      const id: string = 'non_existent_id';
      jest.spyOn(service, 'remove').mockResolvedValue(null);

      // Act
      const result = await request(app.getHttpServer()).delete(`/users/${id}`);

      // Assert
      expect(result.statusCode).toBe(404);
      expect(result.body.title).toBe('User not found');
      expect(result.body.detail).toBe(
        `Check the id because there is no user under the id ${id} to delete`,
      );
      expect(result.body.instance).toBe(`/users/${id}`);
    });

    it('should return 500 if an unexpected error occurs', async () => {
      // Arrange
      const id: string = 'id_to_remove';
      jest
        .spyOn(service, 'remove')
        .mockRejectedValue(new Error('Unexpected error'));

      // Act
      const result = await request(app.getHttpServer()).delete(`/users/${id}`);

      // Assert
      expect(result.statusCode).toBe(500);
      expect(result.body.title).toBe('Unexpected Internal Server Error');
      expect(result.body.detail).toBe(
        'An unexpected error occurred during user deletion',
      );
      expect(result.body.instance).toBe(`/users/${id}`);
    });
  });
});
