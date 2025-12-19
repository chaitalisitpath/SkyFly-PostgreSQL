import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { UpdateUserDto } from './dto/update.user.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async GetUser(id: number) {
        console.log('GetUser called for id:', id);
        const user = await this.prisma.user.findFirst({
            where: { id }
        });
        if (!user) {
            console.log('User not found for id:', id);
            throw new NotFoundException('User not found');
        }
        console.log('User retrieved:', { id: user.id, email: user.email, isProfileComplete: user.isProfileComplete, phone: user.phone, dob: user.dob });
        return user;
    }

    async UpdateUser(id:number, dto: UpdateUserDto){
        const isUserExist = await this.prisma.user.findFirst({
            where: {id}
        });
        if(!isUserExist)
        {
            throw new NotFoundException('User not found');
        }
        try{
            const result = await this.prisma.user.update({
                where: {id},
                data: dto
            });

            // Check if profile is complete
            if (result.phone && result.dob) {
                await this.prisma.user.update({
                    where: {id},
                    data: { isProfileComplete: true }
                });
                result.isProfileComplete = true;
            }

            return result;
        }
        catch(error)
        {
            throw error;
        }
    }
}
