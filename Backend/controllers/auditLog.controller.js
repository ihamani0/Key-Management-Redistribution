
import db from "../models/index.js"
import expressAsyncHandler from "express-async-handler";




export const getAuditLogs = expressAsyncHandler(async (req, res) => {
 
    const { page = 1, pageSize = 20, action, table, userId, dateFrom, dateTo } = req.query;
    
    const where = {};
    if (action) where.operation = action;
    if (table) where.tableName = table;
    if (userId) where.changed_by = userId;
    
    if (dateFrom || dateTo) {
      where.changedAt = {};
      if (dateFrom) where.changedAt[Op.gte] = new Date(dateFrom);
      if (dateTo) where.changedAt[Op.lte] = new Date(dateTo);
    }

    const { count, rows } = await db.AuditLog.findAndCountAll({
      where,
      include: [{
        model: db.User,
        as: 'changedByUser',
        attributes: ['id', 'username', 'name']
      }],
      order: [['changedAt', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: Number(pageSize)
    });



    res.json({
      totalItems: count,
      totalPages: Math.ceil(count / pageSize),
      currentPage: page,
      pageSize,
      data: rows
    });
  
});

    // console.log('=========================================================')
    // console.log(rows)
    // console.log('=========================================================')