import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import {
  sendSuccess,
  sendCreated,
  sendMessage,
  sendBadRequest,
  sendUnauthorized,
  sendForbidden,
  checkEntityExistsOrFail,
  handleControllerError,
} from "../utils/controllerUtils/index.js";

const formatUserData = (user) => {
  return {
    _id: user._id,
    name: user.name,
    login: user.login,
    email: user.email,
    role: user.role,
  };
};

const registerUser = asyncHandler(async (req, res) => {
  try {
    const { name, login, email, password, role } = req.body;

    if (!name || !login || !email || !password) {
      return sendBadRequest(res, "Пожалуйста, заполните все поля");
    }

    const existingUser = await User.findOne({ $or: [{ email }, { login }] });

    if (existingUser) {
      if (existingUser.email === email) {
        return sendBadRequest(res, "Пользователь с таким email уже существует");
      }
      if (existingUser.login === login) {
        return sendBadRequest(
          res,
          "Пользователь с таким логином уже существует"
        );
      }
    }

    const user = await User.create({
      name,
      login,
      email,
      password,
      role: role || "user",
    });

    if (user) {
      sendCreated(res, formatUserData(user));
    } else {
      sendBadRequest(res, "Ошибка при создании пользователя");
    }
  } catch (error) {
    handleControllerError(res, "регистрации", error, "пользователя");
  }
});

// const getUserProfile = asyncHandler(async (req, res) => {
//   try {
//     const user = await checkEntityExistsOrFail(
//       res,
//       User,
//       req.user._id,
//       {},
//       "Пользователь"
//     );

//     if (!user) return;

//     sendSuccess(res, formatUserData(user, false));
//   } catch (error) {
//     handleControllerError(res, "получении профиля", error, "пользователя");
//   }
// });

// const updateUserProfile = asyncHandler(async (req, res) => {
//   try {
//     if (!req.user) {
//       return sendUnauthorized(res, "Не авторизован");
//     }

//     const { name, password } = req.body;

//     if (req.body.role) {
//       return sendForbidden(res, "Изменение роли не разрешено");
//     }

//     const user = await checkEntityExistsOrFail(
//       res,
//       User,
//       req.user._id,
//       {},
//       "Пользователь"
//     );

//     if (!user) return;

//     user.name = name || user.name;
//     if (password) {
//       user.password = password;
//     }

//     const updatedUser = await user.save();
//     sendSuccess(res, formatUserData(updatedUser));
//   } catch (error) {
//     handleControllerError(res, "обновлении профиля", error, "пользователя");
//   }
// });

const getUsers = asyncHandler(async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return sendForbidden(
        res,
        "Доступ запрещен. Требуются права администратора."
      );
    }

    const users = await User.find({}).select("-password");
    sendSuccess(res, users);
  } catch (error) {
    handleControllerError(res, "получении списка", error, "пользователей");
  }
});

const getUserById = asyncHandler(async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return sendForbidden(
        res,
        "Доступ запрещен. Требуются права администратора."
      );
    }

    const user = await checkEntityExistsOrFail(
      res,
      User,
      req.params.id,
      { select: "-password" },
      "Пользователь"
    );

    if (!user) return;

    sendSuccess(res, user);
  } catch (error) {
    handleControllerError(res, "получении", error, "пользователя");
  }
});

const updateUser = asyncHandler(async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return sendForbidden(
        res,
        "Доступ запрещен. Требуются права администратора."
      );
    }

    const user = await checkEntityExistsOrFail(
      res,
      User,
      req.params.id,
      {},
      "Пользователь"
    );

    if (!user) return;

    user.name = req.body.name || user.name;
    user.login = req.body.login || user.login;
    user.email = req.body.email || user.email;

    if (req.body.role) {
      user.role = req.body.role;
    }

    const updatedUser = await user.save();
    sendSuccess(res, formatUserData(updatedUser));
  } catch (error) {
    handleControllerError(res, "обновлении", error, "пользователя");
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return sendForbidden(
        res,
        "Доступ запрещен. Требуются права администратора."
      );
    }

    const user = await checkEntityExistsOrFail(
      res,
      User,
      req.params.id,
      {},
      "Пользователь"
    );

    if (!user) return;

    if (user._id.toString() === req.user._id.toString()) {
      return sendBadRequest(
        res,
        "Невозможно удалить собственную учетную запись"
      );
    }

    await user.deleteOne();
    sendMessage(res, "Пользователь удален");
  } catch (error) {
    handleControllerError(res, "удалении", error, "пользователя");
  }
});

export { registerUser, getUsers, getUserById, updateUser, deleteUser };
