export interface Website {
    title: string;
    url: string;
}

export interface EntertainmentPayload {
    website: Website;
    reason: string;
}

export declare enum MessageType {
    SITE_ENTERED = 0,
    ENTERED_FLAGGED_SITE = 1,
    ENTERED_ENTERTAIMENT = 2
}
export interface InboundMessage<T = any> {
    type: MessageType;
    payload: T;
}