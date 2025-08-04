import { Website } from "prod-app-shared/dist";

class UnblockedSite {
    website: Website;
    durationInSeconds: number; // in seconds
    
    constructor(website: Website, durationInSeconds: number) {
        this.website = website
        this.durationInSeconds = durationInSeconds;
    }
}

const unblockedSites = new Set<UnblockedSite>;

export const addUnblockedSite = (website: Website, time : number) => {
    const newBlockedSite = new UnblockedSite(website, time);
    console.warn("> Added to unblocked sites: ", newBlockedSite);
    unblockedSites.add(newBlockedSite);
}

setInterval(() => {
    unblockedSites.forEach(site => {
        if (site.durationInSeconds > 0) site.durationInSeconds -= 1;
        else unblockedSites.delete(site);
    });
}, 1000);

export const IsURLUnblocked = (url : string) : boolean => {
    if (url.startsWith('moz-extension://')) return true;

    for (const site of unblockedSites) {
        if (site.website.url === url) return true;
    }
    
    return false;
}