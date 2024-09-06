import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nome elegido pelo usuário',
    example: 'Pedro de Castro Tedesco',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Senha elegida pelo usuário',
    example: 'Pedro@123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
