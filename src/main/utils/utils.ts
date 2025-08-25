export const timeToWords = (minutes: number, seconds: number) => {
    if (minutes < 0 || seconds < 0) return "Invalid time given.";

    var hours = Math.floor(minutes / 60);
    var secondsEnglish = `${seconds} second${seconds == 1 ? '' : 's'}`;
    var minutesEnglish = `${minutes % 60} minute${minutes == 1 ? '' : 's'}`;
    var hoursEnglish = `${hours} hour${hours == 1 ? '' : 's'}`;

    if (minutes == 0) return `${secondsEnglish}`;
    else if (hours != 0) return `${hoursEnglish}, ${minutesEnglish}, and ${secondsEnglish}`
    else return `${minutesEnglish} and ${secondsEnglish}`
} 


export const YMDToFancy = (date: string) => {
    // Expects date in "YYYY-MM-DD" format
    const [year, month, day] = date.split('-').map(Number);
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    return `${months[month - 1]} ${day}, ${year}`;
}

export function getYMD(date: Date): string {
  return date.toISOString().slice(0, 10);
}