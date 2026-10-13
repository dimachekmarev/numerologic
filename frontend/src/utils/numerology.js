import { calculateProfile as sharedProfile } from "../../../shared/numerology.mjs";
import { localDay } from "../hooks";
export { reduceNumber, meanings } from "../../../shared/numerology.mjs";
export const calculateProfile = (name = "", birthDate = "") =>
  sharedProfile(name, birthDate, localDay());
