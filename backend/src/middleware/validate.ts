import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from './errorHandler';

/**
 * Express middleware that validates req.body against a Joi schema.
 * Strips unknown keys and returns friendly Hebrew-friendly error
 * messages on failure. Use as:
 *
 *   router.post('/x', validate(schema), handler)
 */
export function validate(schema: Joi.ObjectSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });
    if (error) {
      const msg = error.details.map((d) => d.message).join('; ');
      return next(new AppError(`Validation failed: ${msg}`, 400));
    }
    req.body = value;
    next();
  };
}

// Common schemas used across routes
export const schemas = {
  // Tickets
  ticketCreate: Joi.object({
    title: Joi.string().trim().min(2).max(160).required(),
    description: Joi.string().trim().max(2000).allow('').optional(),
    category: Joi.string().valid('elevator', 'plumbing', 'electrical', 'cleaning', 'security', 'other').default('other'),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
    location: Joi.string().max(160).allow('', null).optional(),
    attachment: Joi.string().allow('', null).optional(), // base64 image
  }),
  // Announcements
  announcementCreate: Joi.object({
    title: Joi.string().trim().min(2).max(200).required(),
    content: Joi.string().trim().max(5000).allow('').optional(),
    category: Joi.string().max(60).optional(),
    is_pinned: Joi.boolean().optional(),
    is_poll: Joi.boolean().optional(),
    poll_question: Joi.string().max(500).optional(),
    poll_options: Joi.array().items(Joi.string().max(200)).max(10).optional(),
    poll_expires_at: Joi.string().optional(),
    quorum_percent: Joi.number().integer().min(0).max(100).optional(),
  }),
  // Documents
  documentCreate: Joi.object({
    title: Joi.string().trim().min(2).max(200).required(),
    category: Joi.string().valid('insurance', 'contract', 'regulations', 'plans', 'invoice', 'legal', 'other').default('other'),
    file_name: Joi.string().max(200).optional(),
    file_type: Joi.string().max(100).optional(),
    file_data: Joi.string().required(),
    notes: Joi.string().max(1000).allow('', null).optional(),
  }),
  // Contractors
  contractorCreate: Joi.object({
    name: Joi.string().trim().min(2).max(120).required(),
    company: Joi.string().max(120).allow('', null).optional(),
    category: Joi.string().max(60).default('other'),
    phone: Joi.string().max(32).allow('', null).optional(),
    email: Joi.string().email().max(120).allow('', null).optional(),
    notes: Joi.string().max(1000).allow('', null).optional(),
    rating: Joi.number().integer().min(1).max(5).optional(),
  }),
  // Building update
  buildingUpdate: Joi.object({
    emergency_phone: Joi.string().max(32).allow('', null).optional(),
    annual_budget: Joi.number().min(0).optional(),
    reserve_fund_balance: Joi.number().min(0).optional(),
  }),
};
