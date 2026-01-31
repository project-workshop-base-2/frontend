import { minikitConfig } from "../../../../minikit.config";

function withValidProperties(properties: Record<string, undefined | boolean | string | readonly string[]>) {
    return Object.fromEntries(
        Object.entries(properties).filter(([_, value]) => {
            if (typeof value === 'boolean') return true;
            if (Array.isArray(value)) return value.length > 0;
            return !!value;
        })
    );
}

export async function GET() {
    const manifest = {
        accountAssociation: {
            header: "eyJmaWQiOjI0NjE0ODMsInR5cGUiOiJhdXRoIiwia2V5IjoiMHhjMzJDYmZlNzZkMTNkOUMxMUMyMDE0ZmJCNkIzNjM0ODNCM0Y0NEJFIn0",
            payload: "eyJkb21haW4iOiJmcm9udGVuZC1laWdodC1zb290eS05Ni52ZXJjZWwuYXBwIn0",
            signature: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEEykU0e0P1wxs2mK6sdCHLUtusnfRxW-4zzbGr-USEU73-keZB-mJ5CvGRQJlW0LRscbzvAYkRJ_4ug0bRNLOaUGwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
        },
        miniapp: withValidProperties({
            version: minikitConfig.miniapp.version,
            name: minikitConfig.miniapp.name,
            homeUrl: minikitConfig.miniapp.homeUrl,
            iconUrl: minikitConfig.miniapp.iconUrl,
            splashImageUrl: minikitConfig.miniapp.splashImageUrl,
            splashBackgroundColor: minikitConfig.miniapp.splashBackgroundColor,
            webhookUrl: minikitConfig.miniapp.webhookUrl,
            subtitle: minikitConfig.miniapp.subtitle,
            description: minikitConfig.miniapp.description,
            screenshotUrls: minikitConfig.miniapp.screenshotUrls,
            primaryCategory: minikitConfig.miniapp.primaryCategory,
            tags: minikitConfig.miniapp.tags,
            heroImageUrl: minikitConfig.miniapp.heroImageUrl,
            tagline: minikitConfig.miniapp.tagline,
            ogTitle: minikitConfig.miniapp.ogTitle,
            ogDescription: minikitConfig.miniapp.ogDescription,
            ogImageUrl: minikitConfig.miniapp.ogImageUrl,
            noindex: false, // set to true if you want to hide from search
        }),
    };

    return Response.json(manifest);
}