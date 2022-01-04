const form = document.querySelector('form');
const a = document.getElementById("downloadAnchor");
const aParent = document.getElementById("downloadAnchorParent");
const error = document.getElementById("errorMessage");
const currentWeek = 38;
let isStringJustNumbers = (val)=>/^\d+$/.test(val)
;
const setErrorMessage = (text)=>{
    error.style.display = 'block';
    error.innerText = text;
};
const baseUrl = window.location.href.includes('localhost:') ? "http://localhost:5001/timetable-parser/us-central1/getCalendar" : "https://us-central1-timetable-parser.cloudfunctions.net/getCalendar";
form.addEventListener('submit', (event)=>{
    error.style.display = 'none';
    // stop form submission
    event.preventDefault();
    const studentID = document.getElementById("studentID").value;
    if (!isStringJustNumbers(studentID)) {
        console.log(studentID);
        setErrorMessage("Invalid Student ID.");
        return;
    }
    const calendarID = document.getElementById("calendarID").value;
    if (parseInt(calendarID) < 0) {
        setErrorMessage("Invalid Timetable ID. If you don't know what to put there, keep it at 1.");
        return;
    }
    const startWeek = document.getElementById("startWeek").value;
    if (parseInt(startWeek) < 0) {
        setErrorMessage("Invalid Starting week input. The start of semester 1 is week 38.");
        return;
    }
    const weekCount = document.getElementById("weekCount").value;
    if (parseInt(weekCount) < 0) {
        setErrorMessage("The amount of weeks in your calendar can't be smaller than 1.");
        return;
    }
    const endWeek = parseInt(startWeek) + parseInt(weekCount);
    const url = `${baseUrl}?studentId=${studentID}&timetableCode=${calendarID}&startWeek=${startWeek}&endWeek=${endWeek}`;
    console.log(url);
    a.href = url;
    aParent.style.display = 'flex';
});

//# sourceMappingURL=index.f3f2eda1.js.map
