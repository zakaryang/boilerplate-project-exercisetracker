class UserController {
    constructor(userService) {
        this.userService = userService;
    }

    async createUser(req, res) {
        try {
            const user = await this.userService.createUser(req.body.username);
            res.json(user);
        } catch (error) {
            if (error.message === "Username is required") {
                res.status(400).json({ error: error.message });
            } else if (error.message.includes("UNIQUE constraint failed")) {
                res.status(400).json({ error: "Username already exists" });
            } else {
                res.status(500).json({ error: "Server error" });
            }
        }
    }

    async getAllUsers(_req, res) {
        try {
            const users = await this.userService.getAllUsers();
            res.json(users);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Server error" });
        }
    }
}

export default UserController;
