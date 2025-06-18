export const timeToWords = (minutes: number, seconds: number) => {
    if (minutes < 0 || seconds < 0) return "Invalid time given.";

    var hours = Math.floor(minutes / 60);
    var secondsEnglish = `${seconds} second${seconds == 1 ? '' : 's'}`;
    var minutesEnglish = `${minutes % 60} minute${minutes == 1 ? '' : 's'}`;
    var hoursEnglish = `${hours} hour${hours == 1 ? '' : 's'}`;

    if (minutes == 0) return `${seconds} seconds`;
    else if (hours != 0) return `${hoursEnglish}, ${minutesEnglish}, and ${secondsEnglish}`
    else return `${minutes} minutes and ${seconds} seconds`
} 