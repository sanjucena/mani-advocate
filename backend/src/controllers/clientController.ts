// ============================================================
// 📁 controllers/clientController.ts — Client CRUD Operations
// ============================================================
// INTERVIEW TIP: "CRUD = Create, Read, Update, Delete — the
// four basic operations for any persistent data. In REST APIs:
//   Create → POST     Read → GET
//   Update → PUT      Delete → DELETE"
// ============================================================

import { Request, Response, NextFunction } from 'express';
import Client from '../models/Client';
import { AppError } from '../middleware/errorHandler';

// ============================================================
// GET /api/v1/clients — List All Clients (with search & pagination)
// ============================================================
// INTERVIEW TIP: "Pagination prevents loading ALL documents at
// once. We use 'skip' and 'limit' in MongoDB:
//   Page 1: skip(0).limit(10)  → documents 1-10
//   Page 2: skip(10).limit(10) → documents 11-20"
// ============================================================
export const getClients = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;

    // Build the filter object
    // INTERVIEW TIP: "We build the query dynamically based on
    // what parameters the client sends. This is a common pattern."
    const filter: any = { createdBy: req.user?._id };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },  // Case-insensitive
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;

    const [clients, total] = await Promise.all([
      Client.find(filter)
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit)
        .lean(),  // .lean() returns plain JS objects (faster, no Mongoose overhead)
      Client.countDocuments(filter),
    ]);

    // INTERVIEW TIP: "Promise.all runs both queries in parallel
    // instead of sequentially. This is faster because we don't
    // wait for clients to finish before counting."

    res.status(200).json({
      success: true,
      data: {
        clients,
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
// GET /api/v1/clients/:id — Get Single Client
// ============================================================
export const getClient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // .populate('cases') fetches the virtual field we defined
    const client = await Client.findOne({
      _id: req.params.id,
      createdBy: req.user?._id,
    }).populate('cases');

    if (!client) {
      throw new AppError('Client not found', 404);
    }

    res.status(200).json({
      success: true,
      data: { client },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// POST /api/v1/clients — Create New Client
// ============================================================
export const createClient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Add the logged-in user's ID as the creator
    req.body.createdBy = req.user?._id;

    const client = await Client.create(req.body);

    res.status(201).json({
      success: true,
      data: { client },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// PUT /api/v1/clients/:id — Update Client
// ============================================================
export const updateClient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // INTERVIEW TIP: "findOneAndUpdate with { new: true } returns
    // the UPDATED document. Without it, you get the old version.
    // runValidators ensures the update follows schema rules."
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user?._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!client) {
      throw new AppError('Client not found', 404);
    }

    res.status(200).json({
      success: true,
      data: { client },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE /api/v1/clients/:id — Delete Client
// ============================================================
export const deleteClient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const client = await Client.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user?._id,
    });

    if (!client) {
      throw new AppError('Client not found', 404);
    }

    // INTERVIEW TIP: "204 No Content is standard for successful
    // DELETE operations. Some APIs return 200 with a message."
    res.status(200).json({
      success: true,
      message: 'Client deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
