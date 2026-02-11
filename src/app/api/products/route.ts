import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';
import { parseJsonField, serializeArray } from '@/lib/json-fields';

// GET /api/products - List products with pagination and filters
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '12');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const condition = searchParams.get('condition');

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      status: 'ACTIVE',
      owner: { vacationMode: false },
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price1Day = {};
      if (minPrice) where.price1Day.gte = parseFloat(minPrice);
      if (maxPrice) where.price1Day.lte = parseFloat(maxPrice);
    }

    if (condition) {
      where.condition = condition;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          location: {
            select: {
              city: true,
            },
          },
          _count: {
            select: { reviews: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.product.count({ where }),
    ]);

    // Calculate average ratings and parse JSON fields
    const productsWithRatings = await Promise.all(
      products.map(async (product) => {
        const avgRating = await prisma.review.aggregate({
          where: { productId: product.id },
          _avg: { rating: true },
        });
        return {
          ...product,
          tags: parseJsonField(product.tags),
          images: parseJsonField(product.images),
          avgRating: avgRating._avg.rating,
          reviewCount: product._count.reviews,
        };
      })
    );

    return successResponse({
      items: productsWithRatings,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / take),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}

// POST /api/products - Create a new product
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    const body = await req.json();
    const {
      title,
      description,
      category,
      tags,
      condition,
      color,
      quantity,
      price1Day,
      price3Day,
      price7Day,
      images,
      locationId,
    } = body;

    const tagsArray = Array.isArray(tags) ? tags : tags ? JSON.parse(tags) : [];
    const imagesArray = Array.isArray(images) ? images : images ? JSON.parse(images) : [];

    const product = await prisma.product.create({
      data: {
        ownerId: user.id,
        title,
        description,
        category,
        tags: serializeArray(tagsArray),
        condition,
        color,
        quantity: parseInt(quantity) || 1,
        price1Day: parseFloat(price1Day),
        price3Day: price3Day ? parseFloat(price3Day) : null,
        price7Day: price7Day ? parseFloat(price7Day) : null,
        images: serializeArray(imagesArray),
        locationId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        location: true,
      },
    });

    return successResponse(
      {
        ...product,
        tags: tagsArray,
        images: imagesArray,
      },
      201
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
