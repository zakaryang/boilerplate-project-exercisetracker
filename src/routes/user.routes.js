import express from 'express';

const router = express.Router();

export default function userRoutes(userController) {
    router.post('/', userController.createUser.bind(userController));
    router.get('/', userController.getAllUsers.bind(userController));

    return router;
} 
