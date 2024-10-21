const prisma = require("../db/prismaClient");

const createUser = async (user_name, email, hash, salt) => {
  try {
    const user = await prisma.users.create({
      data: {
        user_name: user_name,
        email: email,
        hash: hash,
        salt: salt,
      },
    });
    return user;
  } catch (err) {
    console.error(err);
    res.send("Cannot create user! Internal server error");
  }
};

const verifyUserByName = async (user_name) => {
  try {
    const result = await prisma.users.findUnique({
      where: {
        user_name: user_name,
      },
    });
    return result;
  } catch (err) {
    console.error(err);
  }
};

const verifyUserByID = async (user_id) => {
  try {
    const result = await prisma.users.findUnique({
      where: {
        user_id: user_id,
      },
    });
    return result;
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  createUser,
  verifyUserByName,
  verifyUserByID,
};
