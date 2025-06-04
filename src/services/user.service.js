class UserService {
    constructor(db) {
        this.db = db;
    }

    async createUser(username) {
        const trimmedUsername = username?.trim();
        if (!trimmedUsername) {
            throw new Error("Username is required");
        }

        const result = await this.db.run("INSERT INTO users (username) VALUES (?)", [trimmedUsername]);
        const user = await this.db.get("SELECT _id, username FROM users WHERE _id = ?", [result.lastID]);
        
        return {
            _id: user._id.toString(),
            username: user.username
        };
    }

    async getAllUsers() {
        const users = await this.db.all("SELECT _id, username FROM users");
        return users.map(user => ({
            _id: user._id.toString(), // freeCodeCamp requires _id to be a string
            username: user.username
        }));
    }

    async getUserById(id) {
        const user = await this.db.get("SELECT _id, username FROM users WHERE _id = ?", [id]);
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
}

export default UserService;
