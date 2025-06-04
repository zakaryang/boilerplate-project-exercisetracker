import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

export default function frontendRoutes() {
    router.get('/', (_req, res) => {
        const htmlPath = path.resolve(__dirname + '../../../views/index.html')
        res.sendFile(htmlPath);
    });

    return router;
}
