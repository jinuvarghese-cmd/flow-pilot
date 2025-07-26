import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session || session.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }
  // ...protected logic
  res.json({ message: "You are an admin!" });
}