/** Provides the current moment; "today" is derived from it in local time. */
export type Clock = () => Date;

export const systemClock: Clock = () => new Date();
