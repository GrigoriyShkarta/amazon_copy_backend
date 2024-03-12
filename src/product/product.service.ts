import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { generateSlug } from '../utils/generate-slug';
import { productReturnObject, productReturnObjectFullest } from './return-product.object';
import { ProductsDto } from './dto/products.dto';
import { EnumProductSort, GetAllProductDto } from './dto/get-all.product.dto';
import { PaginationService } from '../pagination/pagination.service';
import { Prisma } from '@prisma/client';
import { returnCategoryObject } from '../category/return-category.object';

@Injectable()
export class ProductService {
	constructor(
		private prisma: PrismaService,
		private paginationService: PaginationService,
	) {}

	async getAll(dto: GetAllProductDto = {}) {
		const { sort, searchTerm } = dto;

		const prismaSort: Prisma.ProductOrderByWithRelationInput[] = [];

		if (sort === EnumProductSort.LOW_PRICE) {
			prismaSort.push({ price: 'asc' });
		} else if (sort === EnumProductSort.HIGH_PRICE) {
			prismaSort.push({ price: 'desc' });
		} else if (sort === EnumProductSort.OLDEST) {
			prismaSort.push({ createdAt: 'asc' });
		} else {
			prismaSort.push({ createdAt: 'desc' });
		}

		const prismaSearchTermFilter: Prisma.ProductWhereInput = searchTerm
			? {
					OR: [
						{
							category: {
								name: {
									contains: searchTerm,
									mode: 'insensitive',
								},
							},
						},
						{
							name: {
								contains: searchTerm,
								mode: 'insensitive',
							},
						},
						{
							description: {
								contains: searchTerm,
								mode: 'insensitive',
							},
						},
					],
				}
			: {};

		const { perPage, skip } = this.paginationService.getPagination(dto);

		const products = await this.prisma.product.findMany({
			where: prismaSearchTermFilter,
			orderBy: prismaSort,
			skip,
			take: perPage,
		});

		return {
			products,
			length: await this.prisma.product.count({
				where: prismaSearchTermFilter,
			}),
		};
	}

	async byId(id: number) {
		const product = await this.prisma.product.findUnique({
			where: {
				id,
			},
			select: productReturnObjectFullest,
		});
		if (!product) {
			throw new Error('Product not found');
		}

		return product;
	}

	async bySlug(slug: string) {
		const product = await this.prisma.product.findUnique({
			where: {
				slug,
			},
			select: productReturnObjectFullest,
		});
		if (!product) {
			throw new NotFoundException('Product not found');
		}

		return product;
	}

	async byCategory(categorySlug: string) {
		console.log(categorySlug);
		const product = await this.prisma.product.findMany({
			where: {
				category: {
					slug: categorySlug,
				},
			},
			select: productReturnObjectFullest,
		});
		if (!product) {
			throw new NotFoundException('Product not found');
		}

		return product;
	}

	async getSimilar(id: number) {
		const currentProduct = await this.byId(id);

		const products = await this.prisma.product.findMany({
			where: {
				category: {
					name: currentProduct.category.name,
				},
				NOT: {
					id: currentProduct.id,
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
			select: productReturnObject,
		});

		return products;
	}

	async create() {
		const product = await this.prisma.product.create({
			data: {
				description: '',
				price: 0,
				name: '',
				slug: '',
				category: { connect: { id: null } },
			},
		});

		return product.id;
	}

	async update(id: number, dto: ProductsDto) {
		const { description, images, price, name, categoryId } = dto;

		return this.prisma.product.update({
			where: {
				id,
			},
			data: {
				description,
				images,
				price,
				name,
				slug: generateSlug(dto.name),
				category: {
					connect: {
						id: categoryId,
					},
				},
			},
		});
	}

	async delete(id: number) {
		return this.prisma.product.delete({
			where: {
				id,
			},
		});
	}
}
