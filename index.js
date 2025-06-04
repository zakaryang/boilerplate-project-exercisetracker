import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import initializeDatabase from "./src/config/db.js";
import UserService from "./src/services/user.service.js";
import ExerciseService from "./src/services/exercise.service.js";
import UserController from "./src/controllers/user.controller.js";
import ExerciseController from "./src/controllers/exercise.controller.js";
import userRoutes from "./src/routes/user.routes.js";
import exerciseRoutes from "./src/routes/exercise.routes.js";
import frontendRoutes from "./src/routes/frontend.routes.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use((_req, _res, next) => setTimeout(next, 100)); // Simulate latency for freeCodeCamp


// Initialize database and start server
initializeDatabase().then((db) => {
    // Initialize services
    const userService = new UserService(db);
    const exerciseService = new ExerciseService(db, userService);

    // Initialize controllers
    const userController = new UserController(userService);
    const exerciseController = new ExerciseController(exerciseService);

    // Setup routes
    app.use("/api/users", userRoutes(userController));
    app.use("/api/users", exerciseRoutes(exerciseController));
    app.use("/", frontendRoutes());

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});
