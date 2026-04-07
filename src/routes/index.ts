import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes.js";
import { eventRouter } from "../modules/event/event.routes.js";
import { requestRouter } from "../modules/request/request.routes.js";
import { userRouter } from "../modules/user/user.routes.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/events", eventRouter);
apiRouter.use("/", requestRouter);
