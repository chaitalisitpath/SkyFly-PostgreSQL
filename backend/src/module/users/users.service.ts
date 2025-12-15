import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { UpdateUserDto } from './dto/update.user.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async UpdateUser(id:number, dto: UpdateUserDto){
        console.log('UpdateUser service called with id:', id, 'dto:', dto);
        const isUserExist = await this.prisma.user.findFirst({
            where: {id}
        });
        console.log('User exists:', !!isUserExist);

        if(!isUserExist)
        {
            throw new NotFoundException('User not found');
        }
        try{
            const result = await this.prisma.user.update({
                where: {id},
                data: dto
            });
            console.log('Update result:', result);
            return result;
        }
        catch(error)
        {
            console.log('Update error:', error);
            throw error;
        }
    }
}
