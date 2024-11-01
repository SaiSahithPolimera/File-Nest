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
    console.log("Error occurred while verifying user name");
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
    console.log("Error occurred while verifying user id");
  }
};

const createNewFolder = async (folder_name, user_id, path, parent_folder) => {
  try {
    const result = await prisma.folders.create({
      data: {
        folder_name: folder_name,
        usersUser_id: user_id,
        parent_folder: parent_folder,
        path: path,
      },
    });
    return result;
  } catch (err) {
    console.error(err);
    console.log("Error occurred while adding new folder");
  }
};

const createNewFile = async (file_name, file_size, path, folder_id) => {
  try {
    const result = await prisma.files.create({
      data: {
        file_name: file_name,
        file_size: file_size,
        path: path,
        foldersFolder_id: folder_id,
      },
    });
    return result;
  } catch (err) {
    console.error(err);
    console.log("Error occurred while creating new file");
  }
};

const getFolderIDByName = async (folder_name, user_id) => {
  try {
    const {folder_id} = await prisma.folders.findUnique({
      where: {
        folder_name: folder_name,
        usersUser_id: user_id,
      },
    });
    return folder_id;
  } catch (err) {
    console.error(err);
    console.log("Error while retrieving folder ID");
  }
};

const getFolderDetails = async (folder_id, user_id) => {
  try {
    const result = await prisma.folders.findUnique({
      where: {
        folder_id: folder_id,
        usersUser_id: user_id,
      },
    });
    return result;
  } catch (err) {
    console.log("Error while retrieving folder data");
  }
};

const getFileIDByName = async (file_name) => {
  try {
    const { file_id } = await prisma.files.findUnique({
      where: {
        file_name: file_name,
      },
    });
    return file_id;
  } catch (err) {
    console.error(err);
    console.log("Error while retrieving file ID");
  }
};

const deleteFile = async (file_id) => {
  try {
    const result = await prisma.files.delete({
      where: {
        file_id: file_id,
      },
    });
    return result;
  } catch (err) {
    console.error(err);
    console.log("Error while deleting file");
  }
};

const deleteFolder = async (folder_id, user_id) => {
  try {
    const result = await prisma.folders.delete({
      where: {
        folder_id: folder_id,
        usersUser_id: user_id,
      },
    });
    await prisma.files.deleteMany({
      where: {
        foldersFolder_id: folder_id,
      },
    });
    return result;
  } catch (err) {
    console.error(err);
    console.log("Error occurred while deleting the folder!");
  }
};

const getSubFolders = async (folder_id, user_id) => {
  try {
    const result = await prisma.folders.findMany({
      where: {
        parent_folder: folder_id,
        usersUser_id: user_id,
      },
    });
    return result;
  } catch (err) {
    console.error(err);
    console.log("Error while retrieving sub folder details!");
  }
};

const getFilesFromFolder = async (folder_id) => {
  try {
    const result = await prisma.files.findMany({
      where: {
        foldersFolder_id: folder_id,
      },
    });
    return result;
  } catch (err) {
    console.error(err);
    console.log("Error retrieving file data from folder");
  }
};

module.exports = {
  verifyUserByName,
  verifyUserByID,
  createUser,
  createNewFolder,
  createNewFile,
  getFilesFromFolder,
  getFolderIDByName,
  getFileIDByName,
  getFolderDetails,
  getSubFolders,
  deleteFile,
  deleteFolder,
};
