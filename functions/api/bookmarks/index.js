import { getBookmarks } from "../../_lib/bookmarks";
import { error, json, methodNotAllowed } from "../../_lib/http";

export async function onRequest(context) {
  const { request, env } = context;
  try {
    if (request.method === "GET") return json(await getBookmarks(env.BOOKMARKS_DB));
    return methodNotAllowed();
  } catch (cause) {
    return error(cause.message || "Could not load the link library.", 500);
  }
}
