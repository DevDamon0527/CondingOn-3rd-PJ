export function getCurrnetData(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();

    return `${year}년 ${month}월 ${day}일 ${hour}시 ${minute}분`;
}
export function getCurrentData2(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${year}년 ${month}월 ${day}일`;
}
export function getCurrentData3(date: Date): string {
    const hour = date.getHours();
    const minute = date.getMinutes();

    if (minute === 0) {
        return `${hour}시`;
    }
    return `${hour}시 ${minute}분`;
}

interface TimeObject {
    year: string;
    month: string;
    date: string;
    day: string;
    hour: string;
    minute: string;
    second: string;
    howLong: string;
}

export const getTimeObj = (input: string): TimeObject => {
    const time = new Date(input);
    const now = new Date();
    const gap: number = now.getTime() - time.getTime();
    const secondsLong: number = Math.floor(gap / 1000);
    let howLong;
    if (secondsLong < 60) {
        howLong = `${secondsLong}sec`;
    } else if (secondsLong >= 3600 * 24 * 30) {
        howLong = `${Math.floor(secondsLong / 2592000)}month`;
    } else if (secondsLong >= 3600 * 24) {
        howLong = `${Math.floor(secondsLong / 86400)}day`;
    } else if (secondsLong >= 3600) {
        howLong = `${Math.floor(secondsLong / 3600)}hour`;
    } else {
        howLong = `${Math.floor(secondsLong / 60)}min`;
    }
    let timeObj: TimeObject = {
        year: `${time.getFullYear()}`,
        month: `${time.getMonth() + 1}`,
        date: `${time.getDate()}`,
        day: `${time.getDay()}`,
        hour: `${time.getHours()}`,
        minute: `${time.getMinutes()}`,
        second: `${time.getSeconds()}`,
        howLong: howLong,
    };
    return timeObj;
};
