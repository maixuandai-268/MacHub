import dotenv from "dotenv";
import { connectDatabase } from "./config/db.js";
import { app } from "./app.js";

dotenv.config();

const port = Number(process.env.PORT || 4000);

async function bootstrap() {
  try {
    await connectDatabase(process.env.MONGODB_URI);
    app.listen(port, () => {
      console.log(`API server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start API server", error);
    process.exit(1);
  }
}

bootstrap();
