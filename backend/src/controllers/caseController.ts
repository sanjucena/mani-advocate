// ============================================================
// 📁 controllers/caseController.ts — Case CRUD Operations
// ============================================================

import { Request, Response, NextFunction } from 'express';
import Case from '../models/Case';
import { AppError } from '../middleware/errorHandler';

// ============================================================
// GET /api/v1/cases — List Cases with Filters
// ============================================================
export const getCases = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const caseType = req.query.caseType as string;
    const priority = req.query.priority as string;
    const clientId = req.query.clientId as string;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;

    // Build dynamic filter
    const filter: any = { createdBy: req.user?._id };

    if (status) filter.status = status;
    if (caseType) filter.caseType = caseType;
    if (priority) filter.priority = priority;
    if (clientId) filter.client = clientId;

    if (search) {
      filter.$or = [
        { caseNumber: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { court: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [cases, total] = await Promise.all([
      Case.find(filter)
        .populate('client', 'name phone')  // Only get client name & phone
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit)
        .lean(),
      Case.countDocuments(filter),
    ]);

    // INTERVIEW TIP: ".populate('client', 'name phone') is like
    // a JOIN in SQL. It replaces the client ObjectId with the
    // actual client document, but only the 'name' and 'phone'
    // fields (projecting). This keeps the response lightweight."

    res.status(200).json({
      success: true,
      data: {
        cases,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET /api/v1/cases/:id — Get Single Case with Hearings
// ============================================================
export const getCase = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const caseDoc = await Case.findOne({
      _id: req.params.id,
      createdBy: req.user?._id,
    })
      .populate('client')
      .populate('hearings');

    if (!caseDoc) {
      throw new AppError('Case not found', 404);
    }

    res.status(200).json({
      success: true,
      data: { case: caseDoc },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// POST /api/v1/cases — Create New Case
// ============================================================
export const createCase = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    req.body.createdBy = req.user?._id;

    const newCase = await Case.create(req.body);

    // Populate client info before sending response
    await newCase.populate('client', 'name phone');

    res.status(201).json({
      success: true,
      data: { case: newCase },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// PUT /api/v1/cases/:id — Update Case
// ============================================================
export const updateCase = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const updatedCase = await Case.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user?._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('client', 'name phone');

    if (!updatedCase) {
      throw new AppError('Case not found', 404);
    }

    res.status(200).json({
      success: true,
      data: { case: updatedCase },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE /api/v1/cases/:id — Delete Case
// ============================================================
export const deleteCase = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const caseDoc = await Case.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user?._id,
    });

    if (!caseDoc) {
      throw new AppError('Case not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Case deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// POST /api/v1/cases/:id/notes — Add Note to Case
// ============================================================
// INTERVIEW TIP: "This uses MongoDB's $push operator to add
// an item to an embedded array without replacing the whole array."
// ============================================================
export const addNote = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const caseDoc = await Case.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user?._id },
      {
        $push: {
          notes: {
            content: req.body.content,
            date: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!caseDoc) {
      throw new AppError('Case not found', 404);
    }

    res.status(200).json({
      success: true,
      data: { case: caseDoc },
    });
  } catch (error) {
    next(error);
  }
};
