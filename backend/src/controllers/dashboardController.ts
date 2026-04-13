// ============================================================
// 📁 controllers/dashboardController.ts — Dashboard Statistics
// ============================================================
// INTERVIEW TIP: "The aggregation pipeline is MongoDB's most
// powerful feature. It processes documents through stages like
// $match, $group, $sort, $project — similar to SQL's GROUP BY,
// WHERE, and SELECT. Each stage transforms the data and passes
// it to the next stage."
// ============================================================

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Case from '../models/Case';
import Client from '../models/Client';
import Hearing from '../models/Hearing';

// ============================================================
// GET /api/v1/dashboard/stats
// ============================================================
export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user?._id as string);
    const now = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    // Run all queries in parallel for speed
    const [
      totalClients,
      totalCases,
      casesByStatus,
      casesByType,
      upcomingHearings,
      recentCases,
    ] = await Promise.all([
      // Count total clients
      Client.countDocuments({ createdBy: userId }),

      // Count total cases
      Case.countDocuments({ createdBy: userId }),

      // AGGREGATION: Group cases by status
      // INTERVIEW TIP: "This pipeline:
      //   1. $match — filter to only this user's cases
      //   2. $group — group by status and count each group
      // It's like: SELECT status, COUNT(*) FROM cases
      //            WHERE createdBy = userId GROUP BY status"
      Case.aggregate([
        { $match: { createdBy: userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // Group cases by type
      Case.aggregate([
        { $match: { createdBy: userId } },
        { $group: { _id: '$caseType', count: { $sum: 1 } } },
      ]),

      // Get upcoming hearings (next 7 days)
      Hearing.find({
        createdBy: userId,
        status: 'scheduled',
        date: { $gte: now, $lte: weekFromNow },
      })
        .populate({
          path: 'case',
          select: 'caseNumber title client',
          populate: { path: 'client', select: 'name' },
        })
        .sort({ date: 1 })
        .limit(10)
        .lean(),

      // Get recently created cases
      Case.find({ createdBy: userId })
        .populate('client', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    // Transform aggregation results into a cleaner format
    // From: [{ _id: 'active', count: 5 }, { _id: 'closed', count: 3 }]
    // To:   { active: 5, closed: 3 }
    const statusMap: Record<string, number> = {};
    casesByStatus.forEach((item: any) => {
      statusMap[item._id] = item.count;
    });

    const typeMap: Record<string, number> = {};
    casesByType.forEach((item: any) => {
      typeMap[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalClients,
          totalCases,
          activeCases: statusMap['active'] || 0,
          pendingCases: statusMap['pending'] || 0,
          closedCases: statusMap['closed'] || 0,
          upcomingHearingsCount: upcomingHearings.length,
        },
        casesByStatus: statusMap,
        casesByType: typeMap,
        upcomingHearings,
        recentCases,
      },
    });
  } catch (error) {
    next(error);
  }
};
