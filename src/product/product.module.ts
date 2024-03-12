import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PaginationService } from '../pagination/pagination.service';
import { PrismaService } from '../prisma.service';

@Module({
	controllers: [ProductController],
	providers: [ProductService, ProductService, PaginationService, PrismaService],
})
export class ProductModule {}
