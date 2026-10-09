// Runs inside the embedded document (the iframe). Mimics the sf-embedding "ready" heartbeat.
(function sfEmbeddingHeartbeat() {
    // Host puts { instanceId, hostAppOrigin } in the iframe URL as ?hostMetaData=<json>
    const raw = new URL(location.href).searchParams.get("hostMetaData");
    if (!raw) return console.warn("[embedding] no hostMetaData param; not loaded by uiEmbedding");

    let instanceId, hostAppOrigin;
    try {
        ({ instanceId, hostAppOrigin } = JSON.parse(raw));
    } catch (e) {
        return console.warn("[embedding] invalid hostMetaData param", e);
    }

    // 2. Host answers with the bootstrap envelope, transferring port1.
    window.addEventListener("message", (event) => {
        if (event.source !== window.parent || event.origin !== hostAppOrigin) return;
        const msg = event.data;
        if (msg?.type !== "sf-embedding.bootstrap" || msg.instanceId !== instanceId) return;

        const port = event.ports[0];
        port.onmessage = (e) => console.log("[embedding] JSON-RPC from host:", e.data); // e.g. ui/notifications/host-initialized
        port.start?.();
        console.log("[embedding] bootstrapped; allowedOrigins =", msg.allowedOrigins);
    });

    // 1. Heartbeat: content-free, window-level postMessage to the host.
    //    Host checks: type, event.source === iframe.contentWindow, origin === iframe src origin,
    //    protocolVersion === "1.0.0" (exact match), instanceId === host-minted UUID, and no
    //    prior port transfer (a second heartbeat is rejected as DUPLICATE).
    window.parent.postMessage(
        { type: "sf-embedding/ready", protocolVersion: "1.0.0", instanceId },
        hostAppOrigin,
    );
})();
