import { Coach } from "@bookery/database";
import { RequestHandler } from "express";
import { z } from "zod";

type ResponseSpec = {
  status: number;
  body?: unknown;
};

type HandlerOptions<TBodySchema extends z.ZodTypeAny, TParamsSchema extends z.ZodTypeAny> = {
  requestBodySchema?: TBodySchema;
  paramsSchema?: TParamsSchema;
};

export type Context<TBody=unknown, TParams=unknown> = {
  body: TBody;
  params: TParams;
  session?: Coach;
  setSession: (coach: Coach) => void;
  destroySession: () => Promise<void>;
};

export type Handler<TBody, TParams> = (context: Context<TBody, TParams>) => Promise<ResponseSpec>;

export const forExpress = <TBodySchema extends z.ZodTypeAny = z.ZodUnknown, TParamsSchema extends z.ZodTypeAny = z.ZodUnknown>(
  handler: Handler<z.infer<TBodySchema>, z.infer<TParamsSchema>>,
  options: HandlerOptions<TBodySchema, TParamsSchema>,
) => {
  const expressHandler: RequestHandler = async (req, res, next) => {
    try {
      const paramsParseResult = options.paramsSchema?.safeParse(req.params);
      if (paramsParseResult?.success === false) {
        return res.sendStatus(400);
      }
      const bodyParseResult = options.requestBodySchema?.safeParse(req.body);
      if (bodyParseResult?.success === false) {
        return res.sendStatus(400);
      }
      const resSpec = await handler({
        body: bodyParseResult?.data,
        params: paramsParseResult?.data,
        session: req.session.coach,
        setSession: (coach) => { req.session.coach = coach },
        destroySession: () => new Promise((resolve, reject) => {
          req.session.destroy((err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        }),
      });
      return res.status(resSpec.status).send(resSpec.body);
    } catch (e) {
      next(e);
    }
  };

  return expressHandler;
};
