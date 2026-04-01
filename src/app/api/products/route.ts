import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';
import { parseJsonField, serializeArray } from '@/lib/json-fields';

function haversinemiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

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
    const colorsParam = searchParams.get('colors');
    const colors = colorsParam ? colorsParam.split(',').map(c => c.trim()).filter(Boolean) : null;
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;
    const distance = searchParams.get('distance') ? parseFloat(searchParams.get('distance')!) : null;
    const ownerIdParam = searchParams.get('ownerId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const filterByDates = !!(startDate && endDate);

    const filterByLocation = lat !== null && lng !== null && distance !== null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = ownerIdParam
      ? { ownerId: ownerIdParam }
      : { status: 'ACTIVE', owner: { vacationMode: false } };

    if (category) where.category = category;

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

    if (condition) where.condition = condition;
    if (colors?.length) where.color = { in: colors };

    // Exclude products with overlapping bookings when date filtering
    if (filterByDates) {
      const bookedProductIds = await prisma.booking.findMany({
        where: {
          startDate: { lte: new Date(endDate!) },
          endDate: { gte: new Date(startDate!) },
          status: { in: ['PENDING', 'APPROVED', 'PAID', 'COLLECTED'] },
        },
        select: { productId: true },
      });
      const bookedIds = [...new Set(bookedProductIds.map(b => b.productId))];
      if (bookedIds.length) where.id = { notIn: bookedIds };
    }

    // When filtering by location fetch all matching rows (no pagination limit) so we
    // can apply the distance filter before slicing. Otherwise use normal pagination.
    const fetchAll = filterByLocation || filterByDates;
    const skip = fetchAll ? 0 : (page - 1) * pageSize;
    const take = fetchAll ? undefined : pageSize;

    const products = await prisma.product.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true, blockedDates: filterByDates } },
        location: { select: { city: true, lat: true, lng: true } },
        _count: { select: { reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

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

    // Post-filter by owner blocked dates when date filtering is active
    const afterDateFilter = filterByDates
      ? productsWithRatings.filter(p => {
          const owner = p.owner as typeof p.owner & { blockedDates?: string };
          if (!owner.blockedDates) return true;
          try {
            const ranges: { start: string; end: string }[] = JSON.parse(owner.blockedDates);
            const qStart = new Date(startDate!);
            const qEnd = new Date(endDate!);
            return !ranges.some(r => new Date(r.start) <= qEnd && new Date(r.end) >= qStart);
          } catch { return true; }
        })
      : productsWithRatings;

    // Apply distance filter in JS after fetching
    const filtered = filterByLocation
      ? afterDateFilter.filter(p => {
          const plat = p.location?.lat;
          const plng = p.location?.lng;
          if (plat == null || plng == null) return false;
          return haversinemiles(lat!, lng!, plat, plng) <= distance!;
        })
      : afterDateFilter;

    // Paginate the distance-filtered results
    const total = filtered.length;
    const items = filterByLocation ? filtered.slice((page - 1) * pageSize, page * pageSize) : filtered;

    return successResponse({
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
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
