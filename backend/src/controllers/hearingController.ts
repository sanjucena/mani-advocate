// ============================================================
// 📁 controllers/hearingController.ts — Hearing CRUD Operations
// ============================================================

import { Request, Response, NextFunction } from 'express';
import Hearing from '../models/Hearing';
import { AppError } from '../middleware/errorHandler';

// ============================================================
// GET /api/v1/hearings — List Hearings
// ============================================================
export const getHearings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const caseId = req.query.caseId as string;

    const filter: any = { createdBy: req.user?._id };
    if (status) filter.status = status;
    if (caseId) filter.case = caseId;

    const skip = (page - 1) * limit;

    const [hearings, total] = await Promise.all([
      Hearing.find(filter)
        .populate({
          path: 'case',
          select: 'caseNumber title client',
          populate: { path: 'client', select: 'name' },
        })
        .sort({ date: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Hearing.countDocuments(filter),
    ]);

    // INTERVIEW TIP: "Nested populate lets you populate a field
    // WITHIN a populated document. Here we populate case, and
    // inside that case, we also populate the client's name."

    res.status(200).json({
      success: true,
      data: {
        hearings,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET /api/v1/hearings/upcoming — Get Upcoming Hearings
// ============================================================
export const getUpcomingHearings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    // INTERVIEW TIP: "$gte and $lte are MongoDB comparison
    // operators: $gte = greater than or equal, $lte = less than
    // or equal. Combined, they create a date range filter."
    const hearings = await Hearing.find({
      createdBy: req.user?._id,
      status: 'scheduled',
      date: { $gte: now, $lte: futureDate },
    })
      .populate({
        path: 'case',
        select: 'caseNumber title client',
        populate: { path: 'client', select: 'name phone' },
      })
      .sort({ date: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: { hearings, count: hearings.length },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// POST /api/v1/hearings — Create Hearing
// ============================================================
export const createHearing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    req.body.createdBy = req.user?._id;

    const hearing = await Hearing.create(req.body);
    await hearing.populate({
      path: 'case',
      select: 'caseNumber title',
    });

    res.status(201).json({
      success: true,
      data: { hearing },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET /api/v1/hearings/:id — Get Single Hearing
// ============================================================
export const getHearing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const hearing = await Hearing.findOne({
      _id: req.params.id,
      createdBy: req.user?._id,
    }).populate({
      path: 'case',
      select: 'caseNumber title client',
      populate: { path: 'client', select: 'name phone' },
    });

    if (!hearing) {
      throw new AppError('Hearing not found', 404);
    }

    res.status(200).json({
      success: true,
      data: { hearing },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// PUT /api/v1/hearings/:id — Update Hearing
// ============================================================
export const updateHearing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const hearing = await Hearing.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user?._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!hearing) {
      throw new AppError('Hearing not found', 404);
    }

    res.status(200).json({
      success: true,
      data: { hearing },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE /api/v1/hearings/:id — Delete Hearing
// ============================================================
export const deleteHearing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const hearing = await Hearing.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user?._id,
    });

    if (!hearing) {
      throw new AppError('Hearing not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Hearing deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
