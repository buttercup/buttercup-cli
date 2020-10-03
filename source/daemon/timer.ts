import { stopDaemon } from "./app";

let __timer = null,
    __timerDelay;

function onTimerExpire() {
    stopDaemon();
}

export function renewTimer() {
    clearTimeout(__timer);
    __timer = setTimeout(onTimerExpire, __timerDelay);
}

export function startShutdownTimer(delay) {
    __timerDelay = delay;
    __timer = setTimeout(onTimerExpire, __timerDelay);
}
