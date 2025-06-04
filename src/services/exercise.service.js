class ExerciseService {
    constructor(db, userService) {
        this.db = db;
        this.userService = userService;
    }

    async createExercise(userId, description, duration, date) {
        if (!description || !duration) {
            throw new Error("Description and duration are required");
        }

        const durationNum = Number(duration);
        if (isNaN(durationNum) || durationNum <= 0) {
            throw new Error("Duration must be a positive number");
        }

        const user = await this.userService.getUserById(userId);
        
        const exerciseDate = date ? new Date(date) : new Date();
        const storedDate = exerciseDate.toISOString().split('T')[0];
        
        await this.db.run(
            "INSERT INTO exercises (user_id, description, duration, date) VALUES (?, ?, ?, ?)",
            [userId, description, durationNum, storedDate]
        );

        return {
            _id: user._id.toString(),
            username: user.username,
            description,
            duration: durationNum,
            date: exerciseDate.toDateString()
        };
    }

    async getExerciseLog(userId, from, to, limit) {
        const user = await this.userService.getUserById(userId);
        
        // Base query for counting total exercises
        let countQuery = "SELECT COUNT(*) as total FROM exercises WHERE user_id = ?";
        const countParams = [userId];

        if (from || to) {
            countQuery += " AND date BETWEEN ? AND ?";
            countParams.push(from || "1970-01-01", to || "9999-12-31");
        }

        // Get total count before applying limit
        const countResult = await this.db.get(countQuery, countParams);
        const totalCount = countResult.total;

        // Query for getting exercises with limit
        let query = "SELECT description, duration, date FROM exercises WHERE user_id = ?";
        const params = [userId];

        if (from || to) {
            query += " AND date BETWEEN ? AND ?";
            params.push(from || "1970-01-01", to || "9999-12-31");
        }

        query += " ORDER BY date DESC";

        if (limit) {
            query += " LIMIT ?";
            params.push(parseInt(limit));
        }

        const exercises = await this.db.all(query, params);
        
        return {
            _id: user._id.toString(), // freeCodeCamp requires _id to be a string
            username: user.username,
            count: totalCount,
            log: exercises.map(exercise => ({
                ...exercise,
                duration: parseInt(exercise.duration),
                date: new Date(exercise.date).toDateString()
            }))
        };
    }
}

export default ExerciseService;
