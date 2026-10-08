/**
 * Print Heidi's investor room content as JSON, ready for OrangeCat's
 * `PUT /api/projects/<id>/room`. See lib/config/investor-room.ts.
 *
 *   node --experimental-strip-types scripts/investor-room-payload.ts > room.json
 */
import { investorRoomContent } from "../lib/config/investor-room.ts";

process.stdout.write(`${JSON.stringify(investorRoomContent(), null, 2)}\n`);
