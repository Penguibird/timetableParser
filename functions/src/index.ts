import * as functions from "firebase-functions";
import { generateCalendar } from "./parser";
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

export const getCalendar = functions.https.onRequest(async (request, response) => {
    const { studentId, timetableCode, startWeek, endWeek } = request.query;
    functions.logger.info("Hello logs!", studentId, timetableCode, startWeek, endWeek , { structuredData: true });
    const value = await generateCalendar(studentId.toString(), timetableCode.toString(), startWeek.toString(), endWeek.toString());
    response.set({ "Content-Type": "text/calendar" })
    response.set({ "Content-Disposition": "attachment; filename=\"calendar.ics\"" })
    response.send(value);
});
