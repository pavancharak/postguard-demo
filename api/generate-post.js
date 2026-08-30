import { generatePostHandler } from "./_lib/generatePost.js";

export default function handler(req, res) {
  return generatePostHandler(req, res);
}
