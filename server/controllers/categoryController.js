import asyncHandler from "express-async-handler";
import Category from "../models/categoryModel.js";
import mongoose from "mongoose";
import {
  sendSuccess,
  sendCreated,
  sendMessage,
  sendError,
  sendBadRequest,
  checkEntityExistsOrFail,
  checkUniqueness,
  handleControllerError,
} from "../utils/controllerUtils/index.js";

export const getCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    sendSuccess(res, categories);
  } catch (error) {
    handleControllerError(res, "получении", error, "категорий");
  }
});

export const getCategoryById = asyncHandler(async (req, res) => {
  try {
    const category = await checkEntityExistsOrFail(
      res,
      Category,
      req.params.id,
      {},
      "Категория"
    );

    if (!category) return;

    sendSuccess(res, category);
  } catch (error) {
    handleControllerError(res, "получении", error, "категории");
  }
});

export const createCategory = asyncHandler(async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return sendError(
        res,
        "Доступ запрещен. Требуются права администратора.",
        403
      );
    }

    const { name, parentId, image, description } = req.body;

    if (!name) {
      return sendBadRequest(res, "Название категории обязательно");
    }

    const isUnique = await checkUniqueness(
      Category,
      { name },
      res,
      "Категория с таким названием уже существует"
    );

    if (!isUnique) return;

    const parentIdObj =
      parentId && parentId !== ""
        ? mongoose.Types.ObjectId.createFromHexString(parentId)
        : null;

    if (parentIdObj) {
      const parentExists = await Category.findById(parentIdObj);
      if (!parentExists) {
        return sendBadRequest(
          res,
          "Указанная родительская категория не найдена"
        );
      }
    }

    const category = await Category.create({
      name,
      image,
      description,
      parentId: parentIdObj,
    });

    sendCreated(res, category);
  } catch (error) {
    handleControllerError(res, "создании", error, "категории");
  }
});

export const updateCategory = asyncHandler(async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return sendError(
        res,
        "Доступ запрещен. Требуются права администратора.",
        403
      );
    }

    const { name, parentId, image, description } = req.body;

    const category = await checkEntityExistsOrFail(
      res,
      Category,
      req.params.id,
      {},
      "Категория"
    );

    if (!category) return;

    if (name && name !== category.name) {
      const isUnique = await checkUniqueness(
        Category,
        { name },
        res,
        "Категория с таким названием уже существует"
      );

      if (!isUnique) return;
    }

    if (parentId !== undefined && parentId !== category.parentId?.toString()) {
      if (parentId === req.params.id) {
        return sendBadRequest(
          res,
          "Категория не может быть родителем сама себе"
        );
      }

      if (parentId && parentId !== "") {
        const parentExists = await Category.findById(parentId);
        if (!parentExists) {
          return sendBadRequest(
            res,
            "Указанная родительская категория не найдена"
          );
        }
      }
    }

    category.name = name || category.name;
    category.parentId =
      parentId !== undefined
        ? parentId && parentId !== ""
          ? parentId
          : null
        : category.parentId;
    category.image = image !== undefined ? image : category.image;
    category.description =
      description !== undefined ? description : category.description;

    const updatedCategory = await category.save();
    sendSuccess(res, updatedCategory);
  } catch (error) {
    handleControllerError(res, "обновлении", error, "категории");
  }
});

export const deleteCategory = asyncHandler(async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return sendError(
        res,
        "Доступ запрещен. Требуются права администратора.",
        403
      );
    }

    const category = await checkEntityExistsOrFail(
      res,
      Category,
      req.params.id,
      {},
      "Категория"
    );

    if (!category) return;

    const hasChildren = await Category.exists({ parentId: req.params.id });
    if (hasChildren) {
      return sendBadRequest(
        res,
        "Невозможно удалить категорию, так как она содержит подкатегории"
      );
    }

    await category.deleteOne();
    sendMessage(res, "Категория успешно удалена");
  } catch (error) {
    handleControllerError(res, "удалении", error, "категории");
  }
});

export const hideCategory = asyncHandler(async (req, res) => {
  try {

    if (!req.user || req.user.role !== "admin") {
      return sendError(
        res,
        "Доступ запрещен. Требуются права администратора.",
        403
      );
    }

    const category = await checkEntityExistsOrFail(
      res,
      Category,
      req.params.id,
      {},
      "Категория"
    );

    if (!category) return;

    category.isActive = false;
    await category.save();

    sendMessage(res, "Категория успешно скрыта");
  } catch (error) {
    handleControllerError(res, "скрытии", error, "категории");
  }
});

export const restoreCategory = asyncHandler(async (req, res) => {
  try {

    if (!req.user || req.user.role !== "admin") {
      return sendError(
        res,
        "Доступ запрещен. Требуются права администратора.",
        403
      );
    }

    const category = await checkEntityExistsOrFail(
      res,
      Category,
      req.params.id,
      {},
      "Категория"
    );

    if (!category) return;

    category.isActive = true;
    const restoredCategory = await category.save();

    sendSuccess(res, restoredCategory);
  } catch (error) {
    handleControllerError(res, "восстановлении", error, "категории");
  }
});
