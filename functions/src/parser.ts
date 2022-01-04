import { createEvents } from "ics";
import type { DateArray, EventAttributes } from "ics";
import axios from "axios";
import cheerio from "cheerio";
// import { writeFileSync } from 'fs';

// Function to get number of days in a month
function daysInMonth(month: number, year: number) {
    return new Date(year, month, 0).getDate();
}

// Function to generate request URL
function composeUrl(sid: string | null, tcode: string | null, week: string) {
    return "https://timetable.dundee.ac.uk:8085/reporting/textspreadsheet?objectclass=student+set&idtype=id&identifier=" + sid + "/" + tcode + "&t=SWSCUST+student+set+individual&days=1-7&weeks=" + week + "&periods=1-28&template=SWSCUST+student+set+textspreadsheet"
}

// Get user info
// let  = prompt(CYN+"[ INPUT ]"+RST+" Student ID (this is required): ")
// let  = prompt(CYN+"[ INPUT ]"+RST+" Timetable Code (Press Enter for default): ", "1")
// let  = prompt(CYN+"[ INPUT ]"+RST+" Start Week: (Press Enter for SEM2 default)", "28")
// let  = prompt(CYN+"[ INPUT ]"+RST+" End week: (Press Enter for SEM2 default)", "38")


export async function generateCalendar(studentId: string, timetableCode: string, startWeek: string, endWeek: string,) {
    // Generate calendar
    let events: EventAttributes[] = []

    for (let i = Number(startWeek); i <= Number(endWeek); i++) {
        let url = composeUrl(studentId, timetableCode, i.toString())
        let response = await axios.get(url, { timeout: 10000 })
        let $ = cheerio.load(response.data)

        let dateString = $('span').filter(function () {
            return $(this).text().trim() === 'Weeks:';
        }).next().next().next().text().split(/,|\//);

        let startDay = Number(dateString[0])
        let startMonth = Number(dateString[1])
        let startYear = Number(dateString[2]) + 2000

        let currentDay = startDay
        let currentMonth = startMonth
        let currentYear = startYear

        $("table[class=spreadsheet]").each((i: any, table: any) => {
            $(table).find("tr").not(".columnTitles").each((j: any, row: any) => {
                const td = $(row).find("td")
                // var online = false
                // if ($(td[8]).text().includes("Online") || $(td[8]).text().includes("online")) {
                //     online = true
                // }

                let description = "Module Code: " + $(td[0]).text().match(/(\w+)/g)?.[0].trim() + "\nStaff: " + $(td[7]).text().replace(/\s+/g, ' ').trim()
                let htmlContent = "<b>Module Code: </b>" + $(td[0]).text().match(/(\w+)/g)?.[0].trim() + "<br><b>Staff: </b>" + $(td[7]).text().replace(/\s+/g, ' ').trim()

                let event = {
                    start: [currentYear, currentMonth, currentDay, Number($(td[3]).text().replace(/\s+/g, ' ').trim().split(":")[0]), Number($(td[3]).text().replace(/\s+/g, ' ').trim().split(":")[1])] as DateArray,
                    end: [currentYear, currentMonth, currentDay, Number($(td[4]).text().replace(/\s+/g, ' ').trim().split(":")[0]), Number($(td[4]).text().replace(/\s+/g, ' ').trim().split(":")[1])] as DateArray,
                    status: 'CONFIRMED',
                    busyStatus: 'BUSY',
                    title: "[" + $(td[2]).text().replace(/\s+/g, ' ').trim() + "] " + $(td[1]).text().replace(/\s+/g, ' ').trim(),
                    location: $(td[8]).text().replace(/\s+/g, ' ').trim().split("~SEM2- ").join(""),
                    description: description,
                    htmlContent: htmlContent,
                    calName: "Timetable for " + studentId,
                    startInputType: "utc" as const
                }


                events.push(event as EventAttributes)
            })

            if (currentDay == daysInMonth(currentMonth, currentYear)) {
                if (currentMonth != 12) {
                    currentDay = 1;
                    currentMonth += 1
                }
                else {
                    currentDay = 1
                    currentMonth = 1
                    currentYear += 1
                }
            }
            else {
                currentDay += 1
            }
        })
    }

    const { error, value } = createEvents(events)
    if (error) {
        console.log(error)
        // return
    }
    return value;
    // if (value)
    //     writeFileSync("./timetable.ics", value)
}

