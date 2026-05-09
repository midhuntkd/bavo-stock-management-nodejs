import { RequestHandler } from 'express';
import { catchAsync, sendSuccess } from '../utils';
import * as CategoryService from './category.service';

export const create: RequestHandler = catchAsync(async (req, res) => {
  const data = await CategoryService.createCategory(req.body);
  sendSuccess(res, 'Category created successfully', data, 201);
});

export const list: RequestHandler = catchAsync(async (req, res) => {
  const data = await CategoryService.listCategories(req.query as Record<string, any>);
  sendSuccess(res, 'Categories fetched successfully', data);
});

export const getById: RequestHandler = catchAsync(async (req, res) => {
  const data = await CategoryService.getCategoryById(String(req.params.id));
  sendSuccess(res, 'Category fetched successfully', data);
});

export const update: RequestHandler = catchAsync(async (req, res) => {
  const data = await CategoryService.updateCategory(String(req.params.id), req.body);
  sendSuccess(res, 'Category updated successfully', data);
});

export const updateStatus: RequestHandler = catchAsync(async (req, res) => {
  const data = await CategoryService.updateCategoryStatus(String(req.params.id), String(req.body.status));
  sendSuccess(res, 'Category status updated successfully', data);
});
