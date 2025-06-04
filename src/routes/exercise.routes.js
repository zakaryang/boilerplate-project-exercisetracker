import express from 'express';

const router = express.Router();

export default function exerciseRoutes(exerciseController) {
    router.post('/:_id/exercises', exerciseController.createExercise.bind(exerciseController));
    router.get('/:_id/logs', exerciseController.getExerciseLog.bind(exerciseController));

    return router;
}
