# File-Nest

### What is File-Nest

File nest is a minimal personal storage service which helps users upload their files to the cloud and access them from anywhere.

### Features

Users can:

- **User Authentication**: Users can sign up and log in using session-based authentication handled by Passport.js and Prisma session store.
- **File and Folder Management**: Users can create folders, upload files into them and delete files and folders from the cloud.
- **Secure backup**: Files are uploaded and stored securely on supabase, ensuring easy access and retrieval.

## Stack

- **Backend Framework**: Express
- **File uploads**: Multer
- **Frontend Rendering**: EJS
- **Database**: PostgreSQL
- **Cloud storage**: Supabase
- **Authentication**: PassportJS
- **Database ORM**: Prisma
- **Session Management**: Prisma Session store with express session store for session management

## What's next for File-Nest

- Add a share folder functionality. When a user wants to share a folder (and all of its contents), they should have a form to specify the duration i.e. 1d, 10d etc. This should generate a link that can be shared with anyone.
- Add logic to sort and organize the folders and files based on upload date, size etc. 

## License

[MIT](https://opensource.org/license/mit)
