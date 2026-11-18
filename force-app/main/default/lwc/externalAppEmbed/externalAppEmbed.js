import userId from '@salesforce/user/Id';
import { LightningElement, api, track } from 'lwc';

// Side-effect import: registers the <lwc-shell> custom element
import 'c/vendorLwcShell';

const LOAD_TIMEOUT_MS = 5000;

export default class ExternalAppEmbed extends LightningElement {
    @track hasError = false;
    @track isLoading = true;
    _loadTimer;

    @api appUrl;
    @api shellTitle;
    @api height;

    @track contentHeight;

    get containerStyle() {
        const h = this.contentHeight ?? (Number(this.height) || 60);
        return `height: ${h}px;`;
    }

    // Injected automatically on Record Pages
    @api recordId;
    @api objectApiName;

    // get current userId from the @salesforce/user/Id module, which is a reactive property
    @api userId = userId;

    _shell;
    _lastContextKey;

    renderedCallback() {
        if (this._shell) {
            // Propagate appUrl changes (e.g. edited in App Builder) to the iframe
            if (this._shell.src !== this.appUrl) {
                this.isLoading = true;
                this.hasError = false;
                this._shell.src = this.appUrl;
            }
            this._pushContext();
            return;
        }

        const container = this.template.querySelector('.host');
        const shell = document.createElement('lwc-shell');
        // Set properties BEFORE appendChild
        shell.title = this.shellTitle;
        shell.src = this.appUrl;
        shell.sandbox = 'allow-forms allow-modals';
        shell.debug = false;

        shell.addEventListener('widget-ready', () => this._ready());
        // Remote app reports its content height: { eventType: 'resize', detail: { height } }
        shell.addEventListener('resize', (e) => {
            const h = e.detail && e.detail.height;
            if (typeof h === 'number' && Number.isFinite(h) && h > 0) {
                const next = Math.ceil(h);
                // Ignore sub-pixel/1px jitter to avoid re-render churn
                if (this.contentHeight === undefined || Math.abs(next - this.contentHeight) > 1) {
                    this.contentHeight = next;
                }
            }
        });
        // Fires only when the iframe element itself errors (rare for cross-origin)
        shell.addEventListener('widget-error', () => this._fail());

        container.appendChild(shell);
        this._shell = shell;
        this._pushContext();

        // Cross-origin iframes give no reliable load/error signal (blocked
        // X-Frame-Options/CSP, DNS failure and 404 all fire `load`), so the
        // only dependable success signal is `widget-ready` from the bridge.
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this._loadTimer = window.setTimeout(() => this._fail(), LOAD_TIMEOUT_MS);
    }

    connectedCallback() {
        window.addEventListener('message', this._onMessage);
    }

    disconnectedCallback() {
        window.removeEventListener('message', this._onMessage);
        window.clearTimeout(this._loadTimer);
    }

    // The shell only emits `widget-ready` (bridge-event), but it already makes
    // the iframe visible on plain `bridge-ready`. Mirror that here so the
    // spinner/error state matches what the user sees. The shell's iframe sits
    // in a closed shadow root, so match by origin instead of event.source.
    _onMessage = (event) => {
        if (event.origin !== this._appOrigin()) return;
        const type = event.data && event.data.type;
        if (type === 'bridge-ready' || type === 'bridge-event') {
            this._ready();
        }
    };

    _appOrigin() {
        try {
            return new URL(this.appUrl).origin;
        } catch {
            return null;
        }
    }

    _ready() {
        window.clearTimeout(this._loadTimer);
        this.hasError = false;
        this.isLoading = false;
    }

    _fail() {
        window.clearTimeout(this._loadTimer);
        this.hasError = true;
        this.isLoading = false;
    }

    // Sets data-* attributes on the shell and posts them to the iframe as
    // { type: 'salesforce-data', data: { recordId, objectApiName } }.
    // If the bridge isn't ready yet, the shell sends it once it is.
    _pushContext() {
        if (!this._shell || !this.recordId) return;
        // renderedCallback runs on every re-render (e.g. each resize); only
        // re-send when the context actually changed, otherwise the remote app
        // reloads its data -> resizes -> re-renders -> loops.
        const key = `${this.recordId}|${this.objectApiName || ''}`;
        if (key === this._lastContextKey) return;
        this._lastContextKey = key;
        this._shell.updateData({
            recordId: this.recordId,
            userId: this.userId,
            objectApiName: this.objectApiName || ''
        });
    }
}
