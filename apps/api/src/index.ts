import {registerSchema} from "@app/shared";
import express from "express";

const app = express();
app.get("/", (_req, res) => res.json({ok: true, message: "Hello, world!"}));

app.listen(4000, () =>
	console.log("Server is running on http://localhost:4000"),
);
console.log(
	registerSchema.safeParse({
		email: "test@example.com",
		password: "password123",
	}),
);
