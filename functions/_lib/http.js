export function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow, noarchive" },
  });
}

export function error(message, status = 400) {
  return json({ error: message }, status);
}

export function methodNotAllowed() {
  return error("Method not allowed", 405);
}
