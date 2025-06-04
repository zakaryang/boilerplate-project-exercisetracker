class ExerciseController {
    constructor(exerciseService) {
        this.exerciseService = exerciseService;
    }

    async createExercise(req, res) {
        try {
            const { _id } = req.params;
            const { description, duration, date } = req.body;

            const exercise = await this.exerciseService.createExercise(
                _id,
                description,
                duration,
                date
            );

            res.json(exercise);
        } catch (error) {
            if (error.message === "Description and duration are required") {
                res.status(400).json({ error: error.message });
            } else if (error.message === "User not found") {
                res.status(404).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Server error" });
            }
        }
    }

    async getExerciseLog(req, res) {
        try {
            const { _id } = req.params;
            const { from, to, limit } = req.query;

            const log = await this.exerciseService.getExerciseLog(_id, from, to, limit);
            res.json(log);
        } catch (error) {
            if (error.message === "User not found") {
                res.status(404).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Server error" });
            }
        }
    }
}

export default ExerciseController;
