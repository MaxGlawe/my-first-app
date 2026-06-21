// PROJ-34: Termine ist in den eigenen, abgespeckten Bereich /meine-termine
// umgezogen (außerhalb der klinischen /app-Hülle). Diese Route leitet alte
// Links (z. B. frühe Magiclinks) dorthin um.
import { redirect } from "next/navigation"

export default function AppTermineRedirect() {
  redirect("/meine-termine")
}
